<script setup>
import { ref } from 'vue'
import { useBoardConsole } from '@/composables/useBoardConsole'
import EventTimeline from '@/components/board/EventTimeline.vue'

const board = useBoardConsole()
const limit = ref(50)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    await board.refreshEventsLimit(Number(limit.value) || 50)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1>日志查看</h1>
      <p class="sub">按条数请求 /api/events，支持手动刷新。</p>
    </div>
    <el-card shadow="hover" class="block">
      <template #header>
        <div class="hdr">
          <span class="card-title">最近事件</span>
          <div class="tools">
            <span class="lbl">条数</span>
            <el-select v-model="limit" style="width: 100px" size="small">
              <el-option :value="20" label="20" />
              <el-option :value="50" label="50" />
              <el-option :value="100" label="100" />
              <el-option :value="200" label="200" />
            </el-select>
            <el-button type="primary" size="small" :loading="loading" @click="load">手动刷新</el-button>
          </div>
        </div>
      </template>
      <EventTimeline :items="board.events" :max="500" :loading="loading" />
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
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lbl {
  font-size: 12px;
  color: #94a3b8;
}
.card-title {
  font-weight: 600;
}
</style>
