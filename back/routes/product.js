const express = require('express');
const router = express.Router();
const db = require('../config/database');

// router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM product p LEFT JOIN category c ON p.category_id = c.id';
    const params = [];
    if (category_id) {
      sql += ' WHERE p.category_id = ?';
      params.push(category_id);
    }
    sql += ' ORDER BY p.id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取餐品列表失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '餐品不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取餐品详情失败', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category_id, name, price, daily_stock, current_stock, image, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO product (category_id, name, price, daily_stock, current_stock, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id || null, name, price, daily_stock || 0, current_stock || 0, image || null, status !== undefined ? status : 1]
    );
    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '添加餐品失败', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category_id, name, price, daily_stock, current_stock, image, status } = req.body;
    await db.query(
      'UPDATE product SET category_id = ?, name = ?, price = ?, daily_stock = ?, current_stock = ?, image = ?, status = ? WHERE id = ?',
      [category_id, name, price, daily_stock, current_stock, image, status, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新餐品失败', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM product WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除餐品失败', error: error.message });
  }
});

module.exports = router;
