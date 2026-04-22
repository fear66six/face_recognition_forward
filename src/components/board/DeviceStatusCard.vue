<script setup>
import { computed } from 'vue'

const props = defineProps({
  online: Boolean,
  boardIp: String,
  wifiOk: { type: [Boolean, undefined], default: undefined },
  registeredCount: Number,
  doorLocked: { type: [Boolean, undefined], default: undefined },
  lastRecognition: Object,
  lastAlarm: Object,
})

const wifiLabel = computed(() => {
  if (props.wifiOk === undefined) return '—'
  return props.wifiOk ? '已连接' : '未连接'
})

const doorLabel = computed(() => {
  if (props.doorLocked === undefined) return '—'
  return props.doorLocked ? '闭锁' : '开启/解锁中'
})
</script>

<template>
  <el-card shadow="hover" class="status-card">
    <template #header>
      <span class="card-title">设备状态</span>
    </template>
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="在线">
        <el-tag :type="online ? 'success' : 'danger'" size="small">
          {{ online ? '正常' : '离线' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="板端 IP">
        {{ boardIp || '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="Wi‑Fi">
        {{ wifiLabel }}
      </el-descriptions-item>
      <el-descriptions-item label="注册人数">
        {{ registeredCount ?? '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="门锁">
        {{ doorLabel }}
      </el-descriptions-item>
      <el-descriptions-item label="最近识别">
        <span v-if="lastRecognition">
          {{ lastRecognition.name || lastRecognition.message || lastRecognition.type }}
        </span>
        <span v-else>—</span>
      </el-descriptions-item>
      <el-descriptions-item label="最近告警" :span="2">
        <span v-if="lastAlarm">
          {{ lastAlarm.message || lastAlarm.type }}
        </span>
        <span v-else>—</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped>
.status-card {
  border-radius: 8px;
}
.card-title {
  font-weight: 600;
}
</style>
