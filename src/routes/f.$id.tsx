import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, Globe, Instagram, Mail, MapPin, MessageCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signPaths } from "@/lib/media";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppModal } from "@/components/WhatsAppModal";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVideoEmbedUrl } from "@/lib/profile-links";

export const Route = createFileRoute("/f/$id")({
  head: () => ({
    meta: [
      { title: "Perfil de fotógrafo — Enfocado" },
      {
        name: "description",
        content: "Mirá el portfolio, los servicios y la zona de trabajo de este fotógrafo.",
      },
      { property: "og:title", content: "Perfil de fotógrafo — Enfocado" },
      { property: "og:description", content: "Portfolio, servicios y contacto por WhatsApp." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { id } = Route.useParams();
  const [modal, setModal] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: perfil, isLoading, isError } = useQuery({
    queryKey: ["perfil-publico", id],
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const query = supabase.from("photographers").select(
        "id, full_name, bio, province, services, price_text, whatsapp, contact_email, avatar_url, video_urls, portfolio_pdf_path, instagram_url, website_url, creative_url",
      );
      if (isUuid) {
        const { data, error } = await query.eq("id", id).maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await query.eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: false,
  });

  const { data: imagenes } = useQuery({
    queryKey: ["portfolio-publico", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_images")
        .select("id, storage_path")
        .eq("photographer_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const paths = [
      ...(imagenes ?? []).map((i) => i.storage_path),
      ...(perfil?.avatar_url ? [perfil.avatar_url] : []),
    ];
    if (paths.length) void signPaths(paths).then(setUrls);
  }, [imagenes, perfil]);

  useEffect(() => {
    if (!perfil?.portfolio_pdf_path) {
      setPdfUrl(null);
      return;
    }
    void supabase.storage
      .from("portfolio")
      .createSignedUrl(perfil.portfolio_pdf_path, 60 * 60, { download: true })
      .then(({ data }) => setPdfUrl(data?.signedUrl ?? null));
  }, [perfil?.portfolio_pdf_path]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {isLoading && <p className="text-sm text-muted-foreground">Cargando perfil…</p>}
        {isError && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No pudimos cargar este perfil. Probá nuevamente en unos segundos.
            </p>
            <Button asChild variant="ghost" className="mt-3">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        )}
        {!isLoading && !isError && !perfil && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">Este perfil no existe.</p>
            <Button asChild variant="ghost" className="mt-3">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        )}

        {perfil && (
          <>
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
                {perfil.avatar_url && urls[perfil.avatar_url] ? (
                  <img
                    src={urls[perfil.avatar_url]}
                    alt={`Foto de perfil de ${perfil.full_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                    {(perfil.full_name || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">{perfil.full_name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {perfil.province || "Zona no informada"}
                </p>
                <p className="mt-2 text-sm font-medium">{perfil.price_text || "A consultar"}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(perfil.services ?? []).map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {perfil.instagram_url && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={perfil.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Ver Instagram"
                        title="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {perfil.website_url && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={perfil.website_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visitar sitio web"
                        title="Sitio web"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {perfil.creative_url && (
                    <Button asChild variant="outline" size="icon">
                      <a
                        href={perfil.creative_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Ver perfil de Vimeo o Behance"
                        title="Vimeo o Behance"
                      >
                        <Play className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {pdfUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={pdfUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" /> Descargar Portfolio / PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={() => setModal(true)}>
                  <MessageCircle className="mr-2 h-5 w-5" /> Contactar por WhatsApp
                </Button>
                {perfil.contact_email && (
                  <Button asChild size="lg" variant="outline">
                    <a href={`mailto:${perfil.contact_email}`}>
                      <Mail className="mr-2 h-5 w-5" /> {perfil.contact_email}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {perfil.bio && (
              <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold">Sobre mí</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {perfil.bio}
                </p>
              </section>
            )}

            {(perfil.video_urls ?? []).length > 0 && (
              <section className="mt-6">
                <h2 className="text-lg font-semibold">Videos</h2>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {(perfil.video_urls ?? []).map((videoUrl) => {
                    const embedUrl = getVideoEmbedUrl(videoUrl);
                    if (!embedUrl) return null;
                    return (
                      <div key={videoUrl} className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <iframe
                          src={embedUrl}
                          title={`Video de ${perfil.full_name}`}
                          className="h-full w-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-lg font-semibold">Portfolio</h2>
              {(imagenes ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Este fotógrafo todavía no cargó imágenes.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(imagenes ?? []).map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {urls[img.storage_path] && (
                        <img
                          src={urls[img.storage_path]}
                          alt={`Trabajo de ${perfil.full_name}`}
                          className="aspect-square w-full cursor-zoom-in object-cover transition-transform duration-200 hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <WhatsAppModal
              open={modal}
              onOpenChange={setModal}
              nombre={perfil.full_name}
              whatsapp={perfil.whatsapp ?? ""}
            />

            <ImageLightbox
              images={(imagenes ?? []).map((img) => ({
                src: urls[img.storage_path] ?? "",
                alt: `Trabajo de ${perfil.full_name}`,
              }))}
              index={lightboxIndex}
              onIndexChange={setLightboxIndex}
            />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
