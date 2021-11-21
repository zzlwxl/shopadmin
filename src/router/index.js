import Vue from 'vue'
import Router from 'vue-router'
const Login = () =>import(/* webpackChunkName: "login_home_welcome" */ '@/components/Login.vue')
const Home = () =>import(/* webpackChunkName: "login_home_welcome" */ '@/components/Home.vue')
const Welcome = () =>import(/* webpackChunkName: "login_home_welcome" */ '@/components/Welcome.vue')

const Users = () =>import(/* webpackChunkName: "user_right_role" */ '@/components/user/Users.vue')
const Rights = () =>import(/* webpackChunkName: "user_right_role" */ '@/components/right/Rights.vue')
const Roles = () =>import(/* webpackChunkName: "user_right_role" */ '@/components/right/Roles.vue')

const Cates = () =>import(/* webpackChunkName: "cate_params" */ '@/components/goods/Cates.vue')
const Params = () =>import(/* webpackChunkName: "cate_params" */ '@/components/goods/Params.vue')


const GoodsList = () =>import(/* webpackChunkName: "good_add" */ '@/components/goods/GoodsList.vue')
const AddPage = () =>import(/* webpackChunkName: "good_add" */ '@/components/goods/AddPage.vue')


const Order = () =>import(/* webpackChunkName: "order_report" */ '@/components/goods/Order.vue')
const Report = () =>import(/* webpackChunkName: "order_report" */ '@/components/report/Report.vue')



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
      {path:'/categories',component:Cates},
      {path:'/params',component:Params},
      {path:'/goods',component:GoodsList},
      {path:'/goods/add',component:AddPage},
      {path:'/orders',component:Order},
      {path:'/reports',component:Report},
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
