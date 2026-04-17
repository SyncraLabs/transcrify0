import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Terminos y Condiciones | Transcrify",
  description:
    "Terminos y condiciones de uso de Transcrify, servicio de transcripcion de video a texto con IA.",
  alternates: { canonical: "https://transcrify.es/terms" },
};

const UPDATED = "17 de abril de 2026";

export default function TermsPage() {
  const dict = dictionary.es;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar dict={dict} lang="es" />
      <main className="container mx-auto max-w-3xl px-4 pt-28 pb-24">
        <article className="prose prose-invert prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white max-w-none">
          <h1>Terminos y Condiciones</h1>
          <p className="text-neutral-400">
            Ultima actualizacion: {UPDATED} &middot; En vigor desde: {UPDATED}
          </p>

          <h2>1. El servicio</h2>
          <p>
            Transcrify (<a href="https://transcrify.es">https://transcrify.es</a>) es una
            plataforma de transcripcion de video a texto mediante inteligencia artificial.
            Al usar el servicio aceptas estos Terminos.
          </p>

          <h2>2. Elegibilidad</h2>
          <p>
            Debes tener al menos 14 anos (edad minima de consentimiento digital en Espana) y
            capacidad legal para aceptar estos Terminos. Si actuas en nombre de una empresa,
            garantizas que dispones de poderes para obligarla.
          </p>

          <h2>3. Cuentas</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tus credenciales y de toda
            actividad realizada desde tu cuenta. Notifica inmediatamente cualquier acceso
            no autorizado a{" "}
            <a href="mailto:rodrigodigitalinfluence@gmail.com">
              rodrigodigitalinfluence@gmail.com
            </a>
            .
          </p>

          <h2>4. Planes, creditos y suscripciones</h2>
          <p>
            Ofrecemos un plan gratuito con creditos limitados y planes de pago con creditos
            ampliados procesados por Stripe. Los creditos son personales, no transferibles y
            pueden caducar al final del ciclo de facturacion. Podemos modificar precios
            comunicandolo con al menos 30 dias de antelacion por email.
          </p>

          <h2>5. Politica de reembolsos</h2>
          <p>
            Los servicios de IA y contenido digital generado son, en general, no
            reembolsables una vez consumidos los creditos. Si experimentas un problema
            tecnico imputable a nosotros, escribenos dentro de los 14 dias siguientes y
            estudiaremos un reembolso o credito equivalente.
          </p>

          <h2>6. Uso aceptable</h2>
          <p>Queda prohibido:</p>
          <ul>
            <li>Transcribir contenido sin tener derechos o consentimiento.</li>
            <li>Publicar contenido ilegal, dificamatorio, sexual con menores o violento.</li>
            <li>Eludir limites, creditos o mecanismos de seguridad.</li>
            <li>Realizar scraping automatizado o ingenieria inversa del servicio.</li>
            <li>Enviar spam o abusar de los recursos compartidos.</li>
            <li>Infringir derechos de propiedad intelectual de terceros.</li>
          </ul>

          <h2>7. Propiedad intelectual</h2>
          <p>
            Mantienes la titularidad sobre el contenido que envias. Conservas la propiedad y
            los derechos de uso comercial sobre las transcripciones y exportaciones
            generadas para ti. La marca, codigo y diseno de Transcrify son propiedad de
            Rodrigo (el creador) y estan protegidos.
          </p>

          <h2>8. IA de terceros</h2>
          <p>
            Utilizamos modelos de OpenAI (Whisper, GPT). Las transcripciones automaticas
            pueden contener errores; no garantizamos precision del 100 % y no nos hacemos
            responsables de decisiones tomadas unicamente en base al resultado de la IA.
          </p>

          <h2>9. Exencion de garantias</h2>
          <p>
            EL SERVICIO SE PRESTA &quot;TAL CUAL&quot; Y &quot;SEGUN DISPONIBILIDAD&quot;.
            HASTA EL MAXIMO PERMITIDO POR LA LEY, RENUNCIAMOS A TODA GARANTIA EXPRESA O
            IMPLICITA, INCLUIDAS LAS DE COMERCIABILIDAD, ADECUACION A UN FIN CONCRETO Y NO
            INFRACCION.
          </p>

          <h2>10. Limitacion de responsabilidad</h2>
          <p>
            EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY, NUESTRA RESPONSABILIDAD TOTAL
            AGREGADA POR CUALQUIER RECLAMACION RELACIONADA CON EL SERVICIO NO EXCEDERA LA
            CANTIDAD QUE HAYAS PAGADO A TRANSCRIFY EN LOS TRES (3) MESES ANTERIORES AL
            HECHO QUE ORIGINO LA RECLAMACION.
          </p>

          <h2>11. Terminacion</h2>
          <p>
            Puedes eliminar tu cuenta en cualquier momento desde el dashboard o
            solicitandolo por email. Podemos suspender o cancelar cuentas que incumplan
            estos Terminos, sin reembolso por periodos ya consumidos.
          </p>

          <h2>12. Indemnizacion</h2>
          <p>
            Nos indemnizaras por reclamaciones de terceros derivadas de: (a) tu contenido
            enviado, (b) tus incumplimientos de estos Terminos, (c) tu infraccion de
            derechos de terceros, incluyendo propiedad intelectual.
          </p>

          <h2>13. Resolucion de conflictos</h2>
          <p>
            Intentaremos resolver cualquier disputa de forma informal por email durante 30
            dias. Si no se resuelve, las partes se someten a los juzgados y tribunales del
            domicilio del consumidor en la Union Europea, o a los juzgados de Madrid
            (Espana) para el resto de casos. Renuncias a demandas colectivas, excepto cuando
            la ley aplicable lo prohiba. Se reservan acciones de cesacion y proteccion de
            propiedad intelectual.
          </p>

          <h2>14. Fuerza mayor</h2>
          <p>
            No somos responsables por incumplimientos causados por eventos fuera de nuestro
            control razonable, incluyendo catastrofes, pandemias, cortes de proveedores
            (OpenAI, Stripe, Vercel), ciberataques o actos de autoridades.
          </p>

          <h2>15. Divisibilidad</h2>
          <p>
            Si alguna disposicion se considera invalida, el resto de los Terminos seguira en
            vigor.
          </p>

          <h2>16. Acuerdo completo</h2>
          <p>
            Estos Terminos junto con nuestra{" "}
            <a href="/privacy">Politica de Privacidad</a> constituyen el acuerdo integro
            entre tu y Transcrify.
          </p>

          <h2>17. Cambios en los Terminos</h2>
          <p>
            Podemos modificar estos Terminos. Los cambios sustanciales se comunicaran por
            email con 30 dias de antelacion. El uso continuado del servicio despues de la
            entrada en vigor implica aceptacion.
          </p>

          <h2>18. Contacto</h2>
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
