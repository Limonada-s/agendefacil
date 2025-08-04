
export const defaultPalettes = [
  {
    id: 'default_elegant_blue',
    name: 'Azul Elegante (Padrão)',
    colors: {
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--card': '222.2 47.4% 11.2%',
      '--card-foreground': '210 40% 98%',
      '--popover': '222.2 84% 4.9%',
      '--popover-foreground': '210 40% 98%',
      '--primary': '217.2 91.2% 59.8%', 
      '--primary-foreground': '210 40% 98%',
      '--secondary': '217.2 32.6% 17.5%',
      '--secondary-foreground': '210 40% 98%',
      '--muted': '217.2 32.6% 17.5%',
      '--muted-foreground': '215 20.2% 65.1%',
      '--accent': '217.2 91.2% 59.8%',
      '--accent-foreground': '210 40% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 85.7% 97.3%',
      '--border': '217.2 32.6% 17.5%',
      '--input': '217.2 32.6% 17.5%',
      '--ring': '217.2 91.2% 59.8%',
    }
  },
  {
    id: 'serene_green',
    name: 'Verde Sereno',
    colors: {
      '--background': '220 13% 10%', 
      '--foreground': '210 20% 95%',
      '--card': '220 13% 18%',
      '--card-foreground': '210 20% 95%',
      '--popover': '220 13% 10%',
      '--popover-foreground': '210 20% 95%',
      '--primary': '142.1 76.2% 36.3%', 
      '--primary-foreground': '142.1 76.2% 96.3%',
      '--secondary': '215 20% 25%',
      '--secondary-foreground': '210 20% 95%',
      '--muted': '215 20% 25%',
      '--muted-foreground': '215 15% 65%',
      '--accent': '142.1 76.2% 36.3%',
      '--accent-foreground': '142.1 76.2% 96.3%',
      '--destructive': '0 70% 45%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '215 20% 25%',
      '--input': '215 20% 25%',
      '--ring': '142.1 76.2% 36.3%',
    }
  },
  {
    id: 'delicate_rose',
    name: 'Rosa Delicado',
    colors: {
      '--background': '240 10% 12%',
      '--foreground': '340 20% 96%',
      '--card': '240 10% 20%',
      '--card-foreground': '340 20% 96%',
      '--popover': '240 10% 12%',
      '--popover-foreground': '340 20% 96%',
      '--primary': '336.8 81.8% 56.9%', 
      '--primary-foreground': '336.8 81.8% 96.9%',
      '--secondary': '240 8% 28%',
      '--secondary-foreground': '340 20% 96%',
      '--muted': '240 8% 28%',
      '--muted-foreground': '240 5% 68%',
      '--accent': '336.8 81.8% 56.9%',
      '--accent-foreground': '336.8 81.8% 96.9%',
      '--destructive': '0 75% 50%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '240 8% 28%',
      '--input': '240 8% 28%',
      '--ring': '336.8 81.8% 56.9%',
    }
  },
  {
    id: 'warm_sunset',
    name: 'Pôr do Sol Aconchegante',
    colors: {
      '--background': '30 20% 8%',
      '--foreground': '30 10% 90%',
      '--card': '30 20% 15%',
      '--card-foreground': '30 10% 90%',
      '--popover': '30 20% 8%',
      '--popover-foreground': '30 10% 90%',
      '--primary': '28.1 94.5% 57.5%', 
      '--primary-foreground': '28.1 94.5% 97.5%',
      '--secondary': '30 15% 22%',
      '--secondary-foreground': '30 10% 90%',
      '--muted': '30 15% 22%',
      '--muted-foreground': '30 8% 60%',
      '--accent': '28.1 94.5% 57.5%',
      '--accent-foreground': '28.1 94.5% 97.5%',
      '--destructive': '0 80% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '30 15% 22%',
      '--input': '30 15% 22%',
      '--ring': '28.1 94.5% 57.5%',
    }
  },
  {
    id: 'lavender_dream',
    name: 'Sonho Lavanda',
    colors: {
      '--background': '260 30% 10%',
      '--foreground': '260 15% 92%',
      '--card': '260 30% 18%',
      '--card-foreground': '260 15% 92%',
      '--popover': '260 30% 10%',
      '--popover-foreground': '260 15% 92%',
      '--primary': '250.6 89.1% 60.2%', 
      '--primary-foreground': '250.6 89.1% 98.2%',
      '--secondary': '260 25% 25%',
      '--secondary-foreground': '260 15% 92%',
      '--muted': '260 25% 25%',
      '--muted-foreground': '260 10% 62%',
      '--accent': '250.6 89.1% 60.2%',
      '--accent-foreground': '250.6 89.1% 98.2%',
      '--destructive': '0 70% 50%',
      '--destructive-foreground': '0 0% 100%',
      '--border': '260 25% 25%',
      '--input': '260 25% 25%',
      '--ring': '250.6 89.1% 60.2%',
    }
  }
];

export const applyTheme = (paletteId) => {
  const selectedPalette = defaultPalettes.find(p => p.id === paletteId) || defaultPalettes[0];
  const root = document.documentElement;
  Object.entries(selectedPalette.colors).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
  localStorage.setItem('selectedPaletteId', paletteId);
};

export const getSavedTheme = () => {
  return localStorage.getItem('selectedPaletteId') || defaultPalettes[0].id;
};

export const getCompanyPrimaryColor = (companyId) => {
  const companyThemes = {
    'comp1': '217.2 91.2% 59.8%', 
    'comp2': '142.1 76.2% 36.3%', 
    'comp3': '336.8 81.8% 56.9%', 
  };
  return companyThemes[companyId] || defaultPalettes[0].colors['--primary'];
};

export const applyCompanySpecificTheme = (companyId) => {
  const primaryColor = getCompanyPrimaryColor(companyId);
  const root = document.documentElement;
  root.style.setProperty('--primary', primaryColor);
};

export const resetToGlobalTheme = () => {
  applyTheme(getSavedTheme()); 
};
