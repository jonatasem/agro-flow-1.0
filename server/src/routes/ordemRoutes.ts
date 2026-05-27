import { Router } from 'express';
import { OrdemServicoController } from '../controllers/OrdemServicoController.js';

const router = Router();
const controller = new OrdemServicoController();

router.get('/ordens', controller.getOrdens);
router.post('/ordens', controller.createOrdem);
router.put('/ordens/:id', controller.updateOrdem);
router.delete('/ordens/:id', controller.deleteOrdem);

router.get('/frotas-mestre', controller.getFrotasCadastro);
router.get('/operadores-mestre', controller.getOperadoresCadastro);

export default router;