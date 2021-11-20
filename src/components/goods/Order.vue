<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input @clear="getOrderList" clearable v-model="orderId" placeholder="请输入订单ID">
            <el-button @click="selectOrderList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单ID" prop="order_id"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template #default="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="showBox" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="showProgressBox" size="mini" type="success" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <el-dialog @close="addressVisibleClosed" title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in pregressInfo" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '@/assets/citydata.js'
import progress from '@/assets/progress.json'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      orderId: '',
      total: 0,
      orderlist: [],
      selectOrderlist: [],
      addressVisible: false,
      progressVisible: false,
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
      },
      addressForm: {
        address1: [],
        address2: '',
      },
      cityData: cityData,
      pregressInfo: [],
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return thsi.$message.error('获取订单列表失败')
      }
      console.log(res.data)
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //展示修改地址的对话框
    showBox() {
      this.addressVisible = true
    },
    addressVisibleClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      this.pregressInfo = progress.data
      console.log(this.pregressInfo)
      this.progressVisible = true
    },
    async selectOrderList() {
      const { data: res } = await this.$http.get(`orders/${this.orderId}`)
      if(res.meta.status !== 200){
          this.orderId=''
          console.log(res)
          return this.$message.error('查询失败')
      }
      this.orderlist=[{
          order_number:res.data.order_number,
          order_id:res.data.order_id,
          order_price:res.data.order_price,
          order_pay:res.data.order_pay,
          is_send:res.data.is_send,
          create_time:res.data.create_time}]
      this.total=1
    },
  },
}
</script>

<style lang="less" scope>
.el-cascader {
  width: 100%;
}
</style>
