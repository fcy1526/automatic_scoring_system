<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>教师列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.queryInput" clearable @clear="getTeacherList">
            <el-select v-model="queryInfo.searchType" slot="prepend" placeholder="请选择" style="width: 110px;">
              <el-option label="教师号" value="userId"></el-option>
              <el-option label="姓名" value="trueName"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getTeacherList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
                     v-auth="'TEACHER_ADD'" v-show="false">添加教师</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="teacherList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="userId" label="教师号" width="150px"></el-table-column>
        <el-table-column prop="trueName" label="真实姓名" width="120px"></el-table-column>
        <el-table-column prop="sexStr" label="性别" width="100px"></el-table-column>
        <el-table-column prop="teachClasses" label="教学班级">
          <template slot-scope="scope">
            <el-tag
              :key="tClass.classId"
              v-for="tClass in scope.row.teachClasses">
              {{tClass.name}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" v-show="false"
                       @click="showEditDialog(scope.row.userId)" v-auth="'TEACHER_EDIT'"></el-button>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" v-show="false"
                       @click="removeUserById(scope.row.userId)" v-auth="'TEACHER_DELETE'"></el-button>
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
    <el-dialog title="添加教师" :visible.sync="addDialogVisible" width="30%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item label="教师号" prop="userId">
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
        <el-form-item label="教学班级" prop="teachClasses">
          <el-select v-model="addForm.teachClasses" placeholder="请选择" multiple>
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
        <el-button type="primary" @click="addTeacher">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改教师" :visible.sync="editDialogVisible" width="30%"
               @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item label="教师号">
          <el-input v-model="editForm.userId" disabled></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="trueName">
          <el-input v-model="editForm.trueName"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio v-model="editForm.sex" label="MAN">男</el-radio>
          <el-radio v-model="editForm.sex" label="WOMAN">女</el-radio>
        </el-form-item>
        <el-form-item label="教学班级" prop="teachClasses">
          <el-select v-model="editForm.teachClasses" placeholder="请选择" multiple>
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
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取教师列表的查询参数
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
      // 教师列表
      teacherList: [],
      // 班级列表
      classList: [],
      // 总教师数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        userId: '',
        password: '',
        trueName: '',
        sex: '',
        teachClasses: []
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
        teachClasses: [
          { required: true, message: '请选择班级', trigger: 'change' }
        ]
      },
      // 控制编辑教师对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑教师的表单数据
      editForm: {
        userId: '',
        trueName: '',
        sex: '',
        teachClasses: ''
      },
      // 编辑学生的验证规则对象
      editFormRules: {
        trueName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        teachClasses: [
          { required: true, message: '请选择教学班级', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.getTeacherList()
    this.getClassList()
    // this.global.methods.reset()
  },
  methods: {
    // 获取教师列表
    async getTeacherList () {
      if (this.queryInfo.queryInput !== '' && this.queryInfo.searchType === '') {
        return this.$message.info('请选择查询类型')
      }
      const { data: res } = await this.$http.get('userapi/teacher', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.teacherList = res.data.list
      this.total = res.data.total
    },
    // 获取班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class')
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.classList = res.data
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getTeacherList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getTeacherList()
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addTeacher () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('userapi/teacher', this.addForm)
        if (!res.returnCode) return this.$message.error(res.returnMsg)
        this.$message.success('添加成功!')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户的列表
        this.getTeacherList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`userapi/teacher/${id}`)
      if (!res.returnCode) return this.$message.error('获取教师信息失败')
      this.editForm = res.data
      console.log(res.data)
    },
    // 修改教师信息并提交
    editUserinfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起修改教师信息的数据请求
        const { data: res } = await this.$http.put('userapi/teacher', this.editForm)
        if (!res.returnCode) return this.$message.error('修改教师信息失败!')
        this.$message.success('修改信息成功!')
        // 隐藏修改的对话框
        this.editDialogVisible = false
        // 重新获取教师列表
        this.getTeacherList()
      })
    },
    // 监听修改教师对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的用户信息
    async removeUserById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该教师, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('userapi/teacher/' + id)
      if (!res.returnCode) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')
      this.getTeacherList()
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 3px;
}
</style>
