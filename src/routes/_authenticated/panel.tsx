import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Trash2, Upload, ExternalLink, FileText, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCIAS, SERVICIOS } from "@/lib/catalog";
import { signPaths } from "@/lib/media";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AvatarCropper } from "@/components/AvatarCropper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { externalLinksSchema, parseVideoUrls, normalizeExternalUrl } from "@/lib/profile-links";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Mi panel — Enfocado" },
      { name: "description", content: "Editá tus datos, servicios, tarifa y portfolio." },
      { property: "og:title", content: "Mi panel — Enfocado" },
      { property: "og:description", content: "Panel privado del fotógrafo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Panel,
});

type Imagen = { id: string; storage_path: string };

const MAX_IMAGENES = 5;
const FORMATOS_IMAGEN = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function Panel() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [provincia, setProvincia] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [tarifa, setTarifa] = useState("");
  const [videoLinks, setVideoLinks] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [creative, setCreative] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const { data: perfil, isLoading: cargandoPerfil } = useQuery({
    queryKey: ["perfil", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photographers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: imagenes } = useQuery({
    queryKey: ["portfolio", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_images")
        .select("id, storage_path")
        .eq("photographer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Imagen[];
    },
  });

  useEffect(() => {
    if (!perfil) return;
    setNombre(perfil.full_name ?? "");
    setBio(perfil.bio ?? "");
    setWhatsapp(perfil.whatsapp ?? "");
    setContactEmail(perfil.contact_email ?? "");
    setProvincia(perfil.province ?? "");
    setServicios(perfil.services ?? []);
    setTarifa(perfil.price_text ?? "");
    setVideoLinks((perfil.video_urls ?? []).join("\n"));
    setInstagram(perfil.instagram_url ?? "");
    setWebsite(perfil.website_url ?? "");
    setCreative(perfil.creative_url ?? "");
  }, [perfil]);

  useEffect(() => {
    const paths = (imagenes ?? []).map((i) => i.storage_path);
    if (paths.length) void signPaths(paths).then(setUrls);
  }, [imagenes]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const videos = parseVideoUrls(videoLinks);
    if (!videos) {
      toast.error("Revisá los enlaces de video. Usá hasta 8 enlaces de YouTube o Vimeo.");
      return;
    }
    const normalizedInstagram = normalizeExternalUrl(instagram, "instagram");
    const normalizedWebsite = normalizeExternalUrl(website, "website");
    const normalizedCreative = normalizeExternalUrl(creative, "creative");
    const links = externalLinksSchema.safeParse({
      instagram: normalizedInstagram,
      website: normalizedWebsite,
      creative: normalizedCreative,
    });
    if (!links.success) {
      toast.error(links.error.issues[0]?.message ?? "Revisá los enlaces externos.");
      return;
    }
    const email = contactEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error("Revisá el email de contacto.");
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from("photographers").upsert({
      id: user.id,
      full_name: nombre,
      bio,
      whatsapp,
      contact_email: email || null,
      province: provincia,
      services: servicios,
      price_text: tarifa,
      video_urls: videos,
      instagram_url: links.data.instagram || null,
      website_url: links.data.website || null,
      creative_url: links.data.creative || null,
    });
    setGuardando(false);
    if (error) toast.error("No se pudieron guardar los cambios.");
    else {
      toast.success("Perfil actualizado.");
      void qc.invalidateQueries({ queryKey: ["perfil", user.id] });
    }
  }

  async function subirAvatar(file: File) {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Elegí una imagen de hasta 10 MB.");
      return;
    }
    const path = `${user.id}/avatar-${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) {
      toast.error("No se pudo subir la imagen.");
      return;
    }
    await supabase.from("photographers").upsert({ id: user.id, avatar_url: path });
    toast.success("Foto de perfil actualizada.");
    void qc.invalidateQueries({ queryKey: ["perfil", user.id] });
  }

  async function subirPortfolio(files: FileList) {
    const actuales = (imagenes ?? []).length;
    if (actuales >= MAX_IMAGENES) {
      toast.error("Máximo 5 imágenes permitidas en el portfolio");
      return;
    }
    const seleccionadas = Array.from(files);
    if (actuales + seleccionadas.length > MAX_IMAGENES) {
      toast.error(`Máximo 5 imágenes en el portfolio. Ya tenés ${actuales} cargada(s).`);
      return;
    }
    const permitidas = seleccionadas.slice(0, MAX_IMAGENES - actuales);
    setSubiendo(true);
    for (const file of permitidas) {
      if (!FORMATOS_IMAGEN.includes(file.type)) {
        toast.error(`${file.name} debe ser JPG, PNG o WEBP.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5 MB permitidos.`);
        continue;
      }
      const path = `${user.id}/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { error } = await supabase.storage.from("portfolio").upload(path, file);
      if (error) {
        toast.error(`No se pudo subir ${file.name}`);
        continue;
      }
      await supabase
        .from("portfolio_images")
        .insert({ photographer_id: user.id, storage_path: path, url: path });
    }
    setSubiendo(false);
    void qc.invalidateQueries({ queryKey: ["portfolio", user.id] });
  }

  async function subirPdf(file: File) {
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
      toast.error("Elegí un PDF de hasta 10 MB.");
      return;
    }
    setSubiendo(true);
    const path = `${user.id}/portfolio-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, {
      contentType: "application/pdf",
    });
    if (uploadError) {
      setSubiendo(false);
      toast.error("No se pudo subir el PDF.");
      return;
    }
    const previous = perfil?.portfolio_pdf_path;
    const { error } = await supabase
      .from("photographers")
      .upsert({ id: user.id, portfolio_pdf_path: path });
    if (error) {
      await supabase.storage.from("portfolio").remove([path]);
      setSubiendo(false);
      toast.error("No se pudo guardar el PDF.");
      return;
    }
    if (previous) await supabase.storage.from("portfolio").remove([previous]);
    setSubiendo(false);
    void qc.invalidateQueries({ queryKey: ["perfil", user.id] });
    toast.success("Portfolio PDF actualizado.");
  }

  async function borrarImagen(img: Imagen) {
    await supabase.storage.from("portfolio").remove([img.storage_path]);
    await supabase.from("portfolio_images").delete().eq("id", img.id);
    void qc.invalidateQueries({ queryKey: ["portfolio", user.id] });
    toast.success("Imagen eliminada.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Mi panel</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/f/$id" params={{ id: user.id }}>
              Ver mi perfil público <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {cargandoPerfil && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">Cargando tus datos…</p>
          </div>
        )}

        <form
          onSubmit={guardar}
          className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="n">Nombre o estudio</Label>
              <Input id="n" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w">WhatsApp de contacto</Label>
              <Input
                id="w"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 9 11 5555 5555"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ce">Email de contacto público</Label>
              <Input
                id="ce"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="tunombre@email.com"
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b">Biografía</Label>
            <Textarea
              id="b"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contá tu experiencia, estilo y qué incluye tu trabajo."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Select value={provincia} onValueChange={setProvincia}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí tu provincia o región" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCIAS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t">Tarifa o rango</Label>
              <Input
                id="t"
                value={tarifa}
                onChange={(e) => setTarifa(e.target.value)}
                placeholder='Ej: "$50.000 - $80.000" o "A consultar"'
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Servicios que ofrecés</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICIOS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={servicios.includes(s)}
                    onCheckedChange={(v) =>
                      setServicios((prev) =>
                        v === true ? [...prev, s] : prev.filter((x) => x !== s),
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videos">Videos de YouTube o Vimeo</Label>
            <Textarea
              id="videos"
              rows={4}
              value={videoLinks}
              onChange={(e) => setVideoLinks(e.target.value)}
              placeholder="Pegá un enlace por línea (máximo 8)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                onBlur={() => setInstagram(normalizeExternalUrl(instagram, "instagram"))}
                placeholder="instagram.com/tuusuario o tuusuario"
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web personal</Label>
              <Input
                id="website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onBlur={() => setWebsite(normalizeExternalUrl(website, "website"))}
                placeholder="tusitio.com"
                maxLength={500}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="creative">Vimeo o Behance</Label>
              <Input
                id="creative"
                type="text"
                value={creative}
                onChange={(e) => setCreative(e.target.value)}
                onBlur={() => setCreative(normalizeExternalUrl(creative, "creative"))}
                placeholder="vimeo.com/tuusuario"
                maxLength={500}
              />
            </div>
          </div>

          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Foto de perfil o logo</h2>
          <div className="mt-3 flex items-center gap-4">
            {perfil?.avatar_url && urls[perfil.avatar_url] && (
              <img
                src={urls[perfil.avatar_url]}
                alt="Foto de perfil actual"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              <Camera className="h-4 w-4" />
              Subir foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAvatarFile(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>

        <AvatarCropper
          file={avatarFile}
          onCancel={() => setAvatarFile(null)}
          onConfirm={async (file) => {
            await subirAvatar(file);
            setAvatarFile(null);
          }}
        />

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Portfolio PDF</h2>
          <p className="mt-1 text-sm text-muted-foreground">Subí un archivo PDF de hasta 10 MB.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <FileText className="h-4 w-4" />
            {perfil?.portfolio_pdf_path ? "Reemplazar PDF" : "Subir PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void subirPdf(file);
              }}
            />
          </label>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Portfolio ({(imagenes ?? []).length}/{MAX_IMAGENES})
            </h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              <Upload className="h-4 w-4" />
              {subiendo ? "Subiendo…" : "Cargar imágenes"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) void subirPortfolio(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Máximo 5 imágenes. Formatos aceptados: JPG, PNG, WEBP. Peso máximo: 5 MB por imagen.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(imagenes ?? []).map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-xl bg-muted">
                {urls[img.storage_path] && (
                  <img
                    src={urls[img.storage_path]}
                    alt="Imagen del portfolio"
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => void borrarImagen(img)}
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {(imagenes ?? []).length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">Todavía no cargaste imágenes.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
