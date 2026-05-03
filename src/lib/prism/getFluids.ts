import { supabase } from "@/app/lib/supabase"
 
export async function getFluids() {
  const { data, error } = await supabase
    .from("prism_fluids")
    .select("*")
    .order("name")
 
  if (error) {
    throw new Error(error.message)
  }
 
  return data ?? []
}
