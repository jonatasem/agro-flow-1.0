import type { Request, Response } from 'express';
import { OrdemServicoService } from '../services/OrdemServicoService.js';

const ordemService = new OrdemServicoService();

export class OrdemServicoController {

  // GRAVA NOVO FUNCIONÁRIO AUTORIZADO
  async cadastrarAutorizado(req: Request, res: Response) {
    try {
      const { nome, codigo } = req.body;
      if (!nome || !codigo) {
        return res.status(400).json({ error: 'Os campos nome e codigo são obrigatórios.' });
      }
      const novoUsuario = await ordemService.salvarAutorizado({ 
        nome: nome.trim(), 
        matricula: String(codigo).trim() 
      });
      return res.status(201).json(novoUsuario);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar operador', details: error.message });
    }
  }
  
  // LOGIN
  async loginAutorizados(req: Request, res: Response) {
    try {
      const { matricula } = req.body;
      if (!matricula) return res.status(400).json({ error: 'Matrícula é obrigatória.' });
      const dadosAutenticacao = await ordemService.validarMatricula(String(matricula).trim());
      return res.status(200).json(dadosAutenticacao);
    } catch (error: any) {
      return res.status(401).json({ error: 'Erro ao autenticar', details: error.message });
    }
  }

  // LISTA ORDENS
  async getOrdens(req: Request, res: Response) {
    try {
      const ordens = await ordemService.listarTodas();
      return res.status(200).json(ordens);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao listar', details: error.message });
    }
  }

  // CRIA NOVA ORDEM (Lógica de unificação gerenciada diretamente no Service)
  async createOrdem(req: Request, res: Response) {
    try {
      const { prefixoTrator, idOperador, usinaBase, frente, atividade, setorOs } = req.body;
      
      // 1. Validação básica de payload estrutural obrigatório
      if (!prefixoTrator || !idOperador || !setorOs || setorOs.length === 0) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes.', 
          details: 'prefixoTrator, idOperador e o array setorOs são obrigatórios.' 
        });
      }
      
      // 2. O service decide autonomamente se gera um registro novo ou adiciona no array ativo
      const resultadoOS = await ordemService.criar(req.body);
      return res.status(201).json(resultadoOS);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao processar Ordem de Serviço.', details: error.message });
    }
  }

  // ATUALIZA CABEÇALHO
  async updateOrdem(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const osAtualizada = await ordemService.atualizar(String(id), req.body);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao atualizar O.S.', details: error.message });
    }
  }

  // AVANÇA STATUS SETOR
  async avancarStatusSetor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { setor, status, solucaoTecnico, tipoCausa } = req.body;

      if (!id || !setor || !status) {
        return res.status(400).json({ error: 'Parâmetros de setor/status obrigatórios.' });
      }

      const osAtualizada = await ordemService.atualizarStatusOficina(String(id), setor, status, solucaoTecnico, tipoCausa);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao avançar status', details: error.message });
    }
  }

  // TRANSFERE SETOR
  async transferirSetor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { setorOrigem, setorDestino } = req.body;
      const osAtualizada = await ordemService.injetarNovaOficina(String(id), setorOrigem, setorDestino);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro na transferência', details: error.message });
    }
  }

  // BAIXA FINAL
  async darBaixaFinalSetor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { setor, tipoCausa, solucaoTecnico, tecnicoResponsavel } = req.body;
      const osAtualizada = await ordemService.finalizarOficina(String(id), setor, tipoCausa, solucaoTecnico, tecnicoResponsavel);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao dar baixa', details: error.message });
    }
  }

  // DELETA
  async deleteOrdem(req: Request, res: Response) {
    try {
      await ordemService.eliminar(String(req.params.id));
      return res.status(200).json({ message: "Removido com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao deletar', details: error.message });
    }
  }

  // MESTRE FROTAS E OPERADORES
  async getFrotasCadastro(req: Request, res: Response) {
    try { return res.status(200).json(await ordemService.listarFrotasMestre()); } 
    catch (error: any) { return res.status(500).json({ error: error.message }); }
  }

  async getOperadoresCadastro(req: Request, res: Response) {
    try { return res.status(200).json(await ordemService.listarOperadoresMestre()); } 
    catch (error: any) { return res.status(500).json({ error: error.message }); }
  }
}
