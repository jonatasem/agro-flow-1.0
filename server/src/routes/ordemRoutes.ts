import { Router } from 'express';
import { OrdemServicoController } from '../controllers/OrdemServicoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();
const controller = new OrdemServicoController();

// 🔓 ROTAS PÚBLICAS (Login e Registro do Ecossistema Zilor)
router.post('/autorizados', controller.loginAutorizados);
router.post('/autorizados/cadastro', controller.cadastrarAutorizado);

// 🔒 ROTAS PROTEGIDAS (Metadados Gerais e Controle de Cabeçalho)
router.get('/ordens', controller.getOrdens);
router.post('/ordens', autenticarToken, controller.createOrdem);
router.put('/ordens/:id', autenticarToken, controller.updateOrdem);
router.delete('/ordens/:id', autenticarToken, controller.deleteOrdem);

// 🔒 ROTAS PROTEGIDAS ESPECÍFICAS (Gestão Isolada de Sub-documentos via ID da Oficina)
// req.body espera conter o { setorId } para atuar cirurgicamente na array
router.put('/ordens/:id/status', autenticarToken, controller.avancarStatusSetor);
router.put('/ordens/:id/transferir', autenticarToken, controller.transferirSetor);
router.put('/ordens/:id/baixa', autenticarToken, controller.darBaixaFinalSetor);

// 📊 DADOS MESTRE (Sincronização de Cadastros do Banco Zilor Atlas)
router.get('/frotas-mestre', autenticarToken, controller.getFrotasCadastro);
router.get('/operadores-mestre', autenticarToken, controller.getOperadoresCadastro);

export default router;