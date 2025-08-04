import React, { createContext, useContext, useState, useMemo } from 'react';
// Usando a sua estrutura de importação, que é mais organizada
import { defaultPalettes } from '@/lib/themeUtils';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentPaletteId, setCurrentPaletteId] = useState(() => {
    // Sua lógica para buscar o tema salvo é perfeita
    return localStorage.getItem('selectedPaletteId') || defaultPalettes[0].id;
  });

  // A função applyTheme agora apenas atualiza o estado e o localStorage.
  // Ela não mexe mais diretamente no CSS do site inteiro.
  const applyTheme = (paletteId) => {
    localStorage.setItem('selectedPaletteId', paletteId);
    setCurrentPaletteId(paletteId);
  };
  
  // Esta lógica calcula os estilos CSS com base na paleta selecionada.
  const themeStyles = useMemo(() => {
    const selectedPalette = defaultPalettes.find(p => p.id === currentPaletteId) || defaultPalettes[0];
    const styles = {};
    // Transforma as variáveis de cor em um objeto de estilo inline.
    for (const [variable, value] of Object.entries(selectedPalette.colors)) {
      styles[variable] = value;
    }
    return styles;
  }, [currentPaletteId]);

  const value = {
    currentPaletteId,
    applyTheme,
    palettes: defaultPalettes,
  };

  // O Provider renderiza um 'div' que aplica as variáveis de CSS via 'style'.
  // Este 'div' se torna o contêiner do seu tema, aplicando-o apenas aos seus filhos.
  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-provider h-full" style={themeStyles}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
