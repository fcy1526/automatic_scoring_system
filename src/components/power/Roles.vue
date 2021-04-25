<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
                     v-auth="'ROLE_ADD'" v-show="false">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe :max-height="520"
                :header-cell-style="{background:'#FAFAFA'}"
                :row-key="roleList.id"
                @expand-change="expandChange"
                ref="roleListRef">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', l1 === 0 ? 'bdtop' : '', 'vcenter']"
                    v-for="(item1, l1) in scope.row.children"
                    :key="item1.authId">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.authId)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[l2 === 0 ? '' : 'bdtop', 'vcenter']"
                        v-for="(item2, l2) in item1.children" :key="item2.authId">
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="removeRightById(scope.row, item2.authId)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children"
                            :key="item3.authId"
                            closable @close="removeRightById(scope.row, item3.authId)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="describe"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" v-show="false"
                       @click="showEditDialog(scope.row.id)" v-auth="'ROLE_EDIT'">编辑</el-button>
            <!-- 分配权限按钮 -->
            <el-button size="mini" type="warning" icon="el-icon-setting" v-show="false"
                       @click="showSetAuthDialog(scope.row)" v-auth="'ROLE_AUTH'">分配权限</el-button>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" v-show="false"
                       @click="removeRoleById(scope.row.id)" v-auth="'ROLE_DELETE'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="describe">
          <el-input v-model="addForm.describe"></el-input>
        </el-form-item>
        <el-form-item label="角色类型" prop="isStudentRole">
          <el-radio v-model="addForm.isStudentRole" label="1">学生角色</el-radio>
          <el-radio v-model="addForm.isStudentRole" label="0">其他角色</el-radio>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%"
               @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="describe">
          <el-input v-model="editForm.describe"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setAuthDialogVisible" width="30%"
               @close="setAuthDialogClosed" center>
      <div class="el-dialog-div">
        <!-- 树形控件 -->
        <el-tree :data="authsList" :props="treeProps" default-expand-all
                 show-checkbox node-key="authId" :default-checked-keys="defKeys"
                 ref="treeRef"></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setAuthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotAuths">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框的显示与隐藏
      setAuthDialogVisible: false,
      // 所有权限数据
      authsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值
      defKeys: [],
      // 当前即将分配权限的角色id
      roleid: '',
      // 上一个展开的行
      lastExpandRow: {},
      // 控制显示与隐藏编辑对话框
      editDialogVisible: false,
      // 编辑角色的表单数据
      editForm: {
        id: '',
        name: '',
        describe: '',
        isSysRole: ''
      },
      // 编辑表单的验证规则对象
      editFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        describe: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        name: '',
        describe: '',
        isStudentRole: '0'
      },
      // 添加表单的验证规则对象
      addFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        describe: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ],
        isStudentRole: [
          { required: true, message: '请输入角色类型', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
    // this.global.methods.reset()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('userapi/role/tree')
      if (!res.returnCode) return this.$message.error('获取角色列表失败!')
      this.roleList = res.data
    },
    // 根据id删除对应的权限
    async removeRightById (role, authId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除!')
      }
      const { data: res } = await this.$http.delete('userapi/role', { params: { roleId: role.id, authId: authId } })
      if (!res.returnCode) return this.$message.error('删除权限失败!')
      role.children = res.data.children
      // this.getRolesList()
    },
    // 展示分配权限的对话框
    async showSetAuthDialog (role) {
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('userapi/auth/tree')
      if (!res.returnCode) return this.$message.error('获取权限数据失败!')
      // 把获取到的权限数据保存到data中
      this.authsList = res.data
      this.setAuthDialogVisible = true
      // 递归获取三级权限id
      this.getLeafKeys(role, this.defKeys)
      this.roleid = role.id
    },
    // 通过递归的形式获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前item节点不包含children属性，则是三级节点
        return arr.push(node.authId)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框关闭事件
    setAuthDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotAuths () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), // js扩展运算符
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post('userapi/role',
        { roleId: this.roleid, authIds: idStr })
      if (!res.returnCode) return this.$message.error('分配权限失败!')
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setAuthDialogVisible = false
    },
    // 当用户对某一行展开或者关闭的时候触发
    expandChange (row) {
      if (row.id === this.lastExpandRow.id) return false
      if (this.lastExpandRow !== null) {
        // 关闭上一行
        this.$refs.roleListRef.toggleRowExpansion(this.lastExpandRow, false)
      }
      // 保存当前行
      this.lastExpandRow = row
    },
    // 展示编辑角色对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('userapi/role/' + id)
      if (!res.returnCode) return this.$message.error('获取角色信息失败')
      if (res.data.isSysRole === 1) return this.$message.warning('该角色为系统角色，不可编辑')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑角色信息并提交
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起修改角色信息的数据请求
        const { data: res } = await this.$http.put('userapi/role', this.editForm)
        if (!res.returnCode) return this.$message.error('修改角色信息失败!')
        this.$message.success('修改角色信息成功!')
        // 隐藏修改角色的对话框
        this.editDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 监听修改角色对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除角色
    async removeRoleById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('userapi/role/' + id)
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.$message.success('删除成功!')
      this.getRolesList()
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新角色
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('userapi/role/add', this.addForm)
        if (!res.returnCode) return this.$message.error(res.returnMsg)
        this.$message.success('添加角色成功!')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户的列表
        this.getRolesList()
      })
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.el-dialog-div{
  height: 60vh;
  overflow: auto;
}
</style>
