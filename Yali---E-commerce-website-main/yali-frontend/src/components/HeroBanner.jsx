import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HeroBanner({ banners = [], onCategoryClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-2xl">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.bgImage})` }}
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-white px-4">
            <div className="text-center max-w-4xl animate-slide-in">
              {/* Discount Badge */}
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold mb-4 animate-bounce">
                <Tag className="w-5 h-5" />
                {banner.discount}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-lg md:text-2xl lg:text-3xl mb-6 md:mb-8 drop-shadow-md">
                {banner.subtitle}
              </p>
              <button
                onClick={() => {
                  if (banner.category && onCategoryClick) {
                    onCategoryClick(banner.category);
                  }
                }}
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-[#0066cc] rounded-lg font-semibold text-base md:text-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
              >
                {banner.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/30 hover:bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/30 hover:bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
