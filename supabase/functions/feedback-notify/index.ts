import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FEEDBACK_EMAIL = "huellasvlog@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: insertData, error: insertError } = await supabase
      .from("feedback_messages")
      .insert({ name, email, message })
      .select("id")
      .single();

    if (insertError) {
      console.error("[feedback-notify] Insert error:", insertError.message);
      return new Response(
        JSON.stringify({ error: "No se pudo guardar el comentario" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Enfocado <onboarding@resend.dev>",
            to: [FEEDBACK_EMAIL],
            subject: `Nuevo comentario en Enfocado de ${name}`,
            text: `
Nombre: ${name}
Email: ${email}

Mensaje:
${message}

---
Este mensaje fue enviado desde el formulario de comentarios de Enfocado.
            `.trim(),
          }),
        });
        if (!res.ok) {
          console.error("[feedback-notify] Resend error:", await res.text());
        }
      } catch (mailErr) {
        console.error("[feedback-notify] Email send failed:", mailErr);
      }
    } else {
      console.warn("[feedback-notify] RESEND_API_KEY not configured — feedback saved but no email sent");
    }

    return new Response(
      JSON.stringify({ success: true, id: insertData?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[feedback-notify]", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
