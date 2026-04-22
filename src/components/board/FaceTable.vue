<script setup>
defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['delete', 'register', 'reset', 'refresh'])

function onDelete(row) {
  emit('delete', row)
}
</script>

<template>
  <div class="face-toolbar">
    <el-button type="primary" @click="emit('register')">新增注册</el-button>
    <el-button @click="emit('refresh')">刷新列表</el-button>
    <el-button type="danger" plain @click="emit('reset')">清空人脸库</el-button>
  </div>
  <el-table :data="rows" v-loading="loading" stripe border empty-text="暂无人脸记录" class="face-table">
    <el-table-column label="ID" width="88">
      <template #default="{ row }">{{ row.face_id ?? '—' }}</template>
    </el-table-column>
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column label="操作" width="120" fixed="right">
      <template #default="{ row }">
        <el-button link type="danger" @click="onDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.face-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
.face-table {
  border-radius: 8px;
}
</style>
