import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/right/Rights.vue'
import Roles from '@/components/right/Roles.vue'
import Cates from '@/components/goods/Cates.vue'
Vue.use(Router)

const router=new Router({
  routes :[
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {path:'/home',component:Home,redirect:'/welcome',
    children:[
      {path:'/users',component:Users},
      {path:'/welcome',component:Welcome},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cates}
    ]
  }
  ]
})
router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next() //如果访问的是登陆页，就放行。
  //此时检测到不是登陆页，就要拿到token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token就要去登陆
  if(!tokenStr) return next('/login')
  //有token，直接放行
  next()
})

export default router
