
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle, Palette } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import BackButton from '@/components/shared/BackButton';

const AppearanceSettingsPage = () => {
  const { currentPaletteId, applyTheme, palettes } = useTheme();
  const { toast } = useToast();

  const handleSelectPalette = (paletteId) => {
    applyTheme(paletteId);
    const selectedPalette = palettes.find(p => p.id === paletteId);
    toast({
      title: "Tema Atualizado!",
      description: `O tema "${selectedPalette?.name || 'Selecionado'}" foi aplicado.`,
      className: "bg-green-600 text-white border-green-700",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-3xl mx-auto shadow-xl bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-primary">
              <Palette className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-bold">Configurações de Aparência</CardTitle>
            <CardDescription className="text-muted-foreground text-lg mt-2">
              Personalize as cores da sua plataforma. Escolha uma paleta que combine com sua marca!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Paletas de Cores Predefinidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palettes.map((palette) => (
                <motion.div
                  key={palette.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer border-2 transition-all duration-200 ease-in-out 
                                ${currentPaletteId === palette.id ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-input hover:border-primary/70'}`}
                    onClick={() => handleSelectPalette(palette.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-md flex items-center justify-between">
                        {palette.name}
                        {currentPaletteId === palette.id && <CheckCircle className="h-5 w-5 text-primary" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex space-x-2 h-8">
                        <div className="w-1/3 rounded" style={{ backgroundColor: `hsl(${palette.colors['--primary']})` }}></div>
                        <div className="w-1/3 rounded" style={{ backgroundColor: `hsl(${palette.colors['--secondary']})` }}></div>
                        <div className="w-1/3 rounded" style={{ backgroundColor: `hsl(${palette.colors['--card']})` }}></div>
                      </div>
                       <p className="text-xs text-muted-foreground mt-2">
                        Clique para aplicar esta paleta.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-6">
              A paleta selecionada será aplicada em toda a sua interface de prestador.
              No futuro, você poderá ter ainda mais opções de personalização!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AppearanceSettingsPage;
