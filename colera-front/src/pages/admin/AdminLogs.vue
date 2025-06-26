<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">Logs do Sistema</h2>
    <div class="mb-4 flex flex-wrap gap-4">
      <select v-model="filtros.tipo" class="input-field">
        <option value="">Todos os Tipos</option>
        <option value="admin">Administrador</option>
        <option value="medico">Médico</option>
        <option value="gestor">Gestor</option>
        <option value="tecnico">Técnico</option>
        <option value="triagem">Triagem</option>
      </select>
      <select v-model="filtros.nivel" class="input-field">
        <option value="">Todos os Níveis</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </select>
      <input v-model="filtros.busca" class="input-field" placeholder="Buscar por usuário ou ação..." />
      <input v-model="filtros.data_inicio" type="date" class="input-field" placeholder="Data início" />
      <input v-model="filtros.data_fim" type="date" class="input-field" placeholder="Data fim" />
      <select v-model="filtros.per_page" class="input-field">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
      <select v-model="filtros.order_by" class="input-field">
        <option v-for="opt in orderByOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <select v-model="filtros.order" class="input-field">
        <option value="desc">Descendente</option>
        <option value="asc">Ascendente</option>
      </select>
      <button @click="buscarLogs" class="btn-primary">Filtrar</button>
    </div>
    <div v-if="erro" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
      {{ erro }}
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detalhes</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="log in logs" :key="log.id">
            <td class="px-4 py-2">{{ formatarData(log.created_at) }}</td>
            <td class="px-4 py-2">{{ log.usuario?.name || 'N/A' }}</td>
            <td class="px-4 py-2">{{ log.usuario?.tipo || 'N/A' }}</td>
            <td class="px-4 py-2">{{ log.mensagem }}</td>
            <td class="px-4 py-2">
              <span v-if="typeof log.detalhes === 'object' && log.detalhes !== null">
                <span v-if="log.detalhes.metodo">Método: {{ log.detalhes.metodo }}<br></span>
                <span v-if="log.detalhes.status">Status: {{ log.detalhes.status }}<br></span>
                <span v-if="log.detalhes.parametros">
                  <span v-for="(valor, chave) in log.detalhes.parametros" :key="chave">
                    {{ chave }}: {{ valor }}<br>
                  </span>
                </span>
              </span>
              <span v-else>{{ log.detalhes }}</span>
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-4">Nenhum log encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Paginação -->
    <div v-if="lastPage > 1" class="flex justify-center items-center space-x-2 py-4">
      <button @click="irParaPagina(1)" :disabled="currentPage === 1" class="btn-primary px-2">«</button>
      <button @click="paginaAnterior" :disabled="currentPage === 1" class="btn-primary px-2">Anterior</button>
      <span class="mx-2 text-sm">Página {{ currentPage }} de {{ lastPage }}</span>
      <button @click="proximaPagina" :disabled="currentPage === lastPage" class="btn-primary px-2">Próxima</button>
      <button @click="irParaPagina(lastPage)" :disabled="currentPage === lastPage" class="btn-primary px-2">»</button>
      <span class="ml-4 text-xs text-gray-500">Total: {{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const logs = ref([])
const erro = ref('')
const filtros = ref({
  tipo: '',
  nivel: '',
  busca: '',
  data_inicio: '',
  data_fim: '',
  per_page: '20',
  order_by: 'created_at',
  order: 'desc'
})

const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)

const orderByOptions = [
  { value: 'created_at', label: 'Data de Criação' },
  { value: 'updated_at', label: 'Data de Atualização' },
  { value: 'tipo', label: 'Tipo' },
  { value: 'nivel', label: 'Nível' },
  { value: 'metodo', label: 'Método' },
  { value: 'usuario', label: 'Usuário' },
  { value: 'mensagem', label: 'Mensagem' },
  { value: 'rota', label: 'Rota' },
  { value: 'ip', label: 'IP' }
];

const buscarLogs = async (pagina = 1) => {
  try {
    erro.value = ''
    const token = localStorage.getItem('token')
    if (!token) {
      erro.value = 'Token não encontrado. Por favor, faça login novamente.'
      return
    }
    const params = {}
    if (filtros.value.tipo) params.tipo = filtros.value.tipo
    if (filtros.value.nivel) params.nivel = filtros.value.nivel
    if (filtros.value.busca) params.busca = filtros.value.busca
    if (filtros.value.data_inicio) params.data_inicio = filtros.value.data_inicio
    if (filtros.value.data_fim) params.data_fim = filtros.value.data_fim
    if (filtros.value.per_page) params.per_page = filtros.value.per_page
    if (filtros.value.order_by) params.order_by = filtros.value.order_by
    if (filtros.value.order) params.order = filtros.value.order
    params.page = pagina

    const response = await axios.get('http://127.0.0.1:8000/api/logs', {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    logs.value = response.data.data.map(log => ({
      ...log,
      detalhes: typeof log.detalhes === 'string' ? JSON.parse(log.detalhes) : log.detalhes
    }))
    currentPage.value = response.data.current_page || 1
    lastPage.value = response.data.last_page || 1
    total.value = response.data.total || 0
  } catch (error) {
    erro.value = error.response?.data?.message || 'Erro ao buscar logs'
    logs.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
  }
}

const irParaPagina = (pagina) => {
  if (pagina < 1 || pagina > lastPage.value) return
  buscarLogs(pagina)
}

const proximaPagina = () => {
  if (currentPage.value < lastPage.value) buscarLogs(currentPage.value + 1)
}
const paginaAnterior = () => {
  if (currentPage.value > 1) buscarLogs(currentPage.value - 1)
}

const formatarData = (data) => {
  if (!data) return 'N/A'
  return new Date(data).toLocaleString('pt-AO')
}

onMounted(() => {
  buscarLogs()
})
</script>

<style scoped>
.input-field {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #1d4ed8;
}
</style> 