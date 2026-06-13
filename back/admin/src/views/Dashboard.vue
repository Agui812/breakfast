<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="28"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.productCount }}</div>
              <div class="stat-label">餐品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="28"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.orderCount }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="28"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayOrders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <el-icon :size="28"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.todayRevenue }}</div>
              <div class="stat-label">今日营收</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="pending-row">
      <el-col :span="12">
        <el-card class="pending-card clickable" shadow="hover" @click="goToOrders">
          <div class="pending-content">
            <div class="pending-left">
              <div class="pending-icon" style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <div class="pending-info">
                <div class="pending-title">待处理订单</div>
                <div class="pending-desc">点击查看详情</div>
              </div>
            </div>
            <div class="pending-count">{{ stats.pendingOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="pending-card clickable" shadow="hover" @click="goToFeedbacks">
          <div class="pending-content">
            <div class="pending-left">
              <div class="pending-icon" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);">
                <el-icon :size="32"><ChatDotRound /></el-icon>
              </div>
              <div class="pending-info">
                <div class="pending-title">待处理反馈</div>
                <div class="pending-desc">点击查看详情</div>
              </div>
            </div>
            <div class="pending-count">{{ stats.pendingFeedbacks }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const stats = ref({
  productCount: 0,
  orderCount: 0,
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  pendingFeedbacks: 0
})

const fetchStats = async () => {
  try {
    const res = await api.get('/dashboard')
    stats.value = res.data
  } catch (error) {
    // 错误已在axios拦截器中处理
  }
}

const goToOrders = () => {
  router.push({ path: '/orders', query: { status: 1 } })
}

const goToFeedbacks = () => {
  router.push({ path: '/feedbacks', query: { status: 0 } })
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  padding: 10px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1e2c;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.pending-row {
  margin-bottom: 24px;
}

.pending-card {
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.pending-card:hover {
  transform: translateY(-2px);
}

.pending-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.pending-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pending-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.pending-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pending-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1e2c;
}

.pending-desc {
  font-size: 13px;
  color: #909399;
}

.pending-count {
  font-size: 36px;
  font-weight: 700;
  color: #f5af19;
  min-width: 60px;
  text-align: center;
}
</style>
