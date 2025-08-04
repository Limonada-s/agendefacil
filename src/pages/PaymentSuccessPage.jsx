// Em: src/pages/PaymentSuccessPage.jsx

import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Importar o useAuth

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Pegar o usuário do contexto

  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plano') || 'Seu Plano';

  useEffect(() => {
    // A lógica de toast pode permanecer como você a criou
    toast({
      title: "Pagamento Confirmado!",
      description: `Sua assinatura do plano ${planName} foi ativada.`,
      className: "bg-green-600 text-white border-green-700",
      duration: 7000,
    });
  }, [planName, toast]);

  // ===================================================================
  // ESTA É A FUNÇÃO CORRIGIDA, ADAPTADA AO SEU NOVO CÓDIGO
  // ===================================================================
  const handleGoToDashboard = () => {
      // Usamos o 'user' do AuthContext para decidir o destino.
      const destination = user?.tipo === 'admin' ? '/' : '/descobrir-servicos';
      
      // Forçamos o recarregamento completo para o destino correto.
      // Isso garante que o AuthContext leia o novo token do localStorage.
      window.location.href = destination;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-card text-card-foreground border-border text-center">
          <CardHeader>
            <div className="mx-auto mb-6 text-green-500">
              <CheckCircle className="h-20 w-20" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-4xl font-bold text-green-600">
              Pagamento Realizado com Sucesso!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-3">
              Obrigado por adquirir o <span className="font-semibold text-primary">{planName}</span>. Sua transação foi concluída.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Um email de confirmação foi enviado para você com os detalhes da sua assinatura.
              Você já pode começar a usar todos os benefícios do seu novo plano!
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground/70">
                ID da Transação (Stripe): {sessionId.substring(0,15)}...
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-6">
            <Button 
              onClick={handleGoToDashboard} // Usamos a nova função aqui
              className="w-full font-semibold text-lg py-3 bg-green-600 hover:bg-green-700 text-white"
            >
              Ir para o Painel <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/planos" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Ver outros planos
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
