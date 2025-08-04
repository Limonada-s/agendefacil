import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  getProfessionals, 
  createProfessional,
  updateProfessional,
  deleteProfessional 
} from '@/services/serviceApi';
import ProfessionalForm from "@/components/professionals/ProfessionalForm";
import DeleteConfirmationDialog from "@/components/professionals/DeleteConfirmationDialog";
import BackButton from "@/components/shared/BackButton";

const ProfessionalsPage = () => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProfessional, setCurrentProfessional] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProfessionals();
      setProfessionals(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível buscar a lista de profissionais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenFormDialog = (professional = null) => {
    setCurrentProfessional(professional);
    setIsFormDialogOpen(true);
  };

  const handleSaveProfessional = async (formData) => {
    try {
      if (formData.id) {
        await updateProfessional(formData.id, formData);
        toast({ title: "Sucesso", description: "Profissional atualizado com sucesso." });
      } else {
        await createProfessional(formData);
        toast({ title: "Sucesso", description: "Profissional criado com sucesso." });
      }
      setIsFormDialogOpen(false);
      setCurrentProfessional(null);
      loadData();
    } catch (error) {
      const errorMessage = error.response?.data?.erro || "Ocorreu um erro ao salvar.";
      toast({ title: "Erro ao salvar", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDeleteClick = (professionalId) => {
    setProfessionalToDelete(professionalId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (professionalToDelete) {
      try {
        await deleteProfessional(professionalToDelete);
        toast({ title: "Sucesso", description: "Profissional excluído com sucesso." });
        setIsDeleteDialogOpen(false);
        setProfessionalToDelete(null);
        loadData();
      } catch (error) {
        const errorMessage = error.response?.data?.erro || "Ocorreu um erro ao excluir.";
        toast({ title: "Erro ao excluir", description: errorMessage, variant: "destructive" });
      }
    }
  };

  const filteredProfessionals = professionals.filter(p => {
    // CORREÇÃO: Usar 'nome' em vez de 'name' para buscar
    const searchString = `${p.loginDetails?.nome || ''} ${p.role || ''} ${p.loginDetails?.email || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie os profissionais do seu estabelecimento.</p>
        </div>
        <Button onClick={() => handleOpenFormDialog(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="text-xl text-card-foreground">Lista de Profissionais</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, função ou email..."
                className="pl-10 w-full md:w-80 bg-input text-foreground border-input focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando profissionais...</p>
          ) : filteredProfessionals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "Nenhum profissional encontrado." : "Nenhum profissional cadastrado."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional) => (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-card border-border flex flex-col">
                    <CardContent className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center mb-4">
                        {/* CORREÇÃO: Usar 'nome' para o avatar */}
                        <img 
                          className="h-16 w-16 rounded-full object-cover mr-4 border-2 border-primary/50" 
                          alt={professional.loginDetails.nome}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(professional.loginDetails.nome)}&background=random`}
                        />
                        <div>
                          {/* CORREÇÃO: Usar 'nome' em vez de 'name' */}
                          <h3 className="font-semibold text-lg text-foreground">{professional.loginDetails.nome}</h3>
                          <p className="text-sm text-primary">{professional.role}</p>
                          <p className="text-xs text-muted-foreground mt-1">{professional.loginDetails.email}</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex gap-2 pt-4 border-t border-border/50">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleOpenFormDialog(professional)}
                          aria-label="Editar profissional"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleDeleteClick(professional.id)}
                          aria-label="Excluir profissional"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormDialogOpen && (
        <ProfessionalForm
          isOpen={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
            setCurrentProfessional(null);
          }}
          onSave={handleSaveProfessional}
          professional={currentProfessional}
        />
      )}
      
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="profissional"
      />
    </div>
  );
};

export default ProfessionalsPage;
