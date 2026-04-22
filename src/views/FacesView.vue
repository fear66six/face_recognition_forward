<script setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useBoardConsole } from '@/composables/useBoardConsole'
import FaceTable from '@/components/board/FaceTable.vue'
import FaceRegisterDialog from '@/components/board/FaceRegisterDialog.vue'

const board = useBoardConsole()
const registerOpen = ref(false)

async function onRegister(name) {
  try {
    await board.registerFace(name)
  } catch (e) {
    board.showErr(e, '注册请求失败')
  }
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.name ?? row.face_id ?? '该记录'}」？此操作不可撤销。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  try {
    const body = row.name != null ? { name: row.name } : { face_id: row.face_id }
    await board.deleteFace(body)
  } catch (e) {
    board.showErr(e, '删除失败')
  }
}

async function onReset() {
  try {
    await ElMessageBox.confirm(
      '将清空整个人脸库，已注册人员需重新采集。此操作不可恢复。',
      '危险操作确认',
      {
        type: 'error',
        confirmButtonText: '确认清空',
        cancelButtonText: '取消',
        distinguishCancelAndClose: true,
      },
    )
  } catch {
    return
  }
  try {
    await board.resetFaces()
  } catch (e) {
    board.showErr(e, '清空失败')
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1>人脸库管理</h1>
      <p class="sub">列表来自 /api/faces；注册走 /api/register，删除与清库需二次确认。</p>
    </div>
    <el-card shadow="hover" class="block">
      <FaceTable
        :rows="board.faces"
        :loading="board.bootstrapping"
        @register="registerOpen = true"
        @refresh="board.refreshFaces()"
        @reset="onReset"
        @delete="onDelete"
      />
    </el-card>
    <FaceRegisterDialog v-model="registerOpen" @submit="onRegister" />
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
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
</style>
