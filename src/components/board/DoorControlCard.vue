<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['unlock'])

const duration = ref(3000)

function submit() {
  emit('unlock', Number(duration.value) || 3000)
}
</script>

<template>
  <el-card shadow="hover" class="ctrl-card">
    <template #header>
      <span class="card-title">远程开锁</span>
    </template>
    <p class="hint">向设备下发开锁保持时长（毫秒），请在授权环境下操作。</p>
    <el-form label-width="100px" @submit.prevent>
      <el-form-item label="duration_ms">
        <el-input-number v-model="duration" :min="500" :max="60000" :step="500" :disabled="disabled" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="disabled" @click="submit">执行开锁</el-button>
      </el-form-item>
    </el-form>
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
