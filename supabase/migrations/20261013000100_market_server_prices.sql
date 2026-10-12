/*
  # Phase 5 / Track L — server-side stock prices

  The previous buy_stock/sell_stock took the total price from the client and
  (after 20260604000000) referenced a column that does not exist (`daank_coins`).

  `stock_price(ticker, at)` is a port of `src/lib/market.ts`
  (getDeterministicMarketPrices). The formula must stay identical:

    seedBase = year*10000 + month*100 + day*24 + hour      -- Asia/Kolkata wall clock
    seed     = seedBase + index*1337                        -- index in DAANIK_STOCKS_DATA
    x        = sin(seed) * 10000;  r = x - floor(x)
    vol      = r*0.3 - 0.15
    price    = Math.round(base_price * (1 + vol))           -- floor(v + 0.5) here

  `scripts/check-migrations.mjs` compares this function with market.ts.
  buy_stock/sell_stock now only take (ticker, shares); the server prices the trade.
*/

CREATE OR REPLACE FUNCTION public.market_stock_base(p_ticker text)
RETURNS TABLE (idx integer, base_price integer)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT s.idx, s.base_price
  FROM (VALUES
    ('MSIP', 0, 1240),
    ('CSHLD', 1, 880),
    ('EMIF', 2, 2100),
    ('BNPL', 3, 340),
    ('GLDR', 4, 3400),
    ('CRPT', 5, 1100),
    ('TAXR', 6, 650),
    ('SIPA', 7, 1800)
  ) AS s(ticker, idx, base_price)
  WHERE s.ticker = p_ticker
$$;

CREATE OR REPLACE FUNCTION public.stock_price(p_ticker text, p_at timestamptz DEFAULT now())
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_idx integer;
  v_base integer;
  v_local timestamp := p_at AT TIME ZONE 'Asia/Kolkata';
  v_seed double precision;
  v_x double precision;
  v_vol double precision;
BEGIN
  SELECT b.idx, b.base_price INTO v_idx, v_base FROM public.market_stock_base(p_ticker) b;
  IF v_idx IS NULL THEN
    RETURN NULL;
  END IF;
  v_seed := extract(year FROM v_local)::double precision * 10000
          + extract(month FROM v_local)::double precision * 100
          + extract(day FROM v_local)::double precision * 24
          + extract(hour FROM v_local)::double precision
          + v_idx * 1337;
  v_x := sin(v_seed) * 10000;
  v_vol := (v_x - floor(v_x)) * 0.3 - 0.15;
  RETURN floor(v_base * (1 + v_vol) + 0.5)::integer;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_market_prices(p_at timestamptz DEFAULT now())
RETURNS TABLE (ticker text, base_price integer, current_price integer)
LANGUAGE sql
STABLE
AS $$
  SELECT t.ticker, b.base_price, public.stock_price(t.ticker, p_at)
  FROM unnest(ARRAY['MSIP','CSHLD','EMIF','BNPL','GLDR','CRPT','TAXR','SIPA']) WITH ORDINALITY AS t(ticker, ord)
  CROSS JOIN LATERAL public.market_stock_base(t.ticker) b
  ORDER BY t.ord
$$;

DROP FUNCTION IF EXISTS public.buy_stock(text, integer, integer);
DROP FUNCTION IF EXISTS public.sell_stock(text, integer, integer);

CREATE OR REPLACE FUNCTION public.buy_stock(p_ticker text, p_shares integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_price integer;
  v_total integer;
  v_coins integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_shares IS NULL OR p_shares <= 0 OR p_shares > 1000 THEN
    RAISE EXCEPTION 'Shares must be between 1 and 1000' USING ERRCODE = '22023';
  END IF;
  v_price := public.stock_price(p_ticker, now());
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'Unknown ticker' USING ERRCODE = '22023';
  END IF;
  v_total := v_price * p_shares;

  SELECT daanik_coins INTO v_coins FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF v_coins IS NULL OR v_coins < v_total THEN
    RAISE EXCEPTION 'Not enough DAANIK coins' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.profiles SET daanik_coins = daanik_coins - v_total, updated_at = now()
  WHERE id = v_uid
  RETURNING daanik_coins INTO v_coins;

  INSERT INTO public.user_stocks (user_id, ticker, shares, avg_buy_price)
  VALUES (v_uid, p_ticker, p_shares, v_price)
  ON CONFLICT (user_id, ticker) DO UPDATE
  SET avg_buy_price = ((user_stocks.shares * user_stocks.avg_buy_price) + v_total) / (user_stocks.shares + p_shares),
      shares = user_stocks.shares + p_shares,
      updated_at = now();

  RETURN jsonb_build_object('price', v_price, 'total', v_total, 'coins', v_coins);
END;
$$;

CREATE OR REPLACE FUNCTION public.sell_stock(p_ticker text, p_shares integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_price integer;
  v_total integer;
  v_owned integer;
  v_coins integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_shares IS NULL OR p_shares <= 0 THEN
    RAISE EXCEPTION 'Shares must be positive' USING ERRCODE = '22023';
  END IF;
  v_price := public.stock_price(p_ticker, now());
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'Unknown ticker' USING ERRCODE = '22023';
  END IF;

  SELECT shares INTO v_owned FROM public.user_stocks
  WHERE user_id = v_uid AND ticker = p_ticker FOR UPDATE;
  IF v_owned IS NULL OR v_owned < p_shares THEN
    RAISE EXCEPTION 'Not enough shares' USING ERRCODE = 'P0001';
  END IF;
  v_total := v_price * p_shares;

  UPDATE public.profiles SET daanik_coins = daanik_coins + v_total, updated_at = now()
  WHERE id = v_uid
  RETURNING daanik_coins INTO v_coins;

  IF v_owned = p_shares THEN
    DELETE FROM public.user_stocks WHERE user_id = v_uid AND ticker = p_ticker;
  ELSE
    UPDATE public.user_stocks SET shares = shares - p_shares, updated_at = now()
    WHERE user_id = v_uid AND ticker = p_ticker;
  END IF;

  RETURN jsonb_build_object('price', v_price, 'total', v_total, 'coins', v_coins);
END;
$$;

REVOKE ALL ON FUNCTION public.buy_stock(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.buy_stock(text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.buy_stock(text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.sell_stock(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sell_stock(text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.sell_stock(text, integer) TO authenticated;
