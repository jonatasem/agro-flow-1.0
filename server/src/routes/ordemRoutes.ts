import { Router } from 'express';
import { OrdemServicoController } from '../controllers/OrdemServicoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();
const controller = new OrdemServicoController();

// 🔓 ROTAS PÚBLICAS (Sem o prefixo repetido do /api)
router.post('/autorizados', controller.loginAutorizados);
router.post('/autorizados/cadastro', controller.cadastrarAutorizado);

// 🔒 ROTAS PROTEGIDAS (Exigem o Token JWT gerado no login)
router.get('/ordens', autenticarToken, controller.getOrdens);
router.post('/ordens', autenticarToken, controller.createOrdem);
router.put('/ordens/:id', autenticarToken, controller.updateOrdem);
router.delete('/ordens/:id', autenticarToken, controller.deleteOrdem);

router.get('/frotas-mestre', autenticarToken, controller.getFrotasCadastro);
router.get('/operadores-mestre', autenticarToken, controller.getOperadoresCadastro);

export default router;
