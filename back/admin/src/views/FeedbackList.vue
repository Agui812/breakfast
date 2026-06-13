<template>
  <div class="feedback-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户反馈</span>
          <div class="filter-bar">
            <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 150px" @change="fetchFeedbacks">
              <el-option label="待处理" :value="0" />
              <el-option label="已处理" :value="1" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="feedbacks" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <div v-if="row.user_nickname" style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="28" :src="row.user_avatar" />
              <span>{{ row.user_nickname }}</span>
            </div>
            <span v-else>匿名用户</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系方式" width="130" />
        <el-table-column prop="reply" label="商家回复" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reply || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="提交时间" width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleReply(row)">回复</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchFeedbacks"
        @current-change="fetchFeedbacks"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog
      v-model="replyVisible"
      title="回复反馈"
      width="500px"
    >
      <el-descriptions :column="1" border v-if="currentFeedback">
        <el-descriptions-item label="用户">{{ currentFeedback.user_nickname || '匿名用户' }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容">{{ currentFeedback.content }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ currentFeedback.contact || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="replyForm" style="margin-top: 20px">
        <el-form-item label="回复内容">
          <el-input v-model="replyForm.reply" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const route = useRoute()
const feedbacks = ref([])
const loading = ref(false)
const filterStatus = ref(route.query.status !== undefined ? parseInt(route.query.status) : null)
const total = ref(0)
const replyVisible = ref(false)
const submitting = ref(false)
const currentFeedback = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const replyForm = reactive({
  reply: ''
})

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value !== null && filterStatus.value !== '') {
      params.status = filterStatus.value
    }
    const res = await api.get('/feedbacks', { params })
    feedbacks.value = res.data
    total.value = res.total
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleReply = (row) => {
  currentFeedback.value = row
  replyForm.reply = row.reply || ''
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyForm.reply.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  submitting.value = true
  try {
    await api.put(`/feedbacks/${currentFeedback.value.id}/reply`, { reply: replyForm.reply })
    ElMessage.success('回复成功')
    replyVisible.value = false
    fetchFeedbacks()
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该反馈吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await api.delete(`/feedbacks/${row.id}`)
    ElMessage.success('删除成功')
    fetchFeedbacks()
  } catch (error) {
    // 错误已在axios拦截器中处理
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.feedback-list {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}
</style>
