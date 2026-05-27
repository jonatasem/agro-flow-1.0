import type { Request, Response } from 'express';
import { OrdemServicoService } from '../services/OrdemServicoService.js';

const ordemService = new OrdemServicoService();

export class OrdemServicoController {
  
  async getOrdens(req: Request, res: Response) {
    try {
      const ordens = await ordemService.listarTodas();
      return res.status(200).json(ordens);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao listar ordens de serviço agrícolas', details: error.message });
    }
  }

  async createOrdem(req: Request, res: Response) {
    try {
      const { prefixoTrator, idOperador, criadoPor, triagemSetor } = req.body;

      // Validação: Impede payloads vazios vindos do frontend
      if (!prefixoTrator || !idOperador || !criadoPor || !triagemSetor) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes na requisição.', 
          details: 'prefixoTrator, idOperador, criadoPor e triagemSetor devem ser enviados.' 
        });
      }

      const novaOS = await ordemService.criar(req.body);
      return res.status(201).json(novaOS);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao registar nova O.S. no Prisma', details: error.message });
    }
  }

  async updateOrdem(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      
      if (!id) {
        return res.status(400).json({ error: 'ID da ordem ausente nos parâmetros.' });
      }

      const idString = String(id); // Garante tipo 'string' puro para o TypeScript

      const osAtualizada = await ordemService.atualizar(idString, req.body);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao atualizar dados do chamado', details: error.message });
    }
  }

  async deleteOrdem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID da ordem ausente nos parâmetros.' });
      }

      const idString = String(id); // Garante tipo 'string' puro para o TypeScript

      await ordemService.eliminar(idString);
      return res.status(200).json({ message: `Ordem ${idString} removida com sucesso do painel.` });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao eliminar ordem de serviço', details: error.message });
    }
  }

  async getFrotasCadastro(req: Request, res: Response) {
    try {
      const frotas = await ordemService.listarFrotasMestre();
      return res.status(200).json(frotas);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao carregar frotas mestre', details: error.message });
    }
  }

  async getOperadoresCadastro(req: Request, res: Response) {
    try {
      const operadores = await ordemService.listarOperadoresMestre();
      return res.status(200).json(operadores);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao carregar operadores cadastrados', details: error.message });
    }
  }
}
