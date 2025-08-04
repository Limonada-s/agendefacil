// ===================================================================
// ARQUIVO A: Crie `src/pages/ForgotPasswordPage.jsx`
// ===================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/services/serviceApi';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true); // Mostra a mensagem de sucesso
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Verifique sua caixa de entrada." 
              : "Digite seu email para receber o link de redefinição."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground">
                Se um usuário com o email <span className="font-bold text-primary">{email}</span> existir em nosso sistema, um link para redefinir a senha foi enviado.
              </p>
              <Button onClick={() => navigate('/login')} className="mt-6 w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>
              <p className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">Lembrou a senha? Voltar para o login</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;


// ===================================================================
// ARQUIVO B: Crie `src/pages/ResetPasswordPage.jsx`
// ===================================================================

