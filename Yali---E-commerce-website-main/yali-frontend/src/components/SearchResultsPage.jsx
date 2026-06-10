import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layers, Package, ArrowLeft } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { formatINR } from '../utils/currency';

export function SearchResultsPage({
  products,
  onAddToCart,
  wishlistItems,
  onToggleWishlist
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceMin: '',
    priceMax: '',
    ratings: [],
    discounts: []
  });
  
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

  // 1. Initial text search filter
  const textFiltered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Extract available categories and brands from text search results for the sidebar
  const availableCategories = useMemo(() => {
    const cats = new Set();
    textFiltered.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [textFiltered]);

  const availableBrands = useMemo(() => {
    const brands = new Set();
    textFiltered.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [textFiltered]);

  // 2. Apply Sidebar Filters
  const fullyFiltered = useMemo(() => {
    return textFiltered.filter(p => {
      // Category filter
      if (filters.categories?.length > 0 && !filters.categories.includes(p.category)) return false;
      
      // Brand filter
      if (filters.brands?.length > 0 && !filters.brands.includes(p.brand)) return false;
      
      // Price filter
      const price = parseFloat(p.price);
      if (filters.priceMin && price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && price > parseFloat(filters.priceMax)) return false;

      // Rating filter (if multiple selected, usually it's OR logic among them, e.g. 4+ or 3+ = 3+)
      if (filters.ratings?.length > 0) {
        const minRatingSelected = Math.min(...filters.ratings);
        if ((p.rating || 0) < minRatingSelected) return false;
      }

      // Discount filter
      if (filters.discounts?.length > 0) {
        const minDiscountSelected = Math.min(...filters.discounts);
        if ((p.discount || 0) < minDiscountSelected) return false;
      }

      // Assured filter
      if (filters.assured) {
        // If product doesn't have isAssured, let's mock it using rating >= 4 for now
        const isAssured = p.isAssured || (p.rating >= 4);
        if (!isAssured) return false;
      }

      return true;
    });
  }, [textFiltered, filters]);

  // 3. Sort
  const displayProducts = useMemo(() => {
    const sorted = [...fullyFiltered];
    if (sortBy === 'price-asc') sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (sortBy === 'price-desc') sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [fullyFiltered, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Search results for "{searchQuery}"
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Found {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {displayProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 bg-white rounded-xl px-4 py-2 font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="default">Relevance</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="flex bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#0066cc] text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#0066cc] text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Package className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar 
            filters={filters}
            onFilterChange={setFilters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            showCategoryFilter={true}
          />
        </div>

        {/* Mobile Filter Toggle (Optional) */}
        {/* We can add a mobile drawer here later, for now sticking to desktop layout focus */}

        {/* Products Grid/List */}
        <div className="flex-1 min-w-0">
          {displayProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm">
                We couldn't find anything matching "{searchQuery}" with the current filters.
              </p>
              <button 
                onClick={() => setFilters({ categories: [], priceMin: '', priceMax: '', ratings: [], discounts: [] })}
                className="mt-6 px-6 py-2 bg-[#0066cc] text-white rounded-lg font-semibold text-sm hover:bg-[#0052a3] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayProducts.map(product => (
                <div key={product.id} className="relative group">
                  {product.discount && (
                    <div className="absolute top-2 left-2 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md bg-red-500">
                      {product.discount}% OFF
                    </div>
                  )}
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    onProductClick={(p) => navigate(`/product/${p.id}`)}
                    isWishlisted={wishlistItems.some(i => i.id === product.id)} 
                    onToggleWishlist={onToggleWishlist} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayProducts.map(product => (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)}
                  className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group items-center">
                  <div className="relative w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm md:text-base">{product.name}</h3>
                    {product.category && (
                      <span className="text-xs font-semibold text-gray-500 mb-2 block capitalize">{product.category.replace('-', ' ')}</span>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">{formatINR(product.price)}</span>
                      {product.originalPrice && <span className="text-sm text-gray-400 line-through">{formatINR(product.originalPrice)}</span>}
                      {product.discount && <span className="text-xs text-green-600 font-bold ml-1">{product.discount}% off</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                      className="bg-[#0066cc] hover:bg-[#0052a3] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-center">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
