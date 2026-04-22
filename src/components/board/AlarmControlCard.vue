<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['test'])
</script>

<template>
  <el-card shadow="hover" class="ctrl-card">
    <template #header>
      <span class="card-title">报警测试</span>
    </template>
    <p class="hint">触发设备报警测试流程。</p>
    <el-button type="warning" :disabled="disabled" @click="emit('test')">触发报警测试</el-button>
  </el-card>
</template>

<style scoped>
.ctrl-card {
  border-radius: 8px;
}
.card-title {
  font-weight: 600;
}
.hint {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
