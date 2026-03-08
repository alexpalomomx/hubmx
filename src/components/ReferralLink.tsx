import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Share2, Users } from "lucide-react";

export const ReferralLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    
    // Check for existing referral code
    const { data } = await supabase
      .from("referrals" as any)
      .select("referral_code, status")
      .eq("referrer_id", user.id);

    if (data && (data as any[]).length > 0) {
      setReferralCode((data as any[])[0].referral_code);
      setReferralCount((data as any[]).filter((r: any) => r.status === 'completed').length);
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;
    setLoading(true);
    
    const code = `${user.id.substring(0, 8)}-${Date.now().toString(36)}`;
    
    try {
      await supabase.from("referrals" as any).insert({
        referrer_id: user.id,
        referred_email: 'pending',
        referral_code: code,
        status: 'pending'
      } as any);
      
      setReferralCode(code);
      toast({
        title: "¡Link generado!",
        description: "Comparte tu link para ganar 10 puntos por cada referido",
      });
    } catch (err) {
      console.error('Error generating referral:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = referralCode 
    ? `${window.location.origin}/auth?tab=signup&ref=${referralCode}` 
    : null;

  const copyLink = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "¡Link copiado!",
        description: "Compártelo para ganar puntos",
      });
    }
  };

  const shareWhatsApp = () => {
    if (referralUrl) {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`¡Únete al HUB de Comunidades! Regístrate aquí: ${referralUrl}`)}`,
        '_blank'
      );
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Referir Amigos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gana <span className="font-bold text-primary">10 puntos</span> por cada persona que se registre con tu link.
        </p>
        
        {referralUrl ? (
          <>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={shareWhatsApp} className="flex-1">
                Compartir por WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink} className="flex-1">
                <Copy className="h-4 w-4 mr-1" />
                Copiar link
              </Button>
            </div>
            {referralCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Has referido a <span className="font-bold">{referralCount}</span> persona(s) ✨
              </p>
            )}
          </>
        ) : (
          <Button onClick={generateReferralCode} disabled={loading} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            {loading ? "Generando..." : "Generar mi link de referido"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
