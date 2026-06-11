import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, RefreshCcw, CreditCard, HelpCircle, Briefcase, FileText, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const PAGE_DATA = {
  'help-center': {
    title: 'Help Center & Support',
    icon: HelpCircle,
    content: (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">How can we help you today?</h3>
        <p className="text-gray-600">Browse through our help topics below or contact our 24/7 support team.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#0066cc] mb-2">Track Your Order</h4>
            <p className="text-sm text-gray-600 mb-4">View the current status and location of your recent orders.</p>
            <Link to="/my-orders" className="text-sm font-semibold text-[#10b981]">View Orders →</Link>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#0066cc] mb-2">Contact Customer Care</h4>
            <p className="text-sm text-gray-600 mb-4">Email: support@yali.com<br/>Phone: +1 (800) 123-4567</p>
            <span className="text-sm font-semibold text-[#10b981]">Available 24/7</span>
          </div>
        </div>
      </div>
    )
  },
  'returns-refunds': {
    title: 'Returns & Refunds Policy',
    icon: RefreshCcw,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-xl font-bold text-gray-900">7-Day Easy Returns</h3>
        <p>We want you to be completely satisfied with your purchase. You can return most items within 7 days of delivery for a full refund or exchange.</p>
        
        <h4 className="font-bold text-gray-900 mt-6">Conditions for Return:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Items must be unused and in original condition.</li>
          <li>Original tags, packaging, and accessories must be intact.</li>
          <li>Certain categories like intimate wear, personalized items, and perishables are non-returnable.</li>
        </ul>

        <h4 className="font-bold text-gray-900 mt-6">Refund Process:</h4>
        <p>Once we receive and inspect your returned item, we will process your refund. Funds will reflect in your original payment method within 5-7 business days.</p>
      </div>
    )
  },
  'shipping-info': {
    title: 'Shipping & Delivery',
    icon: Truck,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-xl font-bold text-gray-900">Fast and Reliable Delivery</h3>
        <p>YALI partners with premium logistics providers to ensure your orders reach you safely and on time.</p>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
          <h4 className="font-bold text-gray-900 mb-2">Delivery Timelines</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">Metro Cities:</span> 2-3 Business Days</li>
            <li><span className="font-semibold">Tier 2/3 Cities:</span> 3-5 Business Days</li>
            <li><span className="font-semibold">Remote Areas:</span> 5-7 Business Days</li>
          </ul>
        </div>

        <h4 className="font-bold text-gray-900 mt-6">Shipping Charges</h4>
        <p>Enjoy <span className="font-bold text-green-600">FREE SHIPPING</span> on all orders above ₹999. For orders below ₹999, a nominal flat rate of ₹99 applies.</p>
      </div>
    )
  },
  'payment-methods': {
    title: 'Secure Payment Options',
    icon: CreditCard,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-xl font-bold text-gray-900">100% Safe Payments</h3>
        <p>We use industry-standard encryption to protect your payment details. We offer multiple convenient ways to pay for your order:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-900">Credit / Debit Cards</h4>
            <p className="text-sm mt-1">Visa, MasterCard, RuPay, and American Express accepted.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-900">UPI Payments</h4>
            <p className="text-sm mt-1">Pay instantly using Google Pay, PhonePe, Paytm, or BHIM.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-900">Net Banking</h4>
            <p className="text-sm mt-1">Direct bank transfer from all major national and private banks.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-900">Cash on Delivery (COD)</h4>
            <p className="text-sm mt-1">Pay in cash when your package arrives at your doorstep.</p>
          </div>
        </div>
      </div>
    )
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    icon: HelpCircle,
    content: (
      <div className="space-y-6 text-gray-700">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold text-gray-900 mb-2">How do I cancel my order?</h4>
            <p className="text-sm">You can cancel your order from the 'My Orders' section before it is marked as 'Shipped'. Once shipped, you can refuse the delivery.</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold text-gray-900 mb-2">Are there any hidden fees?</h4>
            <p className="text-sm">No. The total price displayed at checkout is the final amount you pay, inclusive of all applicable taxes.</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-bold text-gray-900 mb-2">Do you deliver internationally?</h4>
            <p className="text-sm">Currently, YALI only operates and delivers within the domestic boundaries. We are working on expanding globally soon!</p>
          </div>
        </div>
      </div>
    )
  },
  'about-us': {
    title: 'About YALI',
    icon: FileText,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-2xl font-bold text-gray-900">Redefining E-Commerce</h3>
        <p>Founded with a vision to make quality products accessible to everyone, YALI is your trusted destination for online shopping.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">Our Mission</h4>
            <p className="text-sm text-blue-800">To deliver joy to your doorstep with authentic products and unbeatable prices.</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-xl">
            <h4 className="font-bold text-emerald-900 mb-2">Our Promise</h4>
            <p className="text-sm text-emerald-800">100% genuine brands, secure transactions, and a customer-first approach.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">Our Network</h4>
            <p className="text-sm text-purple-800">Partnering with over 10,000 verified sellers to bring you the widest selection.</p>
          </div>
        </div>
      </div>
    )
  },
  'careers': {
    title: 'Careers at YALI',
    icon: Briefcase,
    content: null // Content is fetched dynamically
  },
  'affiliate': {
    title: 'YALI Affiliate Program',
    icon: FileText,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-xl font-bold text-gray-900">Earn with every referral!</h3>
        <p>Join the YALI Affiliate Program and earn competitive commission rates by promoting millions of products.</p>
        
        <ul className="list-disc pl-5 space-y-2 mt-4">
          <li><strong>High Conversion Rates:</strong> Our trusted brand ensures high conversion from your traffic.</li>
          <li><strong>Up to 10% Commission:</strong> Earn attractive fees across different product categories.</li>
          <li><strong>Easy Tracking:</strong> Real-time dashboard to track your links and earnings.</li>
        </ul>
        <button className="mt-6 px-6 py-3 bg-[#0066cc] text-white font-bold rounded-xl hover:shadow-lg transition-shadow">Join Now</button>
      </div>
    )
  },
  'sell-on-yali': {
    title: 'Sell on YALI',
    icon: Briefcase,
    content: (
      <div className="space-y-6 text-gray-700">
        <h3 className="text-2xl font-bold text-gray-900">Become a YALI Vendor</h3>
        <p>Reach millions of customers across the country. Grow your business with our extensive logistics and fulfillment network.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">1</div>
            <h4 className="font-bold">Register</h4>
            <p className="text-xs mt-2 text-gray-500">Sign up with your GST and business details.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">2</div>
            <h4 className="font-bold">List Products</h4>
            <p className="text-xs mt-2 text-gray-500">Upload your catalog and set your pricing.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">3</div>
            <h4 className="font-bold">Start Selling</h4>
            <p className="text-xs mt-2 text-gray-500">Receive orders and watch your business grow.</p>
          </div>
        </div>
      </div>
    )
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <p><strong>Last Updated: June 2026</strong></p>
        <p>Your privacy is important to us. This Privacy Policy explains how YALI collects, uses, and protects your personal information when you use our website.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">1. Information We Collect</h4>
        <p>We collect information you provide directly to us (like your name, address, and email when creating an account), as well as automated information (like cookies and browsing history) to improve your experience.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">2. How We Use Your Information</h4>
        <p>Your data is used to process orders, deliver products, communicate regarding your account, and personalize your shopping experience. We do not sell your personal data to third parties.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">3. Data Security</h4>
        <p>We implement stringent security measures including SSL encryption to safeguard your data against unauthorized access.</p>
      </div>
    )
  },
  'terms': {
    title: 'Terms of Service',
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>Welcome to YALI. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">1. Account Responsibilities</h4>
        <p>You are responsible for maintaining the confidentiality of your account credentials. Any activities under your account are your responsibility.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">2. Pricing and Availability</h4>
        <p>All prices are subject to change without notice. We reserve the right to cancel orders if an item is mispriced or out of stock.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">3. Limitation of Liability</h4>
        <p>YALI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or products purchased.</p>
      </div>
    )
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>YALI uses cookies to ensure you get the best experience on our website.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">What are cookies?</h4>
        <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep your cart updated, and analyze site traffic.</p>
        
        <h4 className="font-bold text-gray-900 text-base mt-4">Managing Cookies</h4>
        <p>You can choose to accept or decline cookies through your browser settings. However, declining essential cookies may prevent you from completing purchases on our platform.</p>
      </div>
    )
  }
};

