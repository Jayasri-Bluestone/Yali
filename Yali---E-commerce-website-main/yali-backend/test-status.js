const http = require('http');

const data = JSON.stringify({
  status: 'Shipped',
  trackingNumber: 'AWB123',
  trackingLink: 'https://test.com',
  deliveryPartner: 'FedEx'
});

const req = http.request({
  hostname: 'localhost',
  port: 5010,
  path: '/yali_api/orders/ORD-6NGBFGV45/status',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // we need authorization token! Wait!
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
