import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquareText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SiteFooter() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function sendFeedback(event: React.FormEvent) {
    event.preventDefault();
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(255),
        message: z.string().trim().min(1).max(2000),
      })
      .safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error("Revisá el nombre, el email y el mensaje.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("feedback_messages").insert(parsed.data);
    setSending(false);
    if (error) {
      toast.error("No pudimos enviar tu comentario. Intentá nuevamente.");
      return;
    }
    setName("");
    setEmail("");
    setMessage("");
    setFeedbackOpen(false);
    toast.success("Gracias. Recibimos tu comentario.");
  }

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} Enfocado. Todos los derechos reservados.</p>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto whitespace-normal text-center">
                <MessageSquareText className="h-4 w-4" />
                ¿Falta agregar algo o tuviste un inconveniente? Dejanos tu comentario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Dejanos tu comentario</DialogTitle>
                <DialogDescription>Tu mensaje nos ayuda a mejorar Enfocado.</DialogDescription>
              </DialogHeader>
              <form onSubmit={sendFeedback} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-name">Nombre</Label>
                  <Input
                    id="feedback-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Email</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-message">Mensaje</Label>
                  <Textarea
                    id="feedback-message"
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={2000}
                    required
                  />
                  <p className="text-right text-xs text-muted-foreground">{message.length}/2000</p>
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Enviando…" : "Enviar comentario"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
            <DialogTrigger className="font-medium text-primary underline-offset-4 hover:underline">
              Términos y Condiciones
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Términos y Condiciones</DialogTitle>
              <DialogDescription>Deslinde de responsabilidad de la plataforma.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Esta plataforma funciona exclusivamente como un directorio de prestadores de
                servicios fotográficos y audiovisuales en Argentina. Su única función es facilitar
                que clientes y fotógrafos puedan encontrarse y comunicarse entre sí.
              </p>
              <p>
                La contratación, presupuestos, pagos, señas y cualquier otro acuerdo económico se
                realizan de forma directa entre el cliente y el fotógrafo. La plataforma no
                interviene, no intermedia ni retiene pagos de ningún tipo.
              </p>
              <p>
                La plataforma no garantiza ni responde por la calidad, el cumplimiento, los plazos,
                la veracidad de los datos publicados, ni por los daños o perjuicios derivados de la
                relación entre las partes. Cada prestador es el único responsable de la información
                que publica en su perfil y de los servicios que ofrece.
              </p>
              <p>
                Recomendamos a los usuarios acordar por escrito las condiciones del trabajo, pedir
                comprobantes de pago y verificar la identidad y antecedentes del prestador antes de
                abonar cualquier seña.
              </p>
              <p>
                El uso del sitio implica la aceptación plena de estos términos. Ante contenidos
                indebidos o perfiles falsos, podemos dar de baja el perfil sin aviso previo.
              </p>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </footer>
  );
}
