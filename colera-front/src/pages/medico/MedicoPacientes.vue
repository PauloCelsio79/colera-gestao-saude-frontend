<template>
  <PainelPrevencaoColera />
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Gerenciamento de Pacientes
        </h3>
        <button
          @click="openNewPacienteModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Novo Paciente
        </button>
      </div>
    </div>

    <!-- Gráfico de Risco dos Pacientes -->
    <div v-if="!loading && !error" class="p-4 flex flex-col items-center justify-center">
      <h4 class="text-base font-semibold mb-2">Distribuição de Pacientes por Nível de Risco</h4>
      <div class="w-[180px] h-[180px] flex items-center justify-center">
        <canvas id="graficoRiscoPacientes" width="180" height="180"></canvas>
      </div>
    </div>

    <!-- Filtros -->
    <div v-if="!loading && !error" class="px-4 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-2 sm:space-y-0">
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Nome</label>
        <input v-model="filtros.nome" type="text" class="input-field" placeholder="Nome do paciente">
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">BI</label>
        <input v-model="filtros.bi" type="text" class="input-field" placeholder="BI do paciente">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-400">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              BI
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Nascimento
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ paciente.nome }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ paciente.bi_numero }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ paciente.telefone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ formatDate(paciente.data_nascimento) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editPaciente(paciente)"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="viewTriagens(paciente)"
                class="text-primary-600 hover:text-primary-900"
              >
                Ver Triagens
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingPaciente ? 'Editar Paciente' : 'Novo Paciente' }}
            </h3>
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nome</label>
                  <input v-model="form.nome" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Número do BI</label>
                  <input v-model="form.bi_numero" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telefone</label>
                  <input v-model="form.telefone" type="tel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <input v-model="form.data_nascimento" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Endereço</label>
                  <input v-model="form.endereco" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Gênero</label>
                  <select v-model="form.genero" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Latitude</label>
                  <input v-model="form.latitude" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Longitude</label>
                  <input v-model="form.longitude" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
              </div>
            </form>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleSubmit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Salvar
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Chart from 'chart.js/auto'

const router = useRouter()
const pacientes = ref([])
const showModal = ref(false)
const editingPaciente = ref(null)
const loading = ref(true)
const error = ref(null)

const form = ref({
  nome: '',
  bi_numero: '',
  telefone: '',
  data_nascimento: '',
  endereco: '',
  genero: '',
  latitude: '',
  longitude: ''
})

const filtros = ref({ nome: '', bi: '' })

const pacientesFiltrados = computed(() => {
  return pacientes.value.filter(p => {
    const nomeOk = !filtros.value.nome || (p.nome || '').toLowerCase().includes(filtros.value.nome.toLowerCase())
    const biOk = !filtros.value.bi || (p.bi_numero || '').toLowerCase().includes(filtros.value.bi.toLowerCase())
    return nomeOk && biOk
  })
})

const contagemRiscos = computed(() => {
  const contagem = { alto: 0, medio: 0, baixo: 0 }
  pacientesFiltrados.value.forEach(p => {
    const risco = (p.nivel_risco || '').toLowerCase()
    if (risco === 'alto') contagem.alto++
    else if (risco === 'medio' || risco === 'médio') contagem.medio++
    else contagem.baixo++
  })
  return contagem
})

let graficoRisco = null

const renderizarGrafico = () => {
  const ctx = document.getElementById('graficoRiscoPacientes')
  if (!ctx) return
  if (graficoRisco) graficoRisco.destroy()
  graficoRisco = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Alto Risco', 'Médio Risco', 'Baixo Risco'],
      datasets: [{
        data: [contagemRiscos.value.alto, contagemRiscos.value.medio, contagemRiscos.value.baixo],
        backgroundColor: ['#ef4444', '#f59e42', '#22c55e'],
      }]
    },
    options: {
      plugins: {
        legend: { display: true, position: 'bottom' }
      }
    }
  })
}

watch(contagemRiscos, () => {
  renderizarGrafico()
})

