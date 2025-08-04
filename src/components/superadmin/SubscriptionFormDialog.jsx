// Em: src/components/superadmin/SubscriptionFormDialog.jsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SubscriptionFormDialog = ({ isOpen, onClose, onSave, company }) => {
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (company) {
      // O backend envia 'plano', então lemos de company.plano
      setPlan(company.plano || ''); 
      setStatus(company.subscriptionStatus || '');
      // A data precisa estar no formato YYYY-MM-DD para o input
      setEndDate(company.subscriptionEndDate ? company.subscriptionEndDate.split('T')[0] : '');
    }
  }, [company]);

  const handleSave = () => {
    // O backend espera 'plan', então enviamos como 'plan'
    const formData = {
      plan: plan, 
      subscriptionStatus: status,
      subscriptionEndDate: endDate
    };
    onSave(company.id, formData);
    onClose();
  };

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Assinatura</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da assinatura para {company.nome_empresa}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger id="plan"><SelectValue placeholder="Selecione um plano" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">BASIC</SelectItem>
                <SelectItem value="plus">PLUS</SelectItem>
                <SelectItem value="pro">PRO</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status da Assinatura</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status"><SelectValue placeholder="Selecione um status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="trialing">Em Teste</SelectItem>
                <SelectItem value="past_due">Vencida</SelectItem>
                <SelectItem value="canceled">Cancelada</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="endDate">Data de Fim da Assinatura</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionFormDialog;
