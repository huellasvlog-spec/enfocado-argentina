import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Enfocado" },
      { name: "description", content: "Definí una contraseña nueva para tu cuenta de fotógrafo." },
      { property: "og:title", content: "Nueva contraseña — Enfocado" },
      { property: "og:description", content: "Restablecé el acceso a tu cuenta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pass, setPass] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (pass.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setCargando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada.");
    navigate({ to: "/panel" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight">Nueva contraseña</h1>
        <form
          onSubmit={guardar}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="np">Contraseña nueva</Label>
            <Input
              id="np"
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={cargando}>
            Guardar contraseña
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
