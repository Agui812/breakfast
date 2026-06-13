const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM user ORDER BY create_time DESC');
    res.json({ code: 200, data: users });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取用户列表失败', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { openid, nickname, avatar } = req.body;

    if (!openid) {
      return res.status(400).json({ code: 400, message: 'openid不能为空' });
    }

    const [users] = await db.query('SELECT * FROM user WHERE openid = ?', [openid]);

    if (users.length > 0) {
      const user = users[0];
      res.json({ code: 200, message: '登录成功', data: { user_id: user.id, nickname: user.nickname, avatar: user.avatar } });
    } else {
      const [result] = await db.query(
        'INSERT INTO user (openid, nickname, avatar) VALUES (?, ?, ?)',
        [openid, nickname || null, avatar || null]
      );
      res.json({ code: 200, message: '注册成功', data: { user_id: result.insertId, nickname, avatar } });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '登录失败', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM user WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 200, data: users[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取用户信息失败', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    await db.query(
      'UPDATE user SET nickname = ?, avatar = ? WHERE id = ?',
      [nickname, avatar, req.params.id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败', error: error.message });
  }
});

module.exports = router;
