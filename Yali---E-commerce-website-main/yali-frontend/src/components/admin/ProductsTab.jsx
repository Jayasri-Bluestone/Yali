import { Search, Upload, Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { Pagination } from './Pagination';

export function ProductsTab({
  filteredProducts,
  productSearch,
  setProductSearch,
  categoryFilter,
  setCategoryFilter,
  categoriesList,
  isCategoryAdmin,
  adminCategory,
  handleImportCSV,
  handleExportCSV,
  setIsProductModalOpen,
  setEditingProduct,
  setProductForm,
  handleEditClick,
  handleDeleteProduct,
  handleToggleStatus
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch, categoryFilter]);

  const filteredList = filteredProducts
    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const currentItems = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search scoped products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-2">
          <label className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: '',
                price: '',
                originalPrice: '',
                category: isCategoryAdmin ? adminCategory : 'real-estate',
                image: '',
                images: [],
                stock: '',
                description: '',
                badge: ''
              });
              setIsProductModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Sub-tabs */}
      <div className="flex overflow-x-auto gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 scrollbar-hide mb-4">
        {[
          { value: 'all', label: 'All Categories' },
          ...categoriesList
        ].filter(tab => {
          if (isCategoryAdmin) {
            return tab.value === adminCategory;
          }
          return true;
        }).map(tab => {
          const isActive = categoryFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
              <th className="p-4 rounded-l-lg">Product</th>
              <th className="p-4">Category</th>
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
                    <td className="p-4 capitalize text-gray-600">{p.category?.replace('-', ' ')}</td>
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
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}
