import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import MedicoLayout from '../layouts/MedicoLayout.vue'
import AdminUsers from '../pages/admin/AdminUsers.vue'
import AdminGabinetes from '../pages/admin/AdminGabinetes.vue'
import AdminHospitais from '../pages/admin/AdminHospitais.vue'
import AdminAmbulancias from '../pages/admin/AdminAmbulancias.vue'
import MedicoPacientes from '../pages/medico/MedicoPacientes.vue'
import MedicoTriagens from '../pages/medico/MedicoTriagens.vue'
import MedicoEncaminhamentos from '../pages/medico/MedicoEncaminhamentos.vue'
import GerenteLayout from '../layouts/GerenteLayout.vue'
import GerenteDashboard from '../pages/gerente/GerenteDashboard.vue'
import GerenteRelatorios from '../pages/gerente/GerenteRelatorios.vue'
import GerentePacientes from '../pages/gerente/GerentePacientes.vue'
import GerenteHospitais from '../pages/gerente/GerenteHospitais.vue'
import GerenteAmbulancias from '../pages/gerente/GerenteAmbulancias.vue'
import MedicoPacienteTriagens from '../pages/medico/MedicoPacienteTriagens.vue'
import AdminLogs from '../pages/admin/AdminLogs.vue'
import TecnicoLayout from '../layouts/TecnicoLayout.vue'
import TecnicoDashboard from '../pages/tecnico/TecnicoDashboard.vue'
import GestaoAmbulancias from '../pages/tecnico/GestaoAmbulancias.vue'
import CoordenacaoTransportes from '../pages/tecnico/CoordenacaoTransportes.vue'
import ManutencaoLogistica from '../pages/tecnico/ManutencaoLogistica.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
  {
    path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
    component: LoginPage
  },
  {
      path: '/dashboard/admin',
      component: AdminLayout,
      children: [
        {
          path: 'usuarios',
          component: AdminUsers
        },
        {
          path: 'gabinetes',
          component: AdminGabinetes
        },
        {
          path: 'hospitais',
          component: AdminHospitais
        },
        {
          path: 'ambulancias',
          component: AdminAmbulancias
        },
        {
          path: 'logs',
          component: AdminLogs
        },
        {
          path: 'pacientes',
          component: MedicoPacientes
        }
      ]
    },
    {
      path: '/dashboard/medico',
      component: MedicoLayout,
      children: [
        {
          path: 'pacientes',
          component: MedicoPacientes
        },
        {
          path: 'triagens',
          component: MedicoTriagens
        },
        {
          path: 'encaminhamentos',
          component: MedicoEncaminhamentos
        },
        {
          path: 'pacientes/:id/triagens',
          name: 'medico-paciente-triagens',
          component: MedicoPacienteTriagens,
          meta: { requiresAuth: true, role: 'medico' }
        }
      ]
    },
    {
      path: '/dashboard/gestor',
      component: GerenteLayout,
      children: [
        {
          path: '',
          component: GerenteDashboard
        },
        {
          path: 'pacientes',
          component: GerentePacientes
        },
        {
          path: 'hospitais',
          component: GerenteHospitais
        },
        {
          path: 'ambulancias',
          component: GerenteAmbulancias
        },
        {
          path: 'relatorios',
          component: GerenteRelatorios
        }
      ]
    },
    {
      path: '/dashboard/tecnico',
      component: TecnicoLayout,
      children: [
        {
          path: '',
          component: TecnicoDashboard
        },
        {
          path: 'ambulancias',
          component: GestaoAmbulancias
        },
        {
          path: 'coordenacao',
          component: CoordenacaoTransportes
        },
        {
          path: 'manutencao',
          component: ManutencaoLogistica
        }
      ]
    }
  ]
})

// Middleware de autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!token && to.path !== '/login') {
    return next('/login')
  }

  // Se estiver autenticado e tentar acessar a página de login
  if (token && to.path === '/login') {
    // Redireciona baseado no tipo de usuário
    if (user.tipo === 'admin') {
      return next('/dashboard/admin/usuarios')
    } else if (user.tipo === 'medico') {
      return next('/dashboard/medico/pacientes')
    } else if (user.tipo === 'gestor') {
      return next('/dashboard/gestor')
    } else if (user.tipo === 'tecnico') {
      return next('/dashboard/tecnico')
    } else {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      return next('/login')
    }
  }

  // Verifica permissões de acesso
  if (to.path.startsWith('/dashboard/admin') && user.tipo !== 'admin') {
    return next('/login')
  } else if (to.path.startsWith('/dashboard/medico') && user.tipo !== 'medico') {
    return next('/login')
  } else if (to.path.startsWith('/dashboard/gestor') && user.tipo !== 'gestor') {
    return next('/login')
  } else if (to.path.startsWith('/dashboard/tecnico') && user.tipo !== 'tecnico') {
    return next('/login')
  } else {
    next()
  }
})

export default router