import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DynamicSectionRenderer } from './sections/DynamicSectionRenderer';
import { ProductScrollRow } from '../App'; // If exported, else we need to pass it
import { API_URL } from '../config';
import { Layers } from 'lucide-react';

export function CustomPage({ 
  products, 
  videos, 
  banners,
  uiCards,
  wishlistItems, 
  onAddToCart, 
  onProductClick, 
  onToggleWishlist,
  ProductScrollRowComponent
}) {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [dynamicSections, setDynamicSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`${API_URL}/page-sections/${pageId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDynamicSections(data);
        } else {
          setDynamicSections([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch page layout', err);
        setLoading(false);
      });
  }, [pageId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Page...</div>;
  }

  if (dynamicSections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <Layers className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-3xl font-black text-gray-800 mb-2">Page Not Built Yet</h1>
        <p className="text-gray-500 max-w-md text-center mb-8">
          The page <span className="font-bold text-gray-700">"{pageId}"</span> currently has no dynamic sections configured in the Admin Panel.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {dynamicSections.map(section => (
            <DynamicSectionRenderer 
              key={section.id} 
              section={section} 
              products={products}
              videos={videos}
              banners={banners}
              uiCards={uiCards}
              wishlistItems={wishlistItems}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              onToggleWishlist={onToggleWishlist}
              onCategoryClick={(cat) => navigate(`/category/${cat}`)}
              ProductScrollRowComponent={ProductScrollRowComponent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
