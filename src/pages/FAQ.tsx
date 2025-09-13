import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Users, Calendar, Network, MessageSquare, BookOpen, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
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
          <h1 className="text-3xl font-bold">Preguntas Frecuentes (FAQ)</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Centro de Ayuda
            </CardTitle>
            <p className="text-muted-foreground">
              Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma de comunidades.
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                General
                <Badge variant="secondary">Básico</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué es esta plataforma?</AccordionTrigger>
                  <AccordionContent>
                    Es un hub de comunidades que conecta diferentes grupos y organizaciones, facilitando el networking, 
                    la organización de eventos y la colaboración entre miembros. Permite a las personas descubrir 
                    comunidades afines, participar en eventos y establecer conexiones profesionales significativas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Es gratuito usar la plataforma?</AccordionTrigger>
                  <AccordionContent>
                    Sí, el acceso básico a la plataforma es gratuito. Puedes crear tu perfil, unirte a comunidades, 
                    participar en eventos y hacer conexiones sin costo. Algunas funciones premium pueden estar 
                    disponibles en el futuro.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cómo creo una cuenta?</AccordionTrigger>
                  <AccordionContent>
                    Para crear una cuenta, haz clic en el botón "Registrarse" y completa el formulario con tu 
                    información básica. Recibirás un email de confirmación para activar tu cuenta. Una vez 
                    activada, podrás completar tu perfil y comenzar a explorar las comunidades.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Puedo eliminar mi cuenta?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes eliminar tu cuenta en cualquier momento desde la configuración de tu perfil. 
                    Ten en cuenta que esto eliminará permanentemente todos tus datos, conexiones y actividad 
                    en la plataforma. Esta acción no se puede deshacer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Comunidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Comunidades
                <Badge variant="outline">Participación</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="communities-1">
                  <AccordionTrigger>¿Cómo me uno a una comunidad?</AccordionTrigger>
                  <AccordionContent>
                    Explora las comunidades disponibles en la sección "Comunidades" de la página principal. 
                    Puedes filtrar por categoría, ubicación o intereses. Haz clic en "Unirse" en cualquier 
                    comunidad que te interese. Algunas comunidades pueden requerir aprobación del administrador.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="communities-2">
                  <AccordionTrigger>¿Puedo crear mi propia comunidad?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente, la creación de nuevas comunidades está gestionada por nuestro equipo para 
                    mantener la calidad y evitar duplicaciones. Si tienes una propuesta para una nueva comunidad, 
                    contáctanos a través del formulario de contacto con detalles sobre tu propuesta.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="communities-3">
                  <AccordionTrigger>¿Cómo puedo convertirme en líder de comunidad?</AccordionTrigger>
                  <AccordionContent>
                    Los líderes de comunidad son seleccionados en base a su participación activa, conocimiento 
                    del área y compromiso con la comunidad. Si estás interesado, participa activamente, 
                    contribuye valor y contacta a los administradores actuales de la comunidad.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="communities-4">
                  <AccordionTrigger>¿Puedo salir de una comunidad?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes salir de cualquier comunidad en cualquier momento desde tu dashboard o 
                    desde la página de la comunidad. Simplemente busca la opción "Salir de la comunidad" 
                    en la configuración.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Eventos
                <Badge variant="outline">Organización</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="events-1">
                  <AccordionTrigger>¿Cómo me registro para un evento?</AccordionTrigger>
                  <AccordionContent>
                    Encuentra eventos en la sección "Eventos" o en las páginas de las comunidades. 
                    Haz clic en "Registrarse" en el evento que te interese. Algunos eventos pueden 
                    tener límites de capacidad o requerir aprobación previa.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="events-2">
                  <AccordionTrigger>¿Puedo cancelar mi registro a un evento?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes cancelar tu registro desde tu dashboard o desde la página del evento. 
                    Te recomendamos cancelar con suficiente antelación para permitir que otros puedan 
                    tomar tu lugar, especialmente en eventos con capacidad limitada.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="events-3">
                  <AccordionTrigger>¿Cómo organizo un evento?</AccordionTrigger>
                  <AccordionContent>
                    Los líderes de comunidad y administradores pueden organizar eventos. Si eres miembro 
                    regular y quieres organizar un evento, contacta a los líderes de tu comunidad con tu 
                    propuesta. Ellos pueden ayudarte a publicar y promocionar el evento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="events-4">
                  <AccordionTrigger>¿Qué tipos de eventos se organizan?</AccordionTrigger>
                  <AccordionContent>
                    Organizamos diversos tipos de eventos: talleres técnicos, conferencias, meetups informales, 
                    sesiones de networking, hackathons, charlas inspiracionales, y eventos sociales. 
                    Los eventos pueden ser presenciales, virtuales o híbridos.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Networking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-orange-500" />
                Networking
                <Badge variant="outline">Conexiones</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="networking-1">
                  <AccordionTrigger>¿Cómo funciona el sistema de conexiones?</AccordionTrigger>
                  <AccordionContent>
                    Puedes enviar solicitudes de conexión a otros miembros desde sus perfiles o desde 
                    el directorio de miembros. La otra persona puede aceptar o rechazar tu solicitud. 
                    Una vez conectados, pueden intercambiar mensajes y ver información de contacto adicional.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="networking-2">
                  <AccordionTrigger>¿Cómo mejoro mi perfil de networking?</AccordionTrigger>
                  <AccordionContent>
                    Completa toda la información de tu perfil: foto profesional, biografía detallada, 
                    habilidades, experiencia y objetivos. Mantén tu perfil actualizado y participa 
                    activamente en comunidades y eventos para aumentar tu visibilidad.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="networking-3">
                  <AccordionTrigger>¿Qué son las sugerencias de networking?</AccordionTrigger>
                  <AccordionContent>
                    Nuestro sistema analiza tus habilidades, intereses y actividad para sugerir conexiones 
                    relevantes. Las sugerencias se basan en compatibilidad profesional, ubicación, 
                    experiencia similar o intereses complementarios.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="networking-4">
                  <AccordionTrigger>¿Puedo bloquear o reportar a un usuario?</AccordionTrigger>
                  <AccordionContent>
                    Sí, si experimentas comportamiento inapropiado, puedes bloquear al usuario desde su 
                    perfil y reportar la situación a nuestro equipo de moderación. Tomamos en serio 
                    todos los reportes y actuamos según nuestro código de conducta.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Mensajería */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-500" />
                Mensajería
                <Badge variant="outline">Comunicación</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="messages-1">
                  <AccordionTrigger>¿Cómo envío mensajes a otros usuarios?</AccordionTrigger>
                  <AccordionContent>
                    Puedes enviar mensajes a usuarios con los que estés conectado. Ve al área de mensajes 
                    en tu dashboard o haz clic en el botón de mensaje en el perfil de la persona. 
                    Los mensajes son privados y seguros.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="messages-2">
                  <AccordionTrigger>¿Puedo enviar archivos en los mensajes?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente, el sistema de mensajería soporta texto. Para compartir archivos, 
                    te recomendamos usar servicios de almacenamiento en la nube y compartir los 
                    enlaces en tus mensajes.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="messages-3">
                  <AccordionTrigger>¿Hay notificaciones de mensajes nuevos?</AccordionTrigger>
                  <AccordionContent>
                    Sí, recibes notificaciones en la plataforma cuando tienes mensajes nuevos. 
                    Puedes configurar tus preferencias de notificaciones en la configuración de tu perfil.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Mentorías */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Mentorías
                <Badge variant="outline">Desarrollo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mentorship-1">
                  <AccordionTrigger>¿Cómo funciona el sistema de mentorías?</AccordionTrigger>
                  <AccordionContent>
                    Puedes marcar en tu perfil si estás disponible como mentor o si buscas mentoría. 
                    El sistema sugiere conexiones basadas en experiencia, habilidades y objetivos de desarrollo. 
                    Las mentorías son relaciones voluntarias entre miembros de la comunidad.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mentorship-2">
                  <AccordionTrigger>¿Qué se espera de un mentor?</AccordionTrigger>
                  <AccordionContent>
                    Un mentor proporciona orientación, comparte experiencia y apoya el desarrollo profesional 
                    del mentee. Esto incluye reuniones regulares, retroalimentación constructiva, y apoyo 
                    en el establecimiento y logro de objetivos profesionales.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mentorship-3">
                  <AccordionTrigger>¿Cómo solicito una mentoría?</AccordionTrigger>
                  <AccordionContent>
                    Busca mentores en el directorio de miembros o revisa las sugerencias de mentoría. 
                    Envía una solicitud con información sobre tus objetivos y lo que esperas de la mentoría. 
                    El mentor puede aceptar o declinar basado en disponibilidad y afinidad.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Configuración y Privacidad
                <Badge variant="outline">Cuenta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="settings-1">
                  <AccordionTrigger>¿Cómo cambio mi configuración de privacidad?</AccordionTrigger>
                  <AccordionContent>
                    Ve a la configuración de tu perfil donde puedes ajustar qué información es visible 
                    para otros usuarios, configurar notificaciones, y gestionar permisos de contacto. 
                    Puedes hacer tu perfil más o menos visible según tus preferencias.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="settings-2">
                  <AccordionTrigger>¿Puedo cambiar mi email o contraseña?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes actualizar tu email y contraseña desde la configuración de cuenta. 
                    Para cambios de email, recibirás un mensaje de confirmación en tu nueva dirección. 
                    Para contraseñas, te recomendamos usar una contraseña fuerte y única.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="settings-3">
                  <AccordionTrigger>¿Cómo configuro mis notificaciones?</AccordionTrigger>
                  <AccordionContent>
                    En la configuración de notificaciones puedes elegir qué tipo de alertas recibir: 
                    nuevos mensajes, solicitudes de conexión, invitaciones a eventos, actualizaciones 
                    de comunidades, etc. Puedes activar o desactivar cada tipo individualmente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="settings-4">
                  <AccordionTrigger>¿Mis datos están seguros?</AccordionTrigger>
                  <AccordionContent>
                    Sí, tomamos muy en serio la seguridad de tus datos. Utilizamos encriptación, 
                    acceso controlado y seguimos las mejores prácticas de seguridad. Lee nuestra 
                    Política de Privacidad para más detalles sobre cómo protegemos y utilizamos tu información.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-muted-foreground mb-4">
              Si tu pregunta no está respondida aquí, no dudes en contactarnos.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">Contactar Soporte</Button>
              <Button>Enviar Feedback</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;