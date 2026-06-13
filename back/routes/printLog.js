const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

// router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM print_log');
    const total = countResult[0].total;

    const [logs] = await db.query(
      'SELECT * FROM print_log ORDER BY print_time DESC LIMIT ? OFFSET ?',
      [parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize)]
    );

    const result = [];
    for (const log of logs) {
      const [orders] = await db.query(
        'SELECT order_no, pickup_code, total_amount, create_time FROM order_info WHERE order_no = ?',
        [log.order_no]
      );

      const [items] = await db.query(
        'SELECT product_name, price, quantity FROM order_item WHERE order_no = ?',
        [log.order_no]
      );

      result.push({
        ...log,
        order_no: orders[0]?.order_no || log.order_no,
        pickup_code: orders[0]?.pickup_code || '-',
        total_amount: orders[0]?.total_amount || '0.00',
        create_time: orders[0]?.create_time || log.print_time,
        items
      });
    }

    res.json({ code: 200, data: result, total });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取打印日志失败', error: error.message });
  }
});

module.exports = router;
