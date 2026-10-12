/*
  # delete_own_account RPC

  Lets a signed-in user permanently delete their own account (required by app
  store policies and data-protection law). Called from the client as
  `supabase.rpc('delete_own_account')`.

  Runs as SECURITY DEFINER (owner: postgres) because deleting from auth.users
  is not permitted for the `authenticated` role. It only ever acts on
  auth.uid(), so a caller can never delete someone else's data.

  Most tables already cascade from auth.users / profiles, but rows are deleted
  explicitly first so the function stays correct if a FK is ever changed.
*/

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- Game data owned by the user
  DELETE FROM public.player_contracts WHERE player_id = v_user_id;
  DELETE FROM public.user_stocks      WHERE user_id   = v_user_id;
  DELETE FROM public.leaderboard      WHERE user_id   = v_user_id;

  -- Multiplayer: leave any rooms, and remove rooms the user hosts
  -- (room_players of those rooms cascade via multiplayer_rooms).
  DELETE FROM public.room_players      WHERE player_id = v_user_id;
  DELETE FROM public.multiplayer_rooms WHERE host_id   = v_user_id;

  -- Profile, then the auth identity itself (sessions, identities, MFA
  -- factors etc. cascade inside the auth schema).
  DELETE FROM public.profiles WHERE id = v_user_id;
  DELETE FROM auth.users      WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
