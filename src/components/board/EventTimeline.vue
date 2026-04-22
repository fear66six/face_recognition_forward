<script setup>
import { computed } from 'vue'
import { eventTagMeta, formatTs } from '@/utils/eventMeta'

const props = defineProps({
  items: { type: Array, default: () => [] },
  max: { type: Number, default: 100 },
  loading: { type: Boolean, default: false },
})

const list = computed(() => props.items.slice(0, props.max))
</script>

<template>
  <el-card shadow="never" class="timeline-card">
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="!list.length" description="暂无事件" />
    <el-timeline v-else class="tl">
      <el-timeline-item
        v-for="e in list"
        :key="e.id"
        :timestamp="formatTs(e.ts)"
        placement="top"
      >
        <div class="row">
          <el-tag :type="eventTagMeta(e.type).type" size="small" effect="dark">
            {{ eventTagMeta(e.type).label }}
          </el-tag>
          <span class="name" v-if="e.name">{{ e.name }}</span>
          <span class="msg" v-if="e.message">{{ e.message }}</span>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style scoped>
.timeline-card {
  border: none;
  background: transparent;
}
.tl {
  padding-left: 2px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.msg {
  color: var(--el-text-color-regular);
  font-size: 13px;
}
.name {
  font-weight: 600;
}
</style>
