// Em: src/components/layout/Layout.jsx

import React from "react";
import { useLocation } from 'react-router-dom'; // 1. Importamos o 'useLocation' para saber a URL atual
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionWall from "./SubscriptionWall";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation(); // 2. Pegamos a localização atual da página

  // 3. Verificamos se a assinatura está expirada
  const isSubscriptionExpired = user?.tipo === 'admin' && user?.subscriptionStatus === 'past_due';
  
  const isRenewalPage = location.pathname === '/planos' || 
  location.pathname.startsWith('/pagamento');

  const showWall = isSubscriptionExpired && !isRenewalPage;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 relative">
        {children}
        
        {/* Usamos a nova variável 'showWall' para decidir se renderizamos o componente */}
        {showWall && <SubscriptionWall />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
