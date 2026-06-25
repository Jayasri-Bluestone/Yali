import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  FileImage,
  Package,
  XCircle,
  FileSpreadsheet,
  Plus,
  Tag,
  Building,
  ShieldCheck,
  Film,
  Layers,
  ShoppingCart,
  Heart,
  MapPin,
  MessageSquare,
  Trash2,
  Truck,
  RefreshCcw,
  Briefcase,
  Wallet,
  CreditCard,
  Landmark,
  ChevronDown,
  ChevronRight,
  Settings,
  Car,
  Home,
  Leaf,
  Cookie,
  Shirt,
  Megaphone,
  Star,
  Headset
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Import modular tab components
import { DashboardTab } from './modules/Dashboard/DashboardTab';
import { CustomersTab } from './modules/UserManagement/CustomersTab';
import { VendorsTab } from './modules/UserManagement/VendorsTab';
import { LocationsTab } from './modules/UserManagement/LocationsTab';
import { ReturnsTab } from './modules/OrderManagement/ReturnsTab';
import { SettlementsTab } from './modules/Finance/SettlementsTab';
import { BannersTab } from './modules/Marketing/BannersTab';
import { CouponsTab } from './modules/Marketing/CouponsTab';
import { HomeFeaturesTab } from './modules/Marketing/HomeFeaturesTab';
import { ReviewsTab } from './modules/Reviews/ReviewsTab';
import { ReportsTab } from './modules/Reports/ReportsTab';
import { PaymentGatewaysTab } from './modules/Settings/PaymentGatewaysTab';

import { FileUploadInput } from './FileUploadInput';
import { AdminPlaceholderTab } from './AdminPlaceholderTab';
import { API_URL } from '../../config';

import { RevenueAnalyticsTab } from './modules/Dashboard/RevenueAnalyticsTab';
import { SalesAnalyticsTab } from './modules/Dashboard/SalesAnalyticsTab';
import { UserAnalyticsTab } from './modules/Dashboard/UserAnalyticsTab';
import { RecentActivitiesTab } from './modules/Dashboard/RecentActivitiesTab';
import { DealersTab } from './modules/UserManagement/DealersTab';
import { PropertyAgentsTab } from './modules/UserManagement/PropertyAgentsTab';
import { StaffTab } from './modules/UserManagement/StaffTab';
import { RolesPermissionsTab } from './modules/UserManagement/RolesPermissionsTab';
import { PropertyListingsTab } from './modules/RealEstate/PropertyListingsTab';
import { ResidentialTab } from './modules/RealEstate/ResidentialTab';
import { CommercialTab } from './modules/RealEstate/CommercialTab';
import { AgriculturalLandTab } from './modules/RealEstate/AgriculturalLandTab';
import { VillasApartmentsTab } from './modules/RealEstate/VillasApartmentsTab';
import { RentalsTab } from './modules/RealEstate/RentalsTab';
import { PropertyEnquiriesTab } from './modules/RealEstate/PropertyEnquiriesTab';
import { PropertyApprovalTab } from './modules/RealEstate/PropertyApprovalTab';
import { VehicleListingsTab } from './modules/Automobiles/VehicleListingsTab';
import { BikesTab } from './modules/Automobiles/BikesTab';
import { ScootersTab } from './modules/Automobiles/ScootersTab';
import { CarsTab } from './modules/Automobiles/CarsTab';
import { SUVsTab } from './modules/Automobiles/SUVsTab';
import { CommercialVehiclesTab } from './modules/Automobiles/CommercialVehiclesTab';
import { VehicleEnquiriesTab } from './modules/Automobiles/VehicleEnquiriesTab';
import { VehicleApprovalTab } from './modules/Automobiles/VehicleApprovalTab';
import { OrganicCategoriesTab } from './modules/OrganicProducts/OrganicCategoriesTab';
import { OrganicInventoryTab } from './modules/OrganicProducts/OrganicInventoryTab';
import { OrganicSuppliersTab } from './modules/OrganicProducts/OrganicSuppliersTab';
import { OrganicReviewsTab } from './modules/OrganicProducts/OrganicReviewsTab';
import { DryFruitsCategoriesTab } from './modules/DryFruits/DryFruitsCategoriesTab';
import { DryFruitsListingsTab } from './modules/DryFruits/DryFruitsListingsTab';
import { DryFruitsInventoryTab } from './modules/DryFruits/DryFruitsInventoryTab';
import { DryFruitsPricingTab } from './modules/DryFruits/DryFruitsPricingTab';
import { DryFruitsReviewsTab } from './modules/DryFruits/DryFruitsReviewsTab';
import { FashionCategoriesTab } from './modules/FashionApparel/FashionCategoriesTab';
import { FashionMensTab } from './modules/FashionApparel/FashionMensTab';
import { FashionWomensTab } from './modules/FashionApparel/FashionWomensTab';
import { FashionKidsTab } from './modules/FashionApparel/FashionKidsTab';
import { FashionAccessoriesTab } from './modules/FashionApparel/FashionAccessoriesTab';

