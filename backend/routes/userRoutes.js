import express from 'express';
import userController from '../controllers/userController.js';
import { registerCompany } from '../controllers/register-company.js';

const router = express.Router();

// ROTA PARA REGISTRO DE CLIENTE
router.post("/register", userController.register);
 
router.post("/login", userController.login);

router.get("/session", userController.checkSession);

router.post("/logout", userController.logout);

router.post("/register-company", registerCompany);

router.post("/super-login", userController.loginSuperAdmin);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset-password", userController.resetPassword);

export default router;
