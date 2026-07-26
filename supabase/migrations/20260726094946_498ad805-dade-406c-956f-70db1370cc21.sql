
-- GOALS
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  target_amount numeric NOT NULL DEFAULT 0,
  saved_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals owner select" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "goals owner insert" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals owner update" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals owner delete" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LIFE SIMULATIONS
CREATE TABLE public.life_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_simulations TO authenticated;
GRANT ALL ON public.life_simulations TO service_role;
ALTER TABLE public.life_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "life owner select" ON public.life_simulations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "life owner insert" ON public.life_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "life owner update" ON public.life_simulations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "life owner delete" ON public.life_simulations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER life_simulations_updated_at BEFORE UPDATE ON public.life_simulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DECISION SIMULATIONS
CREATE TABLE public.decision_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_simulations TO authenticated;
GRANT ALL ON public.decision_simulations TO service_role;
ALTER TABLE public.decision_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decisions owner select" ON public.decision_simulations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "decisions owner insert" ON public.decision_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decisions owner delete" ON public.decision_simulations FOR DELETE TO authenticated USING (auth.uid() = user_id);
