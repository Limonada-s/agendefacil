import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Tag, Users, Star, MapPin, ShoppingBag, Clock, ArrowLeft, Info, Phone, Mail, Copy, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
// 1. A ÚNICA IMPORTAÇÃO DE SERVIÇO AGORA É A SUA INSTÂNCIA DO AXIOS
import axios from '@/services/api';


const CompanyProfilePage = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const { isAuthenticated, userType } = useAuth();
  const { toast } = useToast();

  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        // --- PASSO 1: BUSCAR OS DADOS PRINCIPAIS DA EMPRESA ---
        const companyResponse = await axios.get(`/empresas/${companyId}`);
        const companyData = companyResponse.data;

        // Mapeia os dados da empresa para o formato esperado pelo frontend
        setCompany({
          ...companyData,
          name: companyData.nome_empresa,
          email: companyData.email_admin,
          phone: companyData.telefone,
          address: companyData.endereco ? `${companyData.endereco.rua}, ${companyData.endereco.numero} - ${companyData.endereco.bairro}` : 'Endereço não informado',
          coverImage: companyData.coverImage || `https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop`,
          description: companyData.description || "Descrição da empresa não disponível.",
          openingHours: [], // Placeholder, pode ser adicionado no futuro
          rating: null,     // Placeholder
          reviewsCount: 0   // Placeholder
        });

        // --- PASSO 2: BUSCAR SERVIÇOS, PRODUTOS E PROFISSIONAIS EM PARALELO ---
        // Isso é mais rápido do que fazer uma chamada de cada vez.
        const [servicesResponse, productsResponse, professionalsResponse] = await Promise.all([
          axios.get(`/servicos/empresas/${companyId}`),
          axios.get(`/produtos/empresas/${companyId}`),      // Assumindo que esta rota existe no seu backend
          axios.get(`/profissionais/empresas/${companyId}`) // Assumindo que esta rota existe no seu backend
        ]);

        setServices(servicesResponse.data);
        setProducts(productsResponse.data);
        setProfessionals(professionalsResponse.data);

      } catch (err) {
        console.error("Erro ao buscar dados da empresa:", err);
        toast({
          title: "Erro ao carregar",
          description: "Empresa não encontrada ou falha na comunicação com o servidor.",
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
    // Esta função já está correta, navegando para a página de agendamento
    navigate(`/agendar?empresa=${companyId}&servico=${serviceId}`);
  };
  
  const handleBuyProduct = (productId) => {
    // Lógica de compra (placeholder)
    toast({ title: "Em breve!", description: `Funcionalidade de compra será implementada.`, variant: "info" });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast({ title: "Link Copiado!", description: "O link para esta página foi copiado." }))
      .catch(() => toast({ title: "Erro ao copiar", variant: "destructive" }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">Carregando perfil da empresa...</div>;
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Info className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Empresa não encontrada</h1>
        <p className="text-muted-foreground mb-4">Não conseguimos localizar o perfil desta empresa.</p>
        <Button onClick={() => navigate(-1)}>
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
            <Copy className="mr-2 h-4 w-4" /> Copiar Link da Empresa
          </Button>
        </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 md:h-80 bg-muted"
      >
        <img src={company.coverImage} alt={`Capa de ${company.name}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold drop-shadow-lg"
          >
            {company.name}
          </motion.h1>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center text-sm mt-2 opacity-90"
          >
            <MapPin className="h-4 w-4 mr-1.5" /> {company.address}
            <span className="mx-2">|</span>
            <Star className="h-4 w-4 mr-1 text-yellow-400" /> {company.rating || 'N/A'} ({company.reviewsCount || 0} avaliações)
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6 bg-muted text-muted-foreground">
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="professionals">Profissionais</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <h2 className="text-2xl font-semibold mb-4">Nossos Serviços</h2>
                  {services.length > 0 ? (
                    <div className="space-y-4">
                      {services.map(service => (
                        <Card key={service.id} className="hover:shadow-md transition-shadow bg-card border-border">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">{service.description || "Descrição não disponível."}</p>
                              <p className="text-sm text-primary font-medium mt-1">
                                R$ {Number(service.price).toFixed(2)} | Duração: {service.duration} min
                              </p>
                            </div>
                            <Button onClick={() => handleScheduleService(service.id)} size="sm">
                              <Calendar className="mr-2 h-4 w-4" /> Agendar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum serviço cadastrado no momento.</p>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="products">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                   <h2 className="text-2xl font-semibold mb-4">Nossos Produtos</h2>
                   {products.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {products.map(product => (
                         <Card key={product.id} className="hover:shadow-md transition-shadow bg-card border-border">
                           <CardHeader className="p-3">
                              <img src={product.image || `https://placehold.co/600x400/E2E8F0/4A5568?text=Produto`} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2"/>
                             <CardTitle className="text-md font-semibold text-foreground">{product.name}</CardTitle>
                           </CardHeader>
                           <CardContent className="p-3 pt-0">
                             <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{product.description || "Sem descrição."}</p>
                             <p className="text-primary font-semibold text-lg">R$ {Number(product.price).toFixed(2)}</p>
                           </CardContent>
                           <CardFooter className="p-3">
                             <Button onClick={() => handleBuyProduct(product.id)} size="sm" className="w-full">
                               <ShoppingBag className="mr-2 h-4 w-4" /> Comprar
                             </Button>
                           </CardFooter>
                         </Card>
                       ))}
                     </div>
                   ) : (
                     <p className="text-muted-foreground">Nenhum produto cadastrado no momento.</p>
                   )}
                 </motion.div>
              </TabsContent>

              <TabsContent value="professionals">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <h2 className="text-2xl font-semibold mb-4">Nossa Equipe</h2>
                  {professionals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {professionals.map(prof => (
                        <Card key={prof.id} className="text-center p-4 bg-card border-border">
                          <img src={prof.image || `https://ui-avatars.com/api/?name=${prof.name.replace(/\s+/g, '+')}&background=random`} alt={prof.name} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"/>
                          <h3 className="font-semibold text-foreground">{prof.name}</h3>
                          <p className="text-sm text-primary">{prof.role || prof.specialty}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum profissional cadastrado no momento.</p>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
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
                  <Clock className="mr-2 h-5 w-5 text-primary"/> Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">Não informado.</p>
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
