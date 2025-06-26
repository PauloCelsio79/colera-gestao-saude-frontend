<template>
  <PainelPrevencaoColera />
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Dashboard do Admin</h1>
    <nav class="mb-6 flex gap-4">
      <router-link to="/dashboard/admin/usuarios" class="text-blue-600 hover:underline">Usuários</router-link>
      <router-link to="/dashboard/admin/gabinetes" class="text-blue-600 hover:underline">Gabinetes</router-link>
      <router-link to="/dashboard/admin/hospitais" class="text-blue-600 hover:underline">Hospitais</router-link>
      <router-link to="/dashboard/admin/ambulancias" class="text-blue-600 hover:underline">Ambulâncias</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'
// Você pode buscar dados do usuário aqui, se necessário
</script>