import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CodeOfConduct = () => {
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
          <h1 className="text-3xl font-bold">Código de Conducta</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Código de Conducta de la Comunidad
            </CardTitle>
            <p className="text-muted-foreground">
              Creemos en construir una comunidad inclusiva, respetuosa y colaborativa para todos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Nuestro Compromiso
              </h2>
              <p className="text-muted-foreground mb-4">
                Como miembros, colaboradores y líderes de esta comunidad, nos comprometemos a hacer de la participación 
                una experiencia libre de acoso para todos, sin importar edad, tamaño corporal, discapacidad visible o 
                invisible, etnia, características sexuales, identidad y expresión de género, nivel de experiencia, 
                educación, estatus socioeconómico, nacionalidad, apariencia personal, raza, religión o identidad y 
                orientación sexual.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Inclusivo</h3>
                    <p className="text-sm text-muted-foreground">Todos son bienvenidos</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Respetuoso</h3>
                    <p className="text-sm text-muted-foreground">Tratamos a todos con dignidad</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Seguro</h3>
                    <p className="text-sm text-muted-foreground">Espacio libre de acoso</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Comportamientos Esperados</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Los siguientes comportamientos son esperados y solicitados de todos los miembros:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Ser respetuoso:</strong> Tratar a todos con cortesía y respeto mutuo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Ser constructivo:</strong> Proporcionar retroalimentación constructiva y útil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Ser colaborativo:</strong> Trabajar juntos hacia objetivos comunes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Ser empático:</strong> Mostrar comprensión hacia diferentes perspectivas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Usar lenguaje inclusivo:</strong> Utilizar un lenguaje que acoja a todos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Respetar la privacidad:</strong> Mantener confidencial la información personal compartida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span><strong>Aceptar críticas constructivas:</strong> Estar abierto a aprender y mejorar</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Comportamientos Inaceptables
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Los siguientes comportamientos se consideran acoso y son inaceptables:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <Badge variant="destructive" className="mb-2">Prohibido</Badge>
                      <ul className="space-y-1 text-sm">
                        <li>• Comentarios ofensivos sobre características personales</li>
                        <li>• Acoso público o privado</li>
                        <li>• Amenazas de violencia</li>
                        <li>• Intimidación deliberada</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <Badge variant="destructive" className="mb-2">Prohibido</Badge>
                      <ul className="space-y-1 text-sm">
                        <li>• Atención sexual no deseada</li>
                        <li>• Publicación de información privada sin consentimiento</li>
                        <li>• Spam o autopromoción excesiva</li>
                        <li>• Trolling o comportamiento disruptivo</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Directrices Específicas por Área</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Networking y Conexiones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Sé auténtico en tu perfil profesional</li>
                      <li>• Respeta las decisiones de conexión de otros</li>
                      <li>• No envíes mensajes de spam o no solicitados</li>
                      <li>• Mantén conversaciones profesionales y apropiadas</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Eventos y Reuniones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Llega puntual y preparado</li>
                      <li>• Participa de manera constructiva</li>
                      <li>• Respeta el tiempo y las opiniones de otros</li>
                      <li>• Sigue las normas específicas de cada evento</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentorías</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Establece expectativas claras desde el inicio</li>
                      <li>• Mantén compromisos y horarios acordados</li>
                      <li>• Proporciona retroalimentación honesta y constructiva</li>
                      <li>• Respeta los límites profesionales</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Proceso de Reporte</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Si experimentas o presencias comportamiento inaceptable:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Reporta inmediatamente:</strong> Utiliza los canales oficiales de reporte de la plataforma</li>
                  <li><strong>Proporciona detalles:</strong> Incluye toda la información relevante (fechas, capturas, testigos)</li>
                  <li><strong>Mantén evidencia:</strong> Conserva mensajes, imágenes o cualquier prueba del incidente</li>
                  <li><strong>Busca apoyo:</strong> No dudes en contactar a los moderadores o administradores</li>
                </ol>
                
                <Card className="border-blue-200 dark:border-blue-800 mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Garantizamos:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>✓ Confidencialidad en el proceso</li>
                      <li>✓ Investigación imparcial y thorough</li>
                      <li>✓ Respuesta en un plazo razonable</li>
                      <li>✓ Protección contra represalias</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Consecuencias</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Las violaciones a este código pueden resultar en:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Medidas Correctivas:</h3>
                    <ul className="space-y-1">
                      <li>• Advertencia formal</li>
                      <li>• Restricción temporal de funciones</li>
                      <li>• Suspensión temporal de la cuenta</li>
                      <li>• Eliminación permanente de la plataforma</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Factores Considerados:</h3>
                    <ul className="space-y-1">
                      <li>• Severidad del incidente</li>
                      <li>• Historial de comportamiento</li>
                      <li>• Impacto en la comunidad</li>
                      <li>• Intención y contexto</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Alcance</h2>
              <p className="text-muted-foreground">
                Este código se aplica a todos los espacios de la comunidad, incluyendo la plataforma en línea, 
                eventos presenciales y virtuales, comunicaciones oficiales, y cuando alguien representa 
                oficialmente a la comunidad en espacios públicos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Reconocimiento</h2>
              <p className="text-muted-foreground">
                Este Código de Conducta está adaptado del Contributor Covenant, version 2.1, y de las mejores 
                prácticas de comunidades tecnológicas inclusivas. Agradecemos a todas las comunidades que han 
                contribuido al desarrollo de estos estándares.
              </p>
            </section>

            <div className="bg-muted/50 p-4 rounded-lg mt-6">
              <p className="text-center text-muted-foreground">
                <strong>Recuerda:</strong> Todos tenemos la responsabilidad de mantener un ambiente positivo y acogedor.
                Si tienes dudas sobre si algo es apropiado, es mejor errar del lado de la precaución y consultar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeOfConduct;