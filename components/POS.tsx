
import React, { useState } from 'react';
import { Product, Service, Client } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, User as UserIcon, Printer, CheckCircle, X, CreditCard, Banknote, QrCode } from 'lucide-react';

interface POSProps {
  products: Product[];
  services: Service[];
  clients: Client[];
  onFinalizeSale: (items: CartItem[], client: Client | null, paymentMethod: string, total: number) => void;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'PRODUCT' | 'SERVICE';
  originalItem: Product | Service;
}

const POS: React.FC<POSProps> = ({ products, services, clients, onFinalizeSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<{items: CartItem[], total: number, date: string, client: string, method: string} | null>(null);

  // Derived state
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Filtering items
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handlers
  const addToCart = (item: Product | Service, type: 'PRODUCT' | 'SERVICE') => {
    // Check stock for products
    if (type === 'PRODUCT') {
      const product = item as Product;
      const currentInCart = cart.find(c => c.id === item.id)?.quantity || 0;
      if (currentInCart + 1 > product.stock) {
        alert('Estoque insuficiente!');
        return;
      }
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1, 
        type,
        originalItem: item
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        
        // Stock check
        if (item.type === 'PRODUCT') {
           const product = item.originalItem as Product;
           if (newQty > product.stock) {
             alert('Estoque máximo atingido!');
             return item;
           }
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const confirmSale = () => {
    onFinalizeSale(cart, selectedClient, paymentMethod, total);
    
    // Set data for receipt
    setLastSaleData({
      items: [...cart],
      total,
      date: new Date().toLocaleString('pt-BR'),
      client: selectedClient ? selectedClient.name : 'Consumidor Final',
      method: paymentMethod
    });

    // Reset
    setCart([]);
    setSelectedClient(null);
    setIsCheckoutModalOpen(false);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-area');
    if (printContent) {
      const windowUrl = 'about:blank';
      const uniqueName = new Date().getTime();
      const windowName = 'Print' + uniqueName;
      const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0; padding: 10px; }
                .text-center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-bottom: 1px dashed #000; margin: 5px 0; }
                .flex { display: flex; justify-content: space-between; }
                .mb-2 { margin-bottom: 8px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* LEFT COLUMN: CATALOG */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header/Search */}
        <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-950">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => setActiveTab('SERVICES')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'SERVICES' ? 'bg-slate-700 text-green-400' : 'text-slate-400'}`}
            >
              Serviços
            </button>
            <button 
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'PRODUCTS' ? 'bg-slate-700 text-green-400' : 'text-slate-400'}`}
            >
              Produtos
            </button>
          </div>
        </div>

        {/* Grid Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTab === 'SERVICES' ? (
              filteredServices.map(service => (
                <div 
                  key={service.id} 
                  onClick={() => addToCart(service, 'SERVICE')}
                  className="bg-slate-800 border border-slate-700 p-4 rounded-xl cursor-pointer hover:border-green-500 hover:bg-slate-800/80 transition-all flex flex-col justify-between group h-32"
                >
                  <div>
                    <h4 className="font-bold text-slate-200 line-clamp-2">{service.name}</h4>
                    <p className="text-xs text-slate-500">{service.durationMinutes} min</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-green-400 font-bold">R$ {service.price.toFixed(2)}</span>
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product, 'PRODUCT')}
                  className={`
                    bg-slate-800 border border-slate-700 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between group h-32
                    ${product.stock === 0 ? 'opacity-50 pointer-events-none' : 'hover:border-green-500 hover:bg-slate-800/80'}
                  `}
                >
                  <div>
                    <h4 className="font-bold text-slate-200 line-clamp-2">{product.name}</h4>
                    <p className={`text-xs ${product.stock < 5 ? 'text-red-400' : 'text-slate-500'}`}>Estoque: {product.stock}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-green-400 font-bold">R$ {product.price.toFixed(2)}</span>
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CART */}
      <div className="w-96 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-green-500" /> Caixa Aberto
          </h3>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{cart.length} itens</span>
        </div>

        {/* Client Selector */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/30">
          <div className="relative">
             <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <select 
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg py-2 pl-9 pr-2 focus:outline-none focus:border-green-500 appearance-none"
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const client = clients.find(c => c.id === e.target.value);
                setSelectedClient(client || null);
              }}
             >
               <option value="">Selecionar Cliente (Opcional)</option>
               {clients.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
              <ShoppingCart size={40} />
              <p className="text-sm">Nenhum item adicionado</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center group">
                <div className="flex-1 overflow-hidden mr-2">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} x R$ {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center bg-slate-800 rounded border border-slate-700">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-white text-slate-400"><Minus size={12} /></button>
                      <span className="text-xs font-mono w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-white text-slate-400"><Plus size={12} /></button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 rounded-b-2xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-slate-400">Total a Pagar</span>
            <span className="text-3xl font-bold text-white">R$ {total.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
          >
            Finalizar Venda <CheckCircle size={20} />
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Finalizar Pagamento</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <p className="text-slate-400 text-sm">Valor Total</p>
                <p className="text-4xl font-bold text-white mt-1">R$ {total.toFixed(2)}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Cliente: <span className="text-slate-300">{selectedClient ? selectedClient.name : 'Não informado'}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'PIX', label: 'Pix', icon: <QrCode size={20} /> },
                  { id: 'CARD', label: 'Cartão', icon: <CreditCard size={20} /> },
                  { id: 'CASH', label: 'Dinheiro', icon: <Banknote size={20} /> },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all
                      ${paymentMethod === method.id 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                    `}
                  >
                    {method.icon}
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={confirmSale}
                className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSaleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-black rounded-lg w-full max-w-sm shadow-2xl animate-fade-in p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold">Venda Realizada!</h3>
              <p className="text-gray-500 text-sm">Deseja imprimir o comprovante?</p>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setShowReceipt(false)}
                 className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
               >
                 Fechar
               </button>
               <button 
                 onClick={handlePrint}
                 className="flex-1 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
               >
                 <Printer size={18} /> Imprimir
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt Content for Printing */}
      <div id="receipt-area" className="hidden">
         {lastSaleData && (
           <div className="p-2">
             <div className="text-center mb-2">
               <h2 className="bold" style={{ fontSize: '16px' }}>NEON FLOW SAAS</h2>
               <p>Rua Exemplo, 123 - Centro</p>
               <p>CNPJ: 00.000.000/0001-00</p>
             </div>
             <div className="line"></div>
             <div className="mb-2">
               <p>Data: {lastSaleData.date}</p>
               <p>Cliente: {lastSaleData.client}</p>
             </div>
             <div className="line"></div>
             <div className="mb-2">
               {lastSaleData.items.map(item => (
                 <div key={item.id} className="flex">
                   <span>{item.quantity}x {item.name}</span>
                   <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
             </div>
             <div className="line"></div>
             <div className="flex bold" style={{ fontSize: '14px', marginTop: '10px' }}>
               <span>TOTAL</span>
               <span>R$ {lastSaleData.total.toFixed(2)}</span>
             </div>
             <div className="flex">
               <span>Pagamento ({lastSaleData.method})</span>
               <span>R$ {lastSaleData.total.toFixed(2)}</span>
             </div>
             <div className="text-center" style={{ marginTop: '20px' }}>
               <p>Obrigado pela preferência!</p>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default POS;
