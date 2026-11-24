/*
# Tighten project submission policy

Replaces the permissive "Anyone can save a project" INSERT policy with
"Anyone can save a valid project" that validates input ranges and prevents
timestamp spoofing.
*/

DROP POLICY IF EXISTS "Anyone can save a project" ON public.projects;

CREATE POLICY "Anyone can save a valid project"
ON public.projects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND (city IS NULL OR char_length(city) <= 100)
  AND (daily_energy_wh IS NULL OR daily_energy_wh BETWEEN 0 AND 10000000)
  AND (array_wattage IS NULL OR array_wattage BETWEEN 0 AND 10000000)
  AND (num_panels IS NULL OR num_panels BETWEEN 0 AND 10000)
  AND (num_batteries IS NULL OR num_batteries BETWEEN 0 AND 10000)
  AND (inputs IS NULL OR octet_length(inputs::text) <= 100000)
  AND (results IS NULL OR octet_length(results::text) <= 200000)
  AND created_at >= now() - interval '5 minutes'
  AND created_at <= now() + interval '5 minutes'
);