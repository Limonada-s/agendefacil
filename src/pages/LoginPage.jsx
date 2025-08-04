// Em: src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, UserPlus, UserCog, Users, Building } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCPF } from '@/lib/formatters';

const RegisterForm = ({ onRegister, isLoading }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const handleCpfChange = (e) => {
    const formattedCpf = formatCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "Sua senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (senha !== confirmarSenha) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      });
      return;
    }
    onRegister({ nome, email, senha, confirmarSenha, cpf, telefone, data_nascimento: dataNascimento });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3 mt-4">
        <div className="space-y-1">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-register">Email</Label>
          <Input id="email-register" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
          <Input id="dataNascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="senha-register">Senha</Label>
          <Input id="senha-register" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
          <Input id="confirmarSenha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required disabled={isLoading} />
        </div>
        <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
          {isLoading ? "Registrando..." : <><UserPlus className="mr-2 h-4 w-4" /> Registrar Cliente</>}
        </Button>
      </div>
    </form>
  );
};


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authContextLogin, signUp: authContextSignUp, isAuthenticated, userType: authContextUserType, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loginAs, setLoginAs] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const defaultRedirect = authContextUserType === 'admin' ? '/' : '/descobrir-servicos';
      const redirectTo = location.state?.from?.pathname || defaultRedirect;
      if (redirectTo === '/login' || redirectTo === '/registrar-empresa') {
        navigate(defaultRedirect, { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isAuthenticated, authContextUserType, navigate, location.state, authLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authContextLogin(email, password);
      toast({ title: 'Login bem-sucedido!' });
    } catch (error) {
      // A linha de console.error foi removida daqui.
      // O erro agora é tratado silenciosamente, mostrando apenas o toast para o usuário.

      let errorMessage = "Falha no login. Verifique suas credenciais.";
      if (error && error.erro) {
        errorMessage = error.erro;
      } else if (error && error.message) {
        errorMessage = error.message;
      }

      toast({ title: 'Erro de Login', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (registrationData) => {
    setIsLoading(true);
    const { senha, confirmarSenha, ...otherData } = registrationData;
    if (senha !== confirmarSenha) {
      toast({ title: 'Senhas não conferem', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    try {
      const userData = { ...otherData, senha: senha, tipo: 'cliente' };
      await authContextSignUp(userData);
      toast({ title: 'Cadastro realizado!', description: "Você pode fazer login agora." });
      setIsRegistering(false);
    } catch (error) {
      let errorMessage = error?.erro || "Falha ao registrar cliente.";
      toast({ title: 'Erro de Cadastro', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="email-login">Email</Label>
          <Input id="email-login" type="email" placeholder={loginAs === 'user' ? "seu@email.com" : "email.admin@suaempresa.com"} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-login">Senha</Label>
          <Input id="password-login" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        </div>
        <Button type="submit" className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || authLoading}>
          {isLoading || authLoading ? "Aguarde..." : <><LogIn className="mr-2 h-4 w-4" /> Entrar como {loginAs === 'user' ? 'Cliente' : 'Prestador'}</>}
        </Button>
      </div>
    </form>
  );

  const renderRegisterForm = () => {
    if (loginAs === 'user') {
      return <RegisterForm onRegister={handleRegister} isLoading={isLoading} />;
    } else {
      return (
        <div className="space-y-3 mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Para registrar sua empresa e iniciar seu teste gratuito, clique no botão abaixo.
          </p>
          <Button onClick={() => navigate('/registrar-empresa')} className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            <Building className="mr-2 h-4 w-4" /> Registrar Minha Empresa
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            Já tem uma conta de prestador? Use a aba "Login".
          </p>
        </div>
      );
    }
  };

  if (authLoading && !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">Verificando sessão...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-card text-card-foreground border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Select value={loginAs} onValueChange={(value) => { setLoginAs(value); setIsRegistering(false); }} disabled={isLoading}>
                <SelectTrigger className="w-[180px] mx-auto bg-input text-foreground border-border">
                  <SelectValue placeholder="Tipo de Acesso" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="user" className="hover:bg-muted/50 focus:bg-muted/50">
                    <div className="flex items-center"> <Users className="mr-2 h-4 w-4" /> Cliente </div>
                  </SelectItem>
                  <SelectItem value="admin" className="hover:bg-muted/50 focus:bg-muted/50">
                    <div className="flex items-center"> <UserCog className="mr-2 h-4 w-4" /> Prestador </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardTitle className="text-3xl font-bold">
              {isRegistering ? 'Crie sua Conta' : 'Bem-vindo(a)!'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isRegistering
                ? (loginAs === 'user' ? `Insira seus dados para se registrar como cliente.` : `Para registrar sua empresa, clique no botão abaixo.`)
                : `Faça login para acessar os serviços como ${loginAs === 'user' ? 'cliente' : 'prestador'}.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRegistering ? renderRegisterForm() : renderLoginForm()}
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pt-4">
            <Button variant="link" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-primary hover:text-primary/80" disabled={isLoading}>
              {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie uma agora'}
            </Button>
            {!isRegistering && (
              <Button variant="link" asChild className="text-xs text-muted-foreground h-auto p-0">
                <Link to="/forgot-password">
                  Esqueceu sua senha?
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
