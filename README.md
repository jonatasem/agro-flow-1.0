# 🚜 Zillor Tech — Painel de Controle e Monitoramento de Ativos (Agricultura de Precisão)

O **Zillor Tech** é uma plataforma de engenharia de software de alta performance desenvolvida sob medida para centralizar, monitorar e gerenciar ativos de tecnologia embarcada, telemetria e automação agrícola nas unidades produtoras da **Zillor** (*Salto Botelho*, *Quatá*, *Lençóis Paulista* e *Barra Grande*).

O sistema mitiga um gargalo crítico do ecossistema de campo: a descentralização das informações de manutenção preventiva, calibração e inventário de hardware, substituindo fluxos de comunicação informais por uma arquitetura auditável e orientada a eventos.

---
## 💡 Impacto de Negócio vs. Arquitetura Tecnológica
Na dinâmica de uma usina sucroenergética de alta escala, falhas de hardware em computadores de bordo, rádios transceptores ou sensores de plantio geram paradas de máquinas com alto custo operacional por hora. O *Zilor Tech* atua como a camada de inteligência entre o ecossistema agrícola real e o gerenciamento operacional (COA):
* **Maximização da Disponibilidade Física (DF):** Substitui planilhas e mensagens informais por um fluxo Kanban realtime de Ordens de Serviço, otimizando o MTTR (*Mean Time to Repair*).
* **Rastreabilidade de Hardware Crítico:** Mapeia e gerencia o ciclo de vida de displays (*Trimble 1060/2050*, *Topcon Value Line*), computadores de bordo *Solinftec* e sensores de fluxo/muda segmentados por frentes de trabalho.
* **UI/UX para Alta Produtividade:** Interface de baixa carga cognitiva desenvolvida em *Dark Mode Industrial*, projetada para uso ágil tanto no centro de controle operacional quanto em tablets/terminais de campo.
---

## 🛠️ Stack Tecnológico
A arquitetura do projeto adota as especificações mais robustas do desenvolvimento Full-Stack moderno para garantir o tripé: performance de renderização, segurança de tipos e escalabilidade de dados.
* **Frontend:** React (alimentado nativamente pelo **React Compiler** para otimização automatizada da árvore de componentes e eliminação de ganchos manuais como `useMemo`/`useCallback`).
* **Estilização:** Tailwind CSS (Arquitetura moderna baseada nas novas diretivas de variáveis nativas do ecossistema CSS).
* **Contratos de Dados:** TypeScript (Tipagem estática estrita cobrindo o ciclo de vida dos contratos de frotas, operadores e ordens de serviço).
* **Backend:** Node.js & Express (API REST estruturada de forma modular e aderente ao padrão de *Clean Architecture*).
* **Persistência de Dados:** MongoDB Atlas & Prisma ORM (Banco NoSQL distribuído integrado a um modelador de dados estritamente tipado).
---

## 📡 Endpoints Estruturais da API (:3333/api)

| Método | Endpoint | Payload / Objetivo |
| :--- | :--- | :--- |
| **GET** | /api/ordens | Retorna o payload completo de O.S. ativas para o Kanban. |
| **POST** | /api/ordens | Registra nova O.S. (Gera timestamps e hashes de ID autônomos). |
| **PUT** | /api/ordens/:id | Transfere setores ou avança o status técnico do reparo. |
| **DELETE** | /api/ordens/:id | Expurgamento permanente do registro no MongoDB Atlas. |
| **GET** | /api/frotas-mestre | Consulta a tabela mestre de frotas para alimentação de autocompletes. |
| **GET** | /api/operadores-mestre | Consulta a tabela mestre de registros ativos de operadores. |
  
 * **Jonatas Elieser Moreira**
*Zilor Tech — Engenharia de Software impulsionando a eficiência operacional e transformando a tecnologia de campo do Agronegócio.* 🌾
