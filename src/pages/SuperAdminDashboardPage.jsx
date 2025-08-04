import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Briefcase, Calendar } from 'lucide-react';
import api from '@/services/api';

const StatCard = ({ title, value, icon: Icon }) => (
  <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>
);

const SuperAdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/superadmin/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas do sistema:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <div>Carregando estatísticas...</div>;
  if (!stats) return <div>Não foi possível carregar os dados.</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard do Sistema</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Empresas" value={stats.totalCompanies} icon={Building} />
        <StatCard title="Total de Clientes" value={stats.totalUsers} icon={Users} />
        <StatCard title="Total de Profissionais" value={stats.totalProfessionals} icon={Briefcase} />
        <StatCard title="Total de Agendamentos" value={stats.totalAppointments} icon={Calendar} />
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;