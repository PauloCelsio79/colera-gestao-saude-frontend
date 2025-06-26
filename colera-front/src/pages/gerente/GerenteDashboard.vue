<template>
  <PainelPrevencaoColera />
  <div class="space-y-6">
    <!-- Alerta de hospitais lotados -->
    <div v-if="hospitaisLotados.length > 0" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Atenção!</strong>
      <span class="block">Os seguintes hospitais estão em capacidade máxima:</span>
      <ul class="list-disc ml-6">
        <li v-for="h in hospitaisLotados" :key="h.id">{{ h.nome }}</li>
      </ul>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total de Pacientes -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total de Pacientes
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ metricas.totalPacientes }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Casos de Alto Risco -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Casos de Alto Risco
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ metricas.casosAltoRisco }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Leitos Disponíveis -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <HomeIcon class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Leitos Disponíveis
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ metricas.leitosDisponiveis }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Ambulâncias Disponíveis -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TruckIcon class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Ambulâncias Disponíveis
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ metricas.ambulanciasDisponiveis }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <!-- Casos por Nível de Risco -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Casos por Nível de Risco
        </h3>
        <div class="h-64">
          <canvas ref="riscoChart"></canvas>
        </div>
      </div>

      <!-- Evolução de Casos -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Evolução de Casos
        </h3>
        <div class="h-64">
          <canvas ref="evolucaoChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Últimos Encaminhamentos -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-gray-900">
          Últimos Encaminhamentos
        </h3>
      </div>
      <div class="border-t border-gray-200">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="encaminhamento in ultimosEncaminhamentos" :key="encaminhamento.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ encaminhamento.paciente?.nome || 'N/A' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ encaminhamento.hospital?.nome || 'N/A' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': encaminhamento.status === 'pendente',
                    'bg-blue-100 text-blue-800': encaminhamento.status === 'em_andamento',
                    'bg-green-100 text-green-800': encaminhamento.status === 'concluido'
                  }"
                >
                  {{ encaminhamento.status }}
                </span>
                <span class="ml-4 text-sm text-gray-500">
                  {{ formatDate(encaminhamento.created_at) }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  TruckIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'
import PainelPrevencaoColera from '@/components/PainelPrevencaoColera.vue'

const metricas = ref({
  totalPacientes: 0,
  casosAltoRisco: 0,
  leitosDisponiveis: 0,
  ambulanciasDisponiveis: 0
})

const ultimosEncaminhamentos = ref([])
const riscoChart = ref(null)
const evolucaoChart = ref(null)

const hospitaisLotados = ref([])

const fetchMetricas = async () => {
  try {
    console.log('Buscando métricas do dashboard...')
    
    // Buscar estatísticas dos hospitais
    const responseHospitais = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de hospitais:', responseHospitais.data)

    // Calcular total de leitos disponíveis
    const hospitais = Array.isArray(responseHospitais.data) ? responseHospitais.data : 
                     (responseHospitais.data?.data || [])
    const leitosDisponiveis = hospitais.reduce((total, hospital) => {
      return total + (hospital.leitos_disponiveis || 0)
    }, 0)

    // Hospitais lotados
    hospitaisLotados.value = hospitais.filter(h => h.leitos_disponiveis === 0)

    // Buscar todas as triagens para calcular estatísticas
    const responseTriagens = await axios.get('http://127.0.0.1:8000/api/triagens', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de triagens:', responseTriagens.data)

    // Calcular estatísticas das triagens
    const triagens = Array.isArray(responseTriagens.data) ? responseTriagens.data : 
                    (responseTriagens.data?.data || [])

    const estatisticasTriagens = {
      total: triagens.length,
      alto_risco: triagens.filter(t => t.nivel_risco === 'alto').length,
      medio_risco: triagens.filter(t => t.nivel_risco === 'medio').length,
      baixo_risco: triagens.filter(t => t.nivel_risco === 'baixo').length,
      evolucao: calcularEvolucaoCasos(triagens)
    }

    console.log('Estatísticas calculadas:', estatisticasTriagens)

    // Buscar ambulâncias disponíveis
    const responseAmbulancias = await axios.get('http://127.0.0.1:8000/api/ambulancias', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    console.log('Lista de ambulâncias:', responseAmbulancias.data)

    // Calcular ambulâncias disponíveis
    const ambulancias = Array.isArray(responseAmbulancias.data) ? responseAmbulancias.data : 
                       (responseAmbulancias.data?.data || [])
    const ambulanciasDisponiveis = ambulancias.filter(a => a.status === 'disponivel').length

    // Atualizar métricas com os dados recebidos
    metricas.value = {
      totalPacientes: estatisticasTriagens.total,
      casosAltoRisco: estatisticasTriagens.alto_risco,
      leitosDisponiveis: leitosDisponiveis,
      ambulanciasDisponiveis: ambulanciasDisponiveis
    }

    console.log('Métricas atualizadas:', metricas.value)

    // Atualizar gráfico de risco
    if (riscoChart.value) {
      new Chart(riscoChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Alto Risco', 'Médio Risco', 'Baixo Risco'],
          datasets: [{
            data: [
              estatisticasTriagens.alto_risco,
              estatisticasTriagens.medio_risco,
              estatisticasTriagens.baixo_risco
            ],
            backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

    // Atualizar gráfico de evolução
    if (evolucaoChart.value) {
      new Chart(evolucaoChart.value, {
        type: 'line',
        data: {
          labels: estatisticasTriagens.evolucao.dates,
          datasets: [{
            label: 'Casos',
            data: estatisticasTriagens.evolucao.casos,
            borderColor: '#3B82F6',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar estas estatísticas.')
          break
        default:
          alert('Erro ao carregar estatísticas. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }
}

// Função para calcular a evolução dos casos
const calcularEvolucaoCasos = (triagens) => {
  // Agrupar triagens por data
  const casosPorData = triagens.reduce((acc, triagem) => {
    const data = new Date(triagem.created_at).toLocaleDateString('pt-AO')
    acc[data] = (acc[data] || 0) + 1
    return acc
  }, {})

  // Ordenar datas
  const datas = Object.keys(casosPorData).sort((a, b) => new Date(a) - new Date(b))

  // Retornar dados formatados para o gráfico
  return {
    dates: datas,
    casos: datas.map(data => casosPorData[data])
  }
}

const fetchUltimosEncaminhamentos = async () => {
  try {
    console.log('Buscando últimos encaminhamentos...')
    const response = await axios.get('http://127.0.0.1:8000/api/encaminhamentos?limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Últimos encaminhamentos:', response.data)
    
    // Garante que os dados estejam no formato correto
    if (Array.isArray(response.data)) {
      ultimosEncaminhamentos.value = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      ultimosEncaminhamentos.value = response.data.data
    } else {
      console.error('Formato de dados inesperado:', response.data)
      ultimosEncaminhamentos.value = []
    }
  } catch (error) {
    console.error('Erro ao buscar encaminhamentos:', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          alert('Sessão expirada. Por favor, faça login novamente.')
          break
        case 403:
          alert('Você não tem permissão para visualizar encaminhamentos.')
          break
        default:
          alert('Erro ao carregar encaminhamentos. Por favor, tente novamente.')
      }
    } else {
      alert('Erro de conexão. Verifique se o servidor está rodando.')
    }
    ultimosEncaminhamentos.value = []
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-AO')
}

onMounted(() => {
  fetchMetricas()
  fetchUltimosEncaminhamentos()
})
</script> 