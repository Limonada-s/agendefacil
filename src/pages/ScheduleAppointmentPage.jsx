import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Scissors, DollarSign, ArrowLeft, Info, Loader2, Briefcase, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/services/api'; 
import { formatCurrency, formatDate } from '@/lib/utils';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const companyId = queryParams.get('empresa');
  const serviceId = queryParams.get('servico');

  const [company, setCompany] = useState(null);
  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      if (!companyId || !serviceId) {
        toast({ title: "Informações faltando na URL.", variant: "destructive" });
        navigate(-1);
        return;
      }
      setLoading(true);
      try {
        // Busca os dados da empresa e TODOS os seus serviços em paralelo
        const [companyRes, allServicesRes, professionalsRes] = await Promise.all([
          axios.get(`/empresas/${companyId}`),
          axios.get(`/empresas/${companyId}/servicos`), // Rota correta para buscar todos os serviços
          axios.get(`/servicos/${serviceId}/profissionais`) // Rota que vamos criar no backend
        ]);
        setCompany(companyRes.data);
        setProfessionals(professionalsRes.data);
        const specificService = allServicesRes.data.find(s => s.id == serviceId);
        if (!specificService) {
          throw new Error("Serviço não encontrado ou não pertence a esta empresa.");
        }
        setService(specificService);

      } catch (error) {
        console.error("Erro ao carregar dados para agendamento:", error);
        toast({ title: "Erro ao carregar página", description: "Não foi possível encontrar a empresa ou o serviço.", variant: "destructive" });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, serviceId, navigate, toast]);

  // Busca os horários disponíveis (a lógica atual está ok, mas pode ser aprimorada no futuro)
  useEffect(() => {
  const fetchSlots = async () => {
    if (selectedDate && serviceId && selectedProfessionalId) {
      setSlotsLoading(true);
      setAvailableSlots([]);
      setSelectedTime('');
      try {
        const response = await axios.get(`/agendamentos/horarios-disponiveis`, {
          params: { 
            professionalId: selectedProfessionalId, 
            date: selectedDate,
            // ===== A CORREÇÃO ESTÁ AQUI =====
            // Adicionando o serviceId que estava faltando na requisição
            serviceId: serviceId 
          }
        });
        setAvailableSlots(response.data);
      } catch (error) {
        toast({ title: "Erro ao buscar horários", variant: "destructive" });
      } finally {
        setSlotsLoading(false);
      }
    }
  };
  fetchSlots();
}, [selectedDate, serviceId, selectedProfessionalId, toast]);

  const handleSchedule = async () => {
    if (!isAuthenticated) { /* ... */ return; }
    // ===== ADIÇÃO 3: Validação para garantir que um profissional foi selecionado =====
    if (!selectedDate || !selectedTime || !selectedProfessionalId) {
      toast({ title: "Campos obrigatórios", description: "Por favor, selecione o profissional, a data e o horário.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const appointmentData = {
      data: selectedDate,
      hora: selectedTime,
      servico_id: service?.id,
      company_id: company?.id,
      observacoes: notes,
      // ===== ADIÇÃO 4: Incluir o ID do profissional no agendamento =====
      professional_id: selectedProfessionalId,
    };

    try {
      await axios.post('/agendamentos', appointmentData);
      toast({
        title: "Agendamento Realizado!",
        description: `Seu horário para ${service.name} foi confirmado.`,
        className: "bg-green-600 text-white",
      });
      navigate('/meus-agendamentos');
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({ title: "Erro ao Agendar", description: error.response?.data?.erro || "Não foi possível completar o agendamento.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando...</div>;
  }

  if (!company || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Info className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold">Erro ao carregar dados</h1>
        <Button onClick={() => navigate(-1)} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-primary/20 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl bg-card border-border text-card-foreground">
          <CardHeader className="text-center">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-primary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="mx-auto mb-3 text-primary">
              <Briefcase className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold">Agendar Serviço</CardTitle>
            <CardDescription className="text-muted-foreground">
              Você está agendando <span className="font-semibold text-primary">{service.name}</span> em <span className="font-semibold text-primary">{company.nome_empresa}</span>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center mb-2">
                <Scissors className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold text-lg">{service.name}</h3>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-1" /> Duração: {service.duration} min</span>
                <span className="flex items-center font-medium text-primary"><DollarSign className="h-4 w-4 mr-1" /> {formatCurrency(service.price)}</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="professional">Profissional</Label>
              <Select 
                value={selectedProfessionalId} 
                onValueChange={(value) => {
                  setSelectedProfessionalId(value);
                  // Limpa os horários ao trocar de profissional
                  setAvailableSlots([]);
                  setSelectedTime('');
                }}
                disabled={professionals.length === 0}
              >
                <SelectTrigger id="professional" className="bg-input border-input text-foreground">
                  <SelectValue placeholder={professionals.length > 0 ? "Escolha um profissional" : "Nenhum profissional para este serviço"} />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {prof.loginDetails.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} 
                  className="bg-input border-input text-foreground"
                  disabled={!selectedProfessionalId} // Desabilita se nenhum profissional for escolhido
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Horário</Label>
                <Select 
                  value={selectedTime} 
                  onValueChange={setSelectedTime}
                  disabled={slotsLoading || !selectedProfessionalId || availableSlots.length === 0}
                >
                  <SelectTrigger id="time" className="bg-input border-input text-foreground">
                    <SelectValue placeholder={!selectedProfessionalId ? "Escolha um profissional" : (slotsLoading ? "Buscando..." : "Selecione um horário")} />
                  </SelectTrigger>
                  <SelectContent>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)
                    ) : (
                      <SelectItem value="" disabled>Nenhum horário disponível</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Alguma preferência ou informação adicional?" 
                className="bg-input border-input text-foreground"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button onClick={handleSchedule} disabled={isSubmitting || !selectedTime} className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calendar className="mr-2 h-5 w-5" />}
              {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ScheduleAppointmentPage;
