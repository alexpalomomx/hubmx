import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";

const EventsSection = () => {
  const events = [
    {
      id: 1,
      title: "IA Summit 2024",
      description: "Conferencia internacional sobre inteligencia artificial y su impacto en la sociedad",
      date: "2024-03-15",
      time: "09:00 AM",
      location: "Bogotá, Colombia",
      type: "Presencial",
      attendees: 500,
      status: "upcoming",
      category: "tech",
      organizer: "Tech Innovators LATAM"
    },
    {
      id: 2,
      title: "Women in Tech Meetup",
      description: "Encuentro mensual para mujeres en tecnología con charlas y networking",
      date: "2024-03-08",
      time: "06:00 PM",
      location: "Virtual",
      type: "Virtual",
      attendees: 150,
      status: "upcoming",
      category: "tech",
      organizer: "Women in Tech Colombia"
    },
    {
      id: 3,
      title: "Hackathon Social Impact",
      description: "48 horas desarrollando soluciones tecnológicas para problemas sociales",
      date: "2024-03-22",
      time: "08:00 AM",
      location: "Medellín, Colombia",
      type: "Presencial",
      attendees: 200,
      status: "upcoming",
      category: "social",
      organizer: "Social Impact Network"
    },
    {
      id: 4,
      title: "Crypto & Web3 Workshop",
      description: "Taller práctico sobre desarrollo en blockchain y tecnologías descentralizadas",
      date: "2024-03-10",
      time: "02:00 PM",
      location: "Virtual",
      type: "Virtual",
      attendees: 80,
      status: "upcoming",
      category: "web3",
      organizer: "Crypto Builders"
    },
    {
      id: 5,
      title: "STEAM Education Forum",
      description: "Foro sobre metodologías innovadoras en educación STEAM",
      date: "2024-02-28",
      time: "10:00 AM",
      location: "Lima, Perú",
      type: "Híbrido",
      attendees: 300,
      status: "past",
      category: "education",
      organizer: "STEAM Education Hub"
    },
    {
      id: 6,
      title: "Startup Pitch Day",
      description: "Jornada de presentación de startups ante inversionistas y mentores",
      date: "2024-02-20",
      time: "03:00 PM",
      location: "Ciudad de México, México",
      type: "Presencial",
      attendees: 120,
      status: "past",
      category: "entrepreneurship",
      organizer: "StartUp Ecosystem"
    }
  ];

  const upcomingEvents = events.filter(event => event.status === "upcoming");
  const pastEvents = events.filter(event => event.status === "past");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Virtual": return "bg-blue-100 text-blue-800";
      case "Presencial": return "bg-green-100 text-green-800";
      case "Híbrido": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section id="eventos" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Eventos y{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Actividades
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participa en eventos, talleres y actividades que conectan a las comunidades 
            y potencian el aprendizaje colaborativo.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Próximos Eventos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{event.attendees} participantes</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    Organizado por: {event.organizer}
                  </div>

                  <Button variant="hero" size="sm" className="w-full">
                    Registrarse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            Eventos Pasados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">
                      {event.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Finalizado
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} participantes</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Ver evidencia
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="community" size="lg">
            Ver calendario completo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;