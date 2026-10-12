import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function calculateRPChange(placement: number, totalPlayers: number, winStreak: number): number {
  const baseGain = [80, 50, 30, 15, 0, -10]
  const baseLoss = [0, 0, -15, -25, -30, -35]
  const base = placement === 1 ? (baseGain[Math.min(totalPlayers - 1, 5)] ?? 30) : (baseLoss[Math.min(placement - 1, 5)] ?? -15)
  const streakMultiplier = placement === 1 ? Math.min(1 + winStreak * 0.2, 2.0) : 1.0
  return Math.round(base * streakMultiplier)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // Create a Service Role client to bypass RLS for updating the tables safely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const {
      username,
      won,
      finalWealth,
      placement = 1,
      totalPlayers = 2,
      stats = { investChoices: 0, emiDamageTaken: false }
    } = body

    if (typeof finalWealth !== 'number' || finalWealth < 0 || finalWealth > 100000000) {
      throw new Error('Invalid finalWealth value');
    }
    if (typeof placement !== 'number' || placement < 1 || placement > 6) {
      throw new Error('Invalid placement value');
    }
    if (typeof totalPlayers !== 'number' || totalPlayers < 1 || totalPlayers > 6) {
      throw new Error('Invalid totalPlayers value');
    }

    const userId = user.id

    // 1. Upsert leaderboard entry
    const { data: existing } = await supabaseAdmin
      .from('leaderboard')
      .select('id, wins, losses, total_games, highest_net_worth')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      const currentWins = existing.wins || 0;
      const currentLosses = existing.losses || 0;
      const currentTotalGames = existing.total_games || 0;
      const currentHighestNetWorth = existing.highest_net_worth || 0;

      await supabaseAdmin
        .from('leaderboard')
        .update({
          wins: currentWins + (won ? 1 : 0),
          losses: currentLosses + (won ? 0 : 1),
          total_games: currentTotalGames + 1,
          highest_net_worth: Math.max(currentHighestNetWorth, finalWealth),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      await supabaseAdmin
        .from('leaderboard')
        .insert({
          user_id: userId,
          username,
          wins: won ? 1 : 0,
          losses: won ? 0 : 1,
          total_games: 1,
          highest_net_worth: finalWealth,
        })
    }

    // 2. Update profile stats
    let awardedDc = 0;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('games_played, games_won, win_streak, max_win_streak, rank_points, total_xp, daanik_coins')
      .eq('id', userId)
      .maybeSingle()

    if (profile) {
      const currentGamesPlayed = profile.games_played || 0;
      const currentGamesWon = profile.games_won || 0;
      const currentWinStreak = profile.win_streak || 0;
      const currentMaxWinStreak = profile.max_win_streak || 0;
      const currentRankPoints = profile.rank_points || 0;
      const currentTotalXp = profile.total_xp || 0;
      
      const newStreak = won ? currentWinStreak + 1 : 0
      const rpGain = calculateRPChange(placement, totalPlayers, currentWinStreak)
      
      await supabaseAdmin
        .from('profiles')
        .update({
          games_played: currentGamesPlayed + 1,
          games_won: currentGamesWon + (won ? 1 : 0),
          win_streak: newStreak,
          max_win_streak: Math.max(currentMaxWinStreak, newStreak),
          rank_points: Math.max(0, currentRankPoints + rpGain),
          total_xp: currentTotalXp + (won ? 100 : 25),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      // 3. Process Contracts
      try {
        const { data: activeContracts } = await supabaseAdmin
          .from('daily_contracts')
          .select('*')
          .gte('contract_date', new Date().toISOString().split('T')[0])

        if (activeContracts && activeContracts.length > 0) {
          // Fetch existing player contracts in bulk
          const activeContractIds = activeContracts.map((c: any) => c.id)
          const { data: pContractsData } = await supabaseAdmin
            .from('player_contracts')
            .select('*')
            .eq('player_id', userId)
            .in('contract_id', activeContractIds)

          const pContractsMap = new Map((pContractsData || []).map((pc: any) => [pc.contract_id, pc]))
          const upserts = []

          for (const contract of activeContracts) {
            let increment = 0;
            if (contract.requirement_type === 'wins' && won) increment = 1;
            if (contract.requirement_type === 'weekly_wins' && won) increment = 1;
            if (contract.requirement_type === 'invest_choices') increment = stats.investChoices;
            if (contract.requirement_type === 'no_emi_win' && won && !stats.emiDamageTaken) increment = 1;

            if (increment > 0) {
              const pContract = pContractsMap.get(contract.id)
              const currentProgress = pContract ? pContract.progress : 0;
              const newProgress = currentProgress + increment;
              const isNewlyCompleted = !pContract?.completed && newProgress >= contract.requirement_value;

              upserts.push({
                player_id: userId,
                contract_id: contract.id,
                progress: newProgress,
                completed: isNewlyCompleted || (pContract?.completed ?? false),
                completed_at: isNewlyCompleted ? new Date().toISOString() : pContract?.completed_at,
              })

              if (isNewlyCompleted) {
                awardedDc += contract.reward_dc;
              }
            }
          }

          if (upserts.length > 0) {
            await supabaseAdmin.from('player_contracts').upsert(upserts)
          }

          if (awardedDc > 0) {
            await supabaseAdmin
              .from('profiles')
              .update({ daanik_coins: (profile.daanik_coins || 0) + awardedDc })
              .eq('id', userId);
          }
        }
      } catch (e) {
        console.error('Failed to process contracts', e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
