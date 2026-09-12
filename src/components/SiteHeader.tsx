import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

function EnfocadoLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="w-10 h-10 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 30 V 15 H 30" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <path d="M 70 15 H 85 V 30" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <path d="M 85 70 V 85 H 70" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <path d="M 30 85 H 15 V 70" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <circle cx="50" cy="50" r="20" stroke="black" strokeWidth="6" fill="none" />
          <line x1="50" y1="30" x2="72" y2="30" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <line x1="70" y1="50" x2="70" y2="72" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <line x1="50" y1="70" x2="28" y2="70" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <line x1="30" y1="50" x2="30" y2="28" stroke="black" strokeWidth="6" strokeLinecap="square" />
          <circle cx="50" cy="50" r="5.5" fill="#DC2626" />
        </svg>
      </div>
      <span className="font-semibold text-xl tracking-tight text-gray-900 font-sans">
        Enfocado
      </span>
    </div>
  );
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function salir() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <EnfocadoLogo />
        </Link>
        <nav className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/panel">Mi panel</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={salir}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth" search={{ modo: "login" }}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ modo: "registro" }}>
                  Soy fotógrafo
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
