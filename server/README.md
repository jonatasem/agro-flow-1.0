# 🚀 AgroFlow Server - Painel de Controle e Monitoramento de Ativos

O **AgroFlow** é uma API REST desenvolvida para centralizar, monitorar e gerenciar ordens de serviço (O.S.) voltadas a ativos agrícolas (tratores e implementos). A plataforma permite o controle cirúrgico de atendimentos por múltiplas oficinas/setores, gerenciamento de tempos de manutenção por meio de cronômetros internos e rastreabilidade total de operadores e frotas.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js (ESModules)
* **Linguagem:** TypeScript
* **Framework Web:** Express
* **ORM:** Prisma Client
* **Banco de Dados:** MongoDB (com suporte a sub-documentos embutidos)
* **Autenticação:** JSON Web Token (JWT)
* **Utilitários:** UUID v4, CORS, Dotenv

---

## 📐 Arquitetura do Projeto

O projeto segue uma estrutura baseada em camadas claras para separação de responsabilidades:

```text
├── src/
│   ├── controllers/   # Regras de transporte HTTP e validação inicial de payload
│   ├── interfaces/    # Centralização de DTOs, Tipos e Interfaces TypeScript
│   ├── middlewares/   # Interceptadores de requisição (ex: Autenticação JWT)
│   ├── routes/        # Definição e mapeamento dos end-points da API
│   ├── services/      # Camada de negócio e comunicação direta com o banco (Prisma)
│   └── server.ts      # Inicialização do servidor, CORS e variáveis de ambiente
├── prisma/
│   └── schema.prisma  # Modelagem de dados e índices para o MongoDB

```
## 🚀 Como Executar o Projeto
### Pró-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina o **Node.js** (v18+) e uma instância ou URI do **MongoDB** (pode ser o MongoDB Atlas).
### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone [https://github.com/jonatasem/agro-flow.git](https://github.com/jonatasem/agro-flow.git)
cd agro-flow
npm install

```
### 2. Configurar as Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto seguindo o modelo abaixo:
```env
PORT=3333
DATABASE_URL="mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/agroflow?retryWrites=true&w=majority"
JWT_SECRET="sua_chave_secreta_e_segura_aqui"

# Configurações de CORS
URL_PROD="[https://seu-painel-agroflow.com](https://seu-painel-agroflow.com)"
URL_DES="http://localhost:5173"

```
### 3. Sincronizar o Prisma com o MongoDB
Gere os artefatos do Prisma Client baseados no arquivo de schema:
```bash
npx prisma generate

```
### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev

```
O servidor iniciará com a seguinte mensagem no console:
> 🚀 AgroFlow - Painel de Controle e Monitoramento de Ativos rodando com sucesso na porta 3333
> 
## 🔒 Endpoints da API
### 🔓 Rotas Públicas
 * POST /api/autorizados/cadastro - Registra um novo colaborador autorizado no ecossistema.
 * POST /api/autorizados - Realiza a validação da matrícula e retorna o Token JWT (válido por 8h).
### 🔒 Rotas Protegidas (Requer Header Authorization: Bearer <token>)
#### Gestão de Cabeçalhos e O.S. Geral
 * GET /api/ordens - Lista todas as ordens de serviço por ordem decrescente de identificação.
 * POST /api/ordens - Cria uma nova O.S. (ou injeta um novo setor em aberto caso o ativo já possua O.S. ativa).
 * PUT /api/ordens/:idCustomizado - Atualiza metadados gerais do cabeçalho da O.S.
 * DELETE /api/ordens/:idCustomizado - Elimina uma ordem de serviço do sistema.
#### Gestão Isolada de Oficinas (Sub-documentos)
 * PUT /api/ordens/:idCustomizado/status - Avança o status de um setor (ex: inicia cronômetro ao mudar para em_manutencao).
 * PUT /api/ordens/:idCustomizado/transferir - Realiza a transferência pura de uma oficina para outra zerando o cronômetro.
 * PUT /api/ordens/:idCustomizado/baixa - Conclui o atendimento do setor, registrando causas, soluções e calculando o tempo total decorrido.
#### Sincronização de Dados Mestre
 * GET /api/frotas-mestre - Lista todos os equipamentos/frotas cadastrados.
 * GET /api/operadores-mestre - Lista todos os operadores ativos.
## 📈 Regras de Negócio Implementadas
 1. **Evitar Conflito de Atendimento:** O sistema impede a abertura de uma nova O.S. se o mesmo trator já possuir um atendimento ativo no mesmo setor específico.
 2. **Identificação Customizada:** Gerador automático sequencial de identificadores legíveis no padrão OS-ANO-SUFIXO (Ex: OS-2026-001).
 3. **Cálculo Automático de Tempo:** O tempo de manutenção (tempoManutencao) é calculado em formato HH:MM:SS no exato momento em que o técnico dá a baixa final no setor.
## 📝 Scripts Disponíveis
 * npm run dev: Executa a aplicação localmente utilizando recarregamento automático.
 * npm run build: Compila o TypeScript para JavaScript puro dentro da pasta dist/.
 * npm start: Executa o código compilado em produção.
```

```
