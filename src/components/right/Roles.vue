<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary">添加角色</el-button>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="rolesRows">
            <el-row :class="['bdbottom', index1 === 0 ? 'bgtop' : '', 'vcenter']" v-for="(item1, index1) in rolesRows.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <!-- 左边5列让一级权限使用 -->
              <el-col :span="5">
                <el-tag closable @close="removeAskRightByIdById($event, { rolesRows, rightId: item1.id })">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <!-- 二级 -->
                <el-row :class="['bdbottom', index1 === 0 ? 'bgtop' : '', 'vcenter']" v-for="(item2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeAskRightByIdById($event, { rolesRows, rightId: item2.id })">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag @close="removeAskRightByIdById($event, { rolesRows, rightId: item3.id })" closable type="warning" v-for="(item3) in item2.children" :key="item3.id">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column la　bel="操作" width="300px">
          <template #default="roles">
            <el-button @click="setRolesDataDialog(roles.row.id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" @click="delRoles(roles.row.id)" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" @click="setRoleRight(roles.row)" type="warning" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="分配权限" :visible.sync="viewSetRoleRightDialog" width="50%">
      <el-tree ref="treeRef" :default-checked-keys="defKeys" default-expand-all node-key="id" show-checkbox :data="setRoleRightData" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewSetRoleRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRightSub">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog @closed="setRolesDialogClosed" title="修改用户信息" :visible.sync="viewSetRolesDialog" width="50%">
      <el-form ref="setRolesRef" :model="setRolesData" label-width="70px">
        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model="setRolesData.roleId"></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="setRolesData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="setRolesData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewSetRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="setRoles()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
    //   控制编辑角色提示框的显示与隐藏
      viewSetRolesDialog: false,
    //   控制编辑分配权限提示框的显示与隐藏
      viewSetRoleRightDialog:false,
      setRolesData: [],
      setRoleRightData:[],
    //   :treeProps根据:setRoleRightData的每一行进行树形渲染，即树形的属性绑定对象
      treeProps:{
          children:'children',
          label:'authName'
    },
    // 默认选中的节点ID数组
    defKeys:[],
    //分配权限时的角色ID
    setRightRoleId:''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    async setRolesDataDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      this.setRolesData = res.data
      this.viewSetRolesDialog = true
    },
    setRolesDialogClosed() {
      this.$refs.setRolesRef.resetFields()
    },
    async setRoles() {
      const { data: res } = await this.$http.put(`roles/${this.setRolesData.roleId}`, {
        id: this.setRolesData.roleId,
        roleName: this.setRolesData.roleName,
        roleDesc: this.setRolesData.roleDesc,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.viewSetRolesDialog = false
      this.getRolesList()
    },
    async delRoles(id) {
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.getRolesList()
      this.$message.success('删除角色成功')
    },
    async removeAskRightByIdById(e, roleAll) {
      const removeAskResult = await this.$messageBox
        .confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .catch((err) => err)
      if (removeAskResult != 'confirm') {
        return this.$message.error('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${roleAll.rolesRows.row.id}/rights/${roleAll.rightId}`)
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('取消权限失败')
      }
      roleAll.rolesRows.row.children = res.data
      this.$message.success('取消权限成功')
    },
    async setRoleRight(role) {
        const {data:res}= await this.$http.get('rights/tree')
        if(res.meta.status !== 200){
            return this.$message.error('获取权限列表失败')
        }
        this.setRoleRightData=res.data
        this.viewSetRoleRightDialog=true
        this.setRightRoleId=role.id
        this.getRoleRightId(role,this.defKeys)
    },
    // 通过递归获取角色下所有三级权限的ID，并保存到defKeys中
    getRoleRightId(node,arr){
        // 如果当前node节点不包含children属性，就代表时三级节点
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item => {
            this.getRoleRightId(item,arr)
        });
    },
    async setRoleRightSub(){
        const setRoleRightIdKeys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const {data:res} = await this.$http.post(`roles/${this.setRightRoleId}/rights`,{rids: setRoleRightIdKeys.join(',')})
        if(res.meta.status !== 200){
            console.log(res)
            return this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
        this.getRolesList()
        this.viewSetRoleRightDialog=false
    }
  },
}
</script>

<style lang="less">
.el-row {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
