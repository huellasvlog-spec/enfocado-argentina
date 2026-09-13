import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdPlaceholder({ format = "horizontal" }: { format?: "horizontal" | "sidebar" }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("[AdSense]", error);
    }
  }, []);

  return (
    <aside
      aria-label="Espacio publicitario"
      className={format === "sidebar" ? "min-h-64 w-full" : "min-h-28 w-full"}
    >
      {/* banner lateral enfocado */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9614874175146813"
        data-ad-slot="8423948713"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
