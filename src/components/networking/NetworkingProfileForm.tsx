import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, User, MapPin, Link, Star } from "lucide-react";
import {
  useNetworkingProfile,
  useUpdateNetworkingProfile,
  useUserSkills,
  useUserInterests,
  useAddSkill,
  useAddInterest
} from "@/hooks/useNetworkingData";

const NetworkingProfileForm = () => {
  const { user } = useAuth();
  const { data: profile } = useNetworkingProfile(user?.id);
  const { data: userSkills } = useUserSkills(user?.id);
  const { data: userInterests } = useUserInterests(user?.id);
  
  const updateProfile = useUpdateNetworkingProfile();
  const addSkill = useAddSkill();
  const addInterest = useAddInterest();

  // Profile form state
  const [profileData, setProfileData] = useState({
    networking_bio: "",
    location: "",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
    is_available_for_mentoring: false,
    is_seeking_mentorship: false,
    available_for_connections: true
  });

  // Skills and interests form state
  const [newSkill, setNewSkill] = useState({
    skill_name: "",
    proficiency_level: 3,
    is_offering_mentorship: false,
    is_seeking_mentorship: false
  });
  
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileData({
        networking_bio: profile.networking_bio || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        website_url: profile.website_url || "",
        is_available_for_mentoring: profile.is_available_for_mentoring || false,
        is_seeking_mentorship: profile.is_seeking_mentorship || false,
        available_for_connections: profile.available_for_connections !== false
      });
    }
  }, [profile]);

  const handleProfileSave = () => {
    if (!user) return;
    
    updateProfile.mutate({
      user_id: user.id,
      ...profileData
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.skill_name.trim()) return;
    
    addSkill.mutate(newSkill, {
      onSuccess: () => {
        setNewSkill({
          skill_name: "",
          proficiency_level: 3,
          is_offering_mentorship: false,
          is_seeking_mentorship: false
        });
      }
    });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    addInterest.mutate({ interest_name: newInterest }, {
      onSuccess: () => {
        setNewInterest("");
      }
    });
  };

  const getProficiencyLabel = (level: number) => {
    const labels = {
      1: "Principiante",
      2: "Básico", 
      3: "Intermedio",
      4: "Avanzado",
      5: "Experto"
    };
    return labels[level as keyof typeof labels];
  };

  return (
    <div className="space-y-6">
      {/* Basic Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de Networking
          </CardTitle>
          <CardDescription>
            Completa tu perfil para que otros miembros puedan conocerte mejor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía de Networking</Label>
            <Textarea
              id="bio"
              placeholder="Cuéntanos sobre ti, tus intereses y qué buscas en la comunidad..."
              value={profileData.networking_bio}
              onChange={(e) => setProfileData({ ...profileData, networking_bio: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Ciudad, País"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              Enlaces Profesionales
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/tu-perfil"
                value={profileData.linkedin_url}
                onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/tu-usuario"
                value={profileData.twitter_url}
                onChange={(e) => setProfileData({ ...profileData, twitter_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://tu-sitio-web.com"
                value={profileData.website_url}
                onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Preferencias de Networking</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="connections"
                checked={profileData.available_for_connections}
                onCheckedChange={(checked) => 
                  setProfileData({ ...profileData, available_for_connections: checked })
                }
              />
              <Label htmlFor="connections">Disponible para conexiones</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mentoring"
                checked={profileData.is_available_for_mentoring}
                onCheckedChange={(checked) => 
                  setProfileData({ ...profileData, is_available_for_mentoring: checked })
                }
              />
              <Label htmlFor="mentoring" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Disponible como mentor
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="seeking"
                checked={profileData.is_seeking_mentorship}
                onCheckedChange={(checked) => 
                  setProfileData({ ...profileData, is_seeking_mentorship: checked })
                }
              />
              <Label htmlFor="seeking">Busco mentoría</Label>
            </div>
          </div>

          <Button 
            onClick={handleProfileSave}
            disabled={updateProfile.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfile.isPending ? "Guardando..." : "Guardar Perfil"}
          </Button>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Habilidades y Expertises</CardTitle>
          <CardDescription>
            Agrega tus habilidades para que otros puedan encontrarte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Skills */}
          {userSkills && userSkills.length > 0 && (
            <div className="space-y-2">
              <Label>Mis Habilidades</Label>
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="text-sm">
                    {skill.skill_name}
                    <span className="ml-1 text-xs">
                      ({getProficiencyLabel(skill.proficiency_level || 3)})
                    </span>
                    {skill.is_offering_mentorship && (
                      <Star className="h-3 w-3 ml-1 text-yellow-500" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Skill */}
          <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
            <Label>Agregar Nueva Habilidad</Label>
            <div className="space-y-2">
              <Input
                placeholder="Nombre de la habilidad"
                value={newSkill.skill_name}
                onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="proficiency" className="text-sm">Nivel:</Label>
                  <select
                    id="proficiency"
                    value={newSkill.proficiency_level}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: Number(e.target.value) })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {[1, 2, 3, 4, 5].map(level => (
                      <option key={level} value={level}>
                        {getProficiencyLabel(level)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="offer-mentorship"
                    checked={newSkill.is_offering_mentorship}
                    onCheckedChange={(checked) => 
                      setNewSkill({ ...newSkill, is_offering_mentorship: checked })
                    }
                  />
                  <Label htmlFor="offer-mentorship" className="text-sm">Ofrezco mentoría</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="seek-mentorship"
                    checked={newSkill.is_seeking_mentorship}
                    onCheckedChange={(checked) => 
                      setNewSkill({ ...newSkill, is_seeking_mentorship: checked })
                    }
                  />
                  <Label htmlFor="seek-mentorship" className="text-sm">Busco mentoría</Label>
                </div>
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={handleAddSkill}
              disabled={addSkill.isPending || !newSkill.skill_name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Habilidad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Intereses</CardTitle>
          <CardDescription>
            Comparte tus intereses para conectar con personas afines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Interests */}
          {userInterests && userInterests.length > 0 && (
            <div className="space-y-2">
              <Label>Mis Intereses</Label>
              <div className="flex flex-wrap gap-2">
                {userInterests.map((interest) => (
                  <Badge key={interest.id} variant="outline">
                    {interest.interest_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Interest */}
          <div className="flex gap-2">
            <Input
              placeholder="Nuevo interés"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button 
              size="sm" 
              onClick={handleAddInterest}
              disabled={addInterest.isPending || !newInterest.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkingProfileForm;