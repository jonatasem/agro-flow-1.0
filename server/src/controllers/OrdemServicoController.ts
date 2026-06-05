import type { Request, Response } from 'express';
import { OrdemServicoService } from '../services/OrdemServicoService.js';

const ordemService = new OrdemServicoService();

export class OrdemServicoController {

  // GRAVA NOVO FUNCIONÁRIO AUTORIZADO NO BANCO DE DADOS
  async cadastrarAutorizado(req: Request, res: Response) {
    try {
      const { nome, codigo } = req.body; // Mantém o destruct do body vindo do front
      if (!nome || !codigo) {
        return res.status(400).json({ error: 'Os campos nome e codigo são obrigatórios.' });
      }
      
      // Correção aqui: Envia como 'matricula' para bater com o Schema e o Service
      const novoUsuario = await ordemService.salvarAutorizado({ 
        nome: nome.trim(), 
        matricula: String(codigo).trim() 
      });
      
      return res.status(201).json(novoUsuario);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar operador autorizado', details: error.message });
    }
  }
  
  // PROCESSA LOGIN E ENTREGA O TOKEN
  async loginAutorizados(req: Request, res: Response) {
    try {
      const { matricula } = req.body;
      if (!matricula) {
        return res.status(400).json({ error: 'Matrícula é obrigatória para o login.' });
      }
      
      // Garante que o service faça a busca usando a string tratada
      const dadosAutenticacao = await ordemService.validarMatricula(String(matricula).trim());
      return res.status(200).json(dadosAutenticacao);
    } catch (error: any) {
      return res.status(401).json({ error: 'Erro ao autenticar colaborador', details: error.message });
    }
  }

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
      if (!id) return res.status(400).json({ error: 'ID da ordem ausente nos parâmetros.' });
      
      const osAtualizada = await ordemService.atualizar(String(id), req.body);
      return res.status(200).json(osAtualizada);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao atualizar dados do chamado', details: error.message });
    }
  }

  async deleteOrdem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID da ordem ausente nos parâmetros.' });

      await ordemService.eliminar(String(id));
      return res.status(200).json({ message: `Ordem ${id} removida com sucesso do painel.` });
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