import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Plus, Search, Copy, DollarSign, Loader2, Edit, Trash2, Check, X, User, Scissors, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, userRoles } from "@/contexts/AuthContext"; 
import { useAppointments } from "@/contexts/AppointmentsContext"; 
import api from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes importados que já existem
import AppointmentFormDialog from "@/components/appointments/AppointmentFormDialog";
import AppointmentCalendarView from "@/components/appointments/AppointmentCalendarView";
import AppointmentListView from "@/components/appointments/AppointmentListView";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import BackButton from "@/components/shared/BackButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

// Funções de dados locais (MOCK)
import { 
  getClients, 
  getServices, 
  getProfessionals,
  getCompanyById,
  getAvailableTimeSlots,
} from "@/lib/data";

// =============================================================
// COMPONENTE DE EDIÇÃO (DEFINIDO INTERNAMENTE)
// =============================================================
const AppointmentEditDialog = ({ isOpen, onClose, onSave, appointment }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      const formattedDate = appointment.data ? format(new Date(appointment.data), 'yyyy-MM-dd') : '';
      setFormData({ ...appointment, date: formattedDate });
    }
  }, [appointment, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      toast({ title: "Sucesso!", description: "Agendamento atualizado." });
      onClose();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const clientName = appointment?.client?.nome || "Carregando...";
  const serviceName = appointment?.servico?.name || "Carregando...";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>Atualize o status ou os detalhes do horário.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center text-sm mb-2"><User className="h-4 w-4 mr-2 text-primary" /><span className="font-semibold text-foreground">{clientName}</span></div>
            <div className="flex items-center text-sm"><Scissors className="h-4 w-4 mr-2 text-primary" /><span className="font-semibold text-foreground">{serviceName}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="date">Data</Label><Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} /></div>
            <div className="space-y-1.5"><Label htmlFor="time">Horário</Label><Input id="time" name="hora" type="time" value={formData.hora || ''} onChange={handleInputChange} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="status">Status</Label><Select value={formData.status || 'pendente'} onValueChange={(value) => handleSelectChange("status", value)}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="confirmado">Confirmado</SelectItem><SelectItem value="concluido">Concluído</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label htmlFor="notes">Observações</Label><Textarea id="notes" name="observacoes" value={formData.observacoes || ''} onChange={handleInputChange} placeholder="Adicione uma observação interna..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4"/> Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================
// COMPONENTE DE SERVIÇO AVULSO (DEFINIDO INTERNAMENTE)
// =============================================================
const WalkInServiceDialog = ({ isOpen, onClose, onSave, clients, services, professionals, companyId }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSaveWalkIn = () => {
    if (!selectedClientId || !selectedServiceId || !selectedProfessionalId) {
      toast({ title: "Campos obrigatórios", variant: "destructive" });
      return;
    }
    const service = services.find(s => s.id === selectedServiceId);
    const walkInData = {
      clientId: selectedClientId,
      serviceId: selectedServiceId,
      professionalId: selectedProfessionalId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'concluido',
      notes: notes,
      price: service?.price || 0,
      duration: service?.duration || 60,
      companyId: companyId,
      isWalkIn: true
    };
    onSave(walkInData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Lançar Serviço Avulso</DialogTitle>
          <DialogDescription>Registre um serviço realizado sem agendamento prévio.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* ... formulário do WalkInServiceDialog ... */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSaveWalkIn}>Salvar Serviço</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// =============================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =============================================================
const AppointmentsPage = () => {
  const { toast } = useToast();
  const { user, userType } = useAuth(); 
  const { appointments, loading: appointmentsLoading, refetch: refetchAppointments } = useAppointments();

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isWalkInDialogOpen, setIsWalkInDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [appointmentToModify, setAppointmentToModify] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userType === 'admin' && user?.companyId) {
      const companyDetails = getCompanyById(user.companyId);
      setClients(getClients()); 
      setServices(companyDetails?.serviceIds?.map(id => getServices().find(s => s.id === id)).filter(Boolean) || []);
      setProfessionals(getProfessionals().filter(p => p.companyId === user.companyId));
    }
  }, [userType, user?.companyId]);

  const handleOpenNewForm = () => {
    setAppointmentToModify(null);
    setIsNewFormOpen(true);
  };

  const handleOpenEditForm = (appointment) => {
    setAppointmentToModify(appointment);
    setIsEditFormOpen(true);
  };

  const handleSaveAppointment = async (data) => {
    setIsSaving(true);
    try {
      if (data.id) {
        await api.put(`/agendamentos/empresa/${data.id}`, data);
        toast({ title: "Agendamento atualizado!" });
      } else {
        await api.post('/agendamentos/empresa', { ...data, companyId: user?.companyId });
        toast({ title: "Agendamento criado com sucesso!" });
      }
      refetchAppointments();
      setIsNewFormOpen(false);
      setIsEditFormOpen(false);
      setIsWalkInDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteClick = (id) => {
    setAppointmentToModify({ id });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (appointmentToModify?.id) {
      try {
        await api.delete(`/agendamentos/empresa/${appointmentToModify.id}`);
        refetchAppointments();
        toast({ title: "Agendamento excluído!" });
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
    setIsDeleteConfirmOpen(false);
    setAppointmentToModify(null);
  };
  
  const handleChangeStatus = async (appointmentId, newStatus) => {
    try {
        await api.put(`/agendamentos/empresa/${appointmentId}`, { status: newStatus });
        refetchAppointments();
        toast({ title: `Status Alterado!`, description: `Agendamento marcado como ${newStatus}.`});
    } catch (error) {
        toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const clientName = app.client?.nome || '';
    const serviceName = app.servico?.name || '';
    const searchString = `${clientName} ${serviceName} ${app.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciamento de Agendamentos</h1>
          <p className="text-muted-foreground">Visualize, crie e gerencie os agendamentos da sua empresa.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsWalkInDialogOpen(true)} variant="outline">
            <DollarSign className="mr-2 h-4 w-4" /> Lançar Avulso
          </Button>
          <Button onClick={handleOpenNewForm}>
            <Plus className="mr-2 h-5 w-5" /> Novo Agendamento
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="mb-4 bg-card border-border">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <CardTitle className="text-xl text-card-foreground">Lista de Agendamentos</CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, serviço, status..."
                    className="pl-10 w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <AppointmentListView 
                  appointments={filteredAppointments}
                  onEditAppointment={handleOpenEditForm}
                  onDeleteAppointment={handleDeleteClick}
                  onChangeStatus={handleChangeStatus}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppointmentFormDialog
        isOpen={isNewFormOpen}
        onClose={() => setIsNewFormOpen(false)}
        onSave={handleSaveAppointment}
        appointment={null}
        clients={clients}
        services={services}
        professionals={professionals}
        getAvailableTimeSlots={getAvailableTimeSlots}
      />
      
      <AppointmentEditDialog
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSave={handleSaveAppointment}
        appointment={appointmentToModify}
      />
      
      <WalkInServiceDialog
        isOpen={isWalkInDialogOpen}
        onClose={() => setIsWalkInDialogOpen(false)}
        onSave={handleSaveAppointment}
        clients={clients}
        services={services}
        professionals={professionals}
        companyId={user?.companyId}
      />
      
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteAppointment}
        itemName="agendamento"
      />
    </div>
  );
};

export default AppointmentsPage;
