<template>
  <div class="system-config">
    <el-card shadow="hover" style="max-width: 600px">
      <template #header>
        <span style="font-size: 16px; font-weight: 600;">营业时间设置</span>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
        <el-form-item label="营业开始时间" prop="business_start">
          <el-time-picker
            v-model="form.business_start"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="营业结束时间" prop="business_end">
          <el-time-picker
            v-model="form.business_end"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  business_start: '06:00:00',
  business_end: '10:00:00'
})

const rules = {
  business_start: [{ required: true, message: '请选择营业开始时间', trigger: 'change' }],
  business_end: [{ required: true, message: '请选择营业结束时间', trigger: 'change' }]
}

const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await api.get('/config')
    if (res.data.business_start) {
      form.business_start = res.data.business_start
    }
    if (res.data.business_end) {
      form.business_end = res.data.business_end
    }
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await api.put('/config', form)
    ElMessage.success('保存成功')
  } catch (error) {
    // 错误已在axios拦截器中处理
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.system-config {
  padding: 10px;
}
</style>
