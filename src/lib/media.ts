import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const pending: string[] = [];
  for (const p of paths) {
    const hit = cache.get(p);
    if (hit) result[p] = hit;
    else pending.push(p);
  }
  if (pending.length > 0) {
    const { data } = await supabase.storage.from("portfolio").createSignedUrls(pending, 60 * 60);
    for (const item of data ?? []) {
      if (item.signedUrl && item.path) {
        cache.set(item.path, item.signedUrl);
        result[item.path] = item.signedUrl;
      }
    }
  }
  return result;
}

export async function signPath(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const map = await signPaths([path]);
  return map[path] ?? null;
}
