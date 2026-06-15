import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ordemRoutes from './routes/ordemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: process.env.URL_FRONT_END,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api', ordemRoutes);

app.listen(PORT, () => {
  console.log(`🚀 AgroFlow -  Painel de Controle e Monitoramento de Ativos rodando com sucesso na porta ${PORT}`);
});
