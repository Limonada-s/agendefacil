import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase } from 'lucide-react';

const SuperAdminSidebar = () => {
  const location = useLocation();
  const linkClasses = (path) => 
    `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white ${
      location.pathname.startsWith(path) ? 'bg-gray-700 text-white' : ''
    }`;

  return (
    <div className="hidden border-r bg-gray-900/80 lg:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b border-gray-700 px-6">
          <Link to="/superadmin/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <span className="">Super Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link to="/superadmin/dashboard" className={linkClasses('/superadmin/dashboard')}>
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/superadmin/companies" className={linkClasses('/superadmin/companies')}>
              <Briefcase className="h-4 w-4" />
              Empresas
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
