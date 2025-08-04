
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Volta para a página anterior no histórico
    }
  };

  return (
    <Button variant="outline" onClick={handleBack} className="mb-6 flex items-center group text-sm">
      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
      {children || 'Voltar'}
    </Button>
  );
};

export default BackButton;
