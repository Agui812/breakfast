import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserList from '@/views/UserList.vue'
import CategoryList from '@/views/CategoryList.vue'
import ProductList from '@/views/ProductList.vue'
import OrderList from '@/views/OrderList.vue'
import FeedbackList from '@/views/FeedbackList.vue'
import SystemConfig from '@/views/SystemConfig.vue'
import PrintLog from '@/views/PrintLog.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'users', name: 'Users', component: UserList },
      { path: 'categories', name: 'Categories', component: CategoryList },
      { path: 'products', name: 'Products', component: ProductList },
      { path: 'orders', name: 'Orders', component: OrderList },
      { path: 'feedbacks', name: 'Feedbacks', component: FeedbackList },
      { path: 'config', name: 'Config', component: SystemConfig },
      { path: 'print-logs', name: 'PrintLogs', component: PrintLog }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
