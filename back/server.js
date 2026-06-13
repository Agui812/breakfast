const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const configRoutes = require('./routes/config');
const printLogRoutes = require('./routes/printLog');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/category');
const userRoutes = require('./routes/user');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'admin/dist')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config', configRoutes);
app.use('/api/print-logs', printLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Vue前端路由（SPA fallback）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`后台管理系统运行在 http://localhost:${PORT}`);
});
