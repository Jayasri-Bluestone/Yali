import { ChevronDown, ChevronLeft, Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export function FilterSidebar({ 
  filters, 
  onFilterChange, 
  availableCategories = [],
  showCategoryFilter = false
}) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: false,
    discount: false,
    brand: false,
    offers: false,
    quality: false
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCheckboxChange = (group, value) => {
    const current = filters[group] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFilterChange({ ...filters, [group]: updated });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      priceMin: '',
      priceMax: '',
      ratings: [],
      discounts: [],
      assured: false
    });
  };

  // Dummy lists for visual parity with screenshot
  const brandList = ['Generic', 'Premium', 'Standard'];
  const priceStops = ['', '500', '1000', '2000', '5000', '10000', '30000+'];

  return (
    <div className="bg-white border border-gray-200 rounded-[2px] overflow-hidden sticky top-24 shadow-sm w-[270px]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-[18px] font-medium text-gray-900 tracking-wide">Filters</h2>
        {/* We keep clear all subtle if needed, though not in screenshot */}
        <button onClick={clearFilters} className="text-[11px] font-medium text-blue-600 uppercase hover:underline">
          Clear All
        </button>
      </div>

      <div className="max-h-[calc(100vh-160px)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        
        {/* Categories (Flipkart Breadcrumb Style) */}
        {showCategoryFilter && availableCategories.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="text-[11px] font-medium text-gray-800 uppercase tracking-wider mb-2.5">
              Categories
            </div>
            <div className="space-y-2">
              <div className="text-[13px] text-gray-500 flex items-center gap-1.5 cursor-pointer hover:text-[#2874f0]">
                <ChevronLeft className="w-3.5 h-3.5" /> All Products
              </div>
              {availableCategories.map(cat => {
                const isSelected = (filters.categories || []).includes(cat);
                return (
                  <div 
                    key={cat} 
                    onClick={() => handleCheckboxChange('categories', cat)}
                    className={`text-[13px] ml-1 flex items-center gap-1.5 cursor-pointer ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-600 hover:text-[#2874f0]'}`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> {cat.replace('-', ' ')}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brand (Visual Only for exact match to screenshot) */}
        <div className="border-b border-gray-200">
          <button onClick={() => toggleSection('brand')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[12px] font-medium text-gray-800 uppercase tracking-wide">Brand</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.brand && (
            <div className="px-4 pb-4 space-y-3">
              {brandList.map(b => (
                <label key={b} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-[14px] h-[14px] rounded-[2px] border-gray-300 text-[#2874f0] focus:ring-0 cursor-pointer" />
                  <span className="text-[13px] text-gray-700">{b}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Slider Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-[12px] font-medium text-gray-800 uppercase tracking-wide mb-4">
            Price
          </div>
          
          {/* Visual Slider */}
          <div className="px-1.5 mb-5 relative">
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-12 h-2.5 bg-gray-200/50 rounded-t-sm" />
            <div className="relative h-1 bg-gray-300 rounded-full w-full">
              {/* Active track */}
              <div className="absolute left-0 right-0 h-full bg-[#2874f0]" />
              {/* Left Handle */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-gray-400 rounded-full shadow-sm cursor-pointer z-10" />
              {/* Right Handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-gray-400 rounded-full shadow-sm cursor-pointer z-10" />
              {/* Ticks */}
              <div className="absolute top-3 left-0 w-full flex justify-between px-1">
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"/>
              </div>
            </div>
          </div>

          {/* Min Max Selects */}
          <div className="flex items-center justify-between gap-3">
            <select 
              value={filters.priceMin || ''}
              onChange={(e) => onFilterChange({ ...filters, priceMin: e.target.value })}
              className="w-full border border-gray-300 rounded-[2px] px-2 py-1 text-[13px] bg-white outline-none focus:border-[#2874f0] cursor-pointer text-gray-700 h-8"
            >
              <option value="">Min</option>
              {priceStops.filter(p => p).map(p => <option key={p} value={p.replace('+','')}>₹{p}</option>)}
            </select>
            <span className="text-[13px] text-gray-500">to</span>
            <select 
              value={filters.priceMax || ''}
              onChange={(e) => onFilterChange({ ...filters, priceMax: e.target.value })}
              className="w-full border border-gray-300 rounded-[2px] px-2 py-1 text-[13px] bg-white outline-none focus:border-[#2874f0] cursor-pointer text-gray-700 h-8"
            >
              <option value="">₹30000+</option>
              {priceStops.filter(p => p).map(p => <option key={p} value={p.replace('+','')}>₹{p}</option>)}
            </select>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="border-b border-gray-200">
          <button onClick={() => toggleSection('rating')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[12px] font-medium text-gray-800 uppercase tracking-wide">Customer Ratings</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.rating && (
            <div className="px-4 pb-4 space-y-3">
              {[4, 3, 2, 1].map(star => (
                <label key={star} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-[14px] h-[14px] rounded-[2px] border-gray-300 text-[#2874f0] focus:ring-0 cursor-pointer"
                    checked={(filters.ratings || []).includes(star)}
                    onChange={() => handleCheckboxChange('ratings', star)}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-gray-700">{star}</span>
                    <Star className="w-3.5 h-3.5 fill-gray-500 text-gray-500" />
                    <span className="text-[13px] text-gray-700">& above</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Assured Checkbox */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer hover:bg-gray-50"
             onClick={() => onFilterChange({ ...filters, assured: !filters.assured })}>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={filters.assured || false}
              onChange={() => {}}
              className="w-[14px] h-[14px] rounded-[2px] border-gray-300 text-[#2874f0] focus:ring-0 cursor-pointer pointer-events-none" 
            />
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-[#2874f0] rounded-sm flex items-center justify-center -rotate-6">
                <span className="text-white font-bold text-[10px] italic">Y</span>
              </div>
              <span className="text-[#2874f0] font-bold italic text-[14px] tracking-tight">Assured</span>
            </div>
          </div>
          <HelpCircle className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
        </div>

        {/* Discount */}
        <div className="border-b border-gray-200">
          <button onClick={() => toggleSection('discount')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[12px] font-medium text-gray-800 uppercase tracking-wide">Discount</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.discount ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.discount && (
            <div className="px-4 pb-4 space-y-3">
              {[50, 40, 30, 20, 10].map(disc => (
                <label key={disc} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-[14px] h-[14px] rounded-[2px] border-gray-300 text-[#2874f0] focus:ring-0 cursor-pointer"
                    checked={(filters.discounts || []).includes(disc)}
                    onChange={() => handleCheckboxChange('discounts', disc)}
                  />
                  <span className="text-[13px] text-gray-700">{disc}% or more</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Offers (Visual) */}
        <div className="border-b border-gray-200">
          <button onClick={() => toggleSection('offers')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[12px] font-medium text-gray-800 uppercase tracking-wide">Offers</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.offers ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quality Verified (Visual) */}
        <div className="border-b border-gray-200">
          <button onClick={() => toggleSection('quality')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="text-[12px] font-medium text-gray-800 uppercase tracking-wide">Quality Verified Product</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.quality ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
