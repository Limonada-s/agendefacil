// Em: src/pages/CompanyRegistrationPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Building, User, Mail, Phone, MapPin, Lock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GooglePlacesAutocomplete, { geocodeByAddress } from 'react-google-places-autocomplete';
import { formatCPF, formatCNPJ } from '@/lib/formatters';

// Componente para mostrar os critérios de senha
const PasswordStrengthIndicator = ({ criteria }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 text-muted-foreground">
    <span className={criteria.length ? 'text-green-500 font-medium' : ''}>
      {criteria.length ? '✓' : '•'} 8+ caracteres
    </span>
    <span className={criteria.uppercase ? 'text-green-500 font-medium' : ''}>
      {criteria.uppercase ? '✓' : '•'} 1 Maiúscula
    </span>
    <span className={criteria.number ? 'text-green-500 font-medium' : ''}>
      {criteria.number ? '✓' : '•'} 1 Número
    </span>
    <span className={criteria.specialChar ? 'text-green-500 font-medium' : ''}>
      {criteria.specialChar ? '✓' : '•'} 1 Especial (!@#$)
    </span>
  </div>
);

const CompanyRegistrationPage = () => {
  const navigate = useNavigate();
  const { registerCompanyAndLogin } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    ownerName: '',
    ownerCpf: '',
    email: '',
    phone: '',
    rua: '',
    numero: '',
    bairro: '',
    city: '',
    state: '',
    zipCode: '',
    password: '',
    confirmPassword: ''
  });
  
  // Estilos para o componente de autocomplete do Google
  const customGooglePlacesStyles = {
    control: (provided) => ({ ...provided, backgroundColor: 'var(--input)', borderColor: 'var(--border)', boxShadow: 'none', '&:hover': { borderColor: 'var(--ring)', }, }),
    input: (provided) => ({ ...provided, color: 'var(--foreground)', }),
    menu: (provided) => ({ ...provided, backgroundColor: 'var(--popover)', borderColor: 'var(--border)', }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? 'var(--accent)' : 'var(--popover)', color: state.isFocused ? 'var(--accent-foreground)' : 'var(--foreground)', }),
    singleValue: (provided) => ({ ...provided, color: 'var(--foreground)' }),
    placeholder: (provided) => ({...provided, color: 'var(--muted-foreground)'}),
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'ownerCpf') {
      formattedValue = formatCPF(value);
    }

    if (name === 'password') {
      setPasswordCriteria({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /\d/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSelectPlace = async (place) => {
    if (!place) return;
    try {
      const results = await geocodeByAddress(place.label);
      const addressComponents = results[0].address_components;
      
      const getAddressComponent = (type, useShortName = false) => {
        const component = addressComponents.find(c => c.types.includes(type));
        if (!component) return '';
        return useShortName ? component.short_name : component.long_name;
      };
      const newAddress = {
        rua: getAddressComponent('route'),
        numero: getAddressComponent('street_number'),
        bairro: getAddressComponent('sublocality_level_1') || getAddressComponent('political'),
        city: getAddressComponent('administrative_area_level_2'),
        state: getAddressComponent('administrative_area_level_1', true),
        zipCode: getAddressComponent('postal_code'),
      };
      setFormData(prev => ({ ...prev, ...newAddress }));
      toast({ title: "Endereço Preenchido!", description: "Os campos de endereço foram preenchidos automaticamente." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível processar o endereço selecionado.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro de Senha", description: "As senhas não conferem.", variant: "destructive" });
      return;
    }
    if (!formData.ownerCpf && !formData.cnpj) {
        toast({ title: "Documento Faltando", description: "Por favor, preencha o CPF ou o CNPJ.", variant: "destructive" });
        return;
    }
    if (!formData.rua || !formData.city) {
      toast({ title: "Endereço Incompleto", description: "Por favor, selecione um endereço válido na busca.", variant: "destructive" });
      return;
    }
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      toast({
        title: "Senha Fraca",
        description: "Sua senha não atende a todos os critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // REMOVIDO: 'categorias' do payload de registro
      const registrationData = {
        nome_empresa: formData.companyName,
        cnpj: formData.cnpj,
        nome_dono: formData.ownerName,
        cpf_dono: formData.ownerCpf,
        email_admin: formData.email,
        telefone: formData.phone,
        senha: formData.password,
        endereco: {
            rua: formData.rua,
            numero: formData.numero,
            bairro: formData.bairro,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
        }
      };
      
      await registerCompanyAndLogin(registrationData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora, escolha o plano ideal para sua empresa.",
        duration: 5000,
      });
      
      navigate('/planos');

    } catch (error) {
      const msg = error.erro || "Ocorreu um erro durante o registro. Verifique os dados.";
      toast({ title: "Falha no Cadastro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-slate-800 to-primary/20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <Card className="shadow-2xl bg-card text-card-foreground border-border">
          <CardHeader className="text-center relative">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => navigate('/login')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-3xl font-bold">Registre sua Empresa</CardTitle>
            <CardDescription>Preencha os dados para iniciar seu período de teste gratuito.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* REMOVIDO: Bloco inteiro de seleção de categorias */}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="companyName" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" /> Nome da Empresa</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Ex: Salão Beleza Pura" required disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cnpj" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" /> CNPJ (Opcional se CPF preenchido)</Label>
                  <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" disabled={isLoading}/>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="ownerName" className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" /> Nome do Proprietário/Responsável</Label>
                  <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Nome completo" required disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ownerCpf" className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" /> CPF (Opcional se CNPJ preenchido)</Label>
                  <Input id="ownerCpf" name="ownerCpf" value={formData.ownerCpf} onChange={handleInputChange} placeholder="000.000.000-00" disabled={isLoading}/>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" /> Email de Acesso (Admin da Empresa)</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="admin@suaempresa.com" required disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" /> Telefone da Empresa</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" required disabled={isLoading}/>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg border-border/50">
                <div className="space-y-1">
                  <Label className="flex items-center text-lg font-semibold"><MapPin className="mr-2 h-5 w-5 text-primary" /> Endereço da Empresa</Label>
                  <p className="text-sm text-muted-foreground">Comece a digitar e selecione o endereço na lista para preencher automaticamente.</p>
                  <GooglePlacesAutocomplete
                    apiKey="AIzaSyBsDvWYsrizlWcNIthZEE2nJQ0ZNT7WIdg"
                    selectProps={{
                      value: formData.rua ? { label: `${formData.rua}, ${formData.numero}`, value: formData.rua } : null,
                      onChange: handleSelectPlace,
                      placeholder: 'Digite o endereço...',
                      styles: customGooglePlacesStyles,
                    }}
                    apiOptions={{ language: 'pt-BR', region: 'br' }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-4 space-y-1"><Label htmlFor="rua">Rua</Label><Input id="rua" name="rua" value={formData.rua} onChange={handleInputChange} required/></div>
                  <div className="sm:col-span-2 space-y-1"><Label htmlFor="numero">Número</Label><Input id="numero" name="numero" value={formData.numero} onChange={handleInputChange} required/></div>
                  <div className="sm:col-span-3 space-y-1"><Label htmlFor="bairro">Bairro</Label><Input id="bairro" name="bairro" value={formData.bairro} onChange={handleInputChange} required/></div>
                  <div className="sm:col-span-3 space-y-1"><Label htmlFor="city">Cidade</Label><Input id="city" name="city" value={formData.city} onChange={handleInputChange} required/></div>
                  <div className="sm:col-span-2 space-y-1"><Label htmlFor="state">Estado</Label><Input id="state" name="state" value={formData.state} onChange={handleInputChange} required/></div>
                  <div className="sm:col-span-4 space-y-1"><Label htmlFor="zipCode">CEP</Label><Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required/></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="password" className="flex items-center"><Lock className="mr-2 h-4 w-4 text-primary" /> Senha para Acesso (Admin)</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading}/>
                  <PasswordStrengthIndicator criteria={passwordCriteria} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="flex items-center"><Lock className="mr-2 h-4 w-4 text-primary" /> Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required disabled={isLoading}/>
                </div>
              </div>
              
              <Button type="submit" className="w-full font-semibold text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                {isLoading ? "Registrando..." : "Finalizar Cadastro e Iniciar Teste"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CompanyRegistrationPage;
