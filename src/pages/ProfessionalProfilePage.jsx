import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Star, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfessionalProfile } from '@/services/serviceApi';

const ProfessionalProfilePage = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Pega os dados básicos do usuário logado (da tabela Login)
  const [profile, setProfile] = useState(null); // Para os dados da tabela Professional
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyProfessionalProfile();
      setProfile(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível buscar seus dados profissionais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return <p className="text-center text-muted-foreground p-10">Carregando perfil...</p>;
  }

  if (!profile || !user) {
    return <p className="text-center text-muted-foreground p-10">Não foi possível carregar o perfil.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center gap-4">
        <img 
          className="h-24 w-24 rounded-full object-cover border-4 border-primary/50" 
          alt={user.nome}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random&size=128`}
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.nome}</h1>
          <p className="text-xl text-primary">{profile.role}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.telefone || 'Não informado'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Especialidades e Comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Minhas Especialidades:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.specialties && profile.specialties.length > 0 ? (
                  profile.specialties.map((specialty, index) => (
                    <span key={index} className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada.</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span>Comissão de <strong>{profile.commissionRate || 0}%</strong> sobre os serviços.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalProfilePage;
