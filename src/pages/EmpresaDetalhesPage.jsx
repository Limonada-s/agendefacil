import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Star, MapPin, ArrowLeft, Info, Phone, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/services/api';

const CompanyProfilePage = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        navigate(-1);
        return;
      }
      
      setLoading(true);
      console.log(`[ETAPA 1] Iniciando busca de dados para empresa ID: ${companyId}`);

      try {
        const [companyResponse, servicesResponse] = await Promise.all([
          axios.get(`/empresas/${companyId}`),
          axios.get(`/empresas/${companyId}/servicos`)
        ]);
        
        console.log("[ETAPA 2] Dados brutos recebidos da API:", {
          companyData: companyResponse.data,
          servicesData: servicesResponse.data,
        });
        
        const companyData = companyResponse.data;
        setCompany({
          ...companyData,
          name: companyData.nome_empresa,
          email: companyData.email_admin,
          phone: companyData.telefone,
          address: companyData.endereco ? `${companyData.endereco.rua}, ${companyData.endereco.numero}` : 'Endereço não informado',
          coverImage: companyData.coverImage || `https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop`,
          description: companyData.description || "Descrição da empresa não disponível.",
        });

        setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);

      } catch (err) {
        console.error("🔴 ERRO FATAL ao buscar dados da empresa:", err);
        toast({
          title: "Erro ao carregar página",
          description: "Não foi possível buscar os detalhes da empresa.",
          variant: "destructive"
        });
        navigate("/descobrir-servicos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();

  }, [companyId, navigate, toast]);

  const handleScheduleService = (serviceId) => {
    navigate(`/agendar?empresa=${companyId}&servico=${serviceId}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast({ title: "Link Copiado!" }))
      .catch(() => toast({ title: "Erro ao copiar", variant: "destructive" }));
  };

  console.log("[ETAPA 3] Renderizando com os seguintes estados:", { loading, company, services });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Info className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button variant="outline" onClick={handleCopyLink} className="mb-4">
          <Copy className="mr-2 h-4 w-4" /> Copiar Link
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 md:h-80 bg-muted"
      >
        <img src={company.coverImage} alt={`Capa de ${company.name}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{company.name || 'Nome da Empresa'}</h1>
          <div className="flex items-center text-sm mt-2 opacity-90">
            <MapPin className="h-4 w-4 mr-1.5" /> {company.address || 'Endereço não informado'}
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Nossos Serviços</h2>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service, index) => {
                  // =============================================================
                  // LOG DE INVESTIGAÇÃO FINAL
                  // =============================================================
                  console.log(`[ETAPA 4] Renderizando Card para o serviço #${index}:`, service);

                  return (
                    <Card key={service.id || index} className="hover:shadow-md transition-shadow bg-card border-border">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{service.name || 'Serviço sem nome'}</h3>
                          <p className="text-sm text-muted-foreground">{service.description || "Descrição não disponível."}</p>
                          <p className="text-sm text-primary font-medium mt-1">
                            R$ {Number(service.price || 0).toFixed(2)} | Duração: {service.duration || 'N/A'} min
                          </p>
                        </div>
                        <Button onClick={() => handleScheduleService(service.id)} size="sm">
                          <Calendar className="mr-2 h-4 w-4" /> Agendar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum serviço cadastrado para esta empresa no momento.</p>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Info className="mr-2 h-5 w-5 text-primary"/> Sobre Nós
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-primary"/> Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Telefone:</strong> {company.phone || "Não informado"}</p>
                  <p><strong>Email:</strong> {company.email || "Não informado"}</p>
                  <p><strong>Endereço:</strong> {company.address}</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
