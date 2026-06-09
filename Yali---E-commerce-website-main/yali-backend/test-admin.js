const { pool } = require('./db');
pool.query("SELECT id, email, role FROM users WHERE role LIKE '%admin%'")
  .then(([rows]) => {
    console.log(rows);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
