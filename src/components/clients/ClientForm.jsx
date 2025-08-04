import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ClientForm = ({ isOpen, onClose, onSave, client }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthdate: "",
    password: "", // Senha apenas para novos cadastros, não editar existente aqui
    notes: ""
  });

  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id || "",
        name: client.name || "",
        cpf: client.cpf || "",
        phone: client.phone || "",
        email: client.email || "",
        birthdate: client.birthdate || "",
        password: "", // Não popular senha para edição
        notes: client.notes || ""
      });
    } else {
      setFormData({
        id: "", name: "", cpf: "", phone: "", email: "", birthdate: "", password: "", notes: ""
      });
    }
  }, [client, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.cpf) {
      toast({
        title: "Erro ao salvar",
        description: "Nome, CPF, Telefone e E-mail são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.id && !formData.password) { // Novo cliente requer senha
        toast({
            title: "Erro ao salvar",
            description: "Senha é obrigatória para novos clientes.",
            variant: "destructive"
        });
        return;
    }
    // Validação de CPF simples (apenas para exemplo)
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
        toast({
            title: "CPF Inválido",
            description: "O CPF deve conter 11 dígitos.",
            variant: "destructive"
        });
        return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>{formData.id ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados para {formData.id ? "editar o" : "criar um novo"} cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome completo do cliente" className="bg-input text-foreground border-input" />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" className="bg-input text-foreground border-input" />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" className="bg-input text-foreground border-input" />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@exemplo.com" className="bg-input text-foreground border-input" />
          </div>
          
          {!formData.id && ( // Campo de senha apenas para novos clientes
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Crie uma senha" className="bg-input text-foreground border-input" />
            </div>
          )}
          
          <div className="grid gap-1.5">
            <Label htmlFor="birthdate">Data de Nascimento</Label>
            <Input id="birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={handleInputChange} className="bg-input text-foreground border-input" />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Alguma observação sobre o cliente?" className="bg-input text-foreground border-input" />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-primary text-primary hover:bg-primary/10">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {formData.id ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;