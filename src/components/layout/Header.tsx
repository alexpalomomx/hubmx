import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronDown, Info, Handshake, Mail, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    signOut,
    isAdmin,
    isCoordinator,
    isCommunityLeader,
    isCollaborator
  } = useAuth();
  const navigate = useNavigate();
  const navigation = [{
    name: "Inicio",
    href: "#inicio"
  }, {
    name: "Comunidades",
    href: "#comunidades"
  }, {
    name: "Eventos",
    href: "#eventos"
  }, {
    name: "Únete",
    href: "#unete"
  }];
  const moreNavigation = [{
    name: "¿Qué es el HUB?",
    href: "#que-es",
    icon: Info
  }, {
    name: "Alianzas",
    href: "#alianzas",
    icon: Handshake
  }, {
    name: "Contacto",
    href: "#contacto",
    icon: Mail
  }];
  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };
  return <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">HUB de Comunidades</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map(item => <button key={item.name} onClick={() => scrollToSection(item.href.substring(1))} className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer">
                  {item.name}
                </button>)}
              
              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <span>Más</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {moreNavigation.map(item => <DropdownMenuItem key={item.name} asChild>
                      <button onClick={() => scrollToSection(item.href.substring(1))} className="flex items-center w-full cursor-pointer">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </button>
                    </DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:block truncate max-w-32">
                      {user.email?.split('@')[0]}
                    </span>
                    {(isAdmin || isCoordinator || isCommunityLeader || isCollaborator) && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        {isAdmin ? 'Admin' : isCoordinator ? 'Coord' : isCommunityLeader ? 'Líder' : 'Colab'}
                      </span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Mi Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/networking")}>
                    <Users className="mr-2 h-4 w-4" />
                    Networking
                  </DropdownMenuItem>
                  {(isAdmin || isCoordinator) && <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </DropdownMenuItem>}
                  {isCommunityLeader && <DropdownMenuItem onClick={() => navigate("/community-leader")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard Líder
                    </DropdownMenuItem>}
                  {isCollaborator && <DropdownMenuItem onClick={() => navigate("/collaborator")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard Colaborador
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Iniciar sesión
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth?tab=signup")}>
                  Registrarse
                </Button>
              </>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
            {navigation.map(item => <button key={item.name} onClick={() => scrollToSection(item.href.substring(1))} className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left cursor-pointer">
                {item.name}
              </button>)}
            
            {/* More sections in mobile */}
            <div className="border-t border-border pt-2 mt-2">
              {moreNavigation.map(item => <button key={item.name} onClick={() => scrollToSection(item.href.substring(1))} className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center w-full text-left cursor-pointer">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </button>)}
            </div>
            <div className="pt-4 space-y-2">
              {user ? <>
                  <div className="text-sm text-muted-foreground px-3">
                    {user.email}
                    {(isAdmin || isCoordinator || isCommunityLeader || isCollaborator) && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        {isAdmin ? 'Admin' : isCoordinator ? 'Coordinador' : isCommunityLeader ? 'Líder' : 'Colaborador'}
                      </span>}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
              navigate("/dashboard");
              setIsMenuOpen(false);
            }}>
                    Mi Dashboard
                  </Button>
                  {(isAdmin || isCoordinator) && <Button variant="outline" className="w-full" onClick={() => {
              navigate("/admin");
              setIsMenuOpen(false);
            }}>
                      Dashboard Admin
                    </Button>}
                  {isCommunityLeader && <Button variant="outline" className="w-full" onClick={() => {
              navigate("/community-leader");
              setIsMenuOpen(false);
            }}>
                      Dashboard Líder
                    </Button>}
                  {isCollaborator && <Button variant="outline" className="w-full" onClick={() => {
              navigate("/collaborator");
              setIsMenuOpen(false);
            }}>
                      Dashboard Colaborador
                    </Button>}
                  <Button variant="hero" className="w-full" onClick={() => {
              signOut();
              setIsMenuOpen(false);
            }}>
                    Cerrar sesión
                  </Button>
                </> : <>
                  <Button variant="outline" className="w-full" onClick={() => {
              navigate("/auth");
              setIsMenuOpen(false);
            }}>
                    Iniciar sesión
                  </Button>
                  <Button variant="hero" className="w-full" onClick={() => {
              navigate("/auth?tab=signup");
              setIsMenuOpen(false);
            }}>
                    Registrarse
                  </Button>
                </>}
            </div>
          </div>
        </div>}
    </header>;
};
export default Header;