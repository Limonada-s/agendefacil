import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define o diretório onde as imagens serão salvas
const uploadDir = 'uploads/';

// Garante que o diretório de uploads exista. Se não, ele é criado.
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @description Configuração de armazenamento do Multer.
 * Define o destino e o nome do arquivo.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Salva os arquivos na pasta 'uploads/'
  },
  filename: (req, file, cb) => {
    // Cria um nome de arquivo único para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

/**
 * @description Filtro para garantir que apenas imagens sejam aceitas.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Aceita o arquivo
  } else {
    cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false); // Rejeita o arquivo
  }
};

// Cria a instância do Multer com as configurações
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: { 
    fileSize: 1024 * 1024 * 5 // Limite de 5MB por arquivo
  } 
});

export default upload;
