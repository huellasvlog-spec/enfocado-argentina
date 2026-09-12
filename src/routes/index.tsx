import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCIAS, SERVICIOS } from "@/lib/catalog";
import { signPaths } from "@/lib/media";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enfocado — Fotógrafos y realizadores en Argentina" },
      {
        name: "description",
        content:
          "Buscá y contactá fotógrafos, videógrafos y pilotos de drone en todo el país. Filtrá por provincia y tipo de servicio.",
      },
      { property: "og:title", content: "Enfocado — Fotógrafos y realizadores" },
      {
        property: "og:description",
        content: "Directorio de fotógrafos y videógrafos por provincia y servicio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Row = {
  id: string;
  full_name: string;
  bio: string;
  province: string;
  services: string[];
  price_text: string;
  avatar_url: string | null;
};

function Index() {
  const [texto, setTexto] = useState("");
  const [provincia, setProvincia] = useState("todas");
  const [servicio, setServicio] = useState("todos");
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["photographers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photographers")
        .select("id, full_name, bio, province, services, price_text, avatar_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    const paths = (data ?? []).map((r) => r.avatar_url).filter((p): p is string => !!p);
    if (paths.length) void signPaths(paths).then(setAvatars);
  }, [data]);

  const lista = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (!p.full_name) return false;
      if (provincia !== "todas" && p.province !== provincia) return false;
      if (servicio !== "todos" && !p.services.includes(servicio)) return false;
      if (q && !(`${p.full_name} ${p.bio} ${p.province}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [data, texto, provincia, servicio]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center text-primary-foreground">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Encontrá a tu realizador o fotógrafo en Enfocado
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
            Casamientos, eventos, retratos, producto, video y drones. Buscá por provincia y
            contactá directo por WhatsApp.
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl bg-card p-4 text-left shadow-card sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por nombre o zona…"
                className="pl-9"
                aria-label="Buscar fotógrafos"
              />
            </div>
            <Select value={provincia} onValueChange={setProvincia}>
              <SelectTrigger className="sm:w-56 text-foreground" aria-label="Filtrar por provincia">
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las provincias</SelectItem>
                {PROVINCIAS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={servicio} onValueChange={setServicio}>
              <SelectTrigger className="sm:w-56 text-foreground" aria-label="Filtrar por servicio">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los servicios</SelectItem>
                {SERVICIOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isLoading ? "Cargando…" : `${lista.length} fotógrafos disponibles`}
          </h2>
          {(provincia !== "todas" || servicio !== "todos" || texto) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTexto("");
                setProvincia("todas");
                setServicio("todos");
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {!isLoading && lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No encontramos perfiles con esos filtros. Probá con otra provincia o servicio.
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {lista.map((p, index) => (
              <div key={p.id} className="contents">
                <Link
                  to="/f/$id"
                  params={{ id: p.id }}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
                >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-muted">
                  {p.avatar_url && avatars[p.avatar_url] ? (
                    <img
                      src={avatars[p.avatar_url]}
                      alt={`Foto de perfil de ${p.full_name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      {p.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-primary">{p.full_name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.province || "Sin zona"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.services.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>

              <p className="mt-4 text-sm font-medium text-foreground">
                {p.price_text || "A consultar"}
              </p>
                </Link>
                {(index + 1) % 4 === 0 && index < lista.length - 1 && (
                  <div className="sm:col-span-2 xl:col-span-3">
                    <AdPlaceholder />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <AdPlaceholder format="sidebar" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
