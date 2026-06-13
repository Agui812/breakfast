<template>
  <div class="print-log">
    <el-card shadow="hover">
      <template #header>
        <span style="font-size: 16px; font-weight: 600;">打印日志</span>
      </template>

      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="订单编号" width="180">
          <template #default="{ row }">{{ row.order_no }}</template>
        </el-table-column>
        <el-table-column label="餐品明细" min-width="280">
          <template #default="{ row }">
            <div class="items-container">
              <div v-for="(item, index) in row.items" :key="index" class="item-row">
                <span class="item-name">{{ item.product_name }}</span>
                <span class="item-qty">×{{ item.quantity }}</span>
                <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="取餐码" width="90">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ row.pickup_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总价格" width="90">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column label="订单创建时间" width="180">
          <template #default="{ row }">{{ row.create_time }}</template>
        </el-table-column>
        <el-table-column label="打印时间" width="180">
          <template #default="{ row }">{{ row.print_time }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchLogs"
        @current-change="fetchLogs"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const logs = ref([])
const loading = ref(false)
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await api.get('/print-logs', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })
    logs.value = res.data
    total.value = res.total
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.print-log {
  padding: 10px;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}

.item-name {
  color: #303133;
  font-weight: 500;
}

.item-qty {
  color: #909399;
}

.item-price {
  color: #67c23a;
  margin-left: auto;
  font-weight: 500;
}
</style>
