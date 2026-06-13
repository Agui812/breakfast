const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM category WHERE status = 1 ORDER BY sort ASC'
    );
    res.json({ code: 200, data: categories });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取分类列表失败', error: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM category ORDER BY sort ASC');
    res.json({ code: 200, data: categories });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取分类列表失败', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, sort, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO category (name, sort, status) VALUES (?, ?, ?)',
      [name, sort || 0, status !== undefined ? status : 1]
    );
    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '添加失败', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, sort, status } = req.body;
    await db.query(
      'UPDATE category SET name = ?, sort = ?, status = ? WHERE id = ?',
      [name, sort, status, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM category WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败', error: error.message });
  }
});

module.exports = router;
