
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness, businessTypes } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Scissors, Paintbrush, UserCheck, Sparkles, Droplets } from 'lucide-react'; // Mantive os ícones originais, ajuste se necessário

const iconMap = {
  Scissors, Paintbrush, UserCheck, Sparkles, Droplets, Briefcase // Adicionado Briefcase para fallback
};

const BusinessTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { selectBusinessType, businessType: currentBusinessType } = useBusiness();
  const { isAuthenticated, userType } = useAuth();

  const handleSelectType = (type) => {
    selectBusinessType(type);
    if (isAuthenticated) {
      // Se já estiver autenticado, volta para a página apropriada
      // (Ex: painel admin ou descoberta de serviços cliente)
      // ou para a home se o tipo de usuário não for claro
      if (userType === 'admin') {
        navigate('/');
      } else if (userType === 'user') {
        navigate('/descobrir-servicos');
      } else {
        navigate('/'); // Fallback
      }
    } else {
      // Se não estiver autenticado, vai para o login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-background to-primary/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl" // Aumentei um pouco o max-width
      >
        <Card className="shadow-2xl bg-card/90 backdrop-blur-sm border-border text-card-foreground">
          <CardHeader className="text-center">
             <div className="mx-auto mb-4 text-primary">
              <Briefcase className="h-16 w-16" /> {/* Ícone maior */}
            </div>
            <CardTitle className="text-4xl font-bold">Selecione o Ramo de Atividade</CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-2">
              {isAuthenticated 
                ? `Olá! Escolha um novo ramo para ${userType === 'admin' ? 'gerenciar' : 'explorar'}.`
                : "Escolha o tipo do seu negócio para personalizar sua experiência."
              }
              {currentBusinessType && <span className="block mt-1 text-sm">Ramo atual: <span className="font-semibold text-primary">{currentBusinessType.name}</span></span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6"> {/* Ajustado para até 3 colunas em telas maiores */}
            {businessTypes.map((type) => {
              const IconComponent = iconMap[type.icon] || Briefcase;
              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  className="transform transition-all duration-150 ease-out"
                >
                  <Button
                    variant="outline"
                    className={`w-full h-32 flex flex-col items-center justify-center text-base p-4 
                                border-2 border-input hover:border-primary hover:bg-primary/10 
                                focus:ring-primary focus:ring-2 focus:bg-primary/10
                                transition-all duration-200 group
                                ${currentBusinessType?.id === type.id ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-background/50 hover:bg-muted/50'}`}
                    onClick={() => handleSelectType(type)}
                  >
                    <IconComponent className={`h-10 w-10 mb-2 transition-colors duration-200 ${currentBusinessType?.id === type.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    <span className={`font-medium transition-colors duration-200 ${currentBusinessType?.id === type.id ? 'text-primary' : 'text-card-foreground group-hover:text-primary'}`}>
                      {type.name}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BusinessTypeSelectionPage;
