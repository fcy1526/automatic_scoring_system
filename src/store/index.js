import Vue from 'vue' // 引入Vue
import Vuex from 'vuex' // 引入Vuex
// 使用Vuex
Vue.use(Vuex)

const state = {
  // 前端按钮权限表
  btnList: {},
  // 当前用户按钮权限表
  userBtn: {}
}

const mutations = {
  addBtnList (state, btnList) {
    state.btnList = btnList
  },
  addUserBtn (state, userBtn) {
    state.userBtn = userBtn
  }
}

const getters = {
  getBtnList (state) {
    return state.btnList
  },
  getUserBtn (state) {
    return state.userBtn
  }
}
// 创建Vuex实例
const store = new Vuex.Store({
  // 这里放全局参数
  state,
  // 这里是set方法
  mutations,
  // 这里是get方法
  getters
})

export default store
