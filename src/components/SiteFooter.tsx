import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SiteFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} Huellas Foto. Todos los derechos reservados.</p>
        <Dialog open={open} onOpenChange={setOpen}>
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
    </footer>
  );
}
