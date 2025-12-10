
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, X, Package, DollarSign, Layers, Search, AlertCircle, Percent } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
}

const Products: React.FC<ProductsProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    commissionPercentage: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        commissionPercentage: product.commissionPercentage || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: 0, stock: 0, category: '', commissionPercentage: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdate({ ...editingProduct, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Produtos</h2>
          <p className="text-slate-400">Controle de estoque e vendas de produtos.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar produto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500 w-full md:w-64"
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus size={20} /> Novo Produto
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-2">
               <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-green-500">
                  <Package size={20} />
               </div>
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(product)}
                  className="p-1.5 hover:bg-slate-800 rounded text-blue-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-1.5 hover:bg-slate-800 rounded text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-white text-lg truncate mb-1">{product.name}</h3>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {product.category}
            </span>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
               <div>
                 <p className="text-xs text-slate-500">Preço</p>
                 <p className="text-green-400 font-bold">R$ {product.price.toFixed(2)}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-slate-500">Estoque</p>
                 <p className={`font-bold ${product.stock < 5 ? 'text-red-400' : 'text-slate-200'}`}>
                   {product.stock} un
                 </p>
               </div>
            </div>
            {product.commissionPercentage !== undefined && (
               <div className="mt-2 text-xs text-slate-400">
                 Comissão: {product.commissionPercentage}%
               </div>
            )}
            {product.stock < 5 && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> Estoque baixo
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="Ex: Pomada Modeladora"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Estoque</label>
                  <div className="relative">
                    <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                  <div className="relative">
                    <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                      placeholder="Ex: Cabelo, Barba, Venda"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Comissão (%)</label>
                  <div className="relative">
                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="100"
                      value={formData.commissionPercentage}
                      onChange={e => setFormData({...formData, commissionPercentage: parseFloat(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} /> Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
