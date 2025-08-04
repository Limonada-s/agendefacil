// Em: src/pages/HomePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, BarChart2, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/services/api';

// Componente reutilizável para os cards de métricas
const StatCard = ({ title, value, icon, color }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card border-border border-l-4" style={{ borderLeftColor: color }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {React.cloneElement(icon, { className: `h-5 w-5`, style: { color: color } })}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </CardContent>
  </Card>
);

const HomePage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // Usamos 'last30days' como padrão para as métricas financeiras mensais
      const response = await api.get('/financials/summary?range=last30days');
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!dashboardData) {
    return <div className="text-center py-10">Não foi possível carregar os dados do painel.</div>;
  }

  const { summary, upcomingAppointments } = dashboardData;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bem-vindo(a) de volta, {user?.nome || 'Admin'}!
        </h1>
        <p className="text-muted-foreground">Aqui está um resumo do seu negócio hoje.</p>
      </motion.div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 my-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <StatCard title="Faturamento Bruto (Mês)" value={formatCurrency(summary.grossRevenue)} icon={<DollarSign />} color="#34D399" />
        <StatCard title="Agendamentos Hoje" value={summary.appointmentsTodayCount} icon={<Calendar />} color="#60A5FA" />
        <StatCard title="Ticket Médio (Mês)" value={formatCurrency(summary.averageTicket)} icon={<Users />} color="#FBBF24" />
        <StatCard title="Resultado Líquido (Mês)" value={formatCurrency(summary.finalNetRevenue)} icon={<BarChart2 />} color={summary.finalNetRevenue >= 0 ? "#34D399" : "#F87171"} />
      </motion.div>

      <div className="grid gap-8 md:grid-cols-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg bg-card border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                    <CardDescription>Os próximos 3 compromissos na sua agenda.</CardDescription>
                </div>
                <Button asChild variant="ghost">
                    <Link to="/agendamentos">Ver Todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingAppointments.map(app => (
                    <li key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-primary/10 text-primary p-2 rounded-md">
                            <span className="font-bold text-lg">{formatDate(app.data, 'dd')}</span>
                            <span className="text-xs uppercase">{formatDate(app.data, 'MMM')}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.servico?.name || 'Serviço não definido'}</p>
                          <p className="text-sm text-muted-foreground">com {app.client?.nome || 'Cliente'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{app.hora}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-10">Nenhum agendamento futuro encontrado.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
            <Button asChild size="lg">
                <Link to="/financeiro">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    Ver Relatório Financeiro Completo
                </Link>
            </Button>
        </motion.div>
    </div>
  );
};

export default HomePage;
