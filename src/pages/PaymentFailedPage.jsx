
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const PaymentFailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const planName = queryParams.get('plano') || 'Seu Plano';
  const errorReason = queryParams.get('error') || 'Não foi possível processar seu pagamento.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500 via-rose-600 to-pink-700">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-card text-card-foreground border-border text-center">
          <CardHeader>
            <div className="mx-auto mb-6 text-red-500">
              <XCircle className="h-20 w-20" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-4xl font-bold text-red-600">
              Falha no Pagamento
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-3">
              Houve um problema ao processar o pagamento para o <span className="font-semibold text-primary">{planName}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-sm text-red-700">{errorReason}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Por favor, verifique os dados do seu cartão ou tente um método de pagamento diferente.
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-6">
            <Button 
              onClick={() => navigate(`/checkout?plano=${planName}`)} // Tenta novamente o checkout para o mesmo plano
              className="w-full font-semibold text-lg py-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Tentar Novamente <RefreshCw className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/planos" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Escolher Outro Plano
            </Link>
             <Link to="/contato" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Entrar em Contato com Suporte
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
