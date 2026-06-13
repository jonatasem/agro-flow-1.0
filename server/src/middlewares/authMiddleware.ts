import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest } from '../interfaces/index.js';

const JWT_SECRET_ENV = process.env.JWT_SECRET || "";

// 🔒 Bloqueio de Inicialização Segura: Se não existir, derruba o processo
if (!JWT_SECRET_ENV) {
  console.error("❌ ERRO CRÍTICO: A variável de ambiente JWT_SECRET não foi definida no arquivo .env!");
  process.exit(1);
}

// 🛡️ Type Assertion: Agora o TS sabe com 100% de certeza que aqui ela é uma string pura!
const JWT_SECRET = JWT_SECRET_ENV as string;

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