// Consolidated Views
import { AutomobilesView } from './modules/Automobiles/AutomobilesView';
import { OrganicProductsView } from './modules/OrganicProducts/OrganicProductsView';
import { DryFruitsView } from './modules/DryFruits/DryFruitsView';
import { CategoryOrdersView } from './modules/Shared/CategoryOrdersView';
import { StatusOrdersView } from './modules/Shared/StatusOrdersView';
import { FashionView } from './modules/Fashion/FashionView';
import { FinanceRevenueTab } from './modules/Finance/FinanceRevenueTab';
import { FinanceTransactionsTab } from './modules/Finance/FinanceTransactionsTab';
import { FinanceCommissionsTab } from './modules/Finance/FinanceCommissionsTab';
import { FinanceTaxTab } from './modules/Finance/FinanceTaxTab';
import { MarketingFeaturedTab } from './modules/Marketing/MarketingFeaturedTab';
import { MarketingPushTab } from './modules/Marketing/MarketingPushTab';
import { MarketingEmailTab } from './modules/Marketing/MarketingEmailTab';
import { ReviewsPropertyTab } from './modules/Reviews/ReviewsPropertyTab';
import { ReviewsVehicleTab } from './modules/Reviews/ReviewsVehicleTab';
import { ReviewsComplaintsTab } from './modules/Reviews/ReviewsComplaintsTab';
import { ReportsUserTab } from './modules/Reports/ReportsUserTab';
import { ReportsVendorTab } from './modules/Reports/ReportsVendorTab';
import { ReportsPropertyTab } from './modules/Reports/ReportsPropertyTab';
import { ReportsVehicleTab } from './modules/Reports/ReportsVehicleTab';
import { ReportsProductTab } from './modules/Reports/ReportsProductTab';
import { SupportRequestsTab } from './modules/Support/SupportRequestsTab';
import { SupportTicketsTab } from './modules/Support/SupportTicketsTab';
import { SupportChatTab } from './modules/Support/SupportChatTab';
import { SupportFeedbackTab } from './modules/Support/SupportFeedbackTab';
import { SettingsWebsiteTab } from './modules/Settings/SettingsWebsiteTab';
import { SettingsSEOTab } from './modules/Settings/SettingsSEOTab';
import { SettingsSocialTab } from './modules/Settings/SettingsSocialTab';
import { SettingsSecurityTab } from './modules/Settings/SettingsSecurityTab';
import { SettingsBackupTab } from './modules/Settings/SettingsBackupTab';

// Storefront & CMS
import { PageBuilderTab } from './modules/Storefront/PageBuilderTab';
import { HomeLayoutTab } from './modules/Storefront/HomeLayoutTab';

// Logistics & Delivery
import { DeliveryPartnersTab } from './modules/Logistics/DeliveryPartnersTab';
import { ShippingRulesTab } from './modules/Logistics/ShippingRulesTab';

// Advanced Finance
import { CustomerWalletsTab } from './modules/Finance/CustomerWalletsTab';
import { PendingCryptoPaymentsTab } from './modules/Finance/PendingCryptoPaymentsTab';
import { VendorSubscriptionsTab } from './modules/Finance/VendorSubscriptionsTab';

// Marketing Extensions
import { AbandonedCartsTab } from './modules/Marketing/AbandonedCartsTab';
import { WishlistsTab } from './modules/Marketing/WishlistsTab';

// Settings Extensions
import { TaxRatesTab } from './modules/Settings/TaxRatesTab';

