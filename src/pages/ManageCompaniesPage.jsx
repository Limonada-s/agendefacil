import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import api from '@/services/api';
import { formatDate } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import SubscriptionFormDialog from '@/components/superadmin/SubscriptionFormDialog';

const ManageCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({ title: "Erro", description: "Não foi possível carregar a lista de empresas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleEditClick = (company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleSaveSubscription = async (companyId, formData) => {
    try {
      await api.put(`/superadmin/companies/${companyId}/subscription`, formData);
      toast({ title: "Sucesso!", description: "Assinatura da empresa atualizada." });
      loadCompanies(); // Recarrega a lista para mostrar os dados atualizados
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'trialing': return 'default';
      case 'past_due': return 'warning';
      default: return 'destructive';
    }
  };

  if (loading) return <div>Carregando empresas...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Empresas</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Plano</TableHead><TableHead>Status</TableHead><TableHead>Fim da Assinatura</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
        <TableBody>
          {companies.map(company => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.nome_empresa}</TableCell>
              {/* =================================================================== */}
              {/* CORREÇÃO APLICADA AQUI: Usando 'plano' em vez de 'plan'. */}
              {/* =================================================================== */}
              <TableCell className="uppercase">{company.plano}</TableCell>
              <TableCell><Badge variant={getStatusVariant(company.subscriptionStatus)}>{company.subscriptionStatus}</Badge></TableCell>
              <TableCell>{company.subscriptionEndDate ? formatDate(company.subscriptionEndDate) : 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(company)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SubscriptionFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSubscription}
        company={selectedCompany}
      />
    </div>
  );
};

export default ManageCompaniesPage;
