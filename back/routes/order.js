const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

// router.use(authenticateToken);

function generateOrderNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${year}${month}${day}${hour}${minute}${second}${random}`;
}

function generatePickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { phone, pickup_time, total_amount, items, nickname, user_id } = req.body;
    const orderNo = generateOrderNo();
    const pickupCode = generatePickupCode();

    let fullPickupTime = pickup_time;
    if (pickup_time && !pickup_time.includes('-')) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      fullPickupTime = `${year}-${month}-${day} ${pickup_time}`;
    }

    const [orderResult] = await conn.query(
      'INSERT INTO order_info (order_no, pickup_code, nickname, phone, user_id, pickup_time, total_amount, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [orderNo, pickupCode, nickname || null, phone, user_id || null, fullPickupTime, total_amount]
    );

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_item (order_no, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderNo, item.product_id, item.product_name, item.price, item.quantity]
      );

      await conn.query(
        'UPDATE product SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.query('INSERT INTO print_log (order_no) VALUES (?)', [orderNo]);

    await conn.commit();

    res.json({
      code: 200,
      message: '下单成功',
      data: {
        order_no: orderNo,
        pickup_code: pickupCode
      }
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ code: 500, message: '下单失败', error: error.message });
  } finally {
    conn.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10, startDate, endDate } = req.query;
    let sql = 'SELECT o.*, u.nickname as user_nickname, u.avatar as user_avatar FROM order_info o LEFT JOIN user u ON o.user_id = u.id WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND o.order_status = ?';
      params.push(status);
    }
    if (startDate) {
      sql += ' AND o.create_time >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND o.create_time <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY o.create_time DESC';

    const [countResult] = await db.query(sql.replace('SELECT o.*, u.nickname as user_nickname, u.avatar as user_avatar', 'SELECT COUNT(*) as total'), params);
    const total = countResult[0].total;

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const [rows] = await db.query(sql, params);
    res.json({ code: 200, data: rows, total });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取订单列表失败', error: error.message });
  }
});

router.get('/:order_no', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM order_info WHERE order_no = ?', [req.params.order_no]);
    if (orders.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const [items] = await db.query('SELECT * FROM order_item WHERE order_no = ?', [req.params.order_no]);
    res.json({ code: 200, data: { ...orders[0], items } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取订单详情失败', error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { order_status } = req.body;
    await db.query('UPDATE order_info SET order_status = ? WHERE id = ?', [order_status, req.params.id]);
    res.json({ code: 200, message: '订单状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新订单状态失败', error: error.message });
  }
});

router.post('/:order_no/print', async (req, res) => {
  try {
    await db.query('INSERT INTO print_log (order_no) VALUES (?)', [req.params.order_no]);
    res.json({ code: 200, message: '打印记录已保存' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '保存打印记录失败', error: error.message });
  }
});

module.exports = router;
