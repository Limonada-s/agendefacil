// Em: src/pages/ClientServiceDiscoveryPage.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Tag, ArrowRight, Building, Loader2 } from 'lucide-react';
// ===== CORREÇÃO APLICADA AQUI =====
// Caminhos de importação ajustados para serem relativos em vez de usar o atalho '@/'
import { useBusiness } from '../contexts/BusinessContext';
import { useEmpresasProximas } from '../hooks/useEmpresasProximas';

const ClientServiceDiscoveryPage = () => {
  const { businessType } = useBusiness();
  const { empresas: allCompanies, loading } = useEmpresasProximas(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [availableServiceTypes, setAvailableServiceTypes] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    if (allCompanies && allCompanies.length > 0) {
      const allServices = allCompanies.flatMap(e => e.servicos || []);
      const uniqueServiceTypes = [...new Set(allServices.map(service => service.name.toLowerCase()))]
        .map(name => ({ value: name, label: name.charAt(0).toUpperCase() + name.slice(1) }));
      setAvailableServiceTypes(uniqueServiceTypes);
      setFilteredCompanies(allCompanies);
    }
  }, [allCompanies]);

  useEffect(() => {
    if (!allCompanies) return;
    let companies = [...allCompanies];

    if (selectedServiceType) {
      companies = companies.filter(company =>
        company.servicos?.some(service => service.name.toLowerCase() === selectedServiceType.toLowerCase())
      );
    }

    if (searchTerm) {
      companies = companies.filter(company =>
        company.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.endereco && `${company.endereco.rua}, ${company.endereco.numero}, ${company.endereco.bairro}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCompanies(companies);
  }, [searchTerm, selectedServiceType, allCompanies]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Encontre o Serviço Perfeito em <span className="text-primary">{businessType?.name || 'sua região'}</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Explore estabelecimentos e agende seus serviços de beleza e bem-estar.
        </p>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 p-6 bg-card border border-border rounded-lg shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="service-type-filter" className="text-sm font-medium text-muted-foreground mb-1 block">
              Tipo de Serviço
            </Label>
            <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
              <SelectTrigger id="service-type-filter" className="w-full bg-input border-input text-foreground">
                <SelectValue placeholder="Todos os tipos de serviço" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="">Todos os tipos</SelectItem>
                {availableServiceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="capitalize">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="search-term" className="text-sm font-medium text-muted-foreground mb-1 block">
              Buscar por nome ou local
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search-term"
                placeholder="Nome do salão, barbearia, etc. ou endereço"
                className="pl-10 w-full bg-input border-input text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de Empresas */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando empresas próximas...</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col bg-card border-border">
                <div className="relative h-48 w-full">
                  <img src={company.image || `https://placehold.co/800x400/a78bfa/ffffff?text=${encodeURIComponent(company.nome_empresa)}`} alt={`Imagem de ${company.nome_empresa}`} className="w-full h-full object-cover" />
                  
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded-md flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {company.totalReviews > 0 ? (
                      <span>{parseFloat(company.averageRating).toFixed(1)}</span>
                    ) : (
                      <span className="text-xs">Nova</span>
                    )}
                  </div>

                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground">{company.nome_empresa}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {company.endereco?.rua ? `${company.endereco.rua}, ${company.endereco.numero}` : "Endereço não informado"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="p-3 rounded-md bg-primary/5 border border-primary/10 mb-4">
                    <p className="text-sm font-medium italic text-foreground/80 leading-relaxed line-clamp-2">
                      {company.description || `Especialistas em ${businessType?.name || 'beleza'}, oferecendo uma vasta gama de serviços.`}
                    </p>
                  </div>
                  {company.servicos?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Principais Serviços:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {company.servicos.slice(0, 3).map(service => (
                          <span key={service.id || service.name} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Tag size={12} className="mr-1" />{service.name}
                          </span>
                        ))}
                        {company.servicos.length > 3 && <span className="text-primary text-xs px-2 py-0.5 rounded-full">+ {company.servicos.length - 3}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to={`/empresas/${company.id}`}>Ver Serviços e Agendar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Building className="h-24 w-24 mx-auto text-muted-foreground opacity-50 mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Nenhum estabelecimento encontrado</h2>
          <p className="text-muted-foreground">Tente ajustar seus filtros ou buscar por outro termo.</p>
        </motion.div>
      )}
    </div>
  );
};

export default ClientServiceDiscoveryPage;
