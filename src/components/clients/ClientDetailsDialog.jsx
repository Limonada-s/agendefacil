import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Calendar, Phone, Mail, User, StickyNote } from "lucide-react";

const ClientDetailsDialog = ({ isOpen, onClose, client, appointments, onEdit }) => {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" /> Detalhes do Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-2">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary">{client.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Telefone:</span> {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">E-mail:</span> {client.email}
                </div>
              )}
               {client.cpf && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">CPF:</span> {client.cpf}
                </div>
              )}
              {client.birthdate && (
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Nascimento:</span> {formatDate(client.birthdate)}
                </div>
              )}
            </div>
            
            {client.notes && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-start">
                  <StickyNote className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Observações:</p>
                    <p className="italic text-sm">{client.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3 text-base">Histórico de Agendamentos</h4>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado para este cliente.</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((appointment) => ( // Mostra os últimos 5
                  <div key={appointment.id} className="p-2.5 border border-border/70 rounded-md bg-background/50 text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{formatDate(appointment.date, 'dd/MM/yyyy')} às {appointment.time}</p>
                        {/* Aqui você pode adicionar o nome do serviço e profissional se tiver os dados */}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                            appointment.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                            appointment.status === 'cancelado' ? 'bg-red-500/20 text-red-400' :
                            appointment.status === 'concluido' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.length > 5 && <p className="text-xs text-muted-foreground text-center mt-2">E mais {appointments.length - 5} agendamentos...</p>}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-primary text-primary hover:bg-primary/10">
            Fechar
          </Button>
          <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Editar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsDialog;