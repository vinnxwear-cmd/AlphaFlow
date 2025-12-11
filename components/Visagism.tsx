
import React, { useState, useEffect } from 'react';
import { Client, Product, VisagismProfile } from '../types';
import { ScanFace, User as UserIcon, Save, Package, Check, Sparkles } from 'lucide-react';

interface VisagismProps {
  clients: Client[];
  products: Product[];
  onUpdateClient: (client: Client) => void;
}

const Visagism: React.FC<VisagismProps> = ({ clients, products, onUpdateClient }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [profile, setProfile] = useState<VisagismProfile>({
    faceShape: '',
    hairType: '',
    beardStyle: '',
    notes: ''
  });
  
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Load existing profile when client is selected
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client?.visagismProfile) {
        setProfile(client.visagismProfile);
      } else {
        setProfile({ faceShape: '', hairType: '', beardStyle: '', notes: '' });
      }
    }
  }, [selectedClientId, clients]);

  // Generate Recommendations Logic
  useEffect(() => {
    if (!profile.faceShape && !profile.hairType && !profile.beardStyle) {
      setRecommendations([]);
      return;
    }

    const traits = [profile.faceShape, profile.hairType, profile.beardStyle].filter(Boolean);
    
    const recs = products.filter(product => {
      if (!product.recommendedFor || product.recommendedFor.length === 0) return false;
      // If the product has ANY of the tags matching the current profile traits
      return product.recommendedFor.some(tag => traits.includes(tag as any));
    });

    setRecommendations(recs);
  }, [profile, products]);

  const handleSave = () => {
    if (!selectedClientId) return;
    const client = clients.find(c => c.id === selectedClientId);
    if (client) {
      onUpdateClient({
        ...client,
        visagismProfile: profile
      });
      alert('Perfil de Visagismo salvo com sucesso!');
    }
  };

  const selectedClientName = clients.find(c => c.id === selectedClientId)?.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <ScanFace className="text-green-500" size={32} /> Visagismo Inteligente
          </h2>
          <p className="text-slate-400">Analise o perfil do cliente e ofereça os produtos ideais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client & Analysis Form */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* 1. Select Client */}
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase flex items-center gap-2">
                <UserIcon size={16} /> Selecionar Cliente
              </label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Escolha um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
           </div>

           {/* 2. Analysis Form */}
           {selectedClientId && (
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in">
                <h3 className="font-bold text-white mb-4 border-b border-slate-800 pb-2">Análise de Características</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Formato do Rosto</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white mt-1"
                      value={profile.faceShape}
                      onChange={e => setProfile({...profile, faceShape: e.target.value as any})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Oval">Oval</option>
                      <option value="Quadrado">Quadrado</option>
                      <option value="Redondo">Redondo</option>
                      <option value="Triangular">Triangular</option>
                      <option value="Longo">Longo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Cabelo</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white mt-1"
                      value={profile.hairType}
                      onChange={e => setProfile({...profile, hairType: e.target.value as any})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Liso">Liso</option>
                      <option value="Ondulado">Ondulado</option>
                      <option value="Cacheado">Cacheado</option>
                      <option value="Crespo">Crespo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Estilo de Barba</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white mt-1"
                      value={profile.beardStyle}
                      onChange={e => setProfile({...profile, beardStyle: e.target.value as any})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Cheia">Cheia / Lenhador</option>
                      <option value="Cerrada">Cerrada / Por fazer</option>
                      <option value="Cavanhaque">Cavanhaque</option>
                      <option value="Bigode">Bigode</option>
                      <option value="Sem Barba">Sem Barba</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Notas Adicionais</label>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white mt-1 h-24 resize-none"
                      placeholder="Ex: Couro cabeludo sensível..."
                      value={profile.notes || ''}
                      onChange={e => setProfile({...profile, notes: e.target.value})}
                    />
                  </div>

                  <button 
                    onClick={handleSave}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <Save size={18} /> Salvar Perfil
                  </button>
                </div>
             </div>
           )}
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-2">
           {!selectedClientId ? (
             <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 text-center border-dashed">
                <ScanFace size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold mb-2">Aguardando Cliente</h3>
                <p>Selecione um cliente ao lado para iniciar a análise de visagismo.</p>
             </div>
           ) : (
             <div className="space-y-6">
                {/* Profile Summary Card */}
                <div className="bg-gradient-to-r from-green-900/20 to-slate-900 border border-green-500/20 rounded-xl p-6">
                   <h3 className="text-lg font-bold text-white mb-1">Análise de {selectedClientName}</h3>
                   <p className="text-slate-400 text-sm mb-4">Produtos recomendados com base nas características selecionadas.</p>
                   
                   <div className="flex flex-wrap gap-2">
                      {profile.faceShape && <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">Rosto: {profile.faceShape}</span>}
                      {profile.hairType && <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">Cabelo: {profile.hairType}</span>}
                      {profile.beardStyle && <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">Barba: {profile.beardStyle}</span>}
                   </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {recommendations.length > 0 ? (
                     recommendations.map(product => (
                       <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 hover:border-green-500/50 transition-all animate-fade-in">
                          <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-green-500">
                             <Package size={32} />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white">{product.name}</h4>
                                <span className="text-green-400 font-bold text-sm">R$ {product.price.toFixed(2)}</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-1 mb-2">{product.category}</p>
                             
                             <div className="flex flex-wrap gap-1">
                                {product.recommendedFor?.filter(tag => 
                                  [profile.faceShape, profile.hairType, profile.beardStyle].includes(tag as any)
                                ).map(tag => (
                                   <span key={tag} className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 flex items-center gap-1">
                                     <Sparkles size={8} /> {tag}
                                   </span>
                                ))}
                             </div>
                          </div>
                          <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-slate-900 shadow-lg shadow-green-500/20">
                                <Check size={16} strokeWidth={3} />
                             </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="col-span-2 py-10 text-center text-slate-500">
                        {profile.faceShape || profile.hairType || profile.beardStyle 
                          ? 'Nenhum produto específico encontrado para estas características.' 
                          : 'Preencha as características ao lado para ver recomendações.'}
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Visagism;
