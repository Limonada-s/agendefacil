import nodemailer from 'nodemailer';
import logger from '../logger.js';

const sendEmail = async (options) => {
  // 1. Configurar o "transportador" - o serviço que vai enviar o email
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para a porta 465
    auth: {
      user: process.env.EMAIL_USER, // Seu email do arquivo .env
      pass: process.env.EMAIL_PASS, // Sua senha de app do arquivo .env
    },
  });

  // 2. Definir as opções do email (quem envia, para quem, assunto, etc.)
  const mailOptions = {
    from: `Seu SaaS <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html, // O corpo do email em HTML
  };

  // 3. Enviar o email
  try {
    await transporter.sendMail(mailOptions);
    logger.info('email_enviado_com_sucesso', { to: options.email, subject: options.subject });
  } catch (error) {
    logger.error('erro_ao_enviar_email', { error: error.message });
    // Lança o erro para que a função que chamou saiba que falhou
    throw new Error('Não foi possível enviar o email de redefinição.');
  }
};

export default sendEmail;