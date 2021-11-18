import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import '@/assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
Vue.config.productionTip = false
// 请求根路径
axios.defaults.baseURL='http://item.wangxuelong.vip:8888/api/private/v1/'

// 通过axios请求拦截器添加token，保证用于获取数据的权限
axios.interceptors.request.use(config=>{
  //为 请求头 添加token验证的Authorization字段
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
  // 首次登陆没有给token令牌，登陆成功后会给令牌，然后才能访问其他页面
})

Vue.prototype.$http=axios
Vue.component('tree-table',TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
