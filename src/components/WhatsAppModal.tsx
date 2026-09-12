import { Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/catalog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombre: string;
  whatsapp: string;
};

export function WhatsAppModal({ open, onOpenChange, nombre, whatsapp }: Props) {
  async function copiar() {
    try {
      await navigator.clipboard.writeText(whatsapp);
      toast.success("Número copiado");
    } catch {
      toast.error("No se pudo copiar, anotalo manualmente");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar a {nombre}</DialogTitle>
          <DialogDescription>
            Escribile directamente por WhatsApp para coordinar fecha, lugar y presupuesto.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/60 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Número de WhatsApp</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {whatsapp || "No informado"}
          </p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={copiar}>
            <Copy className="mr-2 h-4 w-4" /> Copiar número
          </Button>
        </div>

        <Button asChild size="lg" disabled={!whatsapp}>
          <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Abrir chat de WhatsApp
          </a>
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Aviso: La contratación, pagos y señas se acuerdan directamente entre el cliente y el
          fotógrafo. La plataforma opera como directorio y no intermedia en los pagos ni responde
          por el cumplimiento de los servicios.
        </p>
      </DialogContent>
    </Dialog>
  );
}
