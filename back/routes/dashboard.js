const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

// router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [productCount] = await db.query('SELECT COUNT(*) as total FROM product');
    const [orderCount] = await db.query('SELECT COUNT(*) as total FROM order_info');
    const [todayOrders] = await db.query(
      'SELECT COUNT(*) as total FROM order_info WHERE DATE(create_time) = CURDATE()'
    );
    const [todayRevenue] = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM order_info WHERE DATE(create_time) = CURDATE() AND order_status != 3'
    );
    const [pendingOrders] = await db.query(
      'SELECT COUNT(*) as total FROM order_info WHERE order_status = 1'
    );
    const [pendingFeedbacks] = await db.query(
      'SELECT COUNT(*) as total FROM feedback WHERE status = 0'
    );

    res.json({
      code: 200,
      data: {
        productCount: productCount[0].total,
        orderCount: orderCount[0].total,
        todayOrders: todayOrders[0].total,
        todayRevenue: todayRevenue[0].total,
        pendingOrders: pendingOrders[0].total,
        pendingFeedbacks: pendingFeedbacks[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计数据失败', error: error.message });
  }
});

module.exports = router;
