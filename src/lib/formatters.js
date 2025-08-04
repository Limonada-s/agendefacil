// Em: src/lib/formatters.js

/**
 * Aplica a máscara de CPF (###.###.###-##) a uma string de números.
 * @param {string} value - O valor a ser formatado.
 * @returns {string} - O valor com a máscara aplicada.
 */
export const formatCPF = (value) => {
  if (!value) return "";
  
  // Remove tudo que não for dígito
  const cleanedValue = value.replace(/\D/g, '');
  
  // Limita o tamanho a 11 dígitos
  const truncatedValue = cleanedValue.slice(0, 11);

  // Aplica a máscara
  return truncatedValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatCNPJ = (value) => {
  if (!value) return "";

  // Remove tudo que não for dígito
  const cleanedValue = value.replace(/\D/g, '');

  // Limita o tamanho a 14 dígitos
  const truncatedValue = cleanedValue.slice(0, 14);

  // Aplica a máscara
  return truncatedValue
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};
