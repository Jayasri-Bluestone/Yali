const { pool } = require('./db');

async function test() {
  try {
    const [rows] = await pool.query("SELECT status, status_history FROM orders WHERE order_id = 'ORD-6NGBFGV45'");
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
test();
