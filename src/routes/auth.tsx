import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Modo = "login" | "registro";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo?: Modo } => ({
    modo: search['modo'] === "registro" ? "registro" : search['modo'] === "login" ? "login" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ingresar o registrarse — Huellas Foto" },
      {
        name: "description",
        content: "Creá tu cuenta de fotógrafo o iniciá sesión para editar tu perfil y portfolio.",
      },
      { property: "og:title", content: "Ingresar o registrarse — Huellas Foto" },
      { property: "og:description", content: "Acceso para prestadores de servicios fotográficos." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Modo>(modo ?? "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const [olvide, setOlvide] = useState(false);
  const [mailReset, setMailReset] = useState("");

  useEffect(() => {
    const guardado = localStorage.getItem("huellas_email");
    if (guardado) {
      setEmail(guardado);
      setRecordar(true);
    }
  }, []);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      toast.error("No pudimos iniciar sesión. Revisá el email y la contraseña.");
      return;
    }
    if (recordar) localStorage.setItem("huellas_email", email);
    else localStorage.removeItem("huellas_email");
    navigate({ to: "/panel" });
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (regPass.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPass,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: nombre },
      },
    });
    setCargando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/panel" });
    } else {
      toast.success("Cuenta creada. Revisá tu email para confirmar la cuenta.");
      setTab("login");
    }
  }

  async function recuperar(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(mailReset, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Te enviamos un email para restablecer la contraseña.");
      setOlvide(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="text-center text-2xl font-bold tracking-tight">Acceso para fotógrafos</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Publicá tu perfil, tus servicios y tu portfolio.
        </p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Modo)} className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="registro">Registrarme</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={ingresar}
              className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Contraseña</Label>
                <Input
                  id="pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={recordar}
                    onCheckedChange={(v) => setRecordar(v === true)}
                    aria-label="Recordar usuario"
                  />
                  Recordar usuario
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMailReset(email);
                    setOlvide(true);
                  }}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Olvidé mi contraseña
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? "Ingresando…" : "Iniciar sesión"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="registro">
            <form
              onSubmit={registrar}
              className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre o estudio</Label>
                <Input
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regemail">Email</Label>
                <Input
                  id="regemail"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regpass">Contraseña</Label>
                <Input
                  id="regpass"
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={olvide} onOpenChange={setOlvide}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Te enviamos un enlace para crear una contraseña nueva.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={recuperar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mailreset">Email</Label>
              <Input
                id="mailreset"
                type="email"
                required
                value={mailReset}
                onChange={(e) => setMailReset(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar enlace
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
