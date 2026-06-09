const jwt = require('jsonwebtoken');
const axios = require('axios');
const JWT_SECRET = process.env.JWT_SECRET || 'yali_super_secure_secret_key_2026';

const token = jwt.sign(
  { id: 3, email: 'admin@yali.com', role: 'admin', name: 'Admin', managed_category: 'all' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

axios.get('http://localhost:5000/api/admin/reviews', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  console.log('Success:', res.data);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.response.status, err.response.data);
  process.exit(1);
});
