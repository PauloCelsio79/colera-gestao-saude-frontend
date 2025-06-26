<template>
  <PainelPrevencaoColera />
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Triagens do Paciente
        </h3>
        <div class="flex space-x-4">
          <button
            @click="openNewTriagemModal"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Nova Triagem
          </button>
          <button
            @click="router.back()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Voltar
          </button>
        </div>
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
              Data
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nível de Risco
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sintomas
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Observações
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="triagem in triagens" :key="triagem.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(triagem.created_at) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRiscoClass(triagem.nivel_risco)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ triagem.nivel_risco }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">
                <ul class="list-disc list-inside">
                  <li v-for="(value, key) in triagem.sintomas" :key="key" v-if="value">
                    {{ formatSintoma(key) }}
                  </li>
                </ul>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ triagem.observacoes || 'Nenhuma observação' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewEncaminhamento(triagem)"
                class="text-primary-600 hover:text-primary-900"
              >
                Ver Encaminhamento
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Nova Triagem -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Nova Triagem
            </h3>
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Sintomas</label>
                  <div class="mt-2 space-y-2">
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.sintomas.diarreia" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                      <span class="ml-2">Diarréia</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.sintomas.vomito" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                      <span class="ml-2">Vômito</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.sintomas.desidratacao" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                      <span class="ml-2">Desidratação</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.sintomas.dor_abdominal" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                      <span class="ml-2">Dor Abdominal</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.sintomas.fraqueza" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                      <span class="ml-2">Fraqueza</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nível de Risco</label>
                  <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-primary-500 focus:ring-primary-500 sm:text-sm" :value="form.nivel_risco.charAt(0).toUpperCase() + form.nivel_risco.slice(1) + ' Risco'" readonly />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    v-model="form.observacoes"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  ></textarea>
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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const triagens = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const form = ref({
  sintomas: {
    diarreia: false,
    vomito: false,
    desidratacao: false,
    dor_abdominal: false,
    fraqueza: false
  },
  nivel_risco: 'baixo',
  observacoes: ''
})

const fetchTriagens = async () => {
  loading.value = true
  error.value = null
  try {
    const pacienteId = route.params.id
    console.log('Buscando triagens do paciente:', pacienteId)

    const response = await axios.get(`http://127.0.0.1:8000/api/pacientes/${pacienteId}/triagens`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Triagens recebidas:', response.data)
    triagens.value = Array.isArray(response.data) ? response.data : response.data.data || []
  } catch (error) {
    console.error('Erro ao buscar triagens:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          error.value = 'Sessão expirada. Por favor, faça login novamente.'
          break
        case 403:
          error.value = 'Você não tem permissão para acessar estas triagens.'
          break
        case 404:
          error.value = 'Paciente não encontrado.'
          break
        default:
          error.value = 'Erro ao carregar triagens. Por favor, tente novamente.'
      }
    } else {
      error.value = 'Erro de conexão. Verifique se o servidor está rodando.'
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatSintoma = (sintoma) => {
  const sintomas = {
    diarreia: 'Diarréia',
    vomito: 'Vômito',
    desidratacao: 'Desidratação',
    dor_abdominal: 'Dor Abdominal',
    fraqueza: 'Fraqueza'
  }
  return sintomas[sintoma] || sintoma
}

const getRiscoClass = (risco) => {
  const classes = {
    baixo: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    alto: 'bg-red-100 text-red-800'
  }
  return classes[risco.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const viewEncaminhamento = (triagem) => {
  if (triagem.encaminhamento) {
    router.push(`/dashboard/medico/encaminhamentos/${triagem.encaminhamento.id}`)
  } else {
    alert('Esta triagem não possui encaminhamento.')
  }
}

const openNewTriagemModal = () => {
  form.value = {
    sintomas: {
      diarreia: false,
      vomito: false,
      desidratacao: false,
      dor_abdominal: false,
      fraqueza: false
    },
    nivel_risco: 'baixo',
    observacoes: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    sintomas: {
      diarreia: false,
      vomito: false,
      desidratacao: false,
      dor_abdominal: false,
      fraqueza: false
    },
    nivel_risco: 'baixo',
    observacoes: ''
  }
}

const handleSubmit = async () => {
  try {
    const pacienteId = route.params.id
    const data = {
      paciente_id: parseInt(pacienteId),
      ...form.value
    }

    console.log('Enviando triagem:', data)

    const response = await axios.post('http://127.0.0.1:8000/api/triagens', data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Triagem criada:', response.data)
    await fetchTriagens()
    closeModal()
  } catch (error) {
    console.error('Erro ao criar triagem:', error)
    if (error.response) {
      const mensagensErro = error.response.data.errors || {}
      const mensagem = Object.entries(mensagensErro)
        .map(([campo, erros]) => `${campo}: ${erros.join(', ')}`)
        .join('\n')
      alert(`Erro ao criar triagem:\n${mensagem}`)
    } else {
      alert('Erro ao criar triagem. Verifique a conexão com o servidor.')
    }
  }
}

// Função para calcular o risco automaticamente
function calcularRisco(sintomas) {
  const total = Object.values(sintomas).filter(Boolean).length;
  if (sintomas.desidratacao || total >= 3) return 'alto';
  if (total === 2) return 'medio';
  return 'baixo';
}

// Atualiza o risco automaticamente ao mudar sintomas
watch(() => form.value.sintomas, (novosSintomas) => {
  form.value.nivel_risco = calcularRisco(novosSintomas);
}, { deep: true });

onMounted(fetchTriagens)
</script> 