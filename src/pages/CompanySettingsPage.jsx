import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/shared/BackButton';
import api from '@/services/api';
// ADIÇÃO: Importando o diálogo de confirmação que você já usa em outras páginas
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";

const CompanySettingsPage = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth(); // ADICIONADO logout
  const [settings, setSettings] = useState({
    nome_empresa: '',
    description: '',
    telefone: '',
    email_admin: '',
    allowClientToChooseProfessional: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ===== ADIÇÃO: Estados para controlar o diálogo de cancelamento =====
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  // ====================================================================

  const fetchCompanyData = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/empresas/${user.companyId}`);
      setSettings({
        nome_empresa: data.nome_empresa || '',
        description: data.description || '',
        telefone: data.telefone || '',
        email_admin: data.email_admin || '',
        allowClientToChooseProfessional: data.allowClientToChooseProfessional === undefined ? true : data.allowClientToChooseProfessional,
      });
    } catch (error) {
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar as informações da sua empresa.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, toast]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setSettings(prev => ({ ...prev, allowClientToChooseProfessional: checked }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await api.put('/empresas/settings', settings);
      toast({
        title: "Configurações Salvas!",
        description: "As informações da sua empresa foram atualizadas com sucesso.",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: error.response?.data?.erro || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // ===== ADIÇÃO: Função para iniciar o cancelamento da conta =====
  const handleCancelAccount = async () => {
    setIsCanceling(true);
    try {
      await api.delete('/empresas/cancel-account');
      toast({
        title: "Conta Encerrada",
        description: "Sua conta e todos os dados foram excluídos. Sentiremos sua falta!",
      });
      // Força o logout e redirecionamento
      logout(); 
    } catch (error) {
      toast({
        title: "Erro ao Cancelar",
        description: "Não foi possível excluir sua conta. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
      setIsCancelConfirmOpen(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Carregando configurações...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-2xl mx-auto shadow-xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center">
              <Settings className="mr-3 h-7 w-7 text-primary" />
              Configurações da Empresa
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Gerencie as informações e preferências do seu estabelecimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="nome_empresa">Nome da Empresa</Label>
              <Input id="nome_empresa" name="nome_empresa" value={settings.nome_empresa} onChange={handleInputChange} className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="description">Descrição Curta</Label>
              <Textarea id="description" name="description" value={settings.description} onChange={handleInputChange} placeholder="Uma breve descrição sobre seu negócio para aparecer no perfil da empresa." className="mt-1"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" type="tel" value={settings.telefone} onChange={handleInputChange} className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="email_admin">E-mail de Contato</Label>
                <Input id="email_admin" name="email_admin" type="email" value={settings.email_admin} onChange={handleInputChange} className="mt-1"/>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Preferências de Agendamento</h3>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                <div>
                  <Label htmlFor="allowClientChoice" className="font-medium">
                    Permitir que clientes escolham o profissional?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Se desativado, o sistema atribuirá um profissional disponível.
                  </p>
                </div>
                <Switch
                  id="allowClientChoice"
                  checked={settings.allowClientToChooseProfessional}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ===== ADIÇÃO: Seção "Zona de Perigo" para o cancelamento ===== */}
        <Card className="max-w-2xl mx-auto shadow-xl bg-card border-destructive/50 mt-8">
            <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                    <AlertTriangle className="mr-3 h-6 w-6" />
                    Zona de Perigo
                </CardTitle>
                <CardDescription>
                    Ações irreversíveis. Tenha certeza antes de prosseguir.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="font-semibold">Encerrar conta</p>
                    <p className="text-sm text-muted-foreground">
                        Isso excluirá permanentemente sua empresa, profissionais, serviços e agendamentos.
                    </p>
                </div>
                <Button variant="destructive" onClick={() => setIsCancelConfirmOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Encerrar Minha Conta
                </Button>
            </CardContent>
        </Card>
      </motion.div>

      {/* ===== ADIÇÃO: Diálogo de confirmação para o cancelamento ===== */}
      <DeleteConfirmationDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelAccount}
        title="Você tem certeza absoluta?"
        description="Esta ação não pode ser desfeita. Todos os dados da sua empresa serão permanentemente excluídos."
        confirmText="Eu entendo, encerrar minha conta"
        isDestructive={true}
        isLoading={isCanceling}
      />
    </div>
  );
};

export default CompanySettingsPage;
