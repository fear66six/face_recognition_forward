import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

/** 使用 Hash 路由，便于直接 file:// 或任意静态托管路径部署到板端 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'events', name: 'events', component: () => import('@/views/EventsView.vue') },
        { path: 'logs', name: 'logs', component: () => import('@/views/LogsView.vue') },
        { path: 'faces', name: 'faces', component: () => import('@/views/FacesView.vue') },
        { path: 'control', name: 'control', component: () => import('@/views/ControlView.vue') },
      ],
    },
  ],
})

export default router
