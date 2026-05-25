
// Simulando os dados reais
const maquinasMock = [
  { id: '900159', nome: 'Caminhão 900159', status: 'liberado', detalhe: 'Ajuste de RPM concluído', frente: 'Frente 03' },
  { id: '800105', nome: 'Prancha 800105', status: 'manutencao', detalhe: 'Aguardando troca de fusível do rádio', frente: 'Frente 03' },
  { id: '702899', nome: 'Colhedora 702899', status: 'liberado', detalhe: 'Espaçamento de linha alterado', frente: 'Frente 01' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-agro-dark text-slate-100 font-sans p-6">
      {/* Header */}
      <header className="mb-8 border-b border-agro-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">ZILOR <span className="text-green-500">TECH</span></h1>
          <p className="text-xs text-slate-400 mt-1">Unidade: Lençóis Paulista • Agricultura de Precisão</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs">
          Painel Operacional Ativo
        </div>
      </header>

      {/* Grid Principal */}
      <main>
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Monitoramento de Ativos por Frente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {maquinasMock.map((maquina) => (
            <div key={maquina.id} className="bg-agro-card border border-agro-border rounded-xl p-5 shadow-lg hover:border-slate-500 transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{maquina.frente}</span>
                  <h3 className="text-lg font-bold text-slate-200 mt-0.5">{maquina.nome}</h3>
                </div>
                
                {/* Badge Dinâmico de Status */}
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  maquina.status === 'liberado' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {maquina.status === 'liberado' ? '✅ Liberado' : '🛠️ Em Manutenção'}
                </span>
              </div>
              
              <p className="text-sm text-slate-400 bg-agro-dark p-3 rounded-lg border border-agro-border/50">
                {maquina.detalhe}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}