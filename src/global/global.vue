<script>
import Vue from 'vue'
import store from '@/store'

export default {
  methods: {
    // 获取按钮权限表
    async getAllBtn () {
      const { data: res } = await Vue.prototype.$http.get('userapi/auth')
      store.commit('addBtnList', res.data)
    },
    // 获取用户按钮表
    async getUserBtn () {
      const { data: res } = await Vue.prototype.$http.get('userapi/auth/user')
      store.commit('addUserBtn', res.data)
    },
    // 刷新全局变量
    reset () {
      if (JSON.stringify(store.state.btnList) === '{}') {
        // 全局变量/Vuex为空 说明发生页面刷新或其他情况 重新请求
        // JavaScript代码是运行在内存当中的，代码运行时的变量，函数，也都是保存在内存中的。
        // 刷新页面后，之前申请的所有内存会被释放，重新加载JavaScript代码，变量和函数将重新赋值和初始化。
        // 因此，刷新页面保留数据就必须使用外部存储——客户端 or 服务器
        this.getAllBtn()
      }
      if (JSON.stringify(store.state.userBtn) === '{}') {
        this.getUserBtn()
      }
    }
  }
}
</script>
