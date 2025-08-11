// Arquivo: backend/middlewares/upload.js
// VERSÃO FINAL COM LÓGICA DE AMBIENTE E EXPORTAÇÃO CORRETA

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Storage } from '@google-cloud/storage';
import MGS from 'multer-google-storage';

const MulterGoogleStorage = MGS.default || MGS;

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME; 

const __dirname = path.dirname(new URL(import.meta.url).pathname.substring(1));

const storageTypes = {
  // Configuração para salvar arquivos localmente (desenvolvimento/teste)
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);
        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  }),
};

if (process.env.NODE_ENV === 'production' && GCS_BUCKET_NAME) {
  storageTypes.gcs = new MulterGoogleStorage({
    bucket: GCS_BUCKET_NAME,
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);
        const fileName = `${hash.toString('hex')}-${file.originalname}`;
        cb(null, fileName);
      });
    },
  });
}

// Cria o objeto de configuração
const uploadConfig = {
  dest: path.resolve(__dirname, '..', 'uploads'),
  storage: storageTypes.gcs || storageTypes.local,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite de 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  },
};

// --- CORREÇÃO FINAL ---
// Exporta a instância do multer já configurada, em vez do objeto de configuração.
export default multer(uploadConfig);
