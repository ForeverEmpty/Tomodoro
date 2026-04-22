<script setup lang="ts">
import { useRoute } from 'vue-router'
import { header } from '@/config/header'

const route = useRoute()
</script>

<template>
  <nav class="w-full px-12 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
      <div class="text-sm font-semibold tracking-wider uppercase text-slate-800">Tomodoro</div>
    </div>

    <div class="flex items-center gap-6">
      <div class="hidden md:flex gap-8 items-center">
        <button
          v-for="item in header()"
          :key="item.path"
          @click="item.onClick"
          class="text-xs font-medium text-slate-400 uppercase tracking-wider pb-1 hover:text-slate-900 transition-colors duration-300"
          :class="{ 'text-slate-900 border-b-2 border-slate-900': item.path === route.path }"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
