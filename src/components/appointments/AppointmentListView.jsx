import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Scissors, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const AppointmentListView = ({ appointments, onEditAppointment, onDeleteAppointment }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10 text-sm">
        Nenhum agendamento encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment, index) => (
        <motion.div
          key={appointment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          layout
        >
          <Card className="overflow-hidden bg-background/50 border-border/70 hover:shadow-md transition-shadow">
            <div className={`h-1.5 ${
              appointment.status === 'confirmado' ? 'bg-green-500' :
              appointment.status === 'cancelado' ? 'bg-red-500' :
              appointment.status === 'concluido' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}></div>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-start gap-2.5 mb-2 sm:mb-0">
                  <div className="mt-0.5">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{formatDate(appointment.data)} às {appointment.hora}</p>
                    <p className="text-xs text-muted-foreground">{appointment.servico?.name} - {formatCurrency(appointment.servico?.price)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> 
                        {appointment.client?.nome || 'Cliente não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Scissors className="h-3 w-3" /> 
                        {/* ===== CORREÇÃO: Acessando o nome do profissional aninhado ===== */}
                        {appointment.professional?.loginDetails?.nome || 'Profissional não informado'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 self-start sm:self-center">
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
      ))}
    </div>
  );
};

export default AppointmentListView;
