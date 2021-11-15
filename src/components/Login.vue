<template>
  <div class="login_container">
    <div class="login_box">
      <div class="acatar_box">
        <img src="@/assets/logo.png" alt="" />
      </div>
      <el-form ref="loginFormRef" :rules="loginFromRules" class="login_form" :model="loginFrom">
        <el-form-item prop="username">
          <el-input v-model="loginFrom.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginFrom.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login" round>登录</el-button>
          <el-button @click="resetLoginForm" type="info" round>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginFrom: {
        username: 'admin',
        password: '123456',
      },
      loginFromRules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  created(){
      window.sessionStorage.clear()  
  },
  methods: {
      resetLoginForm(){
          this.$refs.loginFormRef.resetFields()
      },
      login(){
        //   结合表单验证来使用
          this.$refs.loginFormRef.validate(async valid=>{
              if(valid===false)return
            // await把promise对象简化成普通对象，
            // 因为普通对象真正的数据是里面的data，所以解构出来data并重命名为res
              const {data:res}= await this.$http.post("login",this.loginFrom)
              console.log(res)
              if(res.meta.status!==200)return this.$message.error('登录失败')
              this.$message.success('登录成功')
              window.sessionStorage.setItem('token',res.data.token)
              this.$router.push('/home')
          })
      }
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: rgb(0, 56, 135);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.acatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 50%;
  padding: 10px;
  position: absolute;
  left: 50%;
  top: -20%;
  transform: translate(-50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
</style>
