<script setup>
import { useBoardConsole } from '@/composables/useBoardConsole'
import DoorControlCard from '@/components/board/DoorControlCard.vue'
import AlarmControlCard from '@/components/board/AlarmControlCard.vue'
import DeviceStatusCard from '@/components/board/DeviceStatusCard.vue'

const board = useBoardConsole()

async function onUnlock(ms) {
  try {
    await board.unlockDoor(ms)
  } catch (e) {
    board.showErr(e, '开锁失败')
  }
}

async function onAlarm() {
  try {
    await board.testAlarm()
  } catch (e) {
    board.showErr(e, '报警测试失败')
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1>设备控制</h1>
      <p class="sub">远程开锁、报警测试与状态刷新；所有指令均走 HTTP POST。</p>
    </div>
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <DoorControlCard :disabled="!board.online" @unlock="onUnlock" />
      </el-col>
      <el-col :xs="24" :md="12">
        <AlarmControlCard :disabled="!board.online" @test="onAlarm" />
      </el-col>
    </el-row>
    <el-card shadow="hover" class="block">
      <template #header>
        <span class="card-title">当前状态快照</span>
      </template>
      <DeviceStatusCard
        :online="board.online"
        :board-ip="board.boardIp"
        :wifi-ok="board.wifiOk"
        :registered-count="board.registeredCount"
        :door-locked="board.doorLocked"
        :last-recognition="board.lastRecognition"
        :last-alarm="board.lastAlarm"
      />
      <el-divider />
      <p class="hint">完整 JSON（便于对接调试）：</p>
      <pre class="json">{{ JSON.stringify(board.deviceState ?? {}, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 1000px;
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
.card-title {
  font-weight: 600;
}
.hint {
  margin: 0 0 8px;
  font-size: 13px;
  color: #94a3b8;
}
.json {
  margin: 0;
  font-size: 12px;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
