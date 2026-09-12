import { z } from "zod";

const optionalWebUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || /^https?:\/\//i.test(value), "Usá una dirección que comience con http:// o https://")
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Ingresá una dirección válida");

export const externalLinksSchema = z.object({
  instagram: optionalWebUrl.refine(
    (value) => !value || safeHost(value) === "instagram.com",
    "Ingresá un enlace válido de Instagram",
  ),
  website: optionalWebUrl,
  creative: optionalWebUrl.refine((value) => {
    if (!value) return true;
    const host = safeHost(value);
    return host === "vimeo.com" || host === "behance.net";
  }, "Ingresá un enlace válido de Vimeo o Behance"),
});

export type ExternalLinkKind = "instagram" | "website" | "creative";

export function normalizeExternalUrl(value: string, kind: ExternalLinkKind): string {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return "";

  if (kind === "instagram" && !trimmed.includes(".") && !trimmed.includes("/")) {
    return `https://instagram.com/${trimmed}`;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (kind === "instagram") {
    try {
      const parsed = new URL(withProtocol);
      if (!parsed.hostname.includes(".")) return `https://instagram.com/${trimmed}`;
    } catch {
      return `https://instagram.com/${trimmed}`;
    }
  }
  return withProtocol;
}

function safeHost(value: string): string | null {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function parseVideoUrls(value: string): string[] | null {
  const urls = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (urls.length > 8) return null;
  return urls.every((url) => getVideoEmbedUrl(url)) ? urls : null;
}

export function getVideoEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.pathname.startsWith("/shorts/")
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}