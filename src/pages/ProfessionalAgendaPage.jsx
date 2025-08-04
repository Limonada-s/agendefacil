// Em: src/pages/ProfessionalAgendaPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, User, Scissors, Lock, Unlock, Loader2, MoreVertical, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyProfessionalAppointments, getMyFullProfessionalProfile, updateMyBlockedSlots, updateAppointmentStatusByProfessional } from '../services/serviceApi'; // Corrigido o caminho
import { format, parse, addDays } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ProfessionalAgendaPage = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    // Inicia o loading apenas se não estivermos já carregando
    setLoading(true);
    try {
      const [appointmentsData, profileData] = await Promise.all([
        getMyProfessionalAppointments(),
        getMyFullProfessionalProfile()
      ]);
      setAppointments(appointmentsData);
      setProfile(profileData);
    } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar seus dados.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBlockToggle = async (time) => {
    const newBlockedSlot = { date: selectedDate, time };
    const currentBlockedSlots = profile?.blockedSlots || [];
    
    let updatedBlockedSlots;
    const isAlreadyBlocked = currentBlockedSlots.some(slot => slot.date === newBlockedSlot.date && slot.time === newBlockedSlot.time);

    if (isAlreadyBlocked) {
      updatedBlockedSlots = currentBlockedSlots.filter(slot => !(slot.date === newBlockedSlot.date && slot.time === newBlockedSlot.time));
    } else {
      updatedBlockedSlots = [...currentBlockedSlots, newBlockedSlot];
    }

    try {
      await updateMyBlockedSlots(updatedBlockedSlots);
      toast({ title: "Sucesso!", description: `Horário das ${time} foi ${isAlreadyBlocked ? 'desbloqueado' : 'bloqueado'}.` });
      setProfile(prev => ({ ...prev, blockedSlots: updatedBlockedSlots }));
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o horário.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Atualização otimista da UI
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, status: newStatus } : app
      ));
      await updateAppointmentStatusByProfessional(appointmentId, newStatus);
      toast({ title: "Status Atualizado!", description: `O agendamento foi marcado como ${newStatus}.` });
      // Não precisa recarregar tudo, a UI já foi atualizada
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
      // Em caso de erro, busca os dados novamente para reverter a UI
      loadData();
    }
  };

  const timeSlots = useMemo(() => {
    if (!profile?.workingHours) return [];

    const dayOfWeekIndex = new Date(selectedDate.replace(/-/g, '/')).getDay();
    const dayKey = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][dayOfWeekIndex];
    const daySchedule = profile.workingHours[dayKey];

    if (!daySchedule || !daySchedule.ativo) return [];

    const slots = [];
    let currentTime = parse(daySchedule.inicio, 'HH:mm', new Date());
    const endTime = parse(daySchedule.fim, 'HH:mm', new Date());
    
    const appointmentsOnDate = appointments.filter(a => a.data === selectedDate);
    const blockedOnDate = (profile.blockedSlots || []).filter(b => b.date === selectedDate);

    while (currentTime < endTime) {
      const time = format(currentTime, 'HH:mm');
      const appointment = appointmentsOnDate.find(a => a.hora === time);
      const isBlocked = blockedOnDate.some(b => b.time === time);

      let status = 'available';
      let details = null;

      if (appointment) {
        status = 'booked';
        details = { id: appointment.id, client: appointment.client?.nome, service: appointment.servico?.name, currentStatus: appointment.status };
      } else if (isBlocked) {
        status = 'blocked';
      }
      
      slots.push({ time, status, details });
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }
    return slots;
  }, [selectedDate, appointments, profile]);

  // ===================================================================
  // LÓGICA DE CORES ATUALIZADA
  // ===================================================================
  const getCardStyle = (status, details) => {
    if (status === 'blocked') {
      return 'bg-gray-200 dark:bg-gray-800 opacity-70';
    }
    if (status === 'available') {
      return 'bg-card hover:bg-muted/50';
    }
    if (status === 'booked' && details) {
      switch (details.currentStatus) {
        case 'concluido':
          return 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-900 dark:text-green-200';
        case 'cancelado':
          return 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-900 dark:text-red-200';
        default: // pendente ou confirmado
          // COR ATUALIZADA para um tom de âmbar/amarelo mais vibrante
          return 'bg-amber-100 dark:bg-amber-900/50 border-amber-500 text-amber-900 dark:text-amber-200';
      }
    }
    return 'bg-card'; // Fallback
  };

  const handleDateChange = (days) => {
    const currentDate = new Date(selectedDate.replace(/-/g, '/'));
    const newDate = addDays(currentDate, days);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };
  
  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Minha Agenda</h1>
          <p className="text-muted-foreground">Visualize seus agendamentos e gerencie seus horários vagos.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={goToToday} className="hidden sm:flex">Hoje</Button>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto bg-input"
            />
            <Button variant="outline" size="icon" onClick={() => handleDateChange(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {timeSlots.length > 0 ? timeSlots.map(({ time, status, details }) => (
          <Card key={time} className={`transition-all ${getCardStyle(status, details)}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> {time}
              </CardTitle>
              {status === 'booked' && details.currentStatus !== 'concluido' && details.currentStatus !== 'cancelado' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(details.id, 'concluido')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Marcar como Concluído</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(details.id, 'cancelado')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      <span>Marcar como Cancelado</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
              {status === 'available' && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleBlockToggle(time)}>
                  <Lock className="mr-2 h-4 w-4" /> Bloquear Horário
                </Button>
              )}
              {status === 'blocked' && (
                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleBlockToggle(time)}>
                  <Unlock className="mr-2 h-4 w-4" /> Desbloquear
                </Button>
              )}
              {status === 'booked' && (
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-muted-foreground" /> {details.client}</p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><Scissors className="h-4 w-4" /> {details.service}</p>
                  <p className="text-xs capitalize font-medium pt-2">Status: {details.currentStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <p className="col-span-full text-center text-muted-foreground py-10">Você não trabalha neste dia. Ajuste seus horários em "Meus Horários".</p>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAgendaPage;
