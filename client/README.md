# 🚜 AgroFlow OS — Client

O **AgroFlow OS** é um painel de controle e monitoramento operacional realtime para gerenciamento de Ordens de Serviço (O.S.) de ativos e frotas agrícolas. Desenvolvido para lidar de forma dinâmica com o fluxo de manutenção concorrente entre diferentes oficinas das usinas base.

---

## 🛠️ Stack Técnica

* **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Gráficos & Métricas:** [Recharts](https://recharts.org/)
* **Comunicação API:** [Axios](https://axios-http.com/)

---

## 📐 Arquitetura de Dados & Fluxo do Kanban

O sistema foi arquitetado em cima de um modelo NoSQL flexível para evitar a fragmentação de tabelas relacionais. 

* **Documento Pai (`OrdemServicoAgro`):** Retém os metadados fixos do ativo (Prefixo do Trator, Operador de Frota, Frente de Trabalho, Usina Alocada).
* **Subdocumentos (`setorOs[]`):** Um array concorrente de oficinas (Triagem, Elétrica, Mecânica, Borracharia). Cada oficina possui seu próprio identificador único (`id`/`_id`), permitindo o isolamento total dos status (`aguardando_manutencao`, `em_manutencao`, `concluido`) e histórico técnico em paralelo.

---

## 🪝 Camada de Abstração: Custom Hooks

Para manter os componentes de UI puros, legíveis e com responsabilidade única, toda a lógica de estado, efeitos colaterais (`useEffect`) e computações pesadas foi centralizada em Hooks Customizados padronizados:

* `useAuth`: Gerencia a persistência de sessões operacionais de 8 horas e injeção estratégica de tokens JWT no LocalStorage.
* `useOrdensAgro`: Abstrai o ciclo de vida de comunicação com a API Atlas (cargas iniciais, mutações de salvamento e deleções atômicas).
* `useFiltrosKanban`: Centraliza os estados de busca em tempo real e filtros avançados por frota, usina ativa e operadores.
* `useDadosMestre`: Consome simultaneamente tabelas globais de validação de equipamentos e motoristas via `Promise.all`.
* `useBuscaProxima`: Motor de busca otimizado com ordenação léxica e priorização de strings que começam com o termo digitado.
* `useSubmit`: Trava nativa para submissões de formulários, prevenindo disparos duplicados (*double click*) sob oscilações de sinal no campo.

---

## 📦 Estrutura de Pastas Clave

```text
src/
├── components/          # Componentes reutilizáveis (Formulários, Kanban, Modais)
├── context/             # Provedores globais de estado (Autenticação)
├── hook/                # Camada de lógica isolada (Custom Hooks)
├── interface/           # Contratos e Tipagens Estratificadas do TypeScript
├── pages/               # Páginas de fluxo principal (Login, Telas de Visão)
├── services/            # Configurações de clientes HTTP (Axios)
└── utils/               # Funções utilitárias (Manipulação segura de datas UTC)

