<script setup>
import { useBoardConsole } from '@/composables/useBoardConsole'
import DeviceStatusCard from '@/components/board/DeviceStatusCard.vue'
import EventTimeline from '@/components/board/EventTimeline.vue'

const board = useBoardConsole()
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1>总览</h1>
      <p class="sub">设备状态与健康检查摘要。</p>
    </div>
    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <DeviceStatusCard
          :online="board.online"
          :board-ip="board.boardIp"
          :wifi-ok="board.wifiOk"
          :registered-count="board.registeredCount"
          :door-locked="board.doorLocked"
          :last-recognition="board.lastRecognition"
          :last-alarm="board.lastAlarm"
        />
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="mini-card">
          <template #header>
            <span class="card-title">健康检查</span>
          </template>
          <el-skeleton v-if="board.bootstrapping" :rows="3" animated />
          <pre v-else class="json">{{ JSON.stringify(board.health ?? {}, null, 2) }}</pre>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" class="block">
      <template #header>
        <span class="card-title">最近事件（前 8 条）</span>
      </template>
      <EventTimeline :items="board.events" :max="8" :loading="board.bootstrapping" />
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
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
  margin-top: 16px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.mini-card {
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
  min-height: 200px;
}
.card-title {
  font-weight: 600;
}
.json {
  margin: 0;
  font-size: 12px;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
