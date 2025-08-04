import React, { useEffect, useState, useCallback } from 'react';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Info, Loader2, XCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';
import ReviewFormDialog from '@/components/reviews/ReviewFormDialog';
import api from '@/services/api';

const BookingCard = ({ booking, onCancel, onReview }) => {
  // ===== LOG 2: Verificando os dados que cada card individual recebe =====
  console.log(`[BookingCard ID: ${booking.id}] Dados recebidos:`, booking);
  console.log(`[BookingCard ID: ${booking.id}] Objeto 'review' dentro do agendamento:`, booking.review);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'concluido': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-300';
      case 'confirmado': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const isCancellable = ['agendado', 'confirmado', 'pendente'].includes(booking.status);
  
  // ===== A LÓGICA CORRETA E DEFINITIVA =====
  // Um serviço pode ser avaliado se estiver 'concluido' E se a propriedade 'review' for nula ou inexistente.
  const isReviewable = booking.status === 'concluido' && !booking.review;

  const dateFromAPI = new Date(booking.data);
  const timezoneOffset = dateFromAPI.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(dateFromAPI.getTime() + timezoneOffset);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full flex flex-col">
        <div className={`h-2 ${getStatusVariant(booking.status).split(' ')[0]}`}></div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold text-primary">{booking.servico?.name || 'Serviço'}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Em <Link to={`/empresa/${booking.company?.id}`} className="hover:underline">{booking.company?.nome_empresa || 'Empresa'}</Link>
              </CardDescription>
            </div>
            <Badge variant="outline" className={`capitalize ${getStatusVariant(booking.status)}`}>{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm flex-grow">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{format(adjustedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {booking.hora}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          {isCancellable && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(booking.id)} className="w-full">
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
          {isReviewable && (
            <Button variant="outline" size="sm" onClick={() => onReview(booking)} className="w-full">
              <Star className="mr-2 h-4 w-4" /> Avaliar Serviço
            </Button>
          )}
          {booking.status === 'concluido' && booking.review && (
            <p className="text-xs text-muted-foreground text-center w-full">✅ Você já avaliou este serviço.</p>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const MyBookingsPage = () => {
  const { appointments, loading, error, reloadAppointments } = useAppointments();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState(null);
  
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState(null);

  // ===== LOG 1: Verificando os dados que a página recebe do Context =====
  useEffect(() => {
    if(appointments.length > 0) {
        console.log("--- [MyBookingsPage] ---");
        console.log("Dados dos agendamentos recebidos do Context:", appointments);
        console.log("----------------------");
    }
  }, [appointments]);

  const handleCancelClick = (id) => {
    setBookingToCancelId(id);
    setIsCancelConfirmOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancelId) return;
    try {
      await api.put(`/agendamentos/cliente/${bookingToCancelId}`, { status: 'cancelado' });
      toast({ title: "Agendamento Cancelado!" });
      reloadAppointments();
    } catch (error) {
      toast({ title: "Erro ao cancelar", variant: "destructive" });
    } finally {
      setIsCancelConfirmOpen(false);
      setBookingToCancelId(null);
    }
  };

  const handleReviewClick = (appointment) => {
    setAppointmentToReview(appointment);
    setIsReviewFormOpen(true);
  };

  const handleReviewSubmitted = () => {
    reloadAppointments();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p>Erro ao carregar agendamentos.</p></div>;
  }

  const upcomingBookings = appointments.filter(b => ['agendado', 'confirmado', 'pendente'].includes(b.status));
  const pastBookings = appointments.filter(b => ['concluido', 'cancelado'].includes(b.status));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold">Meus Agendamentos</h1>
            <p className="text-muted-foreground mt-1">Acompanhe seus horários e deixe seu feedback.</p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-card border-2 border-dashed rounded-lg">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-2xl font-semibold">Você ainda não tem agendamentos.</h2>
            <p className="text-muted-foreground mb-6">Que tal explorar e marcar seu primeiro horário?</p>
            <Button onClick={() => navigate('/descobrir-servicos')}>Encontrar um Serviço</Button>
          </div>
        ) : (
          <>
            {upcomingBookings.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Próximos Agendamentos</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancelClick} onReview={() => {}} />
                  ))}
                </div>
              </section>
            )}

            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Histórico de Agendamentos</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancelClick} onReview={handleReviewClick} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </motion.div>
      
      <DeleteConfirmationDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={confirmCancelBooking}
        itemName="agendamento"
        title="Confirmar Cancelamento"
        description="Você tem certeza que deseja cancelar este agendamento?"
      />

      <ReviewFormDialog
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        appointment={appointmentToReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default MyBookingsPage;
