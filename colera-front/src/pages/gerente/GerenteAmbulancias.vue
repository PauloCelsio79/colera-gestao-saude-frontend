<template>
  <div class="card">
    <!-- Header -->
    <div class="px-4 py-5 border-b border-secondary-700 sm:px-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-secondary-100">
          Gerenciamento de Ambulâncias
        </h3>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-700">
        <thead class="bg-secondary-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Placa
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Modelo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Hospital
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody class="bg-secondary-800 divide-y divide-secondary-700">
          <tr v-for="ambulancia in ambulancias" :key="ambulancia.id" class="hover:bg-secondary-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-secondary-100">{{ ambulancia.placa }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ ambulancia.modelo }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-secondary-400">{{ getHospitalName(ambulancia.hospital_id) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-800 text-green-100': ambulancia.status === 'disponivel',
                  'bg-yellow-800 text-yellow-100': ambulancia.status === 'em_deslocamento',
                  'bg-red-800 text-red-100': ambulancia.status === 'em_manutencao'
                }"
              >
                {{ ambulancia.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const ambulancias = ref([])
const hospitais = ref([])

const fetchAmbulancias = async () => {
  try {
    console.log('Buscando ambulâncias...')
    const response = await axios.get('http://127.0.0.1:8000/api/ambulancias', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API:', response.data)
    
    // Garante que os dados estejam no formato correto
    let ambulanciasData = []
    if (Array.isArray(response.data)) {
      ambulanciasData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      ambulanciasData = response.data.data
    } else if (typeof response.data === 'object') {
      // Se for um objeto único, converte para array
      ambulanciasData = [response.data]
    }

    // Processa e valida cada ambulância
    ambulancias.value = ambulanciasData
      .filter(ambulancia => ambulancia && typeof ambulancia === 'object')
      .map(ambulancia => ({
        id: ambulancia.id || null,
        placa: ambulancia.placa || 'Placa não informada',
        modelo: ambulancia.modelo || 'Modelo não informado',
        hospital_id: ambulancia.hospital_id || null,
        status: ambulancia.status || 'disponivel',
        latitude: parseFloat(ambulancia.latitude) || 0,
        longitude: parseFloat(ambulancia.longitude) || 0
      }))

    console.log('Total de ambulâncias carregadas:', ambulancias.value.length)
    console.log('Ambulâncias processadas:', ambulancias.value)

    // Atualizar a lista de hospitais se necessário
    if (hospitais.value.length === 0) {
      await fetchHospitais()
    }
  } catch (error) {
    console.error('Erro ao buscar ambulâncias:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      if (error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else {
        alert(error.response.data.message || 'Erro ao carregar ambulâncias')
      }
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
    ambulancias.value = []
  }
}

const fetchHospitais = async () => {
  try {
    console.log('Buscando hospitais...')
    const response = await axios.get('http://127.0.0.1:8000/api/hospitais', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Resposta da API de hospitais:', response.data)
    
    // Garante que os dados estejam no formato correto
    let hospitaisData = []
    if (Array.isArray(response.data)) {
      hospitaisData = response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      hospitaisData = response.data.data
    }

    // Processa e valida cada hospital
    hospitais.value = hospitaisData
      .filter(hospital => hospital && typeof hospital === 'object')
      .map(hospital => ({
        id: hospital.id,
        nome: hospital.nome || 'Nome não informado',
        tipo: hospital.tipo || 'outro',
        endereco: hospital.endereco || 'Endereço não informado'
      }))

    console.log('Total de hospitais carregados:', hospitais.value.length)
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error)
    if (error.response) {
      console.error('Status do erro:', error.response.status)
      console.error('Dados do erro:', error.response.data)
      if (error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else {
        alert(error.response.data.message || 'Erro ao carregar hospitais')
      }
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
      alert('Erro de conexão com o servidor')
    } else {
      console.error('Mensagem de erro:', error.message)
      alert(error.message)
    }
    hospitais.value = []
  }
}

const getHospitalName = (hospitalId) => {
  if (!hospitalId || !Array.isArray(hospitais.value)) return 'N/A'
  const hospital = hospitais.value.find(h => h.id === hospitalId)
  return hospital ? hospital.nome : 'N/A'
}

// Adicionar função para recarregar os dados
const reloadAmbulancias = () => {
  fetchAmbulancias()
}

// Atualizar o onMounted para incluir um intervalo de atualização
onMounted(() => {
  fetchAmbulancias()
  fetchHospitais()
  
  // Recarregar os dados a cada 30 segundos
  const interval = setInterval(() => {
    fetchAmbulancias()
  }, 30000)

  // Limpar o intervalo quando o componente for desmontado
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script> 