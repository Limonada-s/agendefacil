import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ProfessionalDetails = ({ isOpen, onClose, professional, appointments, onEdit, getClientById, getServiceById }) => {
  if (!professional) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Profissional</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={professional.image || `https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop`} alt={professional.name} />
              <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{professional.name}</h3>
              <p className="text-muted-foreground">{professional.role}</p>
            </div>
          </div>
          
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="schedule">Agenda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Disponibilidade</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(professional.availability).map(([day, times]) => (
                       <div className="space-y-1" key={day}>
                        <p className="text-sm capitalize">{day}</p>
                        <p className="text-sm text-muted-foreground">
                          {times.length > 0 
                            ? times.join(", ")
                            : "Indisponível"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule">
              <div>
                <h4 className="font-medium mb-4">Próximos Agendamentos</h4>
                
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum agendamento encontrado para este profissional.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {appointments.map((appointment) => {
                      const client = getClientById(appointment.clientId);
                      const service = getServiceById(appointment.serviceId);
                      
                      return (
                        <div key={appointment.id} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">{formatDate(appointment.date)} às {appointment.time}</p>
                              </div>
                              <p className="text-sm">{service?.name}</p>
                              <p className="text-sm text-muted-foreground">Cliente: {client?.name}</p>
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                                appointment.status === 'concluido' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onEdit}>
            Editar Profissional
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalDetails;