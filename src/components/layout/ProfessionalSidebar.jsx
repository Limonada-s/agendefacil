import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

const ProfessionalSidebar = () => {
  const location = useLocation();
  const linkClasses = (path) => 
    `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white ${
      location.pathname.startsWith(path) ? 'bg-gray-700 text-white' : ''
    }`;

  return (
    <div className="hidden border-r bg-gray-800/40 lg:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b border-gray-700 px-6">
          <Link to="/minha-agenda" className="flex items-center gap-2 font-semibold text-white">
            <span className="">Painel Profissional</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link to="/minha-agenda" className={linkClasses('/minha-agenda')}>
              <Calendar className="h-4 w-4" />
              Minha Agenda
            </Link>
            <Link to="/meu-perfil-profissional" className={linkClasses('/meu-perfil-profissional')}>
              <User className="h-4 w-4" />
              Meu Perfil
            </Link>
            <Link to="/meus-ganhos" className={linkClasses('/meus-ganhos')}>
              <DollarSign className="h-4 w-4" />
              Meus Ganhos
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSidebar;
