import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, HelpCircle, ShieldCheck, Mail, MapPin, Phone, RefreshCw, Truck, CreditCard, Building2, Briefcase, Handshake, Store, Newspaper, Keyboard, Cookie } from 'lucide-react';
import { useEffect } from 'react';

// Common pages content map
const PAGE_CONTENT = {
  'help-center': { title: 'Help Center', icon: HelpCircle },
  'track-order': { title: 'Track Your Order', icon: Truck },
  'returns-refunds': { title: 'Returns & Refunds Policy', icon: RefreshCw },
  'shipping-info': { title: 'Shipping Information', icon: Truck },
  'payment-methods': { title: 'Payment Methods', icon: CreditCard },
  'faqs': { title: 'Frequently Asked Questions', icon: HelpCircle },
  'about-us': { title: 'About YALI', icon: Building2 },
  'careers': { title: 'Careers at YALI', icon: Briefcase },
  'affiliate': { title: 'Affiliate Program', icon: Handshake },
  'sell-on-yali': { title: 'Sell on YALI', icon: Store },
  'press-news': { title: 'Press & News', icon: Newspaper },
  'blog': { title: 'Our Blog', icon: Keyboard },
  'privacy-policy': { title: 'Privacy Policy', icon: ShieldCheck },
  'terms': { title: 'Terms of Service', icon: FileText },
  'cookie-policy': { title: 'Cookie Policy', icon: Cookie },
  'contact-us': { title: 'Contact Us', icon: Mail },
};

