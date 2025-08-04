import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, DollarSign, TrendingUp, TrendingDown, Users, CalendarDays, Package, Activity, FileText, PlusCircle, Trash2, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { subDays, formatISO, parseISO } from 'date-fns';
import BackButton from '@/components/shared/BackButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import api from '@/services/api';


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-md border border-border shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="text-xs">
            {`${entry.name}: ${entry.formatter ? entry.formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ExpenseFormDialog = ({ isOpen, onClose, onSave, professionals, companyId }) => {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('despesa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [professionalId, setProfessionalId] = useState('');

  const handleSubmit = () => {
    if (!description || !amount || !date) {
      toast({ title: "Campos obrigatórios", description: "Descrição, valor e data são necessários.", variant: "destructive" });
      return;
    }
    if (type === 'adiantamento' && !professionalId) {
      toast({ title: "Campo obrigatório", description: "Selecione um profissional para o adiantamento.", variant: "destructive" });
      return;
    }
    onSave({
      description,
      amount: parseFloat(amount),
      type,
      date,
      professionalId: type === 'adiantamento' ? professionalId : null,
      companyId
    });
    setDescription(''); setAmount(''); setType('despesa'); setDate(new Date().toISOString().split('T')[0]); setProfessionalId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Lançar Despesa/Adiantamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div><Label htmlFor="exp-desc">Descrição</Label><Input id="exp-desc" value={description} onChange={e => setDescription(e.target.value)} className="bg-input border-input"/></div>
          <div><Label htmlFor="exp-amount">Valor (R$)</Label><Input id="exp-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-input border-input"/></div>
          <div><Label htmlFor="exp-date">Data</Label><Input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-input border-input"/></div>
          <div>
            <Label htmlFor="exp-type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="exp-type" className="bg-input border-input"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="despesa">Despesa Geral</SelectItem>
                <SelectItem value="adiantamento">Adiantamento p/ Profissional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'adiantamento' && (
            <div>
              <Label htmlFor="exp-prof">Profissional</Label>
              <Select value={professionalId} onValueChange={setProfessionalId}>
                <SelectTrigger id="exp-prof" className="bg-input border-input"><SelectValue placeholder="Selecione o profissional"/></SelectTrigger>
                <SelectContent className="bg-popover border-border">{professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.loginDetails.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const FinancialDashboardPage = () => {
  const { currentPaletteId, palettes } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [financialData, setFinancialData] = useState(null);
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState(null);
  const [isDeleteExpenseConfirmOpen, setIsDeleteExpenseConfirmOpen] = useState(false);

  const activePalette = palettes.find(p => p.id === currentPaletteId) || palettes[0];
  const primaryColor = `hsl(${activePalette.colors['--primary']})`;
  const secondaryColor = `hsl(${activePalette.colors['--secondary']})`;
  const mutedColor = `hsl(${activePalette.colors['--muted-foreground']})`;
  // ===== ADIÇÃO: Declarando a variável que faltava =====
  const foregroundColor = `hsl(${activePalette.colors['--foreground']})`;
  
  const CHART_COLORS = [ primaryColor, `hsl(${activePalette.colors['--accent']})`, secondaryColor, '#FFBB28', '#FF8042', '#00C49F' ];

  const loadFinancialData = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const [summaryRes, professionalsRes] = await Promise.all([
        api.get(`/financials/summary?range=${timeRange}`),
        api.get('/profissionais/all')
      ]);
      setFinancialData(summaryRes.data);
      setAllProfessionals(professionalsRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados financeiros.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [timeRange, user?.companyId, toast]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);
  
  const handleSaveExpense = async (expenseData) => {
    try {
      await api.post('/financials/expenses', expenseData);
      toast({ title: "Lançamento Salvo!", description: "Sua despesa/adiantamento foi registrada." });
      loadFinancialData();
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: "Não foi possível registrar o lançamento.", variant: "destructive" });
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenseToDeleteId(id);
    setIsDeleteExpenseConfirmOpen(true);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDeleteId) return;
    try {
      await api.delete(`/financials/expenses/${expenseToDeleteId}`);
      toast({ title: "Lançamento Excluído!" });
      loadFinancialData();
    } catch (error) {
      toast({ title: "Erro ao Excluir", variant: "destructive" });
    } finally {
      setIsDeleteExpenseConfirmOpen(false);
      setExpenseToDeleteId(null);
    }
  };

  const StatCard = ({ title, value, icon, description, color = primaryColor }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card border-border border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {React.cloneElement(icon, { className: `h-5 w-5` , style: {color: color} })}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
  
  const placeholderDataMessage = "Não há dados suficientes para exibir este gráfico no período selecionado.";

  if (loading) return <div className="container mx-auto py-8">Carregando dados financeiros...</div>;
  if (!financialData) return <div className="container mx-auto py-8">Não foi possível carregar os dados.</div>;

  const { summary, charts, expenses } = financialData;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">Painel Financeiro</h1>
            <p className="text-muted-foreground">Visualize o desempenho financeiro do seu negócio.</p>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-input border-input text-foreground">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="last90days">Últimos 90 dias</SelectItem>
                <SelectItem value="allTime">Todo o período</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsExpenseFormOpen(true)} className="bg-destructive hover:bg-destructive/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Lançar Despesa
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard title="Receita Bruta" value={formatCurrency(summary.grossRevenue)} icon={<DollarSign />} color={CHART_COLORS[0]}/>
          <StatCard title="Comissões Pagas" value={formatCurrency(summary.totalProfessionalCommissions)} icon={<Percent />} color={CHART_COLORS[1]}/>
          <StatCard title="Receita Líquida (Serviços)" value={formatCurrency(summary.salonNetRevenueFromServices)} icon={<TrendingUp />} color={CHART_COLORS[2]}/>
          <StatCard title="Despesas Totais" value={formatCurrency(summary.totalExpensesAmount)} icon={<TrendingDown />} color={CHART_COLORS[3]}/>
          <StatCard title="Resultado Líquido Final" value={formatCurrency(summary.finalNetRevenue)} icon={<Activity />} color={summary.finalNetRevenue >=0 ? CHART_COLORS[5] : CHART_COLORS[4]}/>
          <StatCard title="Ticket Médio (Bruto)" value={formatCurrency(summary.averageTicket)} icon={<Package />} color={CHART_COLORS[4]}/>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
          <Card className="shadow-lg bg-card border-border">
            <CardHeader><CardTitle className="text-xl font-semibold text-foreground">Serviços Mais Rentáveis (Receita Bruta)</CardTitle></CardHeader>
            <CardContent>
             {charts.revenueByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={charts.revenueByService} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill={primaryColor} dataKey="revenue" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {charts.revenueByService.map((entry, index) => ( <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} /> ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} formatter={(value) => formatCurrency(value)}/>
                  <Legend wrapperStyle={{ fontSize: "12px" }}/>
                </PieChart>
              </ResponsiveContainer>
              ) : ( <p className="text-center text-muted-foreground py-10">{placeholderDataMessage}</p> )}
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-card border-border">
            <CardHeader><CardTitle className="text-xl font-semibold text-foreground">Desempenho dos Serviços (Quantidade)</CardTitle></CardHeader>
            <CardContent>
             {charts.revenueByService.filter(s => s.count > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={charts.revenueByService.filter(s => s.count > 0).length * 40 + 60}>
                <BarChart data={charts.revenueByService.filter(s => s.count > 0).sort((a,b) => b.count - a.count).slice(0,10)} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={mutedColor} strokeOpacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: foregroundColor }} stroke={mutedColor}/>
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: foregroundColor }} stroke={mutedColor} width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }}/>
                  <Bar dataKey="count" fill={primaryColor} name="Quantidade" barSize={20} radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
              ) : ( <p className="text-center text-muted-foreground py-10">{placeholderDataMessage}</p> )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-lg bg-card border-border">
          <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Lançamentos Manuais (Despesas/Adiantamentos)</CardTitle>
              <CardDescription>Despesas e adiantamentos registrados no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
              {expenses.length > 0 ? (
              <Table>
                  <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Tipo</TableHead><TableHead>Profissional</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                  {expenses.map(exp => (
                      <TableRow key={exp.id}>
                      <TableCell>{formatDate(exp.date, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{exp.description}</TableCell>
                      <TableCell>{exp.type === 'adiantamento' ? 'Adiantamento' : 'Despesa'}</TableCell>
                      <TableCell>{exp.professional?.loginDetails?.nome || 'N/A'}</TableCell>
                      <TableCell className="text-right text-red-500">{formatCurrency(exp.amount)}</TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4"/></Button>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              ) : (<p className="text-center text-muted-foreground py-10">Nenhuma despesa/adiantamento lançado neste período.</p>)}
          </CardContent>
        </Card>

      </motion.div>
      <ExpenseFormDialog 
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSave={handleSaveExpense}
        professionals={allProfessionals}
        companyId={user?.companyId}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteExpenseConfirmOpen}
        onClose={() => setIsDeleteExpenseConfirmOpen(false)}
        onConfirm={confirmDeleteExpense}
        itemName="lançamento"
      />
    </div>
  );
};

export default FinancialDashboardPage;
