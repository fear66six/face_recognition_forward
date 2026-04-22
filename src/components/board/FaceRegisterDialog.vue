<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const name = ref('')

watch(
  () => props.modelValue,
  (v) => {
    if (v) name.value = ''
  },
)

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  const n = String(name.value || '').trim()
  if (!n) return
  emit('submit', n)
  close()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="人脸注册"
    width="420px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="hint">提交后板端进入采集流程，结果将通过实时事件或轮询状态反馈。</p>
    <el-form @submit.prevent>
      <el-form-item label="姓名">
        <el-input v-model="name" placeholder="请输入姓名" maxlength="32" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :disabled="!name.trim()" @click="confirm">开始注册</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
