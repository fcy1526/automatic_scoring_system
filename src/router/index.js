import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '@/components/Welcome'
import Student from '../components/user/Student'
import Teacher from '@/components/user/Teacher'
import Class from '@/components/class/Class'
import Auths from '@/components/power/Auths'
import Roles from '@/components/power/Roles'
import Score from '@/components/score/Score'
import Course from '@/components/score/Course'
import Group from '@/components/class/Group'
import StudentScore from '@/components/oper/StudentScore'
import MutualScore from '@/components/oper/MutualScore'
import LeaderScore from '@/components/oper/LeaderScore'
import TeacherScore from '@/components/oper/TeacherScore'
import GroupScore from '@/components/oper/GroupScore'
import SysLog from '@/components/log/SysLog'
import SysErrLog from '@/components/log/SysErrLog'
import UserScore from '@/components/score/UserScore'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/student', component: Student },
      { path: '/teacher', component: Teacher },
      { path: '/class', component: Class },
      { path: '/auth', component: Auths },
      { path: '/role', component: Roles },
      { path: '/score', component: Score },
      { path: '/course', component: Course },
      { path: '/group', component: Group },
      { path: '/studentScore', component: StudentScore },
      { path: '/mutualScore', component: MutualScore },
      { path: '/leaderScore', component: LeaderScore },
      { path: '/teacherScore', component: TeacherScore },
      { path: '/groupScore', component: GroupScore },
      { path: '/sysLog', component: SysLog },
      { path: '/sysErrLog', component: SysErrLog },
      { path: '/userScore', component: UserScore }]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行， next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    window.sessionStorage.clear()
    return next('/login')
  }
  next()
})

export default router
