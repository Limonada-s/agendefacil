import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { Star, Loader2 } from 'lucide-react';
import { createReview } from '@/services/serviceApi';

const ReviewFormDialog = ({ isOpen, onClose, appointment, onReviewSubmitted }) => {
  const { toast } = useToast();
  // O rating agora começa com 5 estrelas por padrão
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa o formulário e reseta para 5 estrelas quando ele é aberto/fechado
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Avaliação incompleta", description: "Por favor, selecione de 1 a 5 estrelas.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview({
        appointmentId: appointment.id,
        rating,
        comment
      });
      toast({ title: "Avaliação Enviada!", description: "Obrigado pelo seu feedback.", className: "bg-green-600 text-white" });
      onReviewSubmitted();
      onClose();
    } catch (error) {
      toast({ title: "Erro", description: error.response?.data?.erro || "Não foi possível enviar sua avaliação.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Atendimento</DialogTitle>
          <DialogDescription>
            Deixe sua avaliação para o serviço "{appointment.servico?.name}" realizado em {appointment.company?.nome_empresa}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea 
            placeholder="Deixe um comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;
