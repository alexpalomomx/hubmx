import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Database, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Política de Privacidad y Protección de Datos
            </CardTitle>
            <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                1. Información que Recopilamos
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-medium text-foreground">Información Personal:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Nombre completo y datos de contacto (email, teléfono)</li>
                  <li>Información de perfil profesional (cargo, empresa, ubicación)</li>
                  <li>Fotografía de perfil y biografía</li>
                  <li>Habilidades, intereses y preferencias profesionales</li>
                </ul>
                
                <h3 className="font-medium text-foreground mt-4">Información de Uso:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Registro de actividades en la plataforma</li>
                  <li>Conexiones y networking realizados</li>
                  <li>Eventos a los que se registra y participa</li>
                  <li>Mensajes y comunicaciones (metadatos, no contenido)</li>
                  <li>Preferencias de configuración</li>
                </ul>

                <h3 className="font-medium text-foreground mt-4">Información Técnica:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dirección IP y ubicación aproximada</li>
                  <li>Tipo de dispositivo y navegador</li>
                  <li>Cookies y tecnologías similares</li>
                  <li>Logs de acceso y uso del servicio</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. Cómo Utilizamos su Información
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Utilizamos su información para:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Proporcionar y mantener nuestros servicios</li>
                  <li>Facilitar conexiones y networking entre usuarios</li>
                  <li>Organizar y gestionar eventos</li>
                  <li>Personalizar su experiencia en la plataforma</li>
                  <li>Generar sugerencias de conexiones relevantes</li>
                  <li>Comunicar actualizaciones y notificaciones importantes</li>
                  <li>Analizar el uso para mejorar nuestros servicios</li>
                  <li>Detectar y prevenir actividades fraudulentas</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Compartir Información</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-medium text-foreground">Con Otros Usuarios:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Información de perfil visible según configuración de privacidad</li>
                  <li>Actividad en comunidades públicas</li>
                  <li>Participación en eventos</li>
                </ul>

                <h3 className="font-medium text-foreground mt-4">Con Terceros:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Proveedores de servicios técnicos (hosting, análisis)</li>
                  <li>Organizadores de eventos (datos de registro necesarios)</li>
                  <li>Autoridades legales cuando sea requerido por ley</li>
                </ul>

                <p className="mt-4"><strong>No vendemos</strong> su información personal a terceros para fines comerciales.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Seguridad de Datos</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Encriptación de datos en tránsito y reposo</li>
                  <li>Controles de acceso y autenticación</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Auditorías de seguridad periódicas</li>
                  <li>Capacitación del personal en protección de datos</li>
                </ul>
                <p className="mt-3">Sin embargo, ningún método de transmisión por internet es 100% seguro.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                5. Sus Derechos
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Según las leyes de protección de datos aplicables, usted tiene derecho a:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Acceso:</strong> Solicitar copia de sus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Supresión:</strong> Solicitar eliminación de sus datos</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento en ciertas circunstancias</li>
                </ul>
                <p className="mt-3">Para ejercer estos derechos, contáctenos a través de los canales oficiales.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies y Tecnologías Similares</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mantener su sesión activa</li>
                  <li>Recordar sus preferencias</li>
                  <li>Analizar el uso de la plataforma</li>
                  <li>Personalizar contenido y anuncios</li>
                </ul>
                <p className="mt-3">Puede controlar las cookies a través de la configuración de su navegador.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Retención de Datos</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Conservamos sus datos personales:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mientras mantenga una cuenta activa</li>
                  <li>Durante el tiempo necesario para proporcionar servicios</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Para resolver disputas y hacer cumplir acuerdos</li>
                </ul>
                <p className="mt-3">Los datos se eliminan de forma segura cuando ya no son necesarios.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Transferencias Internacionales</h2>
              <p className="text-muted-foreground">
                Sus datos pueden ser transferidos y procesados en países fuera de su jurisdicción. Aseguramos que estas transferencias cumplan con las leyes aplicables de protección de datos mediante garantías apropiadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Menores de Edad</h2>
              <p className="text-muted-foreground">
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si tiene conocimiento de que hemos recopilado datos de un menor, contáctenos inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Cambios en esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta política periódicamente. Los cambios significativos serán notificados a través de la plataforma o por email. Le recomendamos revisar esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contacto</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Para consultas sobre privacidad y protección de datos, puede contactarnos:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A través del sistema de mensajes de la plataforma</li>
                  <li>En la sección de configuración de privacidad de su perfil</li>
                  <li>Mediante los canales oficiales de soporte</li>
                </ul>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;