// Em: src/components/layout/TrialBanner.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Supondo que seu AuthContext forneça os dados do usuário/empresa
import { differenceInDays } from 'date-fns';

const TrialBanner = () => {
  const { user } = useAuth(); // Precisa ter acesso aos dados da assinatura do usuário
  const navigate = useNavigate();

  const subscriptionEndDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  
  if (user?.subscriptionStatus !== 'trialing' || !subscriptionEndDate) {
    return null; // Não mostra o banner se não estiver em trial
  }

  const daysLeft = differenceInDays(subscriptionEndDate, new Date());

  const getMessage = () => {
    if (daysLeft <= 0) {
      return "Seu período de teste expirou.";
    }
    if (daysLeft === 1) {
      return "Seu período de teste termina amanhã!";
    }
    return `Você tem ${daysLeft} dias restantes no seu período de teste.`;
  };

  return (
    <div className="container mx-auto py-2">
        <Alert className="bg-primary/10 border-primary/20 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-3 text-primary" />
                <div>
                    <AlertTitle className="font-bold text-foreground">{getMessage()}</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        Faça o upgrade agora para desbloquear todos os recursos e continuar crescendo.
                    </AlertDescription>
                </div>
            </div>
            <Button onClick={() => navigate('/planos')} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                Fazer Upgrade
            </Button>
        </Alert>
    </div>
  );
};

export default TrialBanner;
