import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Step1 from '@/views/Step1_Source.vue'
import Step2 from '@/views/Step2_AmpEnv.vue'
import Step3 from '@/views/Step3_Filter.vue'
import Step4 from '@/views/Step4_Interaction.vue'
import Step5 from '@/views/Step5_Record.vue'
import Step6 from '@/views/Step6_Export.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    { path: '/step/1', name: 'step1', component: Step1 },
    { path: '/step/2', name: 'step2', component: Step2 },
    { path: '/step/3', name: 'step3', component: Step3 },
    { path: '/step/4', name: 'step4', component: Step4 },
    { path: '/step/5', name: 'step5', component: Step5 },
    { path: '/step/6', name: 'step6', component: Step6 }
  ]
})

export default router
