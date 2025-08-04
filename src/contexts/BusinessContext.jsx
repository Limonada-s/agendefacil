import React, { createContext, useContext } from 'react';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  
  const value = {
    // Futuramente, pode conter informações da empresa do admin logado,
    // como suas categorias selecionadas, configurações específicas, etc.
    // Por exemplo:
    // currentCompanyDetails: null, 
    // setCurrentCompanyDetails: () => {},
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);