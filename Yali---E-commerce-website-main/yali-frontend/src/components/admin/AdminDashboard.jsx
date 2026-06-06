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
  Heart
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Import modular tab components
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { OrdersTab } from './OrdersTab';
import { CustomersTab } from './CustomersTab';
import { AdminsTab } from './AdminsTab';
import { VendorsTab } from './VendorsTab';
import { CouponsTab } from './CouponsTab';
import { BannersTab } from './BannersTab';
import { VideosTab } from './VideosTab';
import { UICardsTab } from './UICardsTab';
import { CartsTab } from './CartsTab';
import { WishlistsTab } from './WishlistsTab';
import { FileUploadInput } from './FileUploadInput';
import { API_URL } from '../../config';

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
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    stock: '',
    description: '',
    badge: ''
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
    if (isVendor) return o.assigned_vendor_id === userData.id;
    if (isCategoryAdmin) return o.category === adminCategory;
    return true; // Super admin sees all
  });

  const filteredBanners = banners.filter(b => {
    if (isCategoryAdmin) return b.category === adminCategory;
    return true;
  });

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
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, show: true },
    { id: 'products', label: 'Products', icon: ShoppingBag, show: true },
    { id: 'categories', label: 'Categories', icon: Tag, show: userData?.role === 'admin' },
    { id: 'orders', label: 'Orders', icon: Package, show: true },
    { id: 'users', label: 'Customers', icon: Users, show: userData?.role === 'admin' },
    { id: 'admins', label: 'Administrators', icon: ShieldCheck, show: isSuperAdmin },
    { id: 'vendors', label: 'Vendor Partners', icon: Building, show: userData?.role === 'admin' },
    { id: 'coupons', label: 'Coupons', icon: Percent, show: isSuperAdmin },
    { id: 'storefront', label: 'Banners', icon: FileImage, show: isSuperAdmin || isCategoryAdmin },
    { id: 'ui-cards', label: 'Site Cards', icon: Layers, show: isSuperAdmin },
    { id: 'videos', label: 'Spotlight Videos', icon: Film, show: isSuperAdmin || isCategoryAdmin },
    { id: 'carts', label: 'User Carts', icon: ShoppingCart, show: isSuperAdmin },
    { id: 'wishlists', label: 'Wishlists', icon: Heart, show: isSuperAdmin }
  ].filter(t => t.show);

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
      stock: parseInt(productForm.stock) || 0,
      description: productForm.description,
      badge: productForm.badge
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
        stock: '',
        description: '',
        badge: ''
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
      stock: (p.stock ?? 0).toString(),
      description: p.description || '',
      badge: p.badge || ''
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
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      showToast(data.message || `Order status updated to ${newStatus}`, 'success');
      refreshOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTrackingUpdate = async (orderId, trackingNum) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber: trackingNum })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tracking');

      showToast('Tracking details logged successfully', 'success');
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
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl relative z-20">
        <div>
          {/* Logo / Portal Branding */}
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
              YALI {isVendor ? 'Vendor' : 'Console'}
            </h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">Management Portal</p>
          </div>

          {/* User Profile Info Card */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/20">
            <div className="font-semibold truncate text-slate-200 text-sm">{userData?.name}</div>
            <div className="text-[10px] text-purple-400 font-bold capitalize mt-0.5 tracking-wide">{userData?.role} Partner</div>
            {isCategoryAdmin && (
              <div className="inline-block bg-indigo-950 text-indigo-300 font-bold px-2.5 py-0.5 rounded text-[9px] border border-indigo-850 mt-2 truncate max-w-full">
                Scope: {adminCategory}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto space-y-1.5 px-3">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/admin/${tab.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-650 text-white shadow-md shadow-indigo-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
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
        <header className="bg-white border-b border-gray-200 px-8 py-4.5 flex justify-between items-center shrink-0 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-gray-900 capitalize tracking-wide">
              {tabs.find(t => t.id === activeTab)?.label} View
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              {isVendor 
                ? `Merchant console for: ${userData?.vendorDetails?.companyName || userData?.name}`
                : (isCategoryAdmin 
                    ? `Scoped Category Admin Portal - Managing Category: '${adminCategory}'`
                    : 'System-wide Super-Administrator Dashboard')}
            </p>
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

            <Route path="/admin/products" element={
              <ProductsTab
                filteredProducts={filteredProducts}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categoriesList={categoriesList}
                isCategoryAdmin={isCategoryAdmin}
                adminCategory={adminCategory}
                handleImportCSV={handleImportCSV}
                handleExportCSV={handleExportCSV}
                setIsProductModalOpen={setIsProductModalOpen}
                setEditingProduct={setEditingProduct}
                setProductForm={setProductForm}
                handleEditClick={handleEditClick}
                handleDeleteProduct={handleDeleteProduct}
                handleToggleStatus={handleToggleStatus}
              />
            } />

            {userData?.role === 'admin' && (
              <Route path="/admin/categories" element={
                <CategoriesTab
                  products={products}
                  categoriesList={categoriesList}
                  isCategoryAdmin={isCategoryAdmin}
                  adminCategory={adminCategory}
                  selectedCategoryTab={selectedCategoryTab}
                  setSelectedCategoryTab={setSelectedCategoryTab}
                  setEditingProduct={setEditingProduct}
                  setProductForm={setProductForm}
                  setIsProductModalOpen={setIsProductModalOpen}
                  handleEditClick={handleEditClick}
                  handleDeleteProduct={handleDeleteProduct}
                  handleToggleStatus={handleToggleStatus}
                />
              } />
            )}

            <Route path="/admin/orders" element={
              <OrdersTab
                filteredOrders={filteredOrders}
                isSuperAdmin={isSuperAdmin}
                approvedVendors={approvedVendors}
                handleOrderStatusChange={handleOrderStatusChange}
                handleAssignOrder={handleAssignOrder}
                handleTrackingUpdate={handleTrackingUpdate}
              />
            } />

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
              <Route path="/admin/admins" element={
                <AdminsTab
                  users={users}
                  categoriesList={categoriesList}
                  handleToggleUserStatus={handleToggleUserStatus}
                  handleUserRoleChange={handleUserRoleChange}
                />
              } />
            )}

            {userData?.role === 'admin' && (
              <Route path="/admin/vendors" element={
                <VendorsTab
                  users={users}
                  handleToggleUserStatus={handleToggleUserStatus}
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

            {(isSuperAdmin || isCategoryAdmin) && (
              <Route path="/admin/videos" element={
                <VideosTab
                  videos={videos}
                  categoriesList={categoriesList}
                  isCategoryAdmin={isCategoryAdmin}
                  adminCategory={adminCategory}
                  token={token}
                  refreshVideos={refreshVideos}
                  showToast={showToast}
                  handleToggleStatus={handleToggleStatus}
                />
              } />
            )}

            {isSuperAdmin && (
              <Route path="/admin/ui-cards" element={
                <UICardsTab 
                  token={token} 
                  showToast={showToast} 
                  uiCards={uiCards}
                  handleToggleStatus={handleToggleStatus}
                />
              } />
            )}

            {isSuperAdmin && (
              <Route path="/admin/carts" element={
                <CartsTab token={token} showToast={showToast} />
              } />
            )}

            {isSuperAdmin && (
              <Route path="/admin/wishlists" element={
                <WishlistsTab token={token} showToast={showToast} />
              } />
            )}
            
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
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
                    disabled={isCategoryAdmin}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    {categoriesList.map(c => (
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
                label="Product Image"
                type="image"
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
                accept="image/*"
                placeholder="https://images.unsplash.com/photo-..."
                token={token}
              />
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
