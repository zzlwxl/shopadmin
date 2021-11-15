<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="30">
        <el-col :span="15">
          <el-input placeholder="请输入内容" @clear="getUserList" clearable v-model="queryInfo.query">
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="viewAddDialog = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 通过作用域插槽，slotUserRow就是每一行的用户数据 -->
          <template #default="slotUserRow">
            <el-switch v-model="slotUserRow.row.mg_state" @change="userStateChanged(slotUserRow.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175px">
          <template #default="slotUserRow">
            <el-button @click="setUserDataDialog(slotUserRow.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" @click="open(slotUserRow.row.id)" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog @close="viewAddDialogClosed" title="添加用户" :visible.sync="viewAddDialog" width="50%">
      <el-form :model="addFromData" :rules="addFromDataRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addFromData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码 " prop="password">
          <el-input v-model="addFromData.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱 " prop="email">
          <el-input v-model="addFromData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addFromData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog @close="viewSetDialogClosed" title="修改用户信息" :visible.sync="viewSetDialog" width="50%">
      <el-form :model="setFromData" :rules="setFromDataRules" ref="setUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="setFromData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱 " prop="email">
          <el-input v-model="setFromData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="setFromData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewSetDialog = false">取 消</el-button>
        <el-button type="primary" @click="setUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // value要校验的值，cb回调函数
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb()
      }
      cb(new Error('不合法的邮箱'))
    }
    return {
      queryInfo: {
        // 搜索关键字
        query: '',
        //当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userList: [],
      total: 0,
      //控制添加用户对话框的显示与隐藏
      viewAddDialog: false,
      //控制修改用户对话框的显示与隐藏
      viewSetDialog: false,
      // 添加用户的表单数据
      addFromData: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 查询到的用户信息对象
      setFromData: {
      },
      // 添加表单的验证规则
      addFromDataRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '用户名长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '密码长度在 6 到 11个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //自定义校验规则
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号长度必须11字符', trigger: 'blur' },
        ],
      },
      setFromDataRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //自定义校验规则
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号长度必须11字符', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听页码下拉列表的pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果更新失败要还原修改页面上已经修改的状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    viewAddDialogClosed() {
      // 表单重置
      this.$refs.addUserRef.resetFields()
    },
    viewSetDialogClosed(){
      this.$refs.setUserRef.resetFields()
    },
    // 点击按钮，根据表单里的每一个规则对整个表单进行校验，然后再添加新用户
    addUser() {
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addFromData)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.viewAddDialog = false
        this.getUserList()
      })
    },
    setUser(){
      this.$refs.setUserRef.validate(async(valid)=>{
         if (!valid) return
         const {data:res} =await this.$http.put(`users/${this.setFromData.id}`,{
           email:this.setFromData.email,
           mobile:this.setFromData.mobile
           })
         if(res.meta.status !==200){
           this.$message.error('修改用户失败')
         }
         this.$message.success('修改用户成功')
         this.viewSetDialog=false
         this.getUserList()
      })
    },
    async delUser(id){
      const {data:res} = await this.$http.delete(`users/${id}`,id)
      if(res.meta.status!==200){
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async setUserDataDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      console.log(res.data)
      this.setFromData = res.data
      this.viewSetDialog = true
    },
    open(id) {
        this.$messageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.delUser(id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
  },
}
</script>

<style lang="less" scoped></style>
