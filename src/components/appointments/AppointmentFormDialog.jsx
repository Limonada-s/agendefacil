import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { User, Scissors, Calendar, Clock, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from "@/lib/utils";

const AppointmentFormDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  appointment, 
  clients, 
  services, 
  professionals,
  getAvailableTimeSlots
}) => {
  const { toast } = useToast();
  
  // Define se o formulário está em modo de edição
  const isEditing = !!appointment?.id;

  const initialFormState = {
    id: "",
    clientId: "",
    serviceId: "",
    professionalId: "",
    date: new Date().toISOString().split('T')[0],
    hora: "", // Corrigido para 'hora' para ser consistente
    status: "agendado",
    observacoes: "" // Corrigido para 'observacoes'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Popula o formulário com os dados do agendamento quando ele é aberto
  useEffect(() => {
    if (isOpen) {
      if (isEditing && appointment) {
        // Modo de Edição: preenche com os dados existentes
        const formattedDate = appointment.data ? format(new Date(appointment.data), 'yyyy-MM-dd') : '';
        setFormData({ ...appointment, date: formattedDate });
      } else {
        // Modo de Criação: reseta para o estado inicial
        setFormData(initialFormState);
      }
    }
  }, [appointment, isOpen, isEditing]);

  // Busca horários disponíveis (apenas no modo de criação)
  useEffect(() => {
    if (!isEditing && formData.professionalId && formData.date && getAvailableTimeSlots) {
      const timeSlots = getAvailableTimeSlots(formData.professionalId, formData.date);
      setAvailableTimeSlots(timeSlots);
      if (timeSlots.length > 0 && !timeSlots.includes(formData.hora)) {
        setFormData(prev => ({ ...prev, hora: "" }));
      } else if (timeSlots.length === 0) {
        setFormData(prev => ({ ...prev, hora: "" }));
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [isEditing, formData.professionalId, formData.date, getAvailableTimeSlots, formData.hora]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validação dos campos
    if ((!isEditing && (!formData.clientId || !formData.serviceId || !formData.professionalId)) || !formData.date || !formData.hora) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
      toast({ title: "Sucesso!", description: `Agendamento ${isEditing ? 'atualizado' : 'criado'}.` });
      onClose();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize o status ou os detalhes do horário." : "Preencha os detalhes do agendamento."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          
          {/* Mostra informações fixas no modo de edição */}
          {isEditing ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center text-sm mb-2">
                <User className="h-4 w-4 mr-2 text-primary" />
                <span className="font-semibold text-foreground">{appointment?.client?.nome || 'Cliente não encontrado'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Scissors className="h-4 w-4 mr-2 text-primary" />
                <span className="font-semibold text-foreground">{appointment?.servico?.name || 'Serviço não encontrado'}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Mostra dropdowns para selecionar no modo de criação */}
              <div className="grid gap-1.5 px-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)}>
                  <SelectTrigger id="clientId"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 px-2">
                <Label htmlFor="serviceId">Serviço</Label>
                <Select value={formData.serviceId} onValueChange={(value) => handleSelectChange("serviceId", value)}>
                  <SelectTrigger id="serviceId"><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                  <SelectContent>{services.map((service) => (<SelectItem key={service.id} value={service.id}>{service.name} - {formatCurrency(service.price)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 px-2">
                <Label htmlFor="professionalId">Profissional</Label>
                <Select value={formData.professionalId} onValueChange={(value) => handleSelectChange("professionalId", value)}>
                  <SelectTrigger id="professionalId"><SelectValue placeholder="Selecione um profissional" /></SelectTrigger>
                  <SelectContent>{professionals.map((prof) => (<SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Campos comuns para ambos os modos */}
          <div className="grid grid-cols-2 gap-4 px-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Horário</Label>
              {isEditing ? (
                <Input id="time" name="hora" type="time" value={formData.hora || ''} onChange={handleInputChange} />
              ) : (
                <Select value={formData.hora} onValueChange={(value) => handleSelectChange("hora", value)} disabled={!formData.professionalId || !formData.date}>
                  <SelectTrigger id="time"><SelectValue placeholder="Selecione um horário" /></SelectTrigger>
                  <SelectContent>{availableTimeSlots.length > 0 ? (availableTimeSlots.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))) : (<SelectItem value="" disabled>Nenhum horário</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid gap-1.5 px-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || 'pendente'} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5 px-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="observacoes" value={formData.observacoes || ''} onChange={handleInputChange} placeholder="Adicione uma observação interna..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4"/> Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {isEditing ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
