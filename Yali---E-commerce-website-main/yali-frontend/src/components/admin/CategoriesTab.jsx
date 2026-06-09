import { Tag, Building, Home, Bike, Car, Leaf, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { Pagination } from './Pagination';

export function CategoriesTab({
  products,
  categoriesList,
  isCategoryAdmin,
  adminCategory,
  selectedCategoryTab,
  setSelectedCategoryTab,
  setEditingProduct,
  setProductForm,
  setIsProductModalOpen,
  handleEditClick,
  handleDeleteProduct,
  handleToggleStatus
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryTab]);

  const selectedProducts = selectedCategoryTab ? products.filter(p => p.category === selectedCategoryTab) : [];
  const totalPages = Math.ceil(selectedProducts.length / ITEMS_PER_PAGE);
  const currentItems = selectedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {categoriesList
          .filter(cat => {
            if (isCategoryAdmin) return cat.value === adminCategory;
            return true;
          })
          .map(cat => {
            const catProducts = products.filter(p => p.category === cat.value);
            const productCount = catProducts.length;
            const totalStock = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
            const lowStockCount = catProducts.filter(p => (p.stock || 0) < 5).length;
            
            let CatIcon = Tag;
            let gradient = "from-purple-500 to-indigo-500";
            if (cat.value === 'real-estate') {
              CatIcon = Building;
              gradient = "from-[#0066cc] to-[#0099ff]";
            } else if (cat.value === 'properties') {
              CatIcon = Home;
              gradient = "from-[#10b981] to-[#22d3ee]";
            } else if (cat.value === 'bike-accessories') {
              CatIcon = Bike;
              gradient = "from-[#22d3ee] to-[#0066cc]";
            } else if (cat.value === 'car-accessories') {
              CatIcon = Car;
              gradient = "from-[#8b5cf6] to-[#0066cc]";
            } else if (cat.value === 'organic-groceries') {
              CatIcon = Leaf;
              gradient = "from-[#f59e0b] to-[#10b981]";
            }

            const isSelected = selectedCategoryTab === cat.value;

            return (
              <div
                key={cat.value}
                onClick={() => setSelectedCategoryTab(cat.value)}
                className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden relative shadow-sm hover:shadow-md ${
                  isSelected ? 'ring-2 ring-indigo-600 border-transparent scale-102' : 'border-gray-200'
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                  <ToggleSwitch 
                    checked={cat.status === 'active'}
                    onChange={() => handleToggleStatus('categories', cat.id, cat.status)}
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-sm`}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    {lowStockCount > 0 && (
                      <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-[10px] border border-red-100 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {lowStockCount} Low
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate mb-3">{cat.label}</h3>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-bold text-gray-800">{productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Stock:</span>
                      <span className="font-bold text-gray-800">{totalStock}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategoryTab(cat.value);
                      }}
                      className="flex-1 py-1.5 text-[11px] font-bold text-center text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg hover:bg-indigo-100/70 transition-colors"
                    >
                      Explore Tab
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          price: '',
                          originalPrice: '',
                          category: cat.value,
                          image: '',
                          images: [],
                          stock: '',
                          description: '',
                          badge: ''
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200"
                      title="Add Product to Category"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Selected Category Details View */}
      {selectedCategoryTab && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                Category Showcase: {categoriesList.find(c => c.value === selectedCategoryTab)?.label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Reviewing and managing listings categorized under '{selectedCategoryTab}' separately.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  price: '',
                  originalPrice: '',
                  category: selectedCategoryTab,
                  image: '',
                  stock: '',
                  description: '',
                  badge: ''
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product to {categoriesList.find(c => c.value === selectedCategoryTab)?.label}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                  <th className="p-4 rounded-l-lg">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(p => {
                    const isLowStock = (p.stock ?? 0) < 5;
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">{p.name}</div>
                              {p.badge && <span className="inline-block bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded text-[10px] mt-1">{p.badge}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">₹{p.price}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isLowStock
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                            Stock: {p.stock ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <ToggleSwitch 
                            checked={p.status === 'active'}
                            onChange={() => handleToggleStatus('products', p.id, p.status)}
                            activeLabel=""
                            inactiveLabel=""
                          />
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 border border-gray-300 text-gray-600 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 border border-gray-300 text-gray-600 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {selectedProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No products found in this category. Click the "Add Product" button to create one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
}
