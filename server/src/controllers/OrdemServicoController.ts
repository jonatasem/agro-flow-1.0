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

  // CRIA NOVA ORDEM
  async createOrdem(req: Request, res: Response) {
    try {
      const { prefixoTrator, idOperador, setorOs } = req.body;
      
      if (!prefixoTrator || !idOperador || !setorOs || setorOs.length === 0) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes.', 
          details: 'prefixoTrator, idOperador e o array setorOs são obrigatórios.' 
        });
      }
      
      const resultadoOS = await ordemService.criar(req.body);
      return res.status(201).json(resultadoOS);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao processar Ordem de Serviço.', details: error.message });
    }
  }

  // ATUALIZA CABEÇALHO CORRIGIDO
  async updateOrdem(req: Request, res: Response) {
    try {
      const idCustomizado = req.params.idCustomizado || req.params.id; 
      const osAtualizada = await ordemService.atualizar(String(idCustomizado), req.body);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao atualizar O.S.', details: error.message });
    }
  }

  // AVANÇA STATUS SETOR (Atualizado para utilizar o ID único da oficina)
  async avancarStatusSetor(req: Request, res: Response) {
    try {
      const idCustomizado = req.params.idCustomizado || req.params.id;
      const { setorId, status, solucaoTecnico, tipoCausa } = req.body;

      if (!idCustomizado || !setorId || !status) {
        return res.status(400).json({ error: 'Campos idCustomizado, setorId e status são obrigatórios.' });
      }

      const osAtualizada = await ordemService.atualizarStatusOficina(
        String(idCustomizado), 
        String(setorId), 
        status, 
        solucaoTecnico, 
        tipoCausa
      );
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao avançar status', details: error.message });
    }
  }

  // TRANSFERE SETOR (Corrigido para sanar o bug de duplicação usando o ID único)
  async transferirSetor(req: Request, res: Response) {
    try {
      const idCustomizado = req.params.idCustomizado || req.params.id;
      const { setorId, setorDestino } = req.body;

      if (!idCustomizado || !setorId || !setorDestino) {
        return res.status(400).json({ error: 'Campos idCustomizado, setorId e setorDestino são obrigatórios.' });
      }

      // O service vai usar o setorId para encontrar a oficina de origem exata, mudar o status dela para "concluido" (ou histórico) e abrir o novo setor de destino.
      const osAtualizada = await ordemService.injetarNovaOficina(
        String(idCustomizado), 
        String(setorId), 
        setorDestino
      );
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro na transferência', details: error.message });
    }
  }

  // BAIXA FINAL (Atualizado para utilizar o ID único da oficina)
  async darBaixaFinalSetor(req: Request, res: Response) {
    try {
      const idCustomizado = req.params.idCustomizado || req.params.id;
      const { setorId, tipoCausa, solucaoTecnico, tecnicoResponsavel } = req.body;

      if (!idCustomizado || !setorId) {
        return res.status(400).json({ error: 'Campos idCustomizado e setorId são obrigatórios.' });
      }

      const osAtualizada = await ordemService.finalizarOficina(
        String(idCustomizado), 
        String(setorId), 
        tipoCausa, 
        solucaoTecnico, 
        tecnicoResponsavel
      );
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao dar baixa', details: error.message });
    }
  }

  // DELETA
  async deleteOrdem(req: Request, res: Response) {
    try {
      const idCustomizado = req.params.idCustomizado || req.params.id;
      await ordemService.eliminar(String(idCustomizado));
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
