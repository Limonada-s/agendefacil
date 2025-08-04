import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ProfessionalForm = ({ isOpen, onClose, onSave, professional }) => {
  const { toast } = useToast();
  const isEditing = !!professional;

  // Estado inicial do formulário, agora com os novos campos
  const getInitialState = () => ({
    id: professional?.id || null,
    // Dados de Login
    name: professional?.loginDetails?.nome || "",
    email: professional?.loginDetails?.email || "",
    phone: professional?.loginDetails?.telefone || "",
    birthDate: professional?.loginDetails?.data_nascimento || "",
    password: "", // Senha sempre começa vazia por segurança
    // Dados de Perfil
    role: professional?.role || "",
    specialties: professional?.specialties || [],
    commissionRate: professional?.commissionRate || 0,
  });

  const [formData, setFormData] = useState(getInitialState);

  // Popula o formulário quando o modal abre ou o profissional muda
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [professional, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Lógica especial para transformar a string de especialidades em um array
    if (name === "specialties") {
      const specialtiesArray = value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, specialties: specialtiesArray }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({ title: "Campos Obrigatórios", description: "Nome, Email e Função são obrigatórios.", variant: "destructive" });
      return;
    }
    if (!isEditing && !formData.password) {
      toast({ title: "Campo Obrigatório", description: "A senha é obrigatória para criar um novo profissional.", variant: "destructive" });
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{isEditing ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados para {isEditing ? "editar o" : "criar um novo"} profissional.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
          <h4 className="font-semibold text-sm text-primary">Dados de Acesso</h4>
          <Input name="name" placeholder="Nome Completo" value={formData.name || ''} onChange={handleInputChange} />
          <Input name="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} disabled={isEditing} />
          <Input name="phone" placeholder="Telefone" value={formData.phone || ''} onChange={handleInputChange} />
          
          {!isEditing ? (
             <Input name="password" type="password" placeholder="Senha" value={formData.password || ''} onChange={handleInputChange} />
          ) : (
             <p className="text-xs text-muted-foreground -mt-2">A senha só pode ser alterada na tela de recuperação de senha.</p>
          )}

          <h4 className="font-semibold text-sm text-primary mt-4">Dados do Perfil</h4>
          <Input name="role" placeholder="Função (Ex: Cabeleireiro)" value={formData.role || ''} onChange={handleInputChange} />
          
          {/* NOVO CAMPO: ESPECIALIDADES */}
          <div className="grid gap-2">
            <Label htmlFor="specialties" className="text-muted-foreground">Especialidades</Label>
            <Input
              id="specialties"
              name="specialties"
              // Transforma o array em string para exibição no input
              value={formData.specialties.join(', ')}
              onChange={handleInputChange}
              placeholder="Corte, Coloração, Penteado"
              className="bg-input border-input text-foreground"
            />
            <p className="text-xs text-muted-foreground">Separe as especialidades por vírgula.</p>
          </div>

          {/* NOVO CAMPO: COMISSÃO */}
          <div className="grid gap-2">
            <Label htmlFor="commissionRate" className="text-muted-foreground">Comissão (%)</Label>
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              min="0"
              max="100"
              value={formData.commissionRate}
              onChange={handleInputChange}
              placeholder="Ex: 40"
              className="bg-input border-input text-foreground"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalForm;
