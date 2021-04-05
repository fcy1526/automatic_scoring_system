import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './plugins/element.js'
/* 导入全局样式表 */
import './assets/css/global.css'
/* 导入图标 */
import './assets/fonts/iconfont.css'
import '../vue.config'
import 'element-theme-chalk'
/* 全局变量 */
import global from './global/global'

import axios from 'axios'

axios.defaults.baseURL = '/api'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须返回 config
  return config
})
axios.interceptors.response.use(response => {
  // console.log(response)
  return response
}, error => {
  // 当响应异常时
  const isTimeout = error.toString().includes('timeout')
  if (isTimeout) {
    Vue.prototype.$message({
      message: '请求超时...',
      type: 'warning',
      duration: 2000,
      showClose: true
    })
  }
  const isLogTimeout = error.toString().includes('401')
  if (isLogTimeout) {
    // 登录超时, 跳转至登录界面
    Vue.prototype.$message({
      message: '登录过期，请重新登录',
      type: 'warning',
      duration: 2000,
      showClose: true
    })
    window.sessionStorage.clear()
    router.push({
      path: '/login'
    })
  }
  return Promise.reject(error)
})
Vue.prototype.$http = axios
Vue.prototype.$store = store
// 设为全局变量
Vue.prototype.global = global
Vue.config.productionTip = false

// 自定义指令
Vue.directive('auth', {
  inserted: function (el, binding) {
    permissionJudge(binding.value).then(bool => {
      if (!bool) { // 对返回值进行判断
        // 无对应权限，移除dom
        el.parentNode.removeChild(el)
      } else {
        // 显示按钮
        el.style.display = ''
      }
    })
    function permissionJudge (value) { // 权限验证
      return new Promise(function (resolve, reject) {
        // 设置延迟加载，因为按钮名称表是从后端异步获取的，所以需要延迟才能保证获取到最新的数据
        setTimeout(function () {
          const btnList = store.state.btnList // 权限按钮列表，包含了系统内的所有权限按钮名称
          const userBtn = store.state.userBtn // 当前用户的权限按钮列表
          for (const btn in userBtn) {
            if (userBtn[btn] === btnList[value]) {
              // 拥有权限
              resolve(true) // 返回true
            }
          }
          resolve(false) // 返回false
        }, 700)
      })
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
