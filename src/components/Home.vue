<template>
  <el-container class="home-container">
    <!-- 头部  -->
    <el-header>
      <div>
        <img src="@/assets/heima.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button></el-header
    >
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isToggleMenu ? '65px' : '200px'">
          <div class="toggle-menu" @click="toggleMenu">|||</div>
          <!-- :router="true"开启路由模式后根据二级菜单的'/'+subItem.path进行跳转 -->
        <el-menu :default-active="navColState" :router="true" :collapse-transition="false" :collapse="isToggleMenu" :unique-opened="true" background-color="rgb(40, 46, 65)" text-color="#fff" active-text-color="#64B5F6">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconList[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item @click="saveNavColState('/'+subItem.path)" :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
    data(){
        return{
            menulist:[],
            iconList:{
                "125":"el-icon-user-solid",
                "103":"el-icon-lock",
                "101":"el-icon-goods",
                "102":"el-icon-s-order",
                "145":"el-icon-date"
            },
            isToggleMenu:false,
            navColState:''
        }
    },
    created(){
        // 每次刷新都会读取session最新的导航状态
        this.navColState=window.sessionStorage.getItem('activePath')
        this.getMenuList()
    },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList(){
        const {data:res}=await this.$http.get('menus')
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist=res.data
    },
    toggleMenu(){
        this.isToggleMenu=!this.isToggleMenu
    },
    saveNavColState(path){
        // 通过session可以真正的保存导航选中状态，
        // 这样首次进入二级菜单也会拿到导航选中的状态
        window.sessionStorage.setItem('activePath',path)
        // 当从另一个二级菜单退出来后重新选中另一个二级菜单时，
        // 就要新的path传给最新的导航状态
        this.navColState=path
    }
  },
}
</script>
<style lang="less" scoped>
// 每一个组件名称就是一个类名
.el-header {
  background-color: rgb(129, 129, 130);
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  color: rgb(255, 255, 255);
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: rgb(48, 57, 82);
    .el-menu{
        border-right: none;
    }
}
.el-main {
  background-color: rgb(223, 223, 223);
}
.home-container {
  height: 100%;
}
.toggle-menu{
    background-color: rgb(48, 57, 82);
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align:center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>
