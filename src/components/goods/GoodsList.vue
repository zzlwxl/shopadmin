<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input @clear="getGoodsList" clearable v-model="queryInfo.query" placeholder="请输入内容">
            <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="goAddPage" type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column width="95px" prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column width="70px" prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column width="140px" prop="add_time" label="创建时间">
          <template #default="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column width="200px" label="操作">
          <template #default="scope">
            <el-button @click="editCate(scope.row.goods_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button @click="removeById(scope.row.goods_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <el-dialog
    @close="editClosed"
  title="修改商品"
  :visible.sync="editVisible"
  width="50%">
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
  <el-tabs>
          <!-- name:该选项卡在选项卡列表中的顺序值 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="editForm.goods_number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数">
            <el-form-item v-if="item.attr_sel !== 'only'"  :label="item.attr_name" v-for="item in editForm.attrs" :key="item.index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cb, i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" >
            <el-upload :headers="headerObj" :file-list= "pics" :action="uploadURL" list-type="picture" >
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
          </el-tab-pane>
        </el-tabs>
        
  
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editVisible = false">取 消</el-button>
    <el-button type="primary" @click="editSub()">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询参数对象
      queryInfo: {
        //查询的内容
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
       uploadURL: 'http://item.wangxuelong.vip:8888/api/private/v1/upload',
      editFormRules:{
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
      },
      // 商品列表
      goodslist: [],
      editForm:{
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
         goods_introduce:'',
        // 商品详情的介绍
         attrs:[]
      },
      goodId:'',
      editVisible:false,
      // 总数据条数
        pics: [],
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //根据分页获取对应的商品
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async removeById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .catch((err) => err)
        if(confirmResult !== 'confirm'){
            return this.$message.info('已经取消了删除')
        }
        const {data:res}= await this.$http.delete(`goods/${id}`)
        if(res.meta.status !==200){
            return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getGoodsList()
    },
    goAddPage(){
        this.$router.push('/goods/add')
    },
    async editCate(id){
      this.goodId=id
      this.editVisible=true
      const {data:res}= await this.$http.get(`goods/${id}`)
      if(res.meta.status !== 200){
        return this.$message.error('获取商品失败')
      }
      console.log(res.data)
      res.data.pics.some((item) => {
          this.pics.push({name:'',url:`http://item.wangxuelong.vip:8888${item.pics_big}`})
        })
      res.data.attrs.some((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
      this.editForm=res.data
console.log(this.pics)
    },
    async editSub(){
      const {data:res}= await this.$http.put(`goods/${this.goodId}`,this.editForm)
      if(res.meta.status !== 200){
        return this.$message.error('提交失败')
      }
      this.$message.success('提交成功')
      this.editVisible=false
      this.getGoodsList()
    },
    editClosed(){
      this.pics=[]
      this.goodId=''
    }
  },
}
</script>

<style lang="less" scope>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
