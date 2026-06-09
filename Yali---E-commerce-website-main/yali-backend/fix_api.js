const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/'\/api\//g, "'/yali_api/");
c = c.replace(/"\/api\//g, '"/yali_api/');
c = c.replace(/`\/api\//g, '`/yali_api/');
fs.writeFileSync('server.js', c);
console.log('Replaced all API paths.');
