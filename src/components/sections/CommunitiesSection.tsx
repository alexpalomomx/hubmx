import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Filter, Users, MapPin } from "lucide-react";

const CommunitiesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todas" },
    { id: "tech", name: "Tecnología" },
    { id: "social", name: "Impacto Social" },
    { id: "education", name: "Educación" },
    { id: "entrepreneurship", name: "Emprendimiento" },
    { id: "web3", name: "Web3" }
  ];

  const communities = [
    {
      id: 1,
      name: "Tech Innovators LATAM",
      description: "Comunidad de desarrolladores e innovadores tecnológicos de América Latina",
      category: "tech",
      topics: ["IA", "Machine Learning", "Blockchain"],
      members: 1200,
      location: "LATAM",
      logo: "🚀",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      name: "STEAM Education Hub",
      description: "Promovemos la educación en ciencia, tecnología, ingeniería, arte y matemáticas",
      category: "education",
      topics: ["STEAM", "Educación", "Innovación"],
      members: 850,
      location: "Global",
      logo: "🎓",
      color: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      name: "Women in Tech Colombia",
      description: "Empoderando a las mujeres en el sector tecnológico colombiano",
      category: "tech",
      topics: ["Diversidad", "Liderazgo", "Tech"],
      members: 650,
      location: "Colombia",
      logo: "👩‍💻",
      color: "from-pink-500 to-rose-600"
    },
    {
      id: 4,
      name: "Crypto Builders",
      description: "Construyendo el futuro descentralizado con Web3 y blockchain",
      category: "web3",
      topics: ["Web3", "DeFi", "NFTs"],
      members: 400,
      location: "Global",
      logo: "⛓️",
      color: "from-orange-500 to-red-600"
    },
    {
      id: 5,
      name: "Social Impact Network",
      description: "Red de organizaciones enfocadas en generar impacto social positivo",
      category: "social",
      topics: ["ODS", "Sostenibilidad", "Impacto"],
      members: 320,
      location: "Iberoamérica",
      logo: "🌱",
      color: "from-emerald-500 to-green-600"
    },
    {
      id: 6,
      name: "StartUp Ecosystem",
      description: "Conectando emprendedores, mentores e inversionistas",
      category: "entrepreneurship",
      topics: ["Startups", "Inversión", "Mentoring"],
      members: 780,
      location: "LATAM",
      logo: "💡",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const filteredCommunities = selectedCategory === "all" 
    ? communities 
    : communities.filter(community => community.category === selectedCategory);

  return (
    <section id="comunidades" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comunidades{" "}
            <span className="bg-gradient-community bg-clip-text text-transparent">
              Activas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre y conecta con comunidades que están transformando el mundo 
            a través de la tecnología, la educación y el impacto social.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
          </div>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="transition-all duration-200"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="group hover:shadow-community transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {community.logo}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                  {community.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {community.description}
                </p>
                
                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {community.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.members.toLocaleString()} miembros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{community.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            Ver todas las comunidades
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunitiesSection;