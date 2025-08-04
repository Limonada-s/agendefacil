// ServicesPage.jsx atualizado com logs completos e correções de currentUser

import React from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, Clock, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ServiceFormDialog from "@/components/services/ServiceFormDialog";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import BackButton from "@/components/shared/BackButton";
import api from "@/services/api";
import { formatCurrency } from "@/lib/utils";

const ServicesPage = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [services, setServices] = React.useState([]);
  const [companyCategories, setCompanyCategories] = React.useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [currentServiceData, setCurrentServiceData] = React.useState(null)

  React.useEffect(() => {
    console.log("👤 currentUser:", currentUser);

    if (currentUser?.companyId) {
      api.get(`/empresas/${currentUser.companyId}`)
        .then(res => {
          const categorias = res.data.categorias || [];
          const categoriasFormatadas = categorias.map(cat => ({
            id: String(cat.id),
            label: cat.nome,
            group: cat.tipo
          }));
          console.log("📦 Categorias carregadas:", categoriasFormatadas);
          setCompanyCategories(categoriasFormatadas);
        })
        .catch(err => console.error("❌ Erro ao buscar empresa:", err));
    } else {
      console.warn("⚠️ companyId ausente em currentUser.");
    }

    loadData();
  }, [currentUser?.companyId]);

  const loadData = React.useCallback(async () => {
  try {
    // CORREÇÃO: Usando 'currentUser' em vez de 'user'
    if (currentUser?.companyId) {
      const [servicesRes, companyRes] = await Promise.all([
        // CORREÇÃO: Usando 'currentUser'
        api.get(`/empresas/${currentUser.companyId}/servicos?include=profissionais`),
        // CORREÇÃO: Usando 'currentUser'
        api.get(`/empresas/${currentUser.companyId}`)
      ]);
      setServices(servicesRes.data);
      setCompanyCategories(companyRes.data.categorias || []);
    } else {
      setServices([]);
      setCompanyCategories([]);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
    toast({ title: "Erro", description: "Não foi possível carregar os dados da empresa.", variant: "destructive" });
  }
  // CORREÇÃO: Usando 'currentUser' na lista de dependências
}, [currentUser?.companyId, toast]);

  const handleOpenFormDialog = (service = null) => {
    setCurrentServiceData(service);
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setCurrentServiceData(null);
  };


  const handleSaveService = async (serviceToSave) => {
    try {
      if (serviceToSave.id) {
        await api.put(`/servicos/${serviceToSave.id}`, serviceToSave);
      } else {
        await api.post(`/servicos`, serviceToSave);
      }
      await loadData();
      handleCloseFormDialog();
      toast({
        title: serviceToSave.id ? "Serviço atualizado" : "Serviço criado",
        description: `Serviço ${serviceToSave.id ? "atualizado" : "criado"} com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (id) => {
    setServiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/servicos/${serviceToDelete}`);
      await loadData();
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      toast({
        title: "Serviço excluído",
        description: "Serviço excluído com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "" || String(service.categoryId) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  console.log("🔍 Filtros aplicados:", { searchTerm, categoryFilter, totalFiltrados: filteredServices.length });

  const availableCompanyCategoriesForSelect = companyCategories;

  if (!currentUser) {
    console.warn("🔁 currentUser ainda não carregado...");
    return <p className="text-center py-10">Carregando dados da empresa...</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pela sua empresa.</p>
        </div>
        <Button onClick={() => handleOpenFormDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="text-xl text-card-foreground">Lista de Serviços</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviços..."
                  className="pl-10 bg-input text-foreground border-input focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-input text-foreground border-input">
                  <SelectValue placeholder="Todas categorias da empresa" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="">Todas categorias</SelectItem>
                  {availableCompanyCategoriesForSelect.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum serviço encontrado para esta empresa.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const categoryDetails = companyCategories.find(c => c.id === service.categoryId);
                const imageSrc = service.image && (service.image.startsWith('http') || service.image.startsWith('data:image')) 
                                 ? service.image 
                                 : `https://images.unsplash.com/photo-1519709027980-576686a65057?q=80&w=600&auto=format&fit=crop`;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full service-card flex flex-col bg-card border-border group">
                      <div className="h-48 relative overflow-hidden rounded-t-lg">
                        <img src={imageSrc} alt={service.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        {categoryDetails && (
                          <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded-full backdrop-blur-sm">
                            {categoryDetails.label}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow flex flex-col">
                        <h3 className="font-semibold text-lg mb-1 text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 flex-grow line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="inline-flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1.5 text-primary" />
                            {service.duration} min
                          </span>
                          <span className="inline-flex items-center font-medium text-lg text-primary">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 border-t border-border/50">
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenFormDialog(service)}
                          >
                            <Edit2 className="h-4 w-4 mr-1.5"/>
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDeleteClick(service.id)}
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={handleSaveService}
        serviceData={currentServiceData}
        companyId={currentUser?.companyId}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="serviço"
      />
    </div>
  );
};

export default ServicesPage;
