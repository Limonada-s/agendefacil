// src/hooks/useEmpresasProximas.js
import { useState, useEffect } from 'react';
import { buscarEmpresasProximas } from '@/services/serviceApi'; // corrige o caminho

export const useEmpresasProximas = (raio = 10) => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const data = await buscarEmpresasProximas(lat, lng, raio);
          setEmpresas(data);
        } catch (err) {
          console.error("Erro ao carregar empresas próximas:", err);
          setErro("Não foi possível buscar empresas próximas.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.error("Erro de geolocalização:", geoError);
        setErro("Não conseguimos acessar sua localização.");
        setLoading(false);
      }
    );
  }, [raio]);

  return { empresas, loading, erro };
};
