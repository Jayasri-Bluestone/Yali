import { ChevronLeft, ChevronRight, ShieldAlert, Package, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroCollageImg from '../assets/images/custom_hero.png';
import houseImg from '../assets/images/properties_house_1782211864569.png';
import vehiclesImg from '../assets/images/vehicles_car_bike_1782211877015.png';
import organicImg from '../assets/images/organic_basket_1782211894054.png';
import dressesImg from '../assets/images/dresses_rack_1782211920989.png';

const MOCK_BANNERS = [
  {
    id: 'hero-1',
    title: 'Welcome to Yali, Your Premium Marketplace',
    subtitle: 'From Real Estate and Vehicles to Daily Organic Essentials.',
    buttonText: 'Start Exploring',
    link: '/search',
    image: heroCollageImg
  },
  {
    id: 'hero-2',
    title: 'Find Your Dream Home, Properties Land',
    subtitle: 'Discover top residential and commercial properties tailored to you.',
    buttonText: 'Explore Properties',
    link: '/search?category=real-estate',
    image: houseImg
  },
  {
    id: 'hero-3',
    title: 'New & Used Vehicles, Drive Your Dream',
    subtitle: 'Compare features and prices of top cars, bikes, and commercial vehicles.',
    buttonText: 'View Vehicles',
    link: '/search?category=automobiles',
    image: vehiclesImg
  },
  {
    id: 'hero-4',
    title: 'Farm Fresh Goodness, 100% Organic',
    subtitle: 'Get fresh fruits, vegetables, and dry fruits delivered straight from the farm.',
    buttonText: 'Shop Organic',
    link: '/search?category=organic-products',
    image: organicImg
  },
  {
    id: 'hero-5',
    title: 'Latest Fashion Trends, Stylish Collections',
    subtitle: 'Explore our latest arrivals in men, women, and kids clothing.',
    buttonText: 'Shop Fashion',
    link: '/search?category=fashion',
    image: dressesImg
  }
];

export function HeroBanner({ banners = [], onCategoryClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const displayBanners = banners && banners.length > 0 ? banners : MOCK_BANNERS;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayBanners]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  return (
    <div className="relative w-[95%] max-w-[1300px] mx-auto mt-4 md:mt-8">

      <div className="relative w-full h-[250px] md:h-[300px] lg:h-[380px] overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-xl bg-gradient-to-r from-[#031d59] to-[#004dc9] border border-[#70A83B]">

        {/* Exact Curved Green Background on the Right */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 right-0 w-[30%] md:w-[20%] h-full text-[#34982a]">
            <path d="M 0 100 C 30 80, 20 20, 100 0 L 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute inset-0 flex flex-col md:flex-row">

          {/* Left Side: Dynamic Text & Buttons */}
          <div className="w-full md:w-[55%] h-full flex flex-col justify-center pl-10 pr-6 md:pl-20 md:pr-12 pt-8 md:pt-0 z-20 relative">

            {displayBanners.map((banner, index) => (
              <div
                key={`text-${banner.id || index}`}
                className={`absolute inset-0 flex flex-col justify-center pl-10 pr-6 md:pl-20 md:pr-12 transition-opacity duration-1000 pointer-events-none ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="pointer-events-auto flex flex-col items-start">
                  {/* Tagline Badge (Removed in new mockup) */}

                  {/* Main Heading */}
                  <h1 className="text-2xl md:text-3xl lg:text-[40px] font-black text-white leading-[1.1] tracking-tight mb-3 text-left">
                    {banner.title ? (
                      <>
                        {banner.title.split(',')[0]}<br />
                        {banner.title.includes(',') && (
                          <span className="text-[#70A83B]">{banner.title.substring(banner.title.indexOf(',') + 1).trim()}</span>
                        )}
                      </>
                    ) : (
                      <>
                        Welcome to Yali,<br />
                        <span className="text-[#70A83B]">Your Premium Marketplace</span>
                      </>
                    )}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-gray-200 text-[12px] md:text-sm font-medium max-w-md mb-5 text-left">
                    {banner.subtitle || 'Explore. Choose. Own. All your needs, in one trusted platform.'}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => banner.link && navigate(banner.link)}
                    className="bg-[#34982a] hover:bg-[#2c8123] text-white font-bold py-2 md:py-2.5 px-6 md:px-8 text-[13px] md:text-sm rounded-xl shadow-md transition-transform hover:scale-105 mb-4"
                  >
                    {banner.buttonText || 'Shop Now'}
                  </button>
                </div>
              </div>
            ))}

            {/* Trust Badges - Keep static at the bottom */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-auto pb-4 md:pb-6 z-20">
              <div className="flex items-center gap-2 md:gap-3">
                <ShieldAlert className="w-5 h-5 md:w-7 md:h-7 text-[#70A83B]" strokeWidth={1.5} />
                <div className="text-left">
                  <p className="text-[11px] md:text-[13px] font-bold text-white leading-tight">100% Secure</p>
                  <p className="text-[9px] md:text-[10px] text-gray-300 font-medium">Safe Shopping</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Package className="w-5 h-5 md:w-7 md:h-7 text-[#70A83B]" strokeWidth={1.5} />
                <div className="text-left">
                  <p className="text-[11px] md:text-[13px] font-bold text-white leading-tight">Fast Delivery</p>
                  <p className="text-[9px] md:text-[10px] text-gray-300 font-medium">On Time Every Time</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Tag className="w-5 h-5 md:w-7 md:h-7 text-[#70A83B]" strokeWidth={1.5} />
                <div className="text-left">
                  <p className="text-[11px] md:text-[13px] font-bold text-white leading-tight">Best Quality</p>
                  <p className="text-[9px] md:text-[10px] text-gray-300 font-medium">Trusted Products</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Floating Images */}
          <div className="hidden md:flex w-[45%] h-full relative z-10 items-center justify-center p-6">
            {displayBanners.map((banner, index) => (
              <div
                key={`img-${banner.id || index}`}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={banner.bgImage || banner.bg_image || banner.image}
                  alt={banner.title || 'Banner Image'}
                  className={`w-full max-w-[95%] max-h-[95%] object-contain transition-transform duration-[10000ms] ease-out ${index === currentSlide ? 'scale-105 translate-x-0' : 'scale-100 translate-x-4'}`}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            ))}
          </div>

        </div>

        {/* Glassy Overlay for the Banner */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />

        {/* 3. Slider Controls Overlay (Inside banner, glassy UI) */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 pointer-events-auto text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 pointer-events-auto text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 md:left-[75%] -translate-x-1/2 flex gap-2 md:gap-3 pointer-events-auto">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-300 shadow-sm pointer-events-auto ${index === currentSlide ? 'bg-white w-8 md:w-12' : 'bg-white/40 w-2 md:w-3 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
