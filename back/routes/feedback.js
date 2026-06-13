const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    let sql = 'SELECT f.*, u.nickname as user_nickname, u.avatar as user_avatar FROM feedback f LEFT JOIN user u ON f.user_id = u.id WHERE 1=1';
    const params = [];

    if (status !== undefined && status !== '') {
      sql += ' AND f.status = ?';
      params.push(parseInt(status));
    }

    sql += ' ORDER BY f.create_time DESC';

    const [countResult] = await db.query(sql.replace('SELECT f.*, u.nickname as user_nickname, u.avatar as user_avatar', 'SELECT COUNT(*) as total'), params);
    const total = countResult[0].total;

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const [rows] = await db.query(sql, params);
    res.json({ code: 200, data: rows, total });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取反馈列表失败', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, content, contact } = req.body;
    const [result] = await db.query(
      'INSERT INTO feedback (user_id, content, contact) VALUES (?, ?, ?)',
      [user_id || null, content, contact || null]
    );
    res.json({ code: 200, message: '提交成功', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '提交失败', error: error.message });
  }
});

router.put('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    await db.query(
      'UPDATE feedback SET reply = ?, status = 1 WHERE id = ?',
      [reply, req.params.id]
    );
    res.json({ code: 200, message: '回复成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '回复失败', error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE feedback SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败', error: error.message });
  }
});

module.exports = router;
