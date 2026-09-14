import { Copy, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { whatsappLink } from "@/lib/catalog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombre: string;
  whatsapp: string;
  contactEmail: string | null;
};

export function ContactModal({ open, onOpenChange, nombre, whatsapp, contactEmail }: Props) {
  async function copiarWhatsApp() {
    try {
      await navigator.clipboard.writeText(whatsapp);
      toast.success("Número copiado");
    } catch {
      toast.error("No se pudo copiar, anotalo manualmente");
    }
  }

  async function copiarEmail() {
    if (!contactEmail) return;
    try {
      await navigator.clipboard.writeText(contactEmail);
      toast.success("Email copiado");
    } catch {
      toast.error("No se pudo copiar el email");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar a {nombre}</DialogTitle>
          <DialogDescription>
            Elegí el canal de contacto que prefieras para coordinar fecha, lugar y presupuesto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {whatsapp && (
            <div className="rounded-xl border border-border bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{whatsapp}</p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> Abrir chat
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={copiarWhatsApp}>
                  <Copy className="mr-2 h-4 w-4" /> Copiar
                </Button>
              </div>
            </div>
          )}

          {contactEmail && (
            <div className="rounded-xl border border-border bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 break-all text-lg font-semibold tracking-tight text-foreground">
                {contactEmail}
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <a href={`mailto:${contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" /> Enviar email
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={copiarEmail}>
                  <Copy className="mr-2 h-4 w-4" /> Copiar
                </Button>
              </div>
            </div>
          )}

          {!whatsapp && !contactEmail && (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Este profesional no cargó datos de contacto todavía.
            </p>
          )}
        </div>

        <div className="rounded-lg bg-muted/40 p-2">
          <AdPlaceholder format="sidebar" />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Enfocado es una plataforma de directorio que conecta realizadores independientes con
          clientes. La contratación, acuerdos y pagos se realizan de forma directa entre las partes
          sin intermediación ni responsabilidad de Enfocado.
        </p>
      </DialogContent>
    </Dialog>
  );
}