export function StaticPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId]);

  const pageInfo = PAGE_CONTENT[pageId] || { title: pageId.replace('-', ' '), icon: FileText };
  const Icon = pageInfo.icon;

  const renderContent = () => {
    switch (pageId) {
      case 'help-center':
        return (
          <div className="space-y-6 text-gray-600">
            <h3 className="text-xl font-bold text-gray-900">How can we help you today?</h3>
            <p>Welcome to the YALI Help Center. Whether you need help with an order, managing your account, or learning about our services, we're here for you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border border-gray-200 rounded-xl hover:border-[#2874f0] cursor-pointer transition-colors">
                <h4 className="font-bold text-gray-900 mb-2">Order Issues</h4>
                <p className="text-sm">Track, return, or cancel an order</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-[#2874f0] cursor-pointer transition-colors">
                <h4 className="font-bold text-gray-900 mb-2">Delivery & Shipping</h4>
                <p className="text-sm">Shipping speeds, delivery charges, and tracking</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-[#2874f0] cursor-pointer transition-colors">
                <h4 className="font-bold text-gray-900 mb-2">Payment & Wallets</h4>
                <p className="text-sm">Payment methods, YALI Wallet, and refunds</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl hover:border-[#2874f0] cursor-pointer transition-colors">
                <h4 className="font-bold text-gray-900 mb-2">Account Management</h4>
                <p className="text-sm">Change password, update addresses, and security</p>
              </div>
            </div>
          </div>
        );

      case 'privacy-policy':
        return (
          <div className="space-y-6 text-gray-600 prose max-w-none">
            <p>At YALI, we value your trust & respect your privacy. This Privacy Policy provides you with details about the manner in which your data is collected, stored & used by us.</p>
            <h3 className="text-lg font-bold text-gray-900">1. Collection of Personally Identifiable Information</h3>
            <p>We collect personal information (email address, name, phone number, physical address, etc.) from you when you set up a free account with YALI. While you can browse some sections of our site without being a registered member, certain activities (such as placing an order) do require registration.</p>
            <h3 className="text-lg font-bold text-gray-900">2. Use of Demographic / Profile Data</h3>
            <p>We use personal information to provide the services you request. To the extent we use your personal information to market to you, we will provide you the ability to opt-out of such uses.</p>
            <h3 className="text-lg font-bold text-gray-900">3. Security Precautions</h3>
            <p>Our site has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server.</p>
          </div>
        );

      case 'returns-refunds':
        return (
          <div className="space-y-6 text-gray-600">
            <p>YALI's Returns Policy ensures a smooth and hassle-free process for our customers. You can initiate a return or replacement request within the specified return window.</p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Electronics & Appliances:</strong> 7 days replacement only.</li>
              <li><strong>Clothing & Footwear:</strong> 14 days return & exchange.</li>
              <li><strong>Groceries & Perishables:</strong> Non-returnable unless defective on arrival.</li>
            </ul>
            <h3 className="text-lg font-bold text-gray-900 mt-6">Refund Process</h3>
            <p>Once your return is received and inspected by the seller, your refund will be processed to the original payment method within 3-5 business days. For Cash on Delivery orders, refunds will be credited to your YALI Wallet or bank account.</p>
          </div>
        );

      case 'shipping-info':
        return (
          <div className="space-y-6 text-gray-600">
            <p>We strive to deliver your orders as quickly and safely as possible. We partner with premier logistics companies to ensure reliable delivery.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-4">Delivery Speeds</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard Delivery:</strong> 3-5 business days (Free on orders over ₹500)</li>
              <li><strong>Express Delivery:</strong> 1-2 business days (₹99 extra)</li>
              <li><strong>Same Day Delivery:</strong> Available in select metro cities for eligible items (₹149 extra)</li>
            </ul>
            <p className="mt-4 text-sm bg-blue-50 p-4 rounded-lg text-blue-800">Note: Estimated delivery dates may vary during public holidays and mega sale events.</p>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-6 text-gray-600">
            <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-bold text-gray-800 mb-2">How do I cancel my order?</h4>
                <p className="text-sm">You can cancel your order from the "My Orders" section before it is dispatched by the seller. Once dispatched, you may refuse delivery at your doorstep.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-bold text-gray-800 mb-2">What is YALI Wallet?</h4>
                <p className="text-sm">YALI Wallet is a fast, secure payment method. You can add money to it via UPI, Credit/Debit cards, or receive instant refunds directly to the wallet.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-bold text-gray-800 mb-2">How can I track my shipment?</h4>
                <p className="text-sm">Navigate to "My Profile" &gt; "Orders", select your active order, and click on "Track Package" for real-time tracking details.</p>
              </div>
            </div>
          </div>
        );

      case 'about-us':
        return (
          <div className="space-y-6 text-gray-600">
            <p>Founded in 2026, <strong>YALI</strong> is a premier e-commerce destination committed to transforming the way you shop online.</p>
            <p>Our mission is to provide an unparalleled shopping experience by offering authentic products, competitive pricing, and ultra-fast delivery options. We connect millions of consumers with trusted local vendors and international brands.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6">Our Core Values</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Customer Obsession</li>
              <li>Authenticity and Trust</li>
              <li>Empowering Local Sellers</li>
              <li>Sustainable Logistics</li>
            </ul>
          </div>
        );
        
      case 'terms':
        return (
          <div className="space-y-6 text-gray-600 prose max-w-none">
            <p>Welcome to YALI. By using our website, you agree to these terms and conditions. Please read them carefully.</p>
            <h3 className="text-lg font-bold text-gray-900">1. Account Responsibilities</h3>
            <p>If you use YALI, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
            <h3 className="text-lg font-bold text-gray-900">2. Pricing and Availability</h3>
            <p>All prices are listed in Indian Rupees. We reserve the right to modify prices and product availability without prior notice. In the event of a pricing error, we reserve the right to cancel orders placed for the item.</p>
            <h3 className="text-lg font-bold text-gray-900">3. Vendor Policies</h3>
            <p>YALI acts as a marketplace. Products sold by third-party vendors are subject to their respective warranties and return policies, governed by YALI's overarching guarantees.</p>
          </div>
        );

      case 'contact-us':
        return (
          <div className="space-y-8">
            <p className="text-gray-600 leading-relaxed text-lg">
              We'd love to hear from you! Reach out to us using any of the methods below, or drop by our office.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0066cc] shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Headquarters</h3>
                <p className="text-gray-600">123 E-commerce Street, Digital City, DC 12345</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0066cc] shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Phone Support</h3>
                <p className="text-gray-600">+1 (800) 123-4567<br/><span className="text-sm">Mon-Fri 9am to 6pm</span></p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0066cc] shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Email Support</h3>
                <p className="text-gray-600">support@yali.com<br/><span className="text-sm">We reply within 24 hours</span></p>
              </div>
            </div>
          </div>
        );

      default:
        // Generic fallback for smaller pages like Affiliate, Careers, Sell on YALI
        return (
          <div className="prose max-w-none text-gray-600 space-y-6 text-lg leading-relaxed">
            <p>Welcome to the <strong>{pageInfo.title}</strong> page.</p>
            <p>We are constantly expanding our platform and services. Detailed information regarding this section will be published shortly.</p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center text-blue-800 mt-8">
              <h3 className="text-xl font-bold mb-2">More Information Coming Soon</h3>
              <p>Our team is currently preparing comprehensive guidelines and documentation for this portal. Stay tuned!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-[70vh] pb-20 pt-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0066cc]">
              <Icon className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 capitalize">
              {pageInfo.title}
            </h1>
          </div>

          {renderContent()}

        </div>
      </div>
    </div>
  );
}
