// Em: src/components/layout/Header.jsx

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Calendar, Users, Scissors, User, Home, LogOut, DollarSign, Briefcase, Layers, Palette, UserCog, ShieldCheck, Star, Diamond, Settings as SettingsIcon, Image as AppearanceIcon, History, Clock } from 'lucide-react'; 
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyById } from "@/lib/data"; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userType, currentUser } = useAuth();
  const [companyName, setCompanyName] = React.useState("Beleza Agendada");

  React.useEffect(() => {
    if (userType === 'admin' && currentUser?.companyId) {
      const company = getCompanyById(currentUser.companyId);
      if (company?.name) {
        setCompanyName(company.name);
      } else {
        setCompanyName("Meu Estabelecimento");
      }
    } else if (userType === 'superadmin') {
      setCompanyName("Painel Super Admin");
    } else {
      setCompanyName("Beleza Agendada");
    }
  }, [userType, currentUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout(navigate);
    closeMenu();
  };
  
  let navItems = [];
  let settingsSubMenu = [];

  if (userType === 'admin') {
    navItems = [
      { path: "/", label: "Painel", icon: <Home className="h-5 w-5 mr-2" /> },
      { path: "/agendamentos", label: "Agendamentos", icon: <Calendar className="h-5 w-5 mr-2" /> },
      { path: "/clientes", label: "Clientes", icon: <Users className="h-5 w-5 mr-2" /> },
      { path: "/servicos", label: "Serviços", icon: <Layers className="h-5 w-5 mr-2" /> },
      { path: "/profissionais", label: "Profissionais", icon: <UserCog className="h-5 w-5 mr-2" /> },
      { path: "/financeiro", label: "Financeiro", icon: <DollarSign className="h-5 w-5 mr-2" /> },
      { path: "/historico-atendimentos", label: "Histórico", icon: <History className="h-5 w-5 mr-2" /> },
      { path: "/gerenciar-avaliacoes", label: "Avaliações", icon: <Star className="h-5 w-5 mr-2" /> },
    ];
    settingsSubMenu = [
      { path: "/configuracoes/empresa", label: "Empresa", icon: <SettingsIcon className="h-4 w-4 mr-2" /> },
      { path: "/configuracoes/aparencia", label: "Aparência", icon: <AppearanceIcon className="h-4 w-4 mr-2" /> },
    ];
  } else if (userType === 'professional') {
    navItems = [
      { path: "/minha-agenda", label: "Minha Agenda", icon: <Calendar className="h-5 w-5 mr-2" /> },
      { path: "/meu-perfil-profissional", label: "Meu Perfil", icon: <User className="h-5 w-5 mr-2" /> },
      { path: "/meus-ganhos", label: "Meus Ganhos", icon: <DollarSign className="h-5 w-5 mr-2" /> },
      { path: "/meus-horarios", label: "Meus Horários", icon: <Clock className="h-5 w-5 mr-2" /> },
    ];
  } else if (userType === 'superadmin') {
    navItems = [
        { path: "/superadmin/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5 mr-2" /> },
        { path: "/superadmin/companies", label: "Empresas", icon: <Briefcase className="h-5 w-5 mr-2" /> },
    ];
  } else if (userType === 'cliente') {
    navItems = [
      { path: "/descobrir-servicos", label: "Descobrir", icon: <Scissors className="h-5 w-5 mr-2" /> },
      { path: "/meus-agendamentos", label: "Meus Agendamentos", icon: <Calendar className="h-5 w-5 mr-2" /> },
    ];
  }

  const isActive = (path) => {
    return location.pathname === path || (path === "/configuracoes" && location.pathname.startsWith("/configuracoes"));
  };

  if (!isAuthenticated || ['/login', '/planos', '/registrar-empresa', '/super-login'].includes(location.pathname)) {
    return null;
  }
  
  const getLogoIcon = () => {
    return <Scissors className="h-6 w-6 text-primary" />;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={
              userType === 'admin' ? "/" : 
              userType === 'professional' ? "/minha-agenda" : 
              userType === 'superadmin' ? "/superadmin/dashboard" : 
              "/descobrir-servicos"
            } 
            className="flex items-center space-x-2" onClick={closeMenu}>
            {getLogoIcon()}
            <span className="font-bold text-xl">{companyName}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => (
            <Button asChild variant="ghost" key={item.path} className={`text-sm font-medium transition-colors ${isActive(item.path) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50"} px-3 py-2`}>
              <Link to={item.path}>
                {item.label}
              </Link>
            </Button>
          ))}
          {userType === 'admin' && settingsSubMenu.length > 0 && (
            <div className="relative group">
              <Button variant="ghost" className={`text-sm font-medium transition-colors ${isActive("/configuracoes") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50"} px-3 py-2 flex items-center`}>
                <SettingsIcon className="h-5 w-5 mr-1" /> Configurações
              </Button>
              <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                {settingsSubMenu.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm hover:bg-muted/50 ${isActive(item.path) ? "text-primary" : "text-popover-foreground"}`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg md:hidden z-50"
            >
              <nav className="flex flex-col p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center text-base font-medium transition-colors hover:text-primary p-3 rounded-md ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={closeMenu}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                {userType === 'admin' && settingsSubMenu.length > 0 && (
                  <div className="pt-2">
                    <p className="px-3 py-1 text-sm font-semibold text-muted-foreground">Configurações</p>
                    {settingsSubMenu.map(item => (
                       <Link
                         key={item.path}
                         to={item.path}
                         className={`flex items-center text-base font-medium transition-colors hover:text-primary p-3 rounded-md ${
                           isActive(item.path)
                             ? "bg-primary/10 text-primary"
                             : "text-muted-foreground"
                         }`}
                         onClick={closeMenu}
                       >
                         {item.icon}
                         {item.label}
                       </Link>
                    ))}
                  </div>
                )}
                <div className="pt-3 border-t mt-2">
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start p-3 text-base">
                    <LogOut className="h-5 w-5 mr-2" />
                    Sair
                    </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
