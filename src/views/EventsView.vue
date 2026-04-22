<script setup>
import { useBoardConsole } from '@/composables/useBoardConsole'
import EventTimeline from '@/components/board/EventTimeline.vue'

const board = useBoardConsole()
const pollMs = import.meta.env.VITE_BOARD_POLL_MS ?? '2000'
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1>实时事件</h1>
      <p class="sub">
        数据源：SSE（优先）或 {{ pollMs }}ms 轮询；识别/陌生人/注册/开锁等类型高亮显示。
      </p>
    </div>
    <el-card shadow="hover" class="block">
      <template #header>
        <div class="hdr">
          <span class="card-title">事件时间线</span>
          <el-tag v-if="board.sseConnected" type="primary" size="small">SSE 已连接</el-tag>
          <el-tag v-else-if="board.pollActive" type="info" size="small">轮询刷新中</el-tag>
        </div>
      </template>
      <EventTimeline :items="board.events" :max="200" :loading="false" />
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
}
.page-head h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
}
.sub {
  margin: 0 0 18px;
  color: #94a3b8;
  font-size: 13px;
}
.block {
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.hdr {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-title {
  font-weight: 600;
  flex: 1;
}
</style>
