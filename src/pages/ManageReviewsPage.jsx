// Em: src/pages/ManageReviewsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Star, CheckCircle, XCircle, Loader2, MessageSquare, User, Calendar } from 'lucide-react';
import { getReviewsForAdmin, updateReviewStatus } from '../services/serviceApi';

const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const ManageReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReviewsForAdmin();
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        console.error("API não retornou um array de avaliações. Recebido:", data);
        setReviews([]);
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações para moderação:", error);
      toast({
        title: "Erro ao buscar avaliações",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        )
      );
      await updateReviewStatus(reviewId, newStatus);
      toast({
        title: "Avaliação atualizada!",
        description: `A avaliação foi marcada como "${newStatus === 'approved' ? 'Aprovada' : 'Rejeitada'}".`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status da avaliação:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status da avaliação.",
        variant: "destructive",
      });
      fetchReviews();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold">Gerenciar Avaliações</CardTitle>
          <CardDescription>Aprove ou rejeite as avaliações enviadas pelos seus clientes.</CardDescription>
        </CardHeader>

        <div className="space-y-6 mt-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold text-lg">{review.client?.nome || 'Cliente Anônimo'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-muted-foreground italic">
                                <MessageSquare className="inline-block h-4 w-4 mr-2" />
                                {review.comment || "Nenhum comentário foi deixado."}
                            </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center md:w-48">
                        {review.status === 'pending' ? (
                          <div className="flex flex-row md:flex-col gap-2 w-full">
                            <Button onClick={() => handleUpdateStatus(review.id, 'approved')} className="w-full bg-green-500 hover:bg-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                            </Button>
                            <Button onClick={() => handleUpdateStatus(review.id, 'rejected')} variant="destructive" className="w-full">
                              <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={review.status === 'approved' ? 'default' : 'destructive'} className={`text-sm ${review.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {review.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">Nenhuma avaliação para moderar no momento.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageReviewsPage;
