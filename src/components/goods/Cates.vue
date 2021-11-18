<template>
  <div class="cate">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>
      <el-row>
        <!-- 表格 -->
        <tree-table :data="cateList" :expand-type="false" :selection-type="false" show-index class="treetable" index-text="#" stripe border :show-row-hover="false" :columns="columns">
          <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" @click="editCateData(scope.row.cat_id)" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" @click="delCate(scope.row.cat_id)" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </tree-table>
        <!-- 分页 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      </el-row>
    </el-card>
    <!-- 添加分类的对话框   -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <!-- cat_name规则名称 -->
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectdKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              ...cascaderProps,
              checkStrictly: 'true',
            }"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" @close="editCateDialogClosed" width="50%">
      <!-- el的表单验证必须指定表单数据对象，不然进行表单验证时没有作用,会一直在输入的情况下报错-->
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCataSub">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 商品分类的数据列表,默认为空
      cateList: [],
      // 请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok',
        },
        {
          label: '排序',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order',
        },
        {
          label: '操作',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt',
        },
      ],
      // 添加对话框的分类和隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 父级分类的ID
        cat_pid: 0,
        // 分类层级,默认要添加的是1级分类
        cat_level: 0,
      },
      editCateForm:{
        cat_name:''
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      editCateRules:{
        cat_name:[{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 选中的父级分类的id数组
      selectdKeys: [],
      // 编辑对话框的显示和隐藏
      editCateDialogVisible: false,
      editCateName: '',
      editCateId:''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      // 把数据列表赋值给cateList
      this.cateList = res.data.result
      // 获取商品的总数量
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newValue) {
      this.queryInfo.pagesize = newValue
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选中项发生变化触发
    parentCateChanged() {
      // 如果selectdkeys数组的length大于0，说明有选中的父级分类，反之就说明没有选中任何父级分类
      if (this.selectdKeys.length > 0) {
        //选中的ID中最后一个就是这个分类名称的父级分类ID
        this.addCateForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectdKeys.length
        return
      } else {
        //说明没有选中父级分类，就使用默认的父级分类
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectdKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate() {
      //拿到表单的引用对表单进行预校验
      this.$refs.addCateFormRef.validate(async (valid) => {
        //valid是拿到的校验结果
        //预校验失败
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    async delCate(id) {
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    },
    async editCateData(id){
      this.editCateId=id
      const {data:res}= await this.$http.get(`categories/${id}`)
      if(res.meta.status !== 200){
        return this.$message.error('获取分类失败')
      }
      this.editCateForm.cat_name=res.data.cat_name
      console.log(this.editCateForm.cat_name)
      this.editCateDialogVisible = true
    },
    async editCataSub(){
      const {data:res}= await this.$http.put(`categories/${this.editCateId}`,{cat_name:this.editCateName})
      if(res.meta.status !== 200){
        console.log(res)
        return this.$message.error('修改失败')
      }
      this.getCateList()
      this.$message.success('修改成功')
      this.editCateDialogVisible=false
    },
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_name=''
      this.editCateId=''
    }
  },
}
</script>

<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
