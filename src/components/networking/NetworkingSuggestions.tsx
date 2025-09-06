import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  X, 
  Sparkles, 
  MapPin, 
  BookOpen,
  RefreshCw,
  Star
} from "lucide-react";
import { useNetworkingSuggestions, useUpdateSuggestionStatus, useGenerateSuggestions } from "@/hooks/useNetworkingSuggestions";
import { useCreateConnection } from "@/hooks/useNetworkingData";
import { useTrackNetworkingAction } from "@/hooks/useNetworkingAnalytics";

export const NetworkingSuggestions = () => {
  const { data: suggestions, isLoading } = useNetworkingSuggestions();
  const updateSuggestionStatus = useUpdateSuggestionStatus();
  const generateSuggestions = useGenerateSuggestions();
  const createConnection = useCreateConnection();
  const trackAction = useTrackNetworkingAction();

  const handleAcceptSuggestion = async (suggestion: any) => {
    // Accept suggestion
    await updateSuggestionStatus.mutateAsync({
      suggestionId: suggestion.id,
      status: "accepted"
    });

    // Create connection request
    await createConnection.mutateAsync({
      requested_id: suggestion.suggested_user_id,
      message: `¡Hola! La plataforma sugirió que nos conectáramos basado en nuestros intereses comunes. Me gustaría conocerte mejor.`
    });

    // Track analytics
    trackAction.mutate({
      action_type: "suggestion_accepted",
      target_user_id: suggestion.suggested_user_id,
      metadata: {
        suggestion_id: suggestion.id,
        match_score: suggestion.match_score,
        reason: suggestion.suggestion_reason
      }
    });
  };

  const handleDismissSuggestion = (suggestionId: string, suggestedUserId: string) => {
    updateSuggestionStatus.mutate({
      suggestionId,
      status: "dismissed"
    });

    // Track analytics
    trackAction.mutate({
      action_type: "suggestion_dismissed",
      target_user_id: suggestedUserId,
      metadata: { suggestion_id: suggestionId }
    });
  };

  const handleGenerateMore = () => {
    generateSuggestions.mutate(undefined);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando sugerencias...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Sugerencias de Networking</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateMore}
            disabled={generateSuggestions.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateSuggestions.isPending ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        <CardDescription>
          Personas que podrían interesarte basado en tus habilidades e intereses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions && suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => {
              const user = suggestion.suggested_user;
              
              return (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{user.display_name}</h3>
                            {user.networking_profile?.location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {user.networking_profile.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {(suggestion.match_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-2">
                          {user.skills?.slice(0, 3).map((skill: any) => (
                            <Badge key={skill.id} variant="secondary" className="mr-1 mb-1 text-xs">
                              {skill.skill_name}
                            </Badge>
                          ))}
                          {user.skills?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skills.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Mentoring Status */}
                        <div className="mt-2 flex gap-1">
                          {user.networking_profile?.is_available_for_mentoring && (
                            <Badge variant="outline" className="text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Mentor
                            </Badge>
                          )}
                          {user.networking_profile?.is_seeking_mentorship && (
                            <Badge variant="outline" className="text-xs">
                              Busca mentoría
                            </Badge>
                          )}
                        </div>

                        {/* Reason */}
                        {suggestion.suggestion_reason && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {suggestion.suggestion_reason}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            disabled={updateSuggestionStatus.isPending || createConnection.isPending}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Conectar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissSuggestion(suggestion.id, suggestion.suggested_user_id)}
                            disabled={updateSuggestionStatus.isPending}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No hay sugerencias disponibles</p>
            <p className="text-sm text-muted-foreground mb-4">
              Completa tu perfil de networking para recibir mejores sugerencias
            </p>
            <Button onClick={handleGenerateMore} disabled={generateSuggestions.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Sugerencias
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};