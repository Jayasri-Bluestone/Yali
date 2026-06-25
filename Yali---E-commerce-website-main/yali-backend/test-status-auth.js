const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, email: 'admin@yali.com', role: 'admin' },
  'yali_super_secure_secret_key_2026',
  { expiresIn: '24h' }
);

const putData = JSON.stringify({
  status: 'Packed',
  trackingNumber: 'AWB123',
  trackingLink: 'https://test.com',
  deliveryPartner: 'FedEx'
});

const putReq = http.request({
  hostname: 'localhost',
  port: 5010,
  path: '/yali_api/orders/ORD-6NGBFGV45/status',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(putData),
    'Authorization': `Bearer ${token}`
  }
}, r2 => {
  let b2 = '';
  r2.on('data', d => b2 += d);
  r2.on('end', () => console.log('Response:', r2.statusCode, b2));
});
putReq.write(putData);
putReq.end();
