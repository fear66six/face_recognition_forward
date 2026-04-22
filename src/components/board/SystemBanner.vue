<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
})
</script>

<template>
  <el-alert
    v-if="visible"
    class="sys-banner"
    type="error"
    :closable="false"
    show-icon
    title="无法连接门禁板或接口异常"
    :description="message || '请检查网线/Wi‑Fi、板端 IP、以及浏览器与板端是否同源或可配置 Base URL。'"
  />
</template>

<style scoped>
.sys-banner {
  margin-bottom: 16px;
}
</style>
