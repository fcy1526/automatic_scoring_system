<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>学生列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card >
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.queryInput" clearable @clear="getUserList">
            <el-select v-model="queryInfo.searchType" slot="prepend" placeholder="请选择" style="width: 110px;">
              <el-option label="学号" value="userId"></el-option>
              <el-option label="姓名" value="trueName"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
                     v-auth="'STUDENT_ADD'" v-show="false">添加学生</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe :default-sort = "{prop: 'userId', order: 'descending'}">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="userId" label="学号" sortable></el-table-column>
        <el-table-column prop="trueName" label="真实姓名"></el-table-column>
        <el-table-column prop="sexStr" label="性别"></el-table-column>
        <el-table-column prop="className" label="班级"></el-table-column>
        <el-table-column prop="roles" label="角色">
          <template slot-scope="scope">
            <el-tag
              :key="role.id"
              v-for="role in scope.row.roles">
              {{role.describe}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" v-show="false"
                     @click="showEditDialog(scope.row.userId)" v-auth="'STUDENT_EDIT'"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false"
                        v-show="false" v-auth="'STUDENT_ROLE'">
              <el-button size="mini" type="warning"  @click="setRole(scope.row)"
                         icon="el-icon-setting"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" v-show="false"
                       @click="removeUserById(scope.row.userId)" v-auth="'STUDENT_DELETE'"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加学生" :visible.sync="addDialogVisible" width="30%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item label="学号" prop="userId">
          <el-input v-model="addForm.userId"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="trueName">
          <el-input v-model="addForm.trueName"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio v-model="addForm.sex" label="MAN">男</el-radio>
          <el-radio v-model="addForm.sex" label="WOMAN">女</el-radio>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="addForm.classId" placeholder="请选择">
            <el-option
              v-for="item in classList"
              :key="item.classId"
              :label="item.name"
              :value="item.classId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改学生" :visible.sync="editDialogVisible" width="30%"
               @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="editForm.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="trueName">
          <el-input v-model="editForm.trueName"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio v-model="editForm.sex" label="MAN">男</el-radio>
          <el-radio v-model="editForm.sex" label="WOMAN">女</el-radio>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="editForm.classId" placeholder="请选择">
            <el-option
              v-for="item in classList"
              :key="item.classId"
              :label="item.name"
              :value="item.classId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserinfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="setRoleDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="userinfo" ref="setRoleFormRef" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="userinfo.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
<!--          <el-checkbox-group v-model="userinfo.roles">-->
<!--            <el-checkbox label="普通学生" name="type" disabled></el-checkbox>-->
<!--            <el-checkbox label="组长" name="type"></el-checkbox>-->
<!--            <el-checkbox label="学习委员" name="type"></el-checkbox>-->
<!--          </el-checkbox-group>-->
          <el-checkbox-group v-model="userinfo.roles">
            <el-checkbox v-for="role in roleList"
                         :label="role.id"
                         :key="role.id"
                         :disabled="role.name === 'Student'">
              {{ role.describe }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleCommit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取用户列表的查询参数
      queryInfo: {
        // 查询输入框内容
        queryInput: '',
        // 搜索类型
        searchType: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 用户列表
      userList: [],
      // 班级列表
      classList: [],
      // 学生角色列表
      roleList: [],
      // 总用户数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        userId: '',
        password: '',
        trueName: '',
        sex: '',
        classId: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        userId: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        trueName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        roles: [
          { type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }
        ],
        classId: [
          { required: true, message: '请选择班级', trigger: 'change' }
        ]
      },
      // 控制编辑学生对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑学生的表单数据
      editForm: {
        userId: '',
        trueName: '',
        sex: '',
        classId: ''
      },
      // 编辑学生的验证规则对象
      editFormRules: {
        trueName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        classId: [
          { required: true, message: '请选择班级', trigger: 'change' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 用户信息
      userinfo: {
        userId: '',
        roles: []
      },
      // 分配角色表单
      setRoleForm: {
        userId: '',
        roles: []
      }
    }
  },
  created () {
    this.getUserList()
    this.getClassList()
    this.getStudentRoleList()
    // this.global.methods.reset()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      if (this.queryInfo.queryInput !== '' && this.queryInfo.searchType === '') {
        return this.$message.info('请选择查询类型')
      }
      const { data: res } = await this.$http.get('userapi/student/query', { params: this.queryInfo })
      // console.log(res)
      if (!res.returnCode) return this.$message.error('获取学生列表失败! 原因: ' + res.returnMsg)
      this.userList = res.data.list
      this.total = res.data.total
    },
    // 获取班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class')
      if (!res.returnCode) return this.$message.error('获取班级列表失败! 原因: ' + res.returnMsg)
      this.classList = res.data
    },
    // 获取学生角色
    async getStudentRoleList () {
      const { data: res } = await this.$http.get('userapi/role/student')
      if (!res.returnCode) return this.$message.error('获取学生角色失败! 原因: ' + res.returnMsg)
      this.roleList = res.data
    },
    // 自定义处理角色列表 将角色数组转化为字符串返回
    roleStr (row) {
      return row.roles.join(' ; ')
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('userapi/student', this.addForm)
        if (!res.returnCode) return this.$message.error('添加用户失败! 原因: ' + res.returnMsg)
        this.$message.success('添加用户成功!')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户的列表
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`userapi/student/${id}`)
      if (!res.returnCode) return this.$message.error('获取学生信息失败! 原因: ' + res.returnMsg)
      // console.log(res.data)
      this.editForm = res.data
    },
    // 修改学生信息并提交
    editUserinfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起修改学生信息的数据请求
        const { data: res } = await this.$http.put('userapi/student', this.editForm)
        if (!res.returnCode) return this.$message.error('修改学生信息失败! 原因: ' + res.returnMsg)
        this.$message.success('修改学生信息成功!')
        // 隐藏修改学生的对话框
        this.editDialogVisible = false
        // 重新获取学生列表
        this.getUserList()
      })
    },
    // 监听修改学生对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的用户信息
    async removeUserById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该学生, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('userapi/user/' + id)
      if (!res.returnCode) return this.$message.error('删除失败! 原因: ' + res.returnMsg)
      this.$message.success('删除成功!')
      this.getUserList()
    },
    // 展示分配角色的对话框
    setRole (userinfo) {
      console.log(userinfo)
      this.userinfo.userId = userinfo.userId
      this.userinfo.roles = userinfo.roleIds
      this.setRoleDialogVisible = true
    },
    // 分配角色并提交
    async setRoleCommit () {
      // console.log(this.userinfo)
      const { data: res } = await this.$http.put('userapi/user', this.userinfo)
      if (!res.returnCode) return this.$message.error('分配角色失败! 原因: ' + res.returnMsg)
      this.$message.success('分配角色成功!')
      // 隐藏修改学生的对话框
      this.setRoleDialogVisible = false
      // 重新获取学生列表
      this.getUserList()
    },
    // 监听分配角色对话框关闭
    setRoleDialogClose () {
      this.$refs.setRoleFormRef.resetFields()
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 3px;
}
</style>
