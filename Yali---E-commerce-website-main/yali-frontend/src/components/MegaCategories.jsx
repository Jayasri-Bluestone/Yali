import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { API_URL } from '../config';

import houseImg from '../assets/images/properties_house_1782211864569.png';
import vehiclesImg from '../assets/images/vehicles_car_bike_1782211877015.png';
import organicImg from '../assets/images/organic_basket_1782211894054.png';
import dryFruitsImg from '../assets/images/dry_fruits_bowl_1782211906356.png';
import dressesImg from '../assets/images/dresses_rack_1782211920989.png';



export default function MegaCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, subCatsRes, featsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/sub-categories`),
          fetch(`${API_URL}/home-features`)
        ]);

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }

        if (subCatsRes.ok) {
          const subCatsData = await subCatsRes.json();
          setSubCategories(subCatsData);
        }

        if (featsRes.ok) {
          const featsData = await featsRes.json();
          setFeatures(featsData);
        }
      } catch (err) {
        console.error('Failed to fetch mega categories:', err);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (iconName, color, className) => {
    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <Icon className={className} style={{ color: color }} />;
  };

  const getSubItemsForCategory = (catValue) => {
    return subCategories
      .filter(sc => sc.category_value === catValue)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

  const getCategoryImage = (cat) => {
    if (cat.image_url) return cat.image_url;
    switch (cat.value) {
      case 'real-estate': return houseImg;
      case 'automobiles': return vehiclesImg;
      case 'organic-products': return organicImg;
      case 'dry-fruits': return dryFruitsImg;
      case 'fashion': return dressesImg;
      default: return houseImg;
    }
  };

  return (
    <section className="mt-4 mb-12 px-4 max-w-[1600px] mx-auto">
      {/* Big size mock section heading */}
      <div className="mb-4 text-center flex flex-col items-center">
        <h2 className="text-3xl md:text-[42px] font-black leading-tight tracking-tight">
          <span className="text-[#34982a]">Everything You Need, </span>
          <span className="text-[#083366]">All in One Place</span>
        </h2>
        <p className="mt-4 text-gray-500 font-medium text-sm md:text-[15px]">
          Explore. Choose. Own. All your needs, in one trusted platform.
        </p>
       
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
        {categories.map((col) => {
          const subItems = getSubItemsForCategory(col.value);
          const bgCol = col.bg_color || '#3b82f6';

          return (
            <div
              key={col.id}
              className="flex flex-col relative bg-white rounded-[1rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2"
              style={{ borderColor: bgCol + '30', backgroundColor: bgCol + '03' }}
            >
              {/* Clickable Top Section */}
              <div
                className="cursor-pointer group/card"
                onClick={() => {
                  const allSubItems = col.items ? col.items : getSubItemsForCategory(col.value);
                  const subTags = allSubItems.map(i => i.filter_tag);
                  navigate(`/search?category=${col.value}`, {
                    state: {
                      bannerColor: bgCol,
                      subTags: subTags
                    }
                  });
                }}
              >
                {/* Top Icon */}
                <div className="pt-3  flex items-center justify-center transition-transform group-hover/card:scale-110">
                  {renderIcon(col.icon || 'Box', bgCol, 'w-5 h-5')}
                </div>

                {/* Title */}
                <div className="px-4 flex flex-col items-center justify-center text-center h-[44px]">
                  <h3
                    className="text-[15px] font-black leading-tight"
                    style={{ color: bgCol }}
                  >
                    {col.label === 'Automobiles' || col.label === 'Two Wheelers & Four Wheelers' ? (
                      <>
                        Two Wheelers<br />& Four Wheelers
                      </>
                    ) : (
                      col.label
                    )}
                  </h3>
                </div>

                {/* Image */}
                <div className="w-full h-32 px-4 flex items-center justify-center ">
                  <img
                    src={getCategoryImage(col)}
                    alt={col.label}
                    className="max-w-[90%] max-h-full object-contain mix-blend-multiply transition-transform group-hover/card:scale-105 duration-300"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

              {/* Sub-items List */}
              <div className="flex-1 px-4 py-4 flex flex-col gap-3.5">
                {subItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.link_url || `/search?category=${item.filter_tag}`, { state: { bannerColor: bgCol, title: item.label } })}
                    className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-white/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-center mt-0.5">
                      {renderIcon(item.icon_name || 'Tag', bgCol, 'w-[18px] h-[18px] stroke-[2.5]')}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[12.5px] font-bold text-gray-800 leading-tight mb-0.5 group-hover:text-black transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[10.5px] font-medium text-gray-500 leading-tight truncate">
                        {item.subtitle || item.filter_tag}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </section>

  );
}
