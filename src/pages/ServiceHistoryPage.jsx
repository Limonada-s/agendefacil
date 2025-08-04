import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/shared/BackButton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Filter, Search, CheckCircle, XCircle, DollarSign, Percent, Loader2 } from 'lucide-react'; // Importar Loader2
import api from '@/services/api';

// Hook de Debounce para atrasar a busca (seu código original estava correto)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const ServiceHistoryPage = () => {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  
  // ===== CORREÇÃO 1: Lógica de Carregamento Aprimorada =====
  const [initialLoading, setInitialLoading] = useState(true); // Para o carregamento inicial
  const [isFiltering, setIsFiltering] = useState(false); // Para quando os filtros são aplicados

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadHistory = useCallback(async () => {
    if (!currentUser?.companyId) {
      setInitialLoading(false);
      return;
    }
    setIsFiltering(true); // Mostra o indicador de filtro
    try {
      const response = await api.get('/agendamentos/history', {
        params: {
          searchTerm: debouncedSearchTerm,
          statusFilter,
          startDate: dateRangeFilter.start || undefined,
          endDate: dateRangeFilter.end || undefined,
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setInitialLoading(false); // Desliga o carregamento inicial (só acontece uma vez)
      setIsFiltering(false); // Desliga o indicador de filtro
    }
  }, [currentUser?.companyId, debouncedSearchTerm, statusFilter, dateRangeFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Mostra o carregamento apenas na primeira vez que a página abre
  if (initialLoading) {
    return <div className="container mx-auto py-8 text-center">Carregando histórico...</div>;
  }

  if (!data) {
    return <div className="container mx-auto py-8 text-center">Não foi possível carregar o histórico.</div>;
  }

  const { history, summary } = data;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Histórico de Atendimentos</h1>
        <p className="text-muted-foreground">Visualize todos os serviços concluídos e cancelados.</p>
      </motion.div>

      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtros
            {/* ===== CORREÇÃO 2: Indicador de carregamento sutil ===== */}
            {isFiltering && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, serviço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-input border-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-input border-input"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="">Todos Status</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            value={dateRangeFilter.start}
            onChange={(e) => setDateRangeFilter(prev => ({...prev, start: e.target.value}))}
            className="bg-input border-input"
          />
          <Input 
            type="date" 
            value={dateRangeFilter.end}
            onChange={(e) => setDateRangeFilter(prev => ({...prev, end: e.target.value}))}
            className="bg-input border-input"
          />
        </CardContent>
      </Card>
      
      {/* Os cards de resumo agora usam os dados do 'summary' vindo da API */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                  <DollarSign className="mr-2 h-6 w-6"/>
                  Receita Líquida do Salão
              </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalSalonNetRevenue)}</p>
              <p className="text-sm text-muted-foreground">
                  Soma dos valores líquidos para o salão (após comissões) dos serviços concluídos e filtrados.
              </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
              <CardTitle className="flex items-center text-blue-500">
                  <Percent className="mr-2 h-6 w-6"/>
                  Total de Comissões
              </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalProfessionalCommissions)}</p>
              <p className="text-sm text-muted-foreground">
                  Soma das comissões pagas aos profissionais pelos serviços concluídos e filtrados.
              </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Registros</CardTitle>
          <CardDescription>Total de {history.length} registros encontrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">V. Total</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead className="text-right">V. Líquido</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? history.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)} {item.time}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell>{item.professionalName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.servicePrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.professionalCommission)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.salonNetRevenue)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.status === 'concluido' ? 'default' : 'destructive'} className={item.status === 'concluido' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                      {item.status === 'concluido' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {item.status === 'cancelado' && <XCircle className="mr-1 h-3 w-3" />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={8} className="text-center h-24">
                  Nenhum registro encontrado com os filtros atuais.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceHistoryPage;
