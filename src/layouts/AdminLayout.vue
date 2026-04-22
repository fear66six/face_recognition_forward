<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ConnectionStatusTag from '@/components/board/ConnectionStatusTag.vue'
import SystemBanner from '@/components/board/SystemBanner.vue'
import { useBoardConsole } from '@/composables/useBoardConsole'

const route = useRoute()
const active = computed(() => route.path)

const board = useBoardConsole()

onMounted(async () => {
  await board.bootstrap()
  board.startRealtime()
})

onUnmounted(() => {
  board.stopRealtime()
})
</script>

<template>
  <el-container class="layout-root">
    <el-aside width="220px" class="aside">
      <div class="brand">
        <div class="brand-title">人脸门禁面板</div>
        <div class="brand-sub">本地 Web 管理</div>
      </div>
      <el-menu :default-active="active" router class="menu" background-color="#0f172a" text-color="#cbd5e1" active-text-color="#38bdf8">
        <el-menu-item index="/">
          <span>总览</span>
        </el-menu-item>
        <el-menu-item index="/events">
          <span>实时事件</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <span>日志查看</span>
        </el-menu-item>
        <el-menu-item index="/faces">
          <span>人脸库</span>
        </el-menu-item>
        <el-menu-item index="/control">
          <span>控制</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header" height="56px">
        <div class="header-left">
          <span class="page-desc">浏览器直连设备 HTTP API</span>
        </div>
        <div class="header-right">
          <ConnectionStatusTag
            :online="board.online"
            :sse-connected="board.sseConnected"
            :poll-active="board.pollActive"
          />
          <el-button size="small" :loading="board.refreshing" @click="board.refreshSoft()">
            刷新状态
          </el-button>
        </div>
      </el-header>
      <el-main class="main">
        <SystemBanner :visible="!board.online" :message="board.bannerMessage" />
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: #0b1220;
}
.aside {
  background: #0f172a;
  color: #e2e8f0;
  border-right: 1px solid rgba(148, 163, 184, 0.15);
}
.brand {
  padding: 20px 16px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.brand-title {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
}
.brand-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}
.menu {
  border-right: none;
  padding-top: 8px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  padding: 0 20px;
}
.page-desc {
  font-size: 13px;
  color: #94a3b8;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.main {
  background: linear-gradient(180deg, #0b1220 0%, #0f172a 40%);
  color: #e2e8f0;
  padding: 20px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
