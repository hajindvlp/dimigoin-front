import Register from '../paths/auth/register/Register.vue'
import RegisterStepOne from '../paths/auth/register/RegisterStepOne.vue'
import RegisterStepTwo from '../paths/auth/register/RegisterStepTwo.vue'
import RegisterStepThree from '../paths/auth/register/RegisterStepThree.vue'
import RegisterSideOne from '../paths/auth/register/RegisterSideOne.vue'
import RegisterSideTwo from '../paths/auth/register/RegisterSideTwo.vue'
import RegisterSideThree from '../paths/auth/register/RegisterSideThree.vue'

import Login from '../paths/auth/Login.vue'

import { withPrefix } from '../../src/util'

export default withPrefix('/auth', [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '로그인' }
  },
  {
    path: '/register',
    component: Register,
    children: [
      {
        path: '',
        name: 'register',
        redirect: { name: 'register/step/1' }
      },
      {
        path: 'step/1',
        name: 'register/step/1',
        components: {
          side: RegisterSideOne,
          form: RegisterStepOne
        },
        meta: { title: '회원가입' }
      },
      {
        path: 'step/2',
        name: 'register/step/2',
        components: {
          side: RegisterSideTwo,
          form: RegisterStepTwo
        },
        meta: { title: '회원가입' }
      },
      {
        path: 'step/3',
        name: 'register/step/3',
        components: {
          side: RegisterSideThree,
          form: RegisterStepThree
        }
      }
    ]
  }
])
