// Em: src/components/layout/SubscriptionWall.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
// ===================================================================
// CORREÇÃO APLICADA AQUI: Adicionamos o 'CardFooter' que estava faltando.
// ===================================================================
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldAlert, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionWall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Card className="w-full max-w-md text-center shadow-2xl border-destructive">
          <CardHeader>
            <div className="mx-auto mb-4 text-destructive">
              <ShieldAlert className="h-16 w-16" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive">
              Assinatura Expirada
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-2">
              Olá, {user?.nome || 'Admin'}. O acesso ao seu painel foi temporariamente restringido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Para reativar todos os recursos e continuar gerenciando seu negócio, por favor, renove sua assinatura.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/planos')}
              className="w-full font-semibold text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Ver Planos e Renovar
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SubscriptionWall;
