const fs = require('fs');
const path = require('path');

const filesToFix = [
  'modules/UserManagement/CustomersTab.jsx',
  'modules/UserManagement/VendorsTab.jsx',
  'modules/UserManagement/LocationsTab.jsx',
  'modules/OrderManagement/ReturnsTab.jsx',
  'modules/Finance/SettlementsTab.jsx',
  'modules/Marketing/BannersTab.jsx',
  'modules/Marketing/HomeFeaturesTab.jsx',
  'modules/Marketing/CouponsTab.jsx',
  'modules/Reviews/ReviewsTab.jsx',
  'modules/Reports/ReportsTab.jsx',
  'modules/Settings/PaymentGatewaysTab.jsx',
  'modules/Dashboard/DashboardTab.jsx'
];

const basePath = 'd:/Project/YALI/Yali/Yali---E-commerce-website-main/yali-frontend/src/components/admin/';

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix API_URL config import
    content = content.replace(/from\s+['"]\.\.\/\.\.\/config['"]/g, 'from "../../../../config"');
    
    // Fix context imports
    content = content.replace(/from\s+['"]\.\.\/\.\.\/context\/([^'"]+)['"]/g, 'from "../../../../context/$1"');
    
    // Fix generic admin components (ToggleSwitch, Pagination, FileUploadInput, etc)
    // Things that were `./Component` now need to be `../../Component`
    content = content.replace(/from\s+['"]\.\/(ToggleSwitch|Pagination|FileUploadInput)['"]/g, 'from "../../$1"');

    // Fix utils imports
    content = content.replace(/from\s+['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, 'from "../../../../utils/$1"');

    // Fix other modules if any were referenced as `./modules/...`?
    // They are now in `modules/[Category]/` so `./modules/...` would be `../...`
    content = content.replace(/from\s+['"]\.\/modules\/([^'"]+)['"]/g, 'from "../$1"');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
