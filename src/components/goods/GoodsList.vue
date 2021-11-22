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
            <el-form-item   :label="item.attr_name" v-for="item in editForm.attrs" :key="item.index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cb, i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" >
           <el-upload
  class="upload-demo"
  :headers="headerObj" 
  :action="uploadURL"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  :file-list="editForm.pics"
  :on-success="handleSuccess"
  list-type="picture">
  <el-button size="small" type="primary">点击上传</el-button>
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

  <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img class="previewImg" :src="previewPath" alt="">
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
        previewPath:'',
      editForm:{
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
         goods_introduce:'',
        // 商品详情的介绍
         attrs:[],
        pics: [],
      },
        previewVisible:false,
      goodId:'',
      editVisible:false,
      // 总数据条数
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
    // 处理图片预览
    handlePreview(file) {
      console.log(file)
    //   由于这里默认是本地服务器，所以可以替换成目标服务器即可
      this.previewPath = file.url.replace('http://127.0.0.1', 'http://item.wangxuelong.vip')
      console.log(this.previewPath)
      this.previewVisible=true
    },
    handleRemove(file) {
      console.log(file)
      //   获取将要删除的图片的临时路径
      const filePath = file.url
      //   从表单中pics数组中，找到这个图片对应的索引值
      const i = this.editForm.pics.findIndex((x) => x.pic === filePath)
      //根据索引值把这个图片从表单中删除掉
      this.editForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      const picInfo = { pic: response.data.tmp_path }
      console.log(picInfo)
      this.editForm.pics.push(picInfo)
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
      // console.log(res.data)
      res.data.attrs.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
      this.editForm=res.data
       this.editForm.pics=res.data.pics.map((item)=>{
        return {name:'查看',url:`http://item.wangxuelong.vip:8888${item.pics_big}`}
      })
      // console.log(this.editForm.pics)
      this.editForm.attrs=this.editForm.attrs.filter((item)=>{
        return item.attr_name === '版式'
      })
console.log(this.editForm.attrs)
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
      this.goodId=''
    }
  },
}
</script>

<style lang="less" scope>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg{
    width: 100%;
}
</style>