const fetchPacientes = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('Iniciando busca de pacientes...')
    const token = localStorage.getItem('token')
    console.log('Token:', token ? 'Presente' : 'Ausente')

    const response = await axios.get('http://127.0.0.1:8000/api/pacientes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Resposta da API:', response.data)

    if (Array.isArray(response.data)) {
      pacientes.value = response.data
      console.log('Pacientes carregados:', pacientes.value.length)
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Caso a API retorne os dados dentro de um objeto com propriedade 'data'
      pacientes.value = response.data.data
      console.log('Pacientes carregados (dentro de data):', pacientes.value.length)
    } else {
      console.error('Formato de dados inesperado:', response.data)
      pacientes.value = []
      error.value = 'Formato de dados inválido recebido da API'
    }
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    pacientes.value = []
    
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      
      switch (error.response.status) {
        case 401:
          error.value = 'Sessão expirada. Por favor, faça login novamente.'
          // Opcional: redirecionar para login
          // router.push('/login')
          break
        case 403:
          error.value = 'Você não tem permissão para acessar esta página.'
          break
        case 404:
          error.value = 'API não encontrada. Verifique se o servidor está rodando.'
          break
        default:
          error.value = 'Erro ao carregar pacientes. Por favor, tente novamente.'
      }
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      error.value = 'Erro de conexão. Verifique se o servidor está rodando.'
    } else {
      console.error('Erro:', error.message)
      error.value = 'Erro ao carregar pacientes: ' + error.message
    }
  } finally {
    loading.value = false
  }
}

const openNewPacienteModal = () => {
  editingPaciente.value = null
  form.value = {
    nome: '',
    bi_numero: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    genero: '',
    latitude: '',
    longitude: ''
  }
  showModal.value = true
}

const editPaciente = (paciente) => {
  editingPaciente.value = paciente
  form.value = { ...paciente }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPaciente.value = null
  form.value = {
    nome: '',
    bi_numero: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    genero: '',
    latitude: '',
    longitude: ''
  }
}

const handleSubmit = async () => {
  try {
    // Validação dos campos
    if (!form.value.nome || !form.value.bi_numero || !form.value.telefone || 
        !form.value.data_nascimento || !form.value.endereco || !form.value.genero) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Converter latitude e longitude para números
    const data = {
      ...form.value,
      latitude: parseFloat(form.value.latitude) || 0,
      longitude: parseFloat(form.value.longitude) || 0
    }

    if (editingPaciente.value) {
      await axios.put(`http://127.0.0.1:8000/api/pacientes/${editingPaciente.value.id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    } else {
      await axios.post('http://127.0.0.1:8000/api/pacientes', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
    await fetchPacientes()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar paciente:', error)
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data)
      if (error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else if (error.response.status === 422) {
        const mensagensErro = error.response.data.errors || {}
        const mensagem = Object.entries(mensagensErro)
          .map(([campo, erros]) => `${campo}: ${erros.join(', ')}`)
          .join('\n')
        alert(`Erro ao salvar:\n${mensagem}`)
      } else {
        alert(error.response.data.message || 'Erro ao salvar paciente')
      }
    } else {
      alert('Erro ao salvar paciente. Verifique a conexão com o servidor.')
    }
  }
}

const viewTriagens = async (paciente) => {
  if (!paciente || !paciente.id) {
    console.error('Paciente inválido:', paciente)
    return
  }

  try {
    console.log('Buscando triagens do paciente:', paciente.id)
    const response = await axios.get(`http://127.0.0.1:8000/api/pacientes/${paciente.id}/triagens`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Triagens encontradas:', response.data)
    
    // Armazena as triagens no localStorage para uso na próxima página
    localStorage.setItem('triagensPaciente', JSON.stringify(response.data))
    
    // Navega para a página de triagens
    router.push(`/dashboard/medico/pacientes/${paciente.id}/triagens`)
  } catch (error) {
    console.error('Erro ao buscar triagens:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          // Opcional: redirecionar para login
          // router.push('/login')
          break
        case 403:
          alert('Você não tem permissão para acessar as triagens deste paciente.')
          break
        case 404:
          alert('Paciente não encontrado.')
          break
        default:
          alert('Erro ao carregar triagens. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-AO')
}

onMounted(() => {
  fetchPacientes().then(() => {
    setTimeout(renderizarGrafico, 300)
  })
})
</script> 