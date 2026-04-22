<script setup>
defineProps({
  online: { type: Boolean, default: false },
  sseConnected: { type: Boolean, default: false },
  pollActive: { type: Boolean, default: false },
})
</script>

<template>
  <span class="conn-tags">
    <el-tag v-if="online" type="success" size="small" effect="dark">设备在线</el-tag>
    <el-tag v-else type="danger" size="small" effect="dark">设备离线</el-tag>
    <el-tag v-if="online && sseConnected" type="primary" size="small">SSE</el-tag>
    <el-tag v-else-if="online && pollActive" type="info" size="small">轮询</el-tag>
  </span>
</template>

<style scoped>
.conn-tags {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