export function StaticPage() {
  const { slug } = useParams();
  const pageData = PAGE_DATA[slug];

  const [careers, setCareers] = useState([]);
  const [loadingCareers, setLoadingCareers] = useState(false);

  useEffect(() => {
    if (slug === 'careers') {
      setLoadingCareers(true);
      fetch(`${API_URL}/careers`)
        .then(res => res.json())
        .then(data => setCareers(data || []))
        .catch(err => console.error("Failed to fetch careers:", err))
        .finally(() => setLoadingCareers(false));
    }
  }, [slug]);

  if (!pageData) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="px-6 py-3 bg-[#0066cc] text-white font-bold rounded-xl shadow-md hover:bg-[#0052a3] transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  const Icon = pageData.icon;

  const renderContent = () => {
    if (slug === 'careers') {
      return (
        <div className="space-y-6 text-gray-700">
          <h3 className="text-xl font-bold text-gray-900">Build the future of retail with us</h3>
          <p>At YALI, we are always looking for passionate, innovative thinkers to join our diverse team.</p>
          
          <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="font-bold text-gray-900">Current Openings</h4>
            </div>
            
            {loadingCareers ? (
              <div className="p-8 text-center text-gray-500">Loading open positions...</div>
            ) : careers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">There are currently no open positions. Please check back later.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {careers.map(career => (
                  <div key={career.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex-1">
                      <h5 className="font-bold text-[#0066cc] text-lg">{career.title}</h5>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {career.location}</span>
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg font-medium text-gray-700">{career.type}</span>
                      </div>
                      {career.description && (
                        <p className="text-sm mt-3 text-gray-600 line-clamp-2">{career.description}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => alert(`Thanks for your interest in the ${career.title} position! This is a demo feature.`)}
                      className="shrink-0 px-6 py-2.5 bg-[#0066cc] text-white rounded-xl text-sm font-bold hover:bg-[#0052a3] transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    return pageData.content;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066cc] hover:text-[#0052a3] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-12 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Icon className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{pageData.title}</h1>
            </div>
          </div>
          <div className="p-8 sm:p-12">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
