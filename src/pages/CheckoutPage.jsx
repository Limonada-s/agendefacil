
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/AuthContext';

// Substitua pela sua chave publicável do Stripe quando a tiver
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'; 
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, userType } = useAuth();

  // Exemplo: obter informações do plano da URL ou do estado da localização
  const queryParams = new URLSearchParams(location.search);
  const planName = queryParams.get('plano') || 'Plano Padrão';
  const planPrice = queryParams.get('preco') || '99.90'; // Exemplo
  const priceId = queryParams.get('priceId'); // Este virá do seu produto no Stripe

  const [isLoading, setIsLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    // Simular carregamento de dados do usuário se logado
    if (isAuthenticated) {
      // Em um app real, buscaria dados do usuário do AuthContext ou API
      setClientName(userType === 'admin' ? 'Empresa Exemplo' : 'Cliente Exemplo');
      setClientEmail(userType === 'admin' ? 'admin@example.com' : 'user@example.com');
    }
  }, [isAuthenticated, userType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!priceId) {
        toast({
            title: "Erro de Configuração",
            description: "Price ID do Stripe não encontrado. Verifique a configuração do plano.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    if (STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY') {
        toast({
            title: "Configuração Pendente",
            description: "A chave publicável do Stripe ainda não foi configurada. O pagamento não pode ser processado.",
            variant: "destructive",
        });
        setIsLoading(false);
        // Em um cenário de demonstração, poderia redirecionar para sucesso/falha simulado
        // navigate('/pagamento/sucesso?plano=' + planName); 
        return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      toast({ title: "Erro", description: "Stripe.js não carregou.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription', // ou 'payment' para pagamentos únicos
      successUrl: `${window.location.origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}&plano=${planName}`,
      cancelUrl: `${window.location.origin}/pagamento/falha?plano=${planName}`,
      // customerEmail: clientEmail, // Opcional: pré-preenche o email no Stripe Checkout
    });

    if (error) {
      console.error("Stripe redirectToCheckout error:", error);
      toast({ title: "Erro no Checkout", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-slate-800 to-primary/20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl bg-card text-card-foreground border-border">
          <CardHeader className="text-center relative">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-primary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="mx-auto mb-3 text-primary">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Finalizar Compra
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Você está adquirindo o <span className="font-semibold text-primary">{planName}</span> por R$ {planPrice}/mês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="clientName">Nome Completo</Label>
                <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu nome completo" required />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              
              <div className="border p-4 rounded-md bg-muted/30">
                <h3 className="font-semibold mb-2 text-foreground">Resumo do Pedido</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium text-foreground">{planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço Mensal:</span>
                  <span className="font-medium text-foreground">R$ {planPrice}</span>
                </div>
                <div className="border-t my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary">R$ {planPrice}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Você será redirecionado para a página segura do Stripe para concluir o pagamento.
              </p>

              <Button type="submit" className="w-full font-semibold text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Processando...' : 'Pagar com Stripe'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground w-full">
              Pagamento seguro processado por Stripe.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
