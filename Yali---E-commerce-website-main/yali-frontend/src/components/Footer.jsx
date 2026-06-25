import { Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#031d59] to-[#004dc9] mt-12 font-sans border-t-0">
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* 1. Brand & Socials */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 cursor-pointer mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-[#34982a] font-black text-xl italic tracking-tighter">Y</span>
              </div>
              <span className="text-2xl font-black text-white tracking-wide">
                YALI
              </span>
            </Link>
            <p className="text-white/80 text-[13px] leading-relaxed mb-6 font-medium pr-4">
              Your one-stop destination for properties, vehicles, organic products, fashion, and more. Everything you need, all in one trusted platform.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 2. Shop by Category */}
          <div>
            <h3 className="text-white font-bold text-[15px] mb-5">Shop by Category</h3>
            <ul className="space-y-3">
              <li><Link to="/search?category=residential" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Properties Land</Link></li>
              <li><Link to="/search?category=new-vehicles" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Vehicles</Link></li>
              <li><Link to="/search?category=organic" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Organic Products</Link></li>
              <li><Link to="/search?category=nuts" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Dry Fruits</Link></li>
              <li><Link to="/search?category=women" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Dresses</Link></li>
              <li><Link to="/deals" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Deals</Link></li>
              <li><Link to="/new-arrivals" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* 3. Customer Service */}
          <div>
            <h3 className="text-white font-bold text-[15px] mb-5">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/page/about-us" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/page/contact" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/my-orders" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/page/faqs" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/page/shipping-info" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/page/returns-refunds" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/page/terms" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* 4. My Account */}
          <div>
            <h3 className="text-white font-bold text-[15px] mb-5">My Account</h3>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Orders</Link></li>
              <li><Link to="/wishlist" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/compare" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Compare</Link></li>
              <li><Link to="/notifications" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Notifications</Link></li>
              <li><Link to="/settings" className="text-white/80 text-[13px] font-medium hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          {/* 5. Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-[15px] mb-5">Newsletter</h3>
            <p className="text-white/80 text-[13px] leading-relaxed mb-4 font-medium">
              Subscribe to get updates on new arrivals, offers & more.
            </p>
            <div className="flex items-center w-full max-w-[300px]">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-l-md text-[13px] text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-[#34982a] hover:bg-[#2c8123] text-white px-4 py-2.5 rounded-r-md transition-colors flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-[12px] font-medium">
            © 2026 YALI. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-70 hover:opacity-100 transition-all cursor-pointer invert brightness-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-70 hover:opacity-100 transition-all cursor-pointer brightness-[200] grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-70 hover:opacity-100 transition-all cursor-pointer invert brightness-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G Pay" className="h-4 opacity-70 hover:opacity-100 transition-all cursor-pointer invert brightness-0" />
          </div>
        </div>

      </div>
    </footer>
  );
}
