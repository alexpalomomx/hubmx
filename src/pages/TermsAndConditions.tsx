import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Términos y Condiciones de Uso</CardTitle>
            <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y utilizar esta plataforma (el "Servicio"), usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground">
                Nuestra plataforma es un hub de comunidades que facilita la conexión entre miembros, organización de eventos, networking profesional y colaboración entre diferentes comunidades. El servicio incluye:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Registro y participación en comunidades</li>
                <li>Sistema de networking y conexiones profesionales</li>
                <li>Organización y registro de eventos</li>
                <li>Mensajería entre usuarios</li>
                <li>Sistema de mentorías</li>
                <li>Gestión de perfiles profesionales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Registro y Cuentas de Usuario</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Para utilizar ciertos aspectos del servicio, debe crear una cuenta proporcionando información precisa y completa.</p>
                <p>Es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta.</p>
                <p>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta.</p>
                <p>Se reserva el derecho de suspender o cancelar cuentas que violen estos términos.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Conducta del Usuario</h2>
              <p className="text-muted-foreground mb-2">Los usuarios se comprometen a:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Utilizar el servicio de manera legal y apropiada</li>
                <li>Respetar los derechos de otros usuarios</li>
                <li>No publicar contenido ofensivo, difamatorio o ilegal</li>
                <li>No utilizar el servicio para spam o actividades comerciales no autorizadas</li>
                <li>Mantener información de perfil precisa y actualizada</li>
                <li>Cumplir con nuestro Código de Conducta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Contenido y Propiedad Intelectual</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Los usuarios retienen la propiedad de su contenido, pero otorgan una licencia para usar, mostrar y distribuir dicho contenido en la plataforma.</p>
                <p>La plataforma y sus características originales son propiedad exclusiva nuestra y están protegidas por derechos de autor y otras leyes.</p>
                <p>No está permitido copiar, modificar o distribuir nuestro contenido sin autorización expresa.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Eventos y Actividades</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Los organizadores de eventos son responsables del contenido, logística y cumplimiento de regulaciones aplicables.</p>
                <p>La plataforma actúa como facilitador y no es responsable por eventos organizados por terceros.</p>
                <p>Los usuarios participan en eventos bajo su propio riesgo y responsabilidad.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacidad y Protección de Datos</h2>
              <p className="text-muted-foreground">
                El manejo de sus datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitación de Responsabilidad</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>El servicio se proporciona "tal como está" sin garantías de ningún tipo.</p>
                <p>No somos responsables por daños indirectos, incidentales o consecuentes.</p>
                <p>Nuestra responsabilidad total no excederá el monto pagado por el servicio en los últimos 12 meses.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Modificaciones</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán efectivas tras su publicación en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Terminación</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Puede cancelar su cuenta en cualquier momento.</p>
                <p>Podemos suspender o cancelar cuentas por violación de estos términos.</p>
                <p>Tras la terminación, su derecho a usar el servicio cesará inmediatamente.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas sobre estos términos, puede contactarnos a través de los canales oficiales de la plataforma.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;