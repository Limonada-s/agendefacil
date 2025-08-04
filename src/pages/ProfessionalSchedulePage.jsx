import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save, Clock, Loader2 } from 'lucide-react';
import { getMyFullProfessionalProfile, updateMySchedule } from '@/services/serviceApi';
import BackButton from '@/components/shared/BackButton';

const DaySchedule = ({ day, label, schedule, onScheduleChange }) => {
  const handleToggle = (checked) => {
    onScheduleChange(day, 'ativo', checked);
  };

  const handleTimeChange = (type, value) => {
    onScheduleChange(day, type, value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-muted/30">
      <Label htmlFor={`switch-${day}`} className="font-semibold text-lg mb-2 sm:mb-0">{label}</Label>
      <div className="flex items-center gap-4">
        <Switch
          id={`switch-${day}`}
          checked={schedule.ativo}
          onCheckedChange={handleToggle}
        />
        <Input
          type="time"
          value={schedule.inicio}
          onChange={(e) => handleTimeChange('inicio', e.target.value)}
          disabled={!schedule.ativo}
          className="w-32 bg-input"
        />
        <span>até</span>
        <Input
          type="time"
          value={schedule.fim}
          onChange={(e) => handleTimeChange('fim', e.target.value)}
          disabled={!schedule.ativo}
          className="w-32 bg-input"
        />
      </div>
    </div>
  );
};

const ProfessionalSchedulePage = () => {
  const { toast } = useToast();
  const [workingHours, setWorkingHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    { key: 'dom', label: 'Domingo' },
    { key: 'seg', label: 'Segunda-feira' },
    { key: 'ter', label: 'Terça-feira' },
    { key: 'qua', label: 'Quarta-feira' },
    { key: 'qui', label: 'Quinta-feira' },
    { key: 'sex', label: 'Sexta-feira' },
    { key: 'sab', label: 'Sábado' },
  ];

  const defaultSchedule = daysOfWeek.reduce((acc, day) => {
    acc[day.key] = { ativo: day.key !== 'dom', inicio: '09:00', fim: '18:00' };
    return acc;
  }, {});

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getMyFullProfessionalProfile();
      setWorkingHours(profile.workingHours || defaultSchedule);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar seus horários.", variant: "destructive" });
      setWorkingHours(defaultSchedule); // Carrega o padrão em caso de erro
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleScheduleChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateMySchedule(workingHours);
      toast({
        title: "Horários Salvos!",
        description: "Sua semana de trabalho foi atualizada com sucesso.",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      toast({ title: "Erro ao Salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Carregando seus horários...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-3xl mx-auto shadow-xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center">
              <Clock className="mr-3 h-7 w-7 text-primary" />
              Meus Horários de Trabalho
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Defina seus dias e horários de atendimento padrão. Isso afetará os horários disponíveis para seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {daysOfWeek.map(day => (
              <DaySchedule
                key={day.key}
                day={day.key}
                label={day.label}
                schedule={workingHours[day.key]}
                onScheduleChange={handleScheduleChange}
              />
            ))}
            <div className="flex justify-end pt-6">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfessionalSchedulePage;
