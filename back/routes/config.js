const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

// router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_config LIMIT 1');
    res.json({ code: 200, data: rows[0] || {} });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取系统配置失败', error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { business_start, business_end } = req.body;
    await db.query(
      'UPDATE system_config SET business_start = ?, business_end = ? WHERE id = 1',
      [business_start, business_end]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新系统配置失败', error: error.message });
  }
});

module.exports = router;
