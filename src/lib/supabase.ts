import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.VECTOR_DB_URL_DEV!,
  process.env.VECTOR_DB_SERVICE_ROLE_KEY!
);
