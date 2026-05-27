import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ordemRoutes from './routes/ordemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));

// Permite que o Express compreenda payloads enviados em formato JSON
app.use(express.json());

app.use('/api', ordemRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Zilor Core Operacional Backend rodando com sucesso na porta ${PORT}`);
});
