import React, { useState } from 'react';
import { motion } from "framer-motion";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getClientById, getServiceById, getProfessionalById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const AppointmentCalendarView = ({ appointments, onEditAppointment, onDeleteAppointment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + (new Date().getDay() === 0 ? -6 : 1) ))); // Inicia na segunda-feira da semana atual

  const appointmentsForSelectedDate = appointments.filter(appointment => 
    appointment.date === selectedDate && appointment.status !== 'cancelado'
  ).sort((a,b) => a.time.localeCompare(b.time));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      formattedDate: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE', { locale: ptBR }),
      dayNumber: format(date, 'd')
    };
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const handleSelectDay = (dateString) => {
    setSelectedDate(dateString);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <CardTitle className="text-xl text-card-foreground">Visão do Calendário</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek} className="border-primary text-primary hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {format(weekDays[0].date, 'dd MMM', { locale: ptBR })} - {format(weekDays[6].date, 'dd MMM, yyyy', { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextWeek} className="border-primary text-primary hover:bg-primary/10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
          {weekDays.map((day) => (
            <div
              key={day.formattedDate}
              className={`text-center p-2 rounded-md cursor-pointer transition-all duration-200 ease-in-out
                ${selectedDate === day.formattedDate ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-input hover:bg-muted/50'}
                ${isSameDay(day.date, new Date()) ? 'border-2 border-primary/50' : 'border border-transparent'}
              `}
              onClick={() => handleSelectDay(day.formattedDate)}
            >
              <div className="text-xs uppercase font-semibold">{day.dayName}</div>
              <div className="text-lg font-bold">{day.dayNumber}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Agendamentos para {formatDate(selectedDate, 'PPP', { locale: ptBR })}
          </h3>
          
          {appointmentsForSelectedDate.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 text-sm">
              Nenhum agendamento para esta data.
            </p>
          ) : (
            <div className="space-y-3">
              {appointmentsForSelectedDate.map((appointment) => {
                const client = getClientById(appointment.clientId);
                const service = getServiceById(appointment.serviceId);
                const professional = getProfessionalById(appointment.professionalId);
                
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Card className="overflow-hidden bg-background/50 border-border/70 hover:shadow-md transition-shadow">
                      <div className={`h-1.5 ${
                        appointment.status === 'confirmado' ? 'bg-green-500' :
                        appointment.status === 'concluido' ? 'bg-blue-500' :
                        'bg-yellow-500' // Agendado
                      }`}></div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{appointment.time} - {service?.name}</p>
                              <p className="text-xs text-muted-foreground">Cliente: {client?.name}</p>
                              <p className="text-xs text-muted-foreground">Profissional: {professional?.name}</p>
                              {appointment.notes && (
                                <p className="text-xs mt-1 italic text-muted-foreground/80">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => onEditAppointment(appointment)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteAppointment(appointment.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendarView;