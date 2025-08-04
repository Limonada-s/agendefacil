
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  getClients, 
  saveClient as saveClientData, 
  deleteClient as deleteClientData,
  getAppointmentsByClient
} from "@/lib/data";
import ClientForm from "@/components/clients/ClientForm";
import ClientDetailsDialog from "@/components/clients/ClientDetailsDialog";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ClientListItem from "@/components/clients/ClientListItem";
import BackButton from "@/components/shared/BackButton";

const ClientsPage = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientToDeleteId, setClientToDeleteId] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  
  const initialClientState = { id: "", name: "", cpf: "", phone: "", email: "", birthdate: "", password: "", notes: "" };
  const [currentClient, setCurrentClient] = useState(initialClientState);

  const loadClients = useCallback(() => {
    setClients(getClients());
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleOpenForm = (client = null) => {
    setCurrentClient(client ? { ...client, password: "" } : initialClientState); 
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentClient(initialClientState);
  };

  const handleOpenDetails = (client) => {
    setSelectedClient(client);
    setClientAppointments(getAppointmentsByClient(client.id));
    setIsDetailsOpen(true);
    setIsFormOpen(false);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedClient(null);
    setClientAppointments([]);
  };

  const handleSaveClient = (clientData) => {
    try {
      saveClientData(clientData);
      loadClients();
      handleCloseForm();
      toast({
        title: clientData.id ? "Cliente atualizado!" : "Cliente criado!",
        description: `O cliente ${clientData.name} foi ${clientData.id ? "atualizado" : "salvo"} com sucesso.`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = (id) => {
    setClientToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDeleteId) {
      try {
        deleteClientData(clientToDeleteId);
        loadClients();
        toast({
          title: "Cliente excluído!",
          description: "O cliente foi excluído com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    setIsDeleteConfirmOpen(false);
    setClientToDeleteId(null);
  };

  const filteredClients = clients.filter(client => {
    const searchString = `${client.name} ${client.phone} ${client.email} ${client.cpf}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciamento de Clientes</h1>
          <p className="text-muted-foreground">Adicione, visualize, edite e remova clientes.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-5 w-5" /> Novo Cliente
        </Button>
      </motion.div>

      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl text-card-foreground">Lista de Clientes</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone, email ou CPF..."
                className="pl-10 w-full md:w-80 bg-input text-foreground border-input focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <motion.div initial={{ opacity: 0, scale:0.8 }} animate={{ opacity: 1, scale:1}} transition={{delay:0.2}}>
                <img  alt="Ilustração de busca vazia" className="mx-auto h-32 w-32 text-muted-foreground opacity-50 mb-4" src="https://images.unsplash.com/photo-1612200870105-22f8cc963ee1" />
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? "Nenhum cliente encontrado com sua busca." : "Ainda não há clientes cadastrados."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenForm()} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" /> Cadastrar Primeiro Cliente
                  </Button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClients.map((client) => (
                <ClientListItem 
                  key={client.id}
                  client={client}
                  onOpenDetails={handleOpenDetails}
                  onOpenForm={handleOpenForm}
                  onDelete={handleDeleteClient}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ClientForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveClient}
        client={currentClient}
      />

      {selectedClient && (
        <ClientDetailsDialog
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          client={selectedClient}
          appointments={clientAppointments}
          onEdit={() => handleOpenForm(selectedClient)}
        />
      )}
      
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteClient}
        itemName="cliente"
      />
    </div>
  );
};

export default ClientsPage;
