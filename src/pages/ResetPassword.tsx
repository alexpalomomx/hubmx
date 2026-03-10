import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check for recovery session in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setIsValidSession(true);
    }

    // Also listen for auth state changes (Supabase auto-exchanges the token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Contraseña actualizada!", description: "Tu contraseña ha sido cambiada exitosamente." });
      navigate("/");
    }
    setLoading(false);
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <SEOHead title="Restablecer Contraseña" description="Restablece tu contraseña en HUB MX." path="/reset-password" noindex />
        <Card className="w-full max-w-md shadow-glow">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Verificando enlace de recuperación...</p>
            <p className="text-sm text-muted-foreground">Si el enlace expiró, solicita uno nuevo desde la página de inicio de sesión.</p>
            <Button variant="hero" onClick={() => navigate("/auth")}>Ir a Iniciar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <SEOHead title="Restablecer Contraseña" description="Restablece tu contraseña en HUB MX." path="/reset-password" noindex />
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Nueva Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            <Button type="submit" className="w-full" disabled={loading} variant="hero">
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
