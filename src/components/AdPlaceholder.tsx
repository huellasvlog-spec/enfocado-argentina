import { Megaphone } from "lucide-react";

export function AdPlaceholder({ format = "horizontal" }: { format?: "horizontal" | "sidebar" }) {
  return (
    <aside
      aria-label="Espacio Publicitario / Google AdSense"
      className={`flex items-center justify-center border border-dashed border-border bg-muted/45 text-center text-muted-foreground ${
        format === "sidebar" ? "min-h-64 px-5 py-10" : "min-h-28 px-6 py-7"
      }`}
    >
      <div>
        <Megaphone className="mx-auto h-5 w-5" aria-hidden="true" />
        <p className="mt-2 text-xs font-semibold uppercase">Espacio Publicitario</p>
        <p className="mt-1 text-xs">Google AdSense</p>
      </div>
    </aside>
  );
}