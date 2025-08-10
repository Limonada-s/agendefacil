ARG CACHEBUST=1
# Use uma imagem base oficial do Node.js na versão Long-Term Support (LTS)
FROM node:lts

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de manifesto do projeto (package.json e package-lock.json)
# O asterisco (*) garante que ambos os arquivos sejam copiados
COPY package*.json ./

# Instale as dependências do projeto
# Use --only=production em um ambiente de produção para não instalar dependências de desenvolvimento
RUN npm install

# Copie todo o resto do código-fonte da sua aplicação para o diretório de trabalho
COPY . .

# O comando para iniciar a sua aplicação quando o container for executado.
# Ele irá rodar o script "start" definido no seu package.json.
CMD [ "npm", "start" ]

