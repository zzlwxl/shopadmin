<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon> </el-alert>
      <!-- :active="activeIndex-0" 类数字的字符串转为真正的数字型 -->
      <!-- active	设置当前激活的步骤	number -->
      <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form label-position="top" :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-tabs @tab-click="tabClicked" :before-leave="beforeTabLeave" v-model="activeIndex" :tab-position="'left'">
          <!-- name:该选项卡在选项卡列表中的顺序值 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item prop="goods_cat" label="商品分类">
              <el-cascader @change="selectCateChange" v-model="addForm.goods_cat" :options="catelist" :props="{ expandTrigger: 'hover', ...cateListProps }"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cb, i) in item.attr_vals" :key="i" :label="cb"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="4">
            <el-upload :headers="headerObj" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="3">
              <!-- 文本编辑器 -->
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <el-button @click="add" class="btnAdd" type="primary">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img class="previewImg" :src="previewPath" alt="">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      catelist: [],
      selectedCateKeys: [],
      //   (many)动态参数列表数据
      manyTableData: [],
      //   (only)静态属性列表数据
      onlyTableData: [],
      uploadURL: 'http://item.wangxuelong.vip:8888/api/private/v1/upload',
      //   图片上传组件的header请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      previewPath: '',
      previewVisible:false,
      cateListProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //   商品所属的分类数组
        goods_cat: [],
        pics: [],
        // 商品详情的介绍
         goods_introduce:'',
         attrs:[]
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
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
        return this.$message.error('获取失败')
      }
      this.catelist = res.data
      console.log(res.data)
    },
    selectCateChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      this.getCateList()
    },
    beforeTabLeave(activeName, oldActiveName) {
      console.log('将要离开:' + oldActiveName)
      console.log('将要进入:' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked() {
      //说明访问的商品参数(many)面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, {
          params: { sel: 'many' },
        })
        if (res.meta.status == !200) {
          return this.$message.error('获取动态参数失败')
        }
        console.log(res.data)
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, {
          params: { sel: 'only' },
        })
        if (res.meta.status == !200) {
          return this.$message.error('获取静态属性失败')
        }
        console.log(res.data)
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览
    handlePreview(file) {
      console.log(file)
    //   由于这里默认是本地服务器，所以可以替换成目标服务器即可
      this.previewPath = file.response.data.url.replace('http://127.0.0.1', 'http://item.wangxuelong.vip')
      console.log(this.previewPath)
      this.previewVisible=true
    },
    handleRemove(file) {
      //   获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //   从表单中pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      //根据索引值把这个图片从表单中删除掉
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    add(){
        this.$refs.addFormRef.validate(async valid => {
            if(!valid){
                return this.$message.error('有未填写的表单项')
            }
            // 数组拼接字符串
            //  不能直接做转换因为在 级联选择器 中双向绑定了 goods_cat 作为key
            // this.addForm.goods_cat=this.addForm.goods_cat.join(',')

            // 深拷贝
            const form = _.cloneDeep(this.addForm)
            form.goods_cat=form.goods_cat.join(',')

            // 处理动态参数
            this.manyTableData.forEach(item =>{
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_vals:item.attr_vals.join(' ')
                }
                this.addForm.attrs.push(newInfo)
            })
            // 处理静态属性
            this.onlyTableData.forEach(item =>{
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_value:item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })
            form.attrs=this.addForm.attrs
            console.log(form)
            const {data:res}=await this.$http.post('goods',form)
            if(res.meta.status !== 201){
                console.log(res)
                return this.$message.error('添加商品失败')
            }
            this.$message.success('添加商品成功')
            this.$router.push('/goods')
        })
    }
  },
  computed: {
    cateID() {
      if (this.addForm.goods_cat.length === 3) {
        //    请求参数：三级分录的ID
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg{
    width: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>
