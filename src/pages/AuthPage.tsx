import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteMode, setInviteMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const type = url.searchParams.get("type");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).catch(() => {});
    }
    if (type === "invite") {
      setInviteMode(true);
    }
  }, []);

  // Redirect if already authenticated
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);
    if (!error) {
      navigate("/");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;

    const { error } = await signUp(email, password, displayName);
    if (!error) {
      navigate("/");
    }
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      navigate("/");
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
              HUB Comunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inviteMode ? (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Crea tu contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading} variant="hero">
                  {loading ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" name="email" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Contraseña</Label>
                      <div className="relative">
                        <Input id="signin-password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} variant="hero">
                      {loading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre completo</Label>
                      <Input id="signup-name" name="displayName" type="text" placeholder="Tu nombre completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <div className="relative">
                        <Input id="signup-password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" minLength={6} required />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} variant="hero">
                      {loading ? "Registrando..." : "Crear Cuenta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Al registrarte, aceptas nuestros{" "}
                <Link to="#" className="text-primary hover:underline">Términos y Condiciones</Link>{" "}
                y{" "}
                <Link to="#" className="text-primary hover:underline">Política de Privacidad</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;