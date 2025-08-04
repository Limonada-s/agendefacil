import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

const ServiceFormDialog = ({ isOpen, onClose, onSave, serviceData }) => {
  const { toast } = useToast();
  const isEditing = !!serviceData;

  const [formData, setFormData] = useState({ name: '', description: '', duration: 60, price: 0 });
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState(new Set());
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  // Busca todos os profissionais da empresa quando o formulário abre
  useEffect(() => {
    if (isOpen) {
      setLoadingProfessionals(true);
      api.get('/profissionais/all')
        .then(response => {
          setAllProfessionals(response.data);
        })
        .catch(() => {
          toast({ title: "Erro", description: "Não foi possível carregar a lista de profissionais.", variant: "destructive" });
        })
        .finally(() => {
          setLoadingProfessionals(false);
        });
    }
  }, [isOpen, toast]);

  // Preenche o formulário quando um serviço é passado para edição
  useEffect(() => {
    if (serviceData) {
      setFormData({
        id: serviceData.id,
        name: serviceData.name || '',
        description: serviceData.description || '',
        duration: serviceData.duration || 60,
        price: serviceData.price || 0,
      });
      // Pré-seleciona os profissionais que já estão associados a este serviço
      const initialSelectedIds = new Set(serviceData.profissionais?.map(p => p.id) || []);
      setSelectedProfessionalIds(initialSelectedIds);
    } else {
      // Limpa o formulário para um novo serviço
      setFormData({ name: '', description: '', duration: 60, price: 0 });
      setSelectedProfessionalIds(new Set());
    }
  }, [serviceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfessionalToggle = (professionalId) => {
    setSelectedProfessionalIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(professionalId)) {
        newIds.delete(professionalId);
      } else {
        newIds.add(professionalId);
      }
      return newIds;
    });
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      // Envia a lista de IDs dos profissionais selecionados para o backend
      professionals_ids: Array.from(selectedProfessionalIds),
    };
    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do serviço e associe os profissionais que o realizam.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
          <Input name="name" placeholder="Nome do Serviço" value={formData.name} onChange={handleInputChange} />
          <Textarea name="description" placeholder="Descrição do Serviço" value={formData.description} onChange={handleInputChange} />
          <Input name="duration" type="number" placeholder="Duração (minutos)" value={formData.duration} onChange={handleInputChange} />
          <Input name="price" type="number" placeholder="Preço" value={formData.price} onChange={handleInputChange} />

          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Profissionais que realizam este serviço:</Label>
            <div className="space-y-2">
              {loadingProfessionals ? (
                <p className="text-sm text-muted-foreground">Carregando profissionais...</p>
              ) : allProfessionals.length > 0 ? allProfessionals.map(prof => (
                <div key={prof.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`prof-${prof.id}`}
                    checked={selectedProfessionalIds.has(prof.id)}
                    onCheckedChange={() => handleProfessionalToggle(prof.id)}
                  />
                  <label htmlFor={`prof-${prof.id}`} className="text-sm font-medium leading-none">
                    {prof.loginDetails.nome}
                  </label>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhum profissional cadastrado. Adicione profissionais primeiro.</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;
