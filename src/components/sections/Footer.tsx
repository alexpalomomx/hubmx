import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
const Footer = () => {
  const navigation = {
    main: [{
      name: "Inicio",
      href: "#inicio"
    }, {
      name: "¿Qué es el HUB?",
      href: "#que-es"
    }, {
      name: "Comunidades",
      href: "#comunidades"
    }, {
      name: "Eventos",
      href: "#eventos"
    }, {
      name: "Alianzas",
      href: "#alianzas"
    }],
    legal: [{
      name: "Términos y Condiciones",
      href: "#"
    }, {
      name: "Política de Privacidad",
      href: "#"
    }, {
      name: "Código de Conducta",
      href: "#"
    }, {
      name: "FAQ",
      href: "#"
    }],
    social: [{
      name: "Facebook",
      icon: Facebook,
      href: "#"
    }, {
      name: "Twitter",
      icon: Twitter,
      href: "#"
    }, {
      name: "Instagram",
      icon: Instagram,
      href: "#"
    }, {
      name: "LinkedIn",
      icon: Linkedin,
      href: "#"
    }, {
      name: "GitHub",
      icon: Github,
      href: "#"
    }]
  };
  return <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
              HUB Comunidades
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              La red colaborativa que conecta comunidades tecnológicas, sociales y de impacto 
              para transformar el futuro desde lo local hacia lo global.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contacto@hubcomunidades.org</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+57 (1) 234-5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>América Latina</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              {navigation.main.map(item => <li key={item.name}>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    {item.name}
                  </a>
                </li>)}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {navigation.legal.map(item => <li key={item.name}>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    {item.name}
                  </a>
                </li>)}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Newsletter */}
        

        

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 HUB Comunidades. Todos los derechos reservados.
          </div>
          
          {/* Social Links */}
          <div className="flex gap-4">
            {navigation.social.map(item => <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary transition-colors duration-200" aria-label={item.name}>
                <item.icon className="h-5 w-5" />
              </a>)}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Powered by Alex Palomo
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;