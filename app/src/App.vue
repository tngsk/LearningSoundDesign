<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container font-sans text-gray-800 bg-gray-50 min-h-screen">
    <header class="p-4 bg-white shadow-sm flex justify-between items-center">
      <h1 class="text-xl font-bold text-blue-600">Sound Design Lab</h1>
      <nav>
        <router-link to="/" class="mr-4 text-gray-600 hover:text-blue-500">Home</router-link>
      </nav>
    </header>
    <main class="p-4 max-w-4xl mx-auto">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
