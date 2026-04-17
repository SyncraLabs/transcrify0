import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Politica de Privacidad | Transcrify",
  description:
    "Politica de privacidad de Transcrify. Como recopilamos, usamos y protegemos tus datos conforme al RGPD y la LSSI-CE.",
  alternates: { canonical: "https://transcrify.es/privacy" },
};

const UPDATED = "17 de abril de 2026";

export default function PrivacyPage() {
  const dict = dictionary.es;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar dict={dict} lang="es" />
      <main className="container mx-auto max-w-3xl px-4 pt-28 pb-24">
        <article className="prose prose-invert prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white max-w-none">
          <h1>Politica de Privacidad</h1>
          <p className="text-neutral-400">
            Ultima actualizacion: {UPDATED} &middot; En vigor desde: {UPDATED}
          </p>

          <h2>1. Quienes somos</h2>
          <p>
            Transcrify (&quot;nosotros&quot;, &quot;nuestro&quot;) es un servicio de
            transcripcion de video a texto con inteligencia artificial, accesible en{" "}
            <a href="https://transcrify.es">https://transcrify.es</a>. Para cualquier consulta
            relacionada con privacidad, escribenos a{" "}
            <a href="mailto:rodrigodigitalinfluence@gmail.com">
              rodrigodigitalinfluence@gmail.com
            </a>
            .
          </p>

          <h2>2. Informacion que recopilamos</h2>
          <p>
            <strong>Datos de cuenta.</strong> Al registrarte: direccion de correo y
            contrasena (almacenada como hash irreversible a traves de Supabase Auth). Nunca
            guardamos contrasenas en texto plano.
          </p>
          <p>
            <strong>Contenido enviado.</strong> Las URLs de video que envias y los audios
            extraidos temporalmente para transcribir. Los archivos de audio se eliminan tras
            completarse la transcripcion.
          </p>
          <p>
            <strong>Contenido generado.</strong> Transcripciones, titulos generados por IA y
            formatos exportados (TXT, PDF, Markdown, SRT, JSON). Se asocian a tu cuenta para
            que puedas consultarlos.
          </p>
          <p>
            <strong>Datos de uso.</strong> Numero de transcripciones, creditos consumidos,
            plan activo, fechas y volumen.
          </p>
          <p>
            <strong>Datos de pago.</strong> Procesados integramente por Stripe. Nosotros solo
            guardamos el ID de cliente, el plan y el estado de la suscripcion. Nunca tocamos
            numeros de tarjeta.
          </p>
          <p>
            <strong>Datos publicitarios.</strong> Google AdSense (ID de editor
            ca-pub-9934368896204073) coloca cookies y lee identificadores de dispositivo para
            servir publicidad personalizada cuando has dado consentimiento.
          </p>
          <p>
            <strong>Datos tecnicos.</strong> Direccion IP, user agent, pagina de referencia y
            registros del servidor de Vercel (nuestro hosting) con fines de seguridad y
            diagnostico.
          </p>

          <h2>3. Como usamos tus datos</h2>
          <ul>
            <li>Proporcionar el servicio de transcripcion y exportacion.</li>
            <li>Gestionar tu cuenta, suscripcion y creditos.</li>
            <li>Prevenir fraude, abuso y ataques automatizados.</li>
            <li>Enviarte comunicaciones operativas (confirmaciones, facturas).</li>
            <li>Mostrar publicidad relevante si no tienes plan de pago y has consentido.</li>
            <li>Cumplir obligaciones legales, fiscales y contables.</li>
          </ul>

          <h2>4. Servicios de terceros</h2>
          <ul>
            <li>
              <strong>Supabase</strong> &mdash; autenticacion y base de datos.{" "}
              <a href="https://supabase.com/privacy">Politica</a>.
            </li>
            <li>
              <strong>Stripe</strong> &mdash; procesamiento de pagos.{" "}
              <a href="https://stripe.com/es/privacy">Politica</a>.
            </li>
            <li>
              <strong>OpenAI</strong> &mdash; modelos Whisper (transcripcion) y GPT (titulos
              inteligentes). <a href="https://openai.com/policies/privacy-policy">Politica</a>.
            </li>
            <li>
              <strong>Vercel</strong> &mdash; hosting y entrega de contenido.{" "}
              <a href="https://vercel.com/legal/privacy-policy">Politica</a>.
            </li>
            <li>
              <strong>Google AdSense</strong> &mdash; publicidad.{" "}
              <a href="https://policies.google.com/privacy">Politica</a>.
            </li>
          </ul>

          <h2>5. Retencion de datos</h2>
          <p>
            Mantenemos tu cuenta y transcripciones mientras el servicio este activo. Si
            eliminas tu cuenta, borramos datos personales en un plazo maximo de 30 dias,
            salvo informacion que la ley obligue a conservar (facturacion: 5 anos por
            normativa espanola). Los archivos de audio temporales se eliminan tras la
            transcripcion.
          </p>

          <h2>6. Tus derechos</h2>
          <p>
            Puedes ejercer los derechos de acceso, rectificacion, supresion, oposicion,
            limitacion y portabilidad escribiendo a{" "}
            <a href="mailto:rodrigodigitalinfluence@gmail.com">
              rodrigodigitalinfluence@gmail.com
            </a>
            . Respondemos en un plazo maximo de 30 dias.
          </p>

          <h2>7. Cookies y almacenamiento local</h2>
          <p>
            <strong>Esenciales.</strong> Token de sesion de Supabase (cookies httpOnly) y
            claves en <code>localStorage</code> necesarias para el funcionamiento de la app.
          </p>
          <p>
            <strong>Publicidad y analitica.</strong> Google AdSense coloca cookies (incluidas
            las de NPA/personalizacion) cuando aceptas en el banner de consentimiento
            gestionado por la CMP certificada de Google.
          </p>
          <p>
            <strong>No usamos.</strong> Meta Pixel, Google Analytics, Hotjar, Mixpanel,
            Amplitude ni herramientas similares. Si esto cambia, actualizaremos esta
            politica antes de activarlas.
          </p>

          <h2>8. Seguridad</h2>
          <p>
            Cifrado en transito (HTTPS/TLS), contrasenas con hash, claves de API guardadas
            como variables de entorno del servidor y politicas de Row Level Security (RLS)
            en Supabase para aislar datos por usuario.
          </p>

          <h2>9. Menores</h2>
          <p>
            El servicio no esta dirigido a menores de 14 anos (edad minima de consentimiento
            digital en Espana segun el RGPD/LOPDGDD). Si detectamos una cuenta de un menor
            sin consentimiento parental, la eliminaremos.
          </p>

          <h2>10. Usuarios internacionales &mdash; RGPD</h2>
          <p>
            Bases juridicas: ejecucion del contrato (prestar el servicio), interes legitimo
            (seguridad y prevencion de fraude), consentimiento (publicidad personalizada) y
            obligacion legal (facturacion). Tienes derecho a presentar reclamacion ante la{" "}
            <a href="https://www.aepd.es">Agencia Espanola de Proteccion de Datos (AEPD)</a>.
            Algunos proveedores (OpenAI, Stripe, Google) pueden procesar datos fuera del
            EEE; en esos casos aplicamos las clausulas contractuales tipo de la Comision
            Europea.
          </p>

          <h2>11. Usuarios de California &mdash; CCPA/CPRA</h2>
          <p>
            Categorias recopiladas: identificadores (email, IP), informacion comercial
            (plan, transacciones), actividad en internet (uso de la app) y contenido visual
            (videos enviados). No vendemos datos personales. El uso de AdSense puede
            considerarse &quot;compartir&quot; bajo la CCPA; puedes optar por no participar
            desde el banner de consentimiento. Respondemos solicitudes en 45 dias.
          </p>

          <h2>12. Cambios en esta politica</h2>
          <p>
            Publicaremos cualquier actualizacion en esta pagina con una nueva fecha. Para
            cambios relevantes te avisaremos por email.
          </p>

          <h2>13. Contacto</h2>
          <p>
            <a href="mailto:rodrigodigitalinfluence@gmail.com">
              rodrigodigitalinfluence@gmail.com
            </a>
          </p>
        </article>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
