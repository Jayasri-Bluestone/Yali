import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#22d3ee] via-[#0066cc] to-[#10b981] rounded-lg" />
              <span className="text-xl font-bold text-white">YALI</span>
            </div>
            <p className="mb-4 text-sm">
              Your one-stop destination for all your shopping needs. Quality products, great prices, and exceptional service.
            </p>
            <div className="flex gap-3">
              <button className="w-9 h-9 bg-gray-800 hover:bg-[#0066cc] rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </button>
              <button className="w-9 h-9 bg-gray-800 hover:bg-[#0066cc] rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="w-9 h-9 bg-gray-800 hover:bg-[#0066cc] rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </button>
              <button className="w-9 h-9 bg-gray-800 hover:bg-[#0066cc] rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/page/help-center" className="hover:text-[#10b981] transition-colors">Help Center</Link></li>
              <li><Link to="/page/track-order" className="hover:text-[#10b981] transition-colors">Track Order</Link></li>
              <li><Link to="/page/returns-refunds" className="hover:text-[#10b981] transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/page/shipping-info" className="hover:text-[#10b981] transition-colors">Shipping Info</Link></li>
              <li><Link to="/page/payment-methods" className="hover:text-[#10b981] transition-colors">Payment Methods</Link></li>
              <li><Link to="/page/faqs" className="hover:text-[#10b981] transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/page/about-us" className="hover:text-[#10b981] transition-colors">About Us</Link></li>
              <li><Link to="/page/careers" className="hover:text-[#10b981] transition-colors">Careers</Link></li>
              <li><Link to="/page/affiliate" className="hover:text-[#10b981] transition-colors">Affiliate Program</Link></li>
              <li><Link to="/page/sell-on-yali" className="hover:text-[#10b981] transition-colors">Sell on YALI</Link></li>
              <li><Link to="/page/press-news" className="hover:text-[#10b981] transition-colors">Press & News</Link></li>
              <li><Link to="/page/blog" className="hover:text-[#10b981] transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>123 E-commerce Street, Digital City, DC 12345</span>
              </li>
              <li className="flex gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>support@yali.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2 text-sm">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-[#0066cc] to-[#10b981] text-white rounded font-medium text-sm hover:shadow-lg transition-shadow">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-center md:text-left">
              © 2026 YALI. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link to="/page/privacy-policy" className="hover:text-[#10b981] transition-colors">Privacy Policy</Link>
              <Link to="/page/terms" className="hover:text-[#10b981] transition-colors">Terms of Service</Link>
              <Link to="/page/cookie-policy" className="hover:text-[#10b981] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
