// Em: backend/utils/validators.js

const clean = (num) => (num || '').toString().replace(/\D/g, '');

const allDigitsAreEqual = (num) => {
  const firstDigit = num[0];
  return num.split('').every(digit => digit === firstDigit);
};

export const isValidCPF = (cpf) => {
  console.log(`[VALIDATOR_CPF] Recebido para validação: "${cpf}"`); // LOG
  const cleanedCpf = clean(cpf);
  console.log(`[VALIDATOR_CPF] Valor limpo: "${cleanedCpf}"`); // LOG

  if (cleanedCpf.length !== 11 || allDigitsAreEqual(cleanedCpf)) {
    console.log(`[VALIDATOR_CPF] Reprovado na verificação inicial.`); // LOG
    return false;
  }

  const calculateDigit = (slice) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (slice.length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstNine = cleanedCpf.slice(0, 9);
  const firstDigit = calculateDigit(firstNine);
  const firstTen = firstNine + firstDigit;
  const secondDigit = calculateDigit(firstTen);

  const isValid = cleanedCpf.slice(9) === `${firstDigit}${secondDigit}`;
  console.log(`[VALIDATOR_CPF] Resultado da validação: ${isValid}`); // LOG
  return isValid;
};

export const isValidCNPJ = (cnpj) => {
  console.log(`[VALIDATOR_CNPJ] Recebido para validação: "${cnpj}"`); // LOG
  const cleanedCnpj = clean(cnpj);
  console.log(`[VALIDATOR_CNPJ] Valor limpo: "${cleanedCnpj}"`); // LOG

  if (cleanedCnpj.length !== 14 || allDigitsAreEqual(cleanedCnpj)) {
    console.log(`[VALIDATOR_CNPJ] Reprovado na verificação inicial.`); // LOG
    return false;
  }

  const calculateDigit = (slice, weights) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstTwelve = cleanedCnpj.slice(0, 12);
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstDigit = calculateDigit(firstTwelve, firstWeights);
  const firstThirteen = firstTwelve + firstDigit;
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondDigit = calculateDigit(firstThirteen, secondWeights);

  const isValid = cleanedCnpj.slice(12) === `${firstDigit}${secondDigit}`;
  console.log(`[VALIDATOR_CNPJ] Resultado da validação: ${isValid}`); // LOG
  return isValid;
};
