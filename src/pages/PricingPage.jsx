// Em: src/pages/PricingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import api from '@/services/api';

// A estrutura de planos que você criou
const plans = [
  {
    name: "BASIC",
    price: "49,90",
    features: [
      { text: "1 Profissional", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Até 10 serviços", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
    ],
    cta: "Em Breve",
    highlight: false,
    disabled: true,
  },
  {
    name: "PLANO COMPLETO",
    price: "99,90",
    features: [
      { text: "Profissionais ilimitados", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Serviços ilimitados", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Página completa com agendamentos", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Sistema de Comissão", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Estatísticas e Relatórios", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Loja de Produtos Integrada", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Suporte Prioritário", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
    ],
    cta: "Assinar Plano Completo",
    highlight: true,
    disabled: false,
  },
  {
    name: "ENTERPRISE",
    price: "Customizado",
    features: [
      { text: "Tudo do Plano Completo", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Gerente de Conta Dedicado", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
      { text: "Integrações Personalizadas", icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> },
    ],
    cta: "Fale Conosco",
    highlight: false,
    disabled: true,
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  // Pegamos a nova função do nosso contexto
  const { token, updateUserAndToken } = useAuth();

  const handleSelectPlan = async (plan) => {
    if (plan.disabled) return;
    if (plan.name === 'ENTERPRISE') {
      navigate('/contato');
      return;
    }

    try {
      const response = await api.post('/payments/create-checkout-session', 
        { plan: plan.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // ===================================================================
        // PASSO CRÍTICO: ATUALIZAR O FRONTEND COM O NOVO TOKEN
        // ===================================================================
        if (response.data.newToken && response.data.newUser) {
            updateUserAndToken(response.data.newToken, response.data.newUser);
        }
        
        // Navega para a página de sucesso
        navigate(`/pagamento/sucesso?plano=${plan.name.toLowerCase()}`);
      } else {
        console.error("Falha na atualização do plano:", response.data.message);
      }
      
    } catch (error) {
      console.error("Erro crítico ao processar pagamento:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-primary/30 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto text-center mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">
          Um plano simples e completo para o seu negócio
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Todas as ferramentas que você precisa, sem complicações.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20, scale:0.95 }}
            animate={{ opacity: 1, y: 0, scale:1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`flex flex-col h-full rounded-xl shadow-2xl transition-all ${plan.highlight ? 'border-2 border-primary ring-4 ring-primary/20 bg-card' : 'bg-card/80 backdrop-blur-sm border-border'} ${plan.disabled ? 'opacity-60 grayscale' : ''}`}>
              <CardHeader className="p-6">
                <div className="flex justify-between items-center">
                    <CardTitle className={`text-2xl font-semibold ${plan.highlight ? 'text-primary' : 'text-foreground'}`}>{plan.name}</CardTitle>
                    {plan.highlight && <span className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">RECOMENDADO</span>}
                </div>
                <CardDescription className="text-4xl font-bold text-foreground mt-2">
                  {plan.price.startsWith('R$') ? plan.price : `R$ ${plan.price}`}
                  {plan.name !== 'ENTERPRISE' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start">
                      {feature.icon}
                      <span className="text-sm text-muted-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 mt-auto">
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full text-lg font-semibold py-3 ${plan.highlight ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50'}`}
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={plan.disabled}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
