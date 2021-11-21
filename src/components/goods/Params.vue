<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置参数" type="warning"> </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader @change="selectCateChange" v-model="selectedCateKeys" :options="cateList" :props="{ expandTrigger: 'hover', ...cateListProps }"></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" @click="addDialogVisible = true" :disabled="isBtn" size="mini">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template #default="scope">
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <!-- v-model="scope.row.inputValue" 
                这个也是双向绑定，也可以理解是在操作manyTableData的data数据 -->
                <el-input 
                v-model="scope.row.inputValue"
                class="input-new-tag" 
                v-if="scope.row.inputVisible" 
                ref="saveTagInput" 
                size="small" 
                @keyup.enter.native="handleInputConfirm(scope.row)" 
                @blur="handleInputConfirm(scope.row)"> </el-input>
                <!-- 标签添加按钮 -->
                <el-button 
                v-else 
                class="button-new-tag"
                 size="small" 
                 @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit">编辑</el-button>
                <el-button type="danger" size="mini" @click="delParams(scope.row.attr_id)" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" @click="addDialogVisible = true" :disabled="isBtn" size="mini">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
             <el-table-column type="expand">
              <template #default="scope">
                <el-tag @close="handleClose(i,scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <!-- v-model="scope.row.inputValue" 
                这个也是双向绑定，也可以理解是在操作manyTableData的data数据 -->
                <el-input 
                v-model="scope.row.inputValue"
                class="input-new-tag" 
                v-if="scope.row.inputVisible" 
                ref="saveTagInput" 
                size="small" 
                @keyup.enter.native="handleInputConfirm(scope.row)" 
                @blur="handleInputConfirm(scope.row)"> </el-input>
                <!-- 标签添加按钮 -->
                <el-button 
                v-else 
                class="button-new-tag"
                 size="small" 
                 @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit">编辑</el-button>
                <el-button type="danger" size="mini" @click="delParams(scope.row.attr_id)" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog @close="addDialogClosed" :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog @close="editDialogClosed" :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      cateListProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //   级联选择框双向绑定到的数组，即选中的分类
      selectedCateKeys: [],
      //   默认选many
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      editForm: {},
      addFormRules: {
        attr_name: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    selectCateChange() {
      this.getParamsData()
    },
    tabClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData=[]
        this.onlyTableData=[]
        return
      }
      console.log(this.cateId)
      // 证明选中的是三级分类
      //   根据所选分类的ID和当前所处的面板来获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach((item) => {
        //   对获取到的数据重新改变结构，字符串变数组,以供其他方法使用最新修改的数据
        item.attr_vals = item.attr_vals !== '' ? item.attr_vals.split(' ') : []
        // 对获取到的数据追加控制文本框的显示与隐藏的数据
        item.inputVisible = false
        // 追加文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        //   动态参数
        this.manyTableData = res.data
      } else {
        //   静态属性
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async addParams() {
      //表单预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
      console.log(id)
    },
    editParams() {
      //表单预验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    async delParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .catch((err) => err)
      // 取消删除操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点或回车按钮被按下时触发
    handleInputConfirm(row) {
      //没有输入任何内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
    // 先对本地这个attr_val进行PUSh，让用户先看到效果
    row.attr_vals.push(row.inputValue.trim())
    row.inputValue=''
    row.inputVisible=false
    //然后再进行服务端的上传，此时row的值已经是最新值了
    this.saveAttrVals(row)
    },
    async saveAttrVals(row){
        const {data:res}= await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`
    ,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        // 把之前改变成的数组再变回字符串
        attr_vals:row.attr_vals.join(' ')
    }
    )
    if(res.meta.status !== 200){
        return this.$message.error('修改参数项失败')
    }
    this.$message.success('修改参数项成功')
    },
    showInput(row) {
      // 点击按钮显示文本输入框
      row.inputVisible = true
      //   el提供的文本框自动获得焦点
      // $nextTick方法的作用，就是当页面上的元素 被重新渲染 之后，才会处理回调函数的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose(i,row){
        // 删除对应的参数可选项
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
    }
  },
  computed: {
    // 当前选中的三级分类的ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    isBtn() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
</style>
