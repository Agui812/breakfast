<template>
  <div class="order-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <div class="filter-bar">
            <el-select v-model="filter.status" placeholder="订单状态" clearable style="width: 150px" @change="fetchOrders">
              <el-option label="待制作" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取餐" :value="3" />
            </el-select>
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px"
              @change="fetchOrders"
            />
          </div>
        </div>
      </template>

      <el-table :data="orders" style="width: 100%" v-loading="loading">
        <el-table-column prop="order_no" label="订单编号" width="180" />
        <el-table-column prop="nickname" label="顾客" width="120">
          <template #default="{ row }">
            <div v-if="row.user_nickname">
              <el-avatar :size="24" :src="row.user_avatar" style="vertical-align: middle; margin-right: 5px" />
              {{ row.user_nickname }}
            </div>
            <span v-else>{{ row.nickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pickup_code" label="取餐码" width="100">
          <template #default="{ row }">
            <el-tag type="warning" size="large">{{ row.pickup_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pickup_time" label="取餐时间" width="180" />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column prop="order_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.order_status)">
              {{ getStatusText(row.order_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button type="warning" size="small" @click="handleUpdateStatus(row)" v-if="row.order_status === 1">完成</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchOrders"
        @current-change="fetchOrders"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单编号">{{ currentOrder.order_no }}</el-descriptions-item>
        <el-descriptions-item label="取餐码">{{ currentOrder.pickup_code }}</el-descriptions-item>
        <el-descriptions-item label="顾客">{{ currentOrder.nickname }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentOrder.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取餐时间">{{ currentOrder.pickup_time }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.order_status)">
            {{ getStatusText(currentOrder.order_status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.create_time }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>订单明细</el-divider>
      <el-table :data="currentOrder?.items || []" style="width: 100%">
        <el-table-column prop="product_name" label="餐品名称" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column label="小计" width="100">
          <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const route = useRoute()
const orders = ref([])
const loading = ref(false)
const total = ref(0)
const detailVisible = ref(false)
const currentOrder = ref(null)

const filter = reactive({
  status: route.query.status ? parseInt(route.query.status) : null,
  dateRange: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const getStatusType = (status) => {
  const types = { 1: 'warning', 2: 'success', 3: 'info' }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = { 1: '待制作', 2: '已完成', 3: '已取餐' }
  return texts[status] || '未知'
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filter.status) params.status = filter.status
    if (filter.dateRange) {
      params.startDate = filter.dateRange[0].toISOString().split('T')[0]
      params.endDate = filter.dateRange[1].toISOString().split('T')[0] + ' 23:59:59'
    }
    const res = await api.get('/orders', { params })
    orders.value = res.data
    total.value = res.total
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleView = async (row) => {
  try {
    const res = await api.get(`/orders/${row.order_no}`)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch (error) {
    // 错误已在axios拦截器中处理
  }
}

const handlePrint = async (row) => {
  try {
    await api.post(`/orders/${row.order_no}/print`)
    ElMessage.success('打印记录已保存')
  } catch (error) {
    // 错误已在axios拦截器中处理
  }
}

const handleUpdateStatus = async (row) => {
  try {
    await api.put(`/orders/${row.id}/status`, { order_status: 2 })
    ElMessage.success('订单状态已更新')
    fetchOrders()
  } catch (error) {
    // 错误已在axios拦截器中处理
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.filter-bar {
  display: flex;
  gap: 12px;
}
</style>
