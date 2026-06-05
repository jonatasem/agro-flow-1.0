import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest } from '../interfaces/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zilor_chave_secreta_2026_agro';

export function autenticarToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Voucher de autenticação ausente.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, usuarioDecodificado: any) => {
    if (err) {
      return res.status(403).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
    }

    req.usuarioLogado = usuarioDecodificado;
    next();
  });
}