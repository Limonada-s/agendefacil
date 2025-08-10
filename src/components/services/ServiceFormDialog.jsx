/* --- Arquivo: @/components/services/ServiceFormDialog.jsx --- */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud } from 'lucide-react';
import api from '@/services/api';

const ServiceFormDialog = ({ isOpen, onClose, onSave, serviceData, companyId }) => {
  const { toast } = useToast();
  const isEditing = !!serviceData;

  // Estados do formulário
  const [formData, setFormData] = useState({ name: '', description: '', duration: 60, price: 0 });
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState(new Set());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Carrega os profissionais da empresa
  useEffect(() => {
    if (isOpen && companyId) {
      // Idealmente, a API deveria buscar profissionais por companyId
      api.get('/profissionais/all') // Ajuste esta rota se necessário
        .then(response => setAllProfessionals(response.data))
        .catch(() => toast({ title: "Erro", description: "Não foi possível carregar os profissionais.", variant: "destructive" }));
    }
  }, [isOpen, companyId, toast]);

  // Preenche o formulário ao editar ou limpa ao criar um novo
  useEffect(() => {
    if (isOpen) {
        if (serviceData) {
            setFormData({
                id: serviceData.id,
                name: serviceData.name || '',
                description: serviceData.description || '',
                duration: serviceData.duration || 60,
                price: serviceData.price || 0,
            });
            setSelectedProfessionalIds(new Set(serviceData.profissionais?.map(p => p.id) || []));
            setImagePreview(serviceData.image || ''); // Mostra a imagem existente
            setImageFile(null);
        } else {
            // Reseta para um novo serviço
            setFormData({ name: '', description: '', duration: 60, price: 0 });
            setSelectedProfessionalIds(new Set());
            setImagePreview('');
            setImageFile(null);
        }
    }
  }, [serviceData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfessionalToggle = (professionalId) => {
    setSelectedProfessionalIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.has(professionalId) ? newIds.delete(professionalId) : newIds.add(professionalId);
      return newIds;
    });
  };

  const handleSubmit = () => {
    // Usa FormData para enviar arquivos e texto
    const submissionData = new FormData();
    
    // Adiciona os dados do formulário
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
            submissionData.append(key, formData[key]);
        }
    });

    // Adiciona o companyId para garantir a associação correta no backend
    if (companyId) {
        submissionData.append('companyId', companyId);
    }

    // Adiciona o novo arquivo de imagem, se um foi selecionado
    if (imageFile) {
        submissionData.append('image', imageFile);
    }

    // Adiciona os IDs dos profissionais
    Array.from(selectedProfessionalIds).forEach(id => {
        submissionData.append('professionals_ids[]', id);
    });

    // Chama a função de salvar passando o FormData e o ID (se for edição)
    onSave(submissionData, serviceData?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes e adicione uma imagem para seu serviço.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
          {/* Campo de Upload de Imagem */}
          <div className="space-y-2">
            <Label htmlFor="service-image">Imagem do Serviço</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Pré-visualização" className="w-full h-full object-cover" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <Input id="service-image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
            </div>
          </div>

          <Input name="name" placeholder="Nome do Serviço" value={formData.name} onChange={handleInputChange} />
          <Textarea name="description" placeholder="Descrição do Serviço" value={formData.description} onChange={handleInputChange} />
          <Input name="duration" type="number" placeholder="Duração (minutos)" value={formData.duration} onChange={handleInputChange} />
          <Input name="price" type="number" placeholder="Preço" value={formData.price} onChange={handleInputChange} />

          {/* Seleção de Profissionais */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="font-semibold">Profissionais que realizam este serviço:</Label>
            <div className="space-y-2">
              {allProfessionals.length > 0 ? allProfessionals.map(prof => (
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
                <p className="text-sm text-muted-foreground">Nenhum profissional cadastrado.</p>
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