export function AdminDashboard({
  products = [],
  setProducts,
  orders = [],
  setOrders,
  users = [],
  setUsers,
  coupons = [],
  setCoupons,
  banners = [],
  setBanners,
  onViewChange,
  userData,
  refreshProducts,
  refreshBanners,
  refreshCoupons,
  refreshOrders,
  refreshUsers,
  token,
  videos = [],
  refreshVideos,
  categoriesList = [],
  refreshCategories,
  uiCards = [],
  refreshUiCards
}) {
  const { showToast, showConfirm } = useToast();

  // Role and scope identifiers
  const isSuperAdmin = userData?.role === 'admin' && (!userData?.managed_category || userData?.managed_category === 'all');
  const isCategoryAdmin = userData?.role === 'admin' && userData?.managed_category && userData?.managed_category !== 'all';
  const isVendor = userData?.role === 'vendor';
  const adminCategory = userData?.managed_category;

  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/')[2] || 'dashboard';
  const [productSearch, setProductSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ 'Dashboard': true });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Category view tab state - tracks currently selected category details inside Categories panel
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(isCategoryAdmin ? adminCategory : 'real-estate');

  // Set default category filter based on admin category lock
  useEffect(() => {
    if (isCategoryAdmin) {
      setCategoryFilter(adminCategory);
      setSelectedCategoryTab(adminCategory);
    } else {
      setCategoryFilter('all');
    }
  }, [isCategoryAdmin, adminCategory]);

  // Modal / Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    unique_id: '',
    name: '',
    price: '',
    originalPrice: '',
    category: 'real-estate',
    image: '',
    images: '',
    returnPolicy: '7 Days Replacement',
    deliveryDays: '3',
    stock: '',
    description: '',
    badge: '',
    variants: []
  });

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    expiry: ''
  });

  // Filter lists based on role scope
  const filteredProducts = products.filter(p => {
    if (isVendor) return p.vendor_id === userData.id;
    if (isCategoryAdmin) return p.category === adminCategory;
    return true; // Super admin sees all
  });

  const filteredOrders = orders.filter(o => {
    if (isVendor) return o.items && o.items.some(i => i.vendor_id === userData.id);
    if (isCategoryAdmin) return o.category === adminCategory;
    return true; // Super admin sees all
  });

  const filteredBanners = banners.filter(b => {
    if (isCategoryAdmin) return b.category === adminCategory;
    return true;
  });

  const [walletAmount, setWalletAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // Approved vendors for assignments list (users where role = 'vendor' & status = 'active')
  const approvedVendors = users.filter(u => u.role === 'vendor' && u.status === 'active');

  // Statistics
  const totalSales = filteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalOrdersCount = filteredOrders.length;
  const pendingOrdersCount = filteredOrders.filter(o => o.status === 'Pending').length;
  const lowStockCount = filteredProducts.filter(p => (p.stock || 0) < 5).length;

  // Tab control lists based on roles
  const MENU_STRUCTURE = [
    {
      group: 'Dashboard',
      icon: TrendingUp,
      show: true,
      items: [
        { id: 'dashboard', label: 'Overview', show: true },
        { id: 'revenue-analytics', label: 'Revenue Analytics', show: isSuperAdmin || isVendor },
        { id: 'sales-analytics', label: 'Sales Analytics', show: isSuperAdmin || isVendor },
        { id: 'user-analytics', label: 'User Analytics', show: userData?.role === 'admin' },
        { id: 'recent-activities', label: 'Recent Activities', show: true },
      ]
    },
    {
      group: 'Storefront & CMS',
      icon: Layers,
      show: isSuperAdmin,
      items: [
        { id: 'page-builder', label: 'Page Builder / Custom Pages', show: true },
        { id: 'home-layout', label: 'Home Page Layout / UI Cards', show: true },
      ]
    },
    {
      group: 'User Management',
      icon: Users,
      show: userData?.role === 'admin',
      items: [
        { id: 'users', label: 'Customers', show: true },
        { id: 'vendors', label: 'Vendors', show: true },
        { id: 'dealers', label: 'Dealers', show: true },
        { id: 'property-agents', label: 'Property Agents', show: true },
        { id: 'staff', label: 'Staff', show: isSuperAdmin },
        { id: 'roles-permissions', label: 'Roles & Permissions', show: isSuperAdmin },
        { id: 'locations', label: 'Visitor Locations', show: isSuperAdmin },
      ]
    },
    {
      group: 'Real Estate',
      icon: Home,
      show: true,
      items: [
        { id: 'property-listings', label: 'Property Listings', show: true },
        { id: 'residential', label: 'Residential', show: true },
        { id: 'commercial', label: 'Commercial', show: true },
        { id: 'agricultural-land', label: 'Agricultural Land', show: true },
        { id: 'villas-apartments', label: 'Villas & Apartments', show: true },
        { id: 'rentals', label: 'Rentals', show: true },
        { id: 'property-enquiries', label: 'Property Enquiries', show: true },
        { id: 'property-approval', label: 'Property Approval', show: isSuperAdmin },
      ]
    },
    {
      group: 'Automobiles',
      icon: Car,
      show: true,
      items: [
        { id: 'vehicle-listings', label: 'Vehicle Listings', show: true },
        { id: 'bikes', label: 'Bikes', show: true },
        { id: 'scooters', label: 'Scooters', show: true },
        { id: 'cars', label: 'Cars', show: true },
        { id: 'suvs', label: 'SUVs', show: true },
        { id: 'commercial-vehicles', label: 'Commercial Vehicles', show: true },
        { id: 'vehicle-enquiries', label: 'Vehicle Enquiries', show: true },
        { id: 'vehicle-approval', label: 'Vehicle Approval', show: isSuperAdmin },
      ]
    },
    {
      group: 'Organic Products',
      icon: Leaf,
      show: true,
      items: [
        { id: 'organic-categories', label: 'Categories', show: true },
        { id: 'products', label: 'Product Listings', show: true },
        { id: 'organic-orders', label: 'Orders', show: true },
        { id: 'organic-inventory', label: 'Inventory', show: true },
        { id: 'organic-suppliers', label: 'Suppliers', show: true },
        { id: 'organic-reviews', label: 'Reviews', show: true },
      ]
    },
    {
      group: 'Dry Fruits',
      icon: Cookie,
      show: true,
      items: [
        { id: 'dryfruits-categories', label: 'Categories', show: true },
        { id: 'dryfruits-listings', label: 'Product Listings', show: true },
        { id: 'dryfruits-orders', label: 'Orders', show: true },
        { id: 'dryfruits-inventory', label: 'Inventory', show: true },
        { id: 'dryfruits-pricing', label: 'Pricing', show: true },
        { id: 'dryfruits-reviews', label: 'Reviews', show: true },
      ]
    },
    {
      group: 'Fashion & Apparel',
      icon: Shirt,
      show: true,
      items: [
        { id: 'fashion-categories', label: 'Categories', show: true },
        { id: 'fashion-mens', label: "Men's Wear", show: true },
        { id: 'fashion-womens', label: "Women's Wear", show: true },
        { id: 'fashion-kids', label: 'Kids Wear', show: true },
        { id: 'fashion-accessories', label: 'Accessories', show: true },
        { id: 'fashion-orders', label: 'Orders', show: true },
        { id: 'fashion-inventory', label: 'Inventory', show: true },
      ]
    },
    {
      group: 'Order Management',
      icon: Package,
      show: true,
      items: [
        { id: 'orders-new', label: 'New Orders', show: true },
        { id: 'orders-processing', label: 'Processing', show: true },
        { id: 'orders-shipped', label: 'Shipped', show: true },
        { id: 'orders-delivered', label: 'Delivered', show: true },
        { id: 'refunds-returns', label: 'Returns', show: true },
        { id: 'orders-cancelled', label: 'Cancelled', show: true },
      ]
    },
    {
      group: 'Logistics & Delivery',
      icon: Truck,
      show: isSuperAdmin,
      items: [
        { id: 'delivery-partners', label: 'Delivery Partners / Riders', show: true },
        { id: 'shipping-rules', label: 'Shipping Rules & Zones', show: true },
      ]
    },
    {
      group: 'Finance',
      icon: Landmark,
      show: isSuperAdmin || isVendor,
      items: [
        { id: 'finance-revenue', label: 'Revenue', show: true },
        { id: 'finance-transactions', label: 'Transactions', show: true },
        { id: 'settlements', label: 'Vendor Payouts', show: true },
        { id: 'finance-commissions', label: 'Commissions', show: true },
        { id: 'finance-tax', label: 'Tax Reports', show: true },
        { id: 'customer-wallets', label: 'Customer Wallets', show: isSuperAdmin },
        { id: 'crypto-payments', label: 'Crypto Verification', show: isSuperAdmin },
        { id: 'vendor-subscriptions', label: 'Vendor Subscriptions', show: isSuperAdmin },
      ]
    },
    {
      group: 'Marketing',
      icon: Megaphone,
      show: isSuperAdmin,
      items: [
        { id: 'storefront', label: 'Banners', show: true },
        { id: 'home-features', label: 'Home Features', show: true },
        { id: 'marketing-featured', label: 'Featured Listings', show: true },
        { id: 'coupons', label: 'Coupons', show: true },
        { id: 'marketing-push', label: 'Push Notifications', show: true },
        { id: 'marketing-email', label: 'Email Campaigns', show: true },
        { id: 'abandoned-carts', label: 'Abandoned Carts', show: true },
        { id: 'wishlists', label: 'Wishlist Analytics', show: true },
      ]
    },
    {
      group: 'Reviews & Ratings',
      icon: Star,
      show: userData?.role === 'admin',
      items: [
        { id: 'reviews', label: 'Product Reviews', show: true },
        { id: 'reviews-property', label: 'Property Reviews', show: true },
        { id: 'reviews-vehicle', label: 'Vehicle Reviews', show: true },
        { id: 'reviews-complaints', label: 'Complaint Management', show: true },
      ]
    },
    {
      group: 'Reports',
      icon: FileSpreadsheet,
      show: isSuperAdmin || isVendor,
      items: [
        { id: 'reports', label: 'Sales Reports', show: true },
        { id: 'reports-user', label: 'User Reports', show: isSuperAdmin },
        { id: 'reports-vendor', label: 'Vendor Reports', show: isSuperAdmin },
        { id: 'reports-property', label: 'Property Reports', show: true },
        { id: 'reports-vehicle', label: 'Vehicle Reports', show: true },
        { id: 'reports-product', label: 'Product Reports', show: true },
      ]
    },
    {
      group: 'Support Center',
      icon: Headset,
      show: true,
      items: [
        { id: 'support-requests', label: 'Contact Requests', show: true },
        { id: 'support-tickets', label: 'Support Tickets', show: true },
        { id: 'support-chat', label: 'Live Chat', show: true },
        { id: 'support-feedback', label: 'Feedback', show: true },
      ]
    },
    {
      group: 'Settings',
      icon: Settings,
      show: isSuperAdmin,
      items: [
        { id: 'settings-website', label: 'Website Settings', show: true },
        { id: 'payment-gateways', label: 'Payment Gateway', show: true },
        { id: 'settings-seo', label: 'SEO Settings', show: true },
        { id: 'settings-social', label: 'Social Media', show: true },
        { id: 'settings-security', label: 'Security', show: true },
        { id: 'settings-backup', label: 'Backup & Restore', show: true },
        { id: 'tax-rates', label: 'Tax & Currency Rates', show: true },
      ]
    }
  ];

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // -------------------------------------------------------------
  // API Operations
  // -------------------------------------------------------------

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Price,Category,Stock,Badge\n";
    filteredProducts.forEach(p => {
      csvContent += `"${p.id}","${p.name.replace(/"/g, '""')}",${p.price},"${p.category}",${p.stock || 0},"${p.badge || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "yali_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Products CSV exported successfully!", "success");
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast("Simulating CSV read & uploading to backend...", "info");

    // Create mock list of items matching database structure
    const mockNewProducts = [
      {
        name: 'Imported Premium Car Polish - Gloss Finish',
        price: 19.99,
        category: isCategoryAdmin ? adminCategory : 'car-accessories',
        stock: 35,
        description: 'Premium imported car polish for long-lasting shine and protection.',
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&h=500&fit=crop'
      },
      {
        name: 'Organic Wheat Flour - Whole Grain (5kg)',
        price: 8.49,
        category: isCategoryAdmin ? adminCategory : 'organic-groceries',
        stock: 3,
        description: 'Freshly ground organic whole wheat flour sourced from direct farmers.',
        image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&h=500&fit=crop'
      }
    ];

    try {
      const res = await fetch(`${API_URL}/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: mockNewProducts })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to bulk import');

      showToast(data.message, 'success');
      refreshProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showToast("Please fill in required fields", "warning");
      return;
    }

    const payload = {
      unique_id: productForm.unique_id || undefined,
      name: productForm.name,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      category: productForm.category,
      image: productForm.image,
      images: Array.isArray(productForm.images) ? productForm.images.map(s => s.trim()).filter(Boolean) : [],
      return_policy: productForm.returnPolicy,
      delivery_days: parseInt(productForm.deliveryDays) || 3,
      stock: parseInt(productForm.stock) || 0,
      description: productForm.description,
      badge: productForm.badge,
      variants: productForm.variants || []
    };

    try {
      let res;
      if (editingProduct) {
        // Edit mode
        res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Add mode
        res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      showToast(data.message || 'Product saved successfully!', 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        unique_id: '',
        name: '',
        price: '',
        originalPrice: '',
        category: isCategoryAdmin ? adminCategory : 'real-estate',
        image: '',
        images: [],
        returnPolicy: '7 Days Replacement',
        deliveryDays: '3',
        stock: '',
        description: '',
        badge: '',
        variants: []
      });
      refreshProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setProductForm({
      unique_id: p.unique_id || '',
      name: p.name,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      category: p.category,
      image: p.image || '',
      images: p.images ? (typeof p.images === 'string' && p.images.startsWith('[') ? JSON.parse(p.images) : p.images.split(',')) : [],
      returnPolicy: p.return_policy || '7 Days Replacement',
      deliveryDays: p.delivery_days ? p.delivery_days.toString() : '3',
      stock: (p.stock ?? 0).toString(),
      description: p.description || '',
      badge: p.badge || '',
      variants: Array.isArray(p.variants) ? p.variants.map(v => ({
        sku: v.sku || '',
        attributes: v.attributes || {},
        price: v.price !== null ? v.price.toString() : '',
        stock: v.stock !== null ? v.stock.toString() : ''
      })) : []
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    showConfirm("Are you sure you want to delete this product?", async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete product');

        showToast(data.message || 'Product deleted successfully', 'success');
        refreshProducts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  const handleToggleStatus = async (entity, id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    showConfirm(`Are you sure you want to change status to ${nextStatus}?`, async () => {
      try {
        const res = await fetch(`${API_URL}/admin/${entity}/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update status');

        showToast(data.message || `Status updated to ${nextStatus}`, 'success');

        // Update specific entity without reloading the page
        switch (entity) {
          case 'products': refreshProducts && refreshProducts(); break;
          case 'categories': refreshCategories && refreshCategories(); break;
          case 'banners': refreshBanners && refreshBanners(); break;
          case 'videos': refreshVideos && refreshVideos(); break;
          case 'coupons': refreshCoupons && refreshCoupons(); break;
          case 'ui-cards': refreshUiCards && refreshUiCards(); break;
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  const handleOrderStatusChange = async (orderId, newStatus, extraData = {}) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      showToast(data.message || `Order status updated to ${newStatus}`, 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOrderItemStatusChange = async (itemId, newStatus, extraData = {}) => {
    try {
      const res = await fetch(`${API_URL}/order-items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update item status');

      showToast(data.message || `Item status updated to ${newStatus}`, 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTrackingUpdate = async (orderId, updates) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tracking');

      showToast('Tracking details logged successfully', 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeliveryDateUpdate = async (orderId, deliveryDate) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/delivery-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ expectedDeliveryDate: deliveryDate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery date');

      showToast('Expected delivery date updated', 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAssignOrder = async (orderId, vendorId) => {
    if (!vendorId) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vendorId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign order');

      showToast('Order successfully assigned to vendor and notification logged!', 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    showConfirm(`Are you sure you want to change the user's status to ${nextStatus}?`, async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update status');

        showToast(data.message || `User status updated to ${nextStatus}`, 'success');
        refreshUsers();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  const handleUserRoleChange = async (userId, newRole, managedCategory) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole, managedCategory })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change role');

      showToast('Role permissions saved successfully', 'success');
      refreshUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.value) {
      showToast("Please fill in coupon details", "warning");
      return;
    }

    try {
      const url = editingCoupon ? `${API_URL}/coupons/${editingCoupon.code}` : `${API_URL}/coupons`;
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponForm.code,
          type: couponForm.type,
          value: parseFloat(couponForm.value),
          minOrder: parseFloat(couponForm.minOrder) || 0,
          expiry: couponForm.expiry
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

      showToast(`Coupon "${couponForm.code.toUpperCase()}" ${editingCoupon ? 'updated' : 'generated'}!`, 'success');
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      setCouponForm({ code: '', type: 'percentage', value: '', minOrder: '', expiry: '' });
      refreshCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = (code) => {
    showConfirm("Are you sure you want to delete this coupon?", async () => {
      try {
        const res = await fetch(`${API_URL}/coupons/${code}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

        showToast('Coupon removed', 'success');
        refreshCoupons();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  const handleEditCouponClick = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      expiry: coupon.expiry ? coupon.expiry.split('T')[0] : ''
    });
    setIsCouponModalOpen(true);
  };

  const handleBannerUpdate = async (bannerId, bannerData) => {
    try {
      const res = await fetch(`${API_URL}/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bannerData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update banner');

      showToast('Banner content updated successfully!', 'success');
      refreshBanners();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // categoriesList is now passed from App.jsx as a prop

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Left Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} h-screen`}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo / Portal Branding */}
          <div className="shrink-0 p-6 border-b border-slate-800">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
              YALI {isVendor ? 'Vendor' : 'Console'}
            </h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">Management Portal</p>
          </div>

          {/* User Profile Info Card */}
          <div className="shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-950/20">
            <div className="font-semibold truncate text-slate-200 text-sm">{userData?.name}</div>
            <div className="text-[10px] text-purple-400 font-bold capitalize mt-0.5 tracking-wide">{userData?.role} Partner</div>
            {isCategoryAdmin && (
              <div className="inline-block bg-indigo-950 text-indigo-300 font-bold px-2.5 py-0.5 rounded text-[9px] border border-indigo-850 mt-2 truncate max-w-full">
                Scope: {adminCategory}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto space-y-2 px-3 custom-scrollbar">
            {MENU_STRUCTURE.filter(g => g.show).map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroups[group.group];
              const visibleItems = group.items.filter(item => item.show);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${isExpanded ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4 shrink-0" />
                      <span className="uppercase tracking-wider text-[10px]">{group.group}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 flex flex-col gap-0.5 ml-4 border-l border-slate-700/50 pl-2">
                      {visibleItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              navigate(`/admin/${item.id}`);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${isActive
                                ? 'bg-gradient-to-r from-purple-700 to-indigo-650 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                              }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onViewChange('store')}
            className="w-full py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Back to Storefront
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('yali_token');
              window.location.reload();
            }}
            className="w-full py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Right-hand Main Content Section */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Main Content Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4.5 flex justify-between items-center shrink-0 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900 capitalize tracking-wide">
                {MENU_STRUCTURE.flatMap(g => g.items).find(t => t.id === activeTab)?.label || activeTab.replace(/-/g, ' ')} View
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                {isVendor
                  ? `Merchant console for: ${userData?.vendorDetails?.companyName || userData?.name}`
                  : (isCategoryAdmin
                    ? `Scoped Category Admin Portal - Managing Category: '${adminCategory}'`
                    : 'System-wide Super-Administrator Dashboard')}
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Products CSV
          </button>
        </header>

        {/* Content Workspace Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/70">

          <Routes>
            <Route path="/admin/dashboard" element={
              <DashboardTab
                totalSales={totalSales}
                totalOrdersCount={totalOrdersCount}
                pendingOrdersCount={pendingOrdersCount}
                lowStockCount={lowStockCount}
                isVendor={isVendor}
                filteredOrders={filteredOrders}
                users={users}
                filteredProducts={filteredProducts}
              />
            } />

            <Route path="/admin/reviews" element={
              <ReviewsTab />
            } />









            {(userData?.role === 'admin' || isVendor) && (
              <Route path="/admin/refunds-returns" element={
                <ReturnsTab token={token} userData={userData} isVendor={isVendor} />
              } />
            )}

            {(userData?.role === 'admin' || isVendor) && (
              <Route path="/admin/reports" element={
                <ReportsTab userData={userData} token={token} />
              } />
            )}

            {userData?.role === 'admin' && (
              <Route path="/admin/users" element={
                <CustomersTab
                  users={users}
                  categoriesList={categoriesList}
                  handleToggleUserStatus={handleToggleUserStatus}
                  handleUserRoleChange={handleUserRoleChange}
                  token={token}
                  showToast={showToast}
                />
              } />
            )}

            {isSuperAdmin && (
              <>


                <Route path="/admin/payment-gateways" element={
                  <PaymentGatewaysTab token={token} />
                } />
              </>
            )}

            {(isSuperAdmin || isVendor) && (
              <Route path="/admin/settlements" element={
                <SettlementsTab token={token} userData={userData} isVendor={isVendor} />
              } />
            )}



            {userData?.role === 'admin' && (
              <Route path="/admin/vendors" element={
                <VendorsTab
                  users={users}
                  handleToggleUserStatus={handleToggleUserStatus}
                  handleUserRoleChange={handleUserRoleChange}
                  categoriesList={categoriesList}
                  refreshUsers={refreshUsers}
                  token={token}
                />
              } />
            )}

            {isSuperAdmin && (
              <Route path="/admin/coupons" element={
                <CouponsTab
                  coupons={coupons}
                  setIsCouponModalOpen={setIsCouponModalOpen}
                  setEditingCoupon={setEditingCoupon}
                  setCouponForm={setCouponForm}
                  handleEditCouponClick={handleEditCouponClick}
                  handleDeleteCoupon={handleDeleteCoupon}
                  handleToggleStatus={handleToggleStatus}
                />
              } />
            )}

            {(isSuperAdmin || isCategoryAdmin) && (
              <Route path="/admin/storefront" element={
                <BannersTab
                  filteredBanners={filteredBanners}
                  banners={banners}
                  setBanners={setBanners}
                  handleBannerUpdate={handleBannerUpdate}
                  token={token}
                  handleToggleStatus={handleToggleStatus}
                />
              } />
            )}











            {isSuperAdmin && (
              <Route path="/admin/locations" element={
                <LocationsTab token={token} />
              } />
            )}







            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/revenue-analytics" element={<RevenueAnalyticsTab />} />
            <Route path="/admin/sales-analytics" element={<SalesAnalyticsTab />} />
            <Route path="/admin/user-analytics" element={<UserAnalyticsTab />} />
            <Route path="/admin/recent-activities" element={<RecentActivitiesTab />} />
            <Route path="/admin/dealers" element={<DealersTab />} />
            <Route path="/admin/property-agents" element={<PropertyAgentsTab />} />
            <Route path="/admin/staff" element={<StaffTab />} />
            <Route path="/admin/roles-permissions" element={<RolesPermissionsTab />} />
            <Route path="/admin/property-listings" element={<PropertyListingsTab />} />
            <Route path="/admin/residential" element={<ResidentialTab />} />
            <Route path="/admin/commercial" element={<CommercialTab />} />
            <Route path="/admin/agricultural-land" element={<AgriculturalLandTab />} />
            <Route path="/admin/villas-apartments" element={<VillasApartmentsTab />} />
            <Route path="/admin/rentals" element={<RentalsTab />} />
            <Route path="/admin/property-enquiries" element={<PropertyEnquiriesTab />} />
            <Route path="/admin/property-approval" element={<PropertyApprovalTab />} />
            <Route path="/admin/vehicle-listings" element={<AutomobilesView defaultTab="Cars" />} />
            <Route path="/admin/bikes" element={<AutomobilesView defaultTab="Bikes" />} />
            <Route path="/admin/scooters" element={<AutomobilesView defaultTab="Scooters" />} />
            <Route path="/admin/cars" element={<AutomobilesView defaultTab="Cars" />} />
            <Route path="/admin/suvs" element={<AutomobilesView defaultTab="SUVs" />} />
            <Route path="/admin/commercial-vehicles" element={<AutomobilesView defaultTab="Commercial" />} />
            <Route path="/admin/vehicle-enquiries" element={<VehicleEnquiriesTab />} />
            <Route path="/admin/vehicle-approval" element={<VehicleApprovalTab />} />
            
            <Route path="/admin/organic-categories" element={<OrganicProductsView defaultTab="vegetables" />} />
            <Route path="/admin/products" element={<OrganicProductsView defaultTab="vegetables" />} />
            <Route path="/admin/organic-orders" element={<CategoryOrdersView category="organic-products" categoryLabel="Organic Products" orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/organic-inventory" element={<OrganicProductsView defaultTab="vegetables" />} />
            <Route path="/admin/organic-suppliers" element={<OrganicSuppliersTab />} />
            <Route path="/admin/organic-reviews" element={<OrganicReviewsTab />} />
            
            <Route path="/admin/dryfruits-categories" element={<DryFruitsView defaultTab="nuts" />} />
            <Route path="/admin/dryfruits-listings" element={<DryFruitsView defaultTab="dried-fruits" />} />
            <Route path="/admin/dryfruits-orders" element={<CategoryOrdersView category="dry-fruits" categoryLabel="Dry Fruits" orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/dryfruits-inventory" element={<DryFruitsView defaultTab="seeds" />} />
            <Route path="/admin/dryfruits-pricing" element={<DryFruitsPricingTab />} />
            <Route path="/admin/dryfruits-reviews" element={<DryFruitsReviewsTab />} />
            
            <Route path="/admin/fashion-categories" element={<FashionView defaultTab="men" />} />
            <Route path="/admin/fashion-mens" element={<FashionView defaultTab="men" />} />
            <Route path="/admin/fashion-womens" element={<FashionView defaultTab="women" />} />
            <Route path="/admin/fashion-kids" element={<FashionView defaultTab="kids" />} />
            <Route path="/admin/fashion-accessories" element={<FashionView defaultTab="fashion-accessories" />} />
            <Route path="/admin/fashion-orders" element={<CategoryOrdersView category="fashion" categoryLabel="Fashion & Apparel" orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/fashion-inventory" element={<FashionView defaultTab="men" />} />
            <Route path="/admin/orders-new" element={<StatusOrdersView status="Pending" title="New Orders" description="Manage all new and pending orders." orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/orders-processing" element={<StatusOrdersView status="Confirmed" title="Processing Orders" description="Orders that have been confirmed and are being prepared." orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/orders-shipped" element={<StatusOrdersView status="Shipped" title="Shipped Orders" description="Orders that have been dispatched for delivery." orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/orders-delivered" element={<StatusOrdersView status="Delivered" title="Delivered Orders" description="Orders that have reached the customers." orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/orders-cancelled" element={<StatusOrdersView status="Cancelled" title="Cancelled Orders" description="Orders that were cancelled." orders={filteredOrders} onStatusChange={handleOrderStatusChange} />} />
            <Route path="/admin/finance-revenue" element={<FinanceRevenueTab />} />
            <Route path="/admin/finance-transactions" element={<FinanceTransactionsTab />} />
            <Route path="/admin/finance-commissions" element={<FinanceCommissionsTab />} />
            <Route path="/admin/finance-tax" element={<FinanceTaxTab />} />
            <Route path="/admin/marketing-featured" element={<MarketingFeaturedTab />} />
            <Route path="/admin/marketing-push" element={<MarketingPushTab />} />
            <Route path="/admin/marketing-email" element={<MarketingEmailTab />} />
            <Route path="/admin/home-features" element={<HomeFeaturesTab token={token} />} />
            <Route path="/admin/reviews-property" element={<ReviewsPropertyTab />} />
            <Route path="/admin/reviews-vehicle" element={<ReviewsVehicleTab />} />
            <Route path="/admin/reviews-complaints" element={<ReviewsComplaintsTab />} />
            <Route path="/admin/reports-user" element={<ReportsUserTab />} />
            <Route path="/admin/reports-vendor" element={<ReportsVendorTab />} />
            <Route path="/admin/reports-property" element={<ReportsPropertyTab />} />
            <Route path="/admin/reports-vehicle" element={<ReportsVehicleTab />} />
            <Route path="/admin/reports-product" element={<ReportsProductTab />} />
            <Route path="/admin/support-requests" element={<SupportRequestsTab />} />
            <Route path="/admin/support-tickets" element={<SupportTicketsTab />} />
            <Route path="/admin/support-chat" element={<SupportChatTab />} />
            <Route path="/admin/support-feedback" element={<SupportFeedbackTab />} />
            <Route path="/admin/settings-website" element={<SettingsWebsiteTab />} />
            <Route path="/admin/settings-seo" element={<SettingsSEOTab />} />
            <Route path="/admin/settings-social" element={<SettingsSocialTab />} />
            <Route path="/admin/settings-security" element={<SettingsSecurityTab />} />
            <Route path="/admin/settings-backup" element={<SettingsBackupTab />} />
            <Route path="/admin/page-builder" element={<PageBuilderTab />} />
            <Route path="/admin/home-layout" element={<HomeLayoutTab />} />
            <Route path="/admin/delivery-partners" element={<DeliveryPartnersTab />} />
            <Route path="/admin/shipping-rules" element={<ShippingRulesTab />} />
            <Route path="/admin/customer-wallets" element={<CustomerWalletsTab />} />
            <Route path="/admin/crypto-payments" element={<PendingCryptoPaymentsTab />} />
            <Route path="/admin/vendor-subscriptions" element={<VendorSubscriptionsTab />} />
            <Route path="/admin/abandoned-carts" element={<AbandonedCartsTab />} />
            <Route path="/admin/wishlists" element={<WishlistsTab />} />
            <Route path="/admin/tax-rates" element={<TaxRatesTab />} />
            <Route path="*" element={<AdminPlaceholderTab />} />
          </Routes>

        </div>
      </main>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-950">{editingProduct ? 'Edit Product Parameters' : 'Add New Listing'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unique ID / Code</label>
                  <input
                    type="text"
                    value={productForm.unique_id || ''}
                    onChange={(e) => setProductForm({ ...productForm, unique_id: e.target.value })}
                    placeholder="e.g. YALI-PROD-0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    disabled={isCategoryAdmin || (isVendor && !!userData?.managed_category && userData.managed_category !== 'all')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer disabled:opacity-75 disabled:bg-gray-100"
                  >
                    {categoriesList
                      .filter(c => {
                        if (isCategoryAdmin) return c.value === adminCategory;
                        if (isVendor && userData?.managed_category && userData.managed_category !== 'all') return c.value === userData.managed_category;
                        return true;
                      })
                      .map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
              <FileUploadInput
                label="Main Product Image"
                type="image"
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
                accept="image/*"
                placeholder="https://images.unsplash.com/photo-..."
                token={token}
              />
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-gray-700">Gallery Images (Slider)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages = Array.isArray(productForm.images) ? productForm.images : [];
                      setProductForm({ ...productForm, images: [...currentImages, ''] });
                    }}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    + Add Image
                  </button>
                </div>
                {Array.isArray(productForm.images) && productForm.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex gap-2 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                    <div className="flex-1">
                      <FileUploadInput
                        label={`Gallery Image ${idx + 1}`}
                        type="image"
                        value={typeof imgUrl === 'string' ? imgUrl.trim() : ''}
                        onChange={(url) => {
                          const currentImages = [...productForm.images];
                          currentImages[idx] = url;
                          setProductForm({ ...productForm, images: currentImages });
                        }}
                        accept="image/*"
                        token={token}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentImages = [...productForm.images];
                        currentImages.splice(idx, 1);
                        setProductForm({ ...productForm, images: currentImages });
                      }}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors h-fit self-end mb-1 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {(!Array.isArray(productForm.images) || productForm.images.length === 0) && (
                  <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    No gallery images added yet.
                  </div>
                )}
              </div>

              {/* Variant Builder */}
              <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-indigo-900">Product Variants</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentVars = Array.isArray(productForm.variants) ? productForm.variants : [];
                      setProductForm({ ...productForm, variants: [...currentVars, { sku: '', attributes: {}, price: '', stock: '', image: '' }] });
                    }}
                    className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 transition-colors cursor-pointer"
                  >
                    + Add Variant
                  </button>
                </div>
                {Array.isArray(productForm.variants) && productForm.variants.map((variant, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-indigo-200 shadow-sm relative group">
                    <div className="flex flex-wrap gap-2 items-start">
                      <div className="w-full sm:w-auto flex-1">
                        <input
                          type="text"
                          placeholder="Variant Attributes (e.g. Size: M, Color: Red)"
                          value={variant.attributesString !== undefined ? variant.attributesString : Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          onChange={(e) => {
                            const newVars = [...productForm.variants];
                            newVars[idx].attributesString = e.target.value;
                            const pairs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            const attrs = {};
                            pairs.forEach(p => {
                              const [k, v] = p.split(':');
                              if (k && v) attrs[k.trim()] = v.trim();
                            });
                            newVars[idx].attributes = attrs;
                            setProductForm({ ...productForm, variants: newVars });
                          }}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="text-[9px] text-gray-400 mt-0.5">Format: "Key: Value, Key: Value"</div>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => {
                            const newVars = [...productForm.variants];
                            newVars[idx].price = e.target.value;
                            setProductForm({ ...productForm, variants: newVars });
                          }}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => {
                            const newVars = [...productForm.variants];
                            newVars[idx].stock = e.target.value;
                            setProductForm({ ...productForm, variants: newVars });
                          }}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newVars = [...productForm.variants];
                          newVars.splice(idx, 1);
                          setProductForm({ ...productForm, variants: newVars });
                        }}
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors mt-0.5"
                        title="Remove variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-full mt-1">
                      <FileUploadInput
                        label={`Variant Image (Optional)`}
                        type="image"
                        value={variant.image || ''}
                        onChange={(url) => {
                          const newVars = [...productForm.variants];
                          newVars[idx].image = url;
                          setProductForm({ ...productForm, variants: newVars });
                        }}
                        accept="image/*"
                        token={token}
                      />
                    </div>
                  </div>
                ))}
                {(!Array.isArray(productForm.variants) || productForm.variants.length === 0) && (
                  <div className="text-center py-4 text-xs text-indigo-400 border border-dashed border-indigo-200 rounded-lg">
                    No variants added. Product will be treated as a single item.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={productForm.badge}
                  onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  placeholder="New, Popular, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Return Policy</label>
                  <input
                    type="text"
                    value={productForm.returnPolicy}
                    onChange={(e) => setProductForm({ ...productForm, returnPolicy: e.target.value })}
                    placeholder="e.g. 7 Days Replacement"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Days</label>
                  <input
                    type="number"
                    value={productForm.deliveryDays}
                    onChange={(e) => setProductForm({ ...productForm, deliveryDays: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Product changes' : 'Launch Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null); setCouponForm({ code: '', type: 'percentage', value: '', minOrder: '', expiry: '' }); }} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitCoupon} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none uppercase"
                  placeholder="e.g. SUMMER20"
                  required
                  disabled={!!editingCoupon}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Coupon Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order Criteria ($)</label>
                <input
                  type="number"
                  value={couponForm.minOrder}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={couponForm.expiry}
                  onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none cursor-pointer"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  {editingCoupon ? 'Update Coupon' : 'Generate Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCouponModalOpen(false); setEditingCoupon(null); setCouponForm({ code: '', type: 'percentage', value: '', minOrder: '', expiry: '' }); }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
