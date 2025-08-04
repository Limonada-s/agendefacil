import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowDownCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyEarnings } from '@/services/serviceApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import BackButton from '@/components/shared/BackButton';

const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="bg-card border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </CardContent>
  </Card>
);

const ProfessionalEarningsPage = () => {
  const { toast } = useToast();
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyEarnings(timeRange);
      setEarningsData(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar seus ganhos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  if (loading) return <div className="container mx-auto py-8">Carregando seus ganhos...</div>;
  if (!earningsData) return <div className="container mx-auto py-8">Não foi possível carregar os dados.</div>;

  const { summary, details } = earningsData;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Ganhos</h1>
            <p className="text-muted-foreground">Acompanhe suas comissões e pagamentos.</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-input border-input"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="last90days">Últimos 90 dias</SelectItem>
              <SelectItem value="allTime">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total em Comissões" value={formatCurrency(summary.totalCommission)} icon={TrendingUp} />
          <StatCard title="Total em Adiantamentos" value={formatCurrency(summary.totalAdvances)} icon={ArrowDownCircle} />
          <StatCard title="Serviços Concluídos" value={summary.totalServices} icon={CheckCircle} />
          <StatCard title="Saldo a Receber" value={formatCurrency(summary.finalBalance)} icon={DollarSign} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Detalhamento de Comissões</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Serviço</TableHead><TableHead className="text-right">Comissão</TableHead></TableRow></TableHeader>
                <TableBody>
                  {details.commissions.length > 0 ? details.commissions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.serviceName}</TableCell>
                      <TableCell className="text-right text-green-500">{formatCurrency(item.commissionAmount)}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhuma comissão neste período.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Adiantamentos Realizados</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                <TableBody>
                  {details.advances.length > 0 ? details.advances.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right text-red-500">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum adiantamento neste período.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfessionalEarningsPage;