<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>班级管理</el-breadcrumb-item>
      <el-breadcrumb-item>班级列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear="getClassList">
            <template slot="prepend">班级名称：</template>
            <el-button slot="append" icon="el-icon-search" @click="getClassList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
                     v-auth="'CLASS_ADD'" v-show="false">添加班级</el-button>
        </el-col>
      </el-row>
      <!-- 班级列表区域 -->
      <el-table :data="classList" border stripe
                :default-sort = "{prop: 'classId', order: 'ascending'}"
                :row-key="classList.classId"
                @expand-change="expandChange"
                ref="classListRef">
        <el-table-column type="expand">
          <template slot-scope="props">
            <!-- 学生列表区域 -->
              <el-table :data="props.row.studentList" border stripe
                        :show-header="true" size="mini"
                        :max-height="251"
                        :header-cell-style="{background:'#FAFAFA'}"
                        style="margin-top: 0px; border: 0px !important;">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="userId" label="学号" sortable></el-table-column>
                <el-table-column prop="trueName" label="真实姓名"></el-table-column>
                <el-table-column prop="sex" label="性别"></el-table-column>
                <el-table-column prop="roles" label="角色">
                  <template slot-scope="scope">
                    <el-tag
                      :key="role"
                      v-for="role in scope.row.roles">
                      {{role}}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="classId" label="编号" sortable></el-table-column>
        <el-table-column prop="name" label="班级名称" sortable></el-table-column>
        <el-table-column prop="count" label="班级人数" sortable></el-table-column>
        <el-table-column prop="teachers" label="教师">
          <template slot-scope="scope">
            <el-tag
              :key="teacher.userId"
              v-for="teacher in scope.row.teachers">
              {{teacher.trueName}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" v-show="false"
                       @click="showEditDialog(scope.row.classId)" v-auth="'CLASS_EDIT'"></el-button>
            <!-- 分配教师按钮 -->
            <el-tooltip effect="dark" content="分配教师" placement="top" :enterable="false"
                        v-auth="'CLASS_TEACHER'" v-show="false">
              <el-button size="mini" type="warning"  @click="setTeacher(scope.row)"
                         icon="el-icon-setting"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" v-show="false"
                       @click="removeClassById(scope.row.classId)" v-auth="'CLASS_DELETE'"></el-button>
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
    <!-- 添加班级的对话框 -->
    <el-dialog title="添加班级" :visible.sync="addDialogVisible" width="30%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改班级的对话框 -->
    <el-dialog title="修改班级" :visible.sync="editDialogVisible" width="30%"
               @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editClass">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配教师的对话框 -->
    <el-dialog title="分配教师" :visible.sync="setTeacherDialogVisible" width="30%" @close="setTeacherDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="classInfo" ref="setTeacherFormRef"
               :rules="setTeacherFormRules" label-width="100px">
        <el-form-item label="班级名称">
          <el-input v-model="classInfo.className" disabled></el-input>
        </el-form-item>
        <el-form-item label="教师" prop="teacherIdList">
          <el-select v-model="classInfo.teacherIdList" placeholder="请选择" multiple>
            <el-option
              v-for="teacher in teachers"
              :key="teacher.userId"
              :label="teacher.name"
              :value="teacher.userId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setTeacherDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setTeacherCommit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取班级列表的查询参数
      queryInfo: {
        // 班级名称
        name: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 班级列表
      classList: [],
      // 班级总数
      total: 0,
      // 控制新增对话框的显示与隐藏
      addDialogVisible: false,
      // 新增班级的表单数据
      addForm: {
        name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        name: [
          { required: true, message: '请输入班级名称', trigger: 'blur' }
        ]
      },
      // 控制编辑班级对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑班级的表单数据
      editForm: {
        name: ''
      },
      // 编辑表单的验证规则对象
      editFormRules: {
        name: [
          { required: true, message: '请输入班级名称', trigger: 'blur' }
        ]
      },
      // 班级信息
      classInfo: {
        // 班级id
        classId: '',
        // 班级名称
        className: '',
        // 教师列表
        teacherIdList: []
      },
      // 控制分配教师对话框的显示与隐藏
      setTeacherDialogVisible: false,
      // 教师列表
      teachers: [],
      // 分配教师表单验证规则
      setTeacherFormRules: {
        teacherIdList: [
          { required: true, message: '请选择教师', trigger: 'change' }
        ]
      },
      // 上一个展开的行
      lastExpandRow: {}
    }
  },
  created () {
    this.getClassList()
    this.getTeacherList()
    // this.global.methods.reset()
  },
  methods: {
    // 获取班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class/query', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.classList = res.data.list
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getClassList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getClassList()
    },
    // 监听添加班级对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加班级
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('userapi/class', this.addForm)
        if (!res.returnCode) return this.$message.error(res.returnMsg)
        this.$message.success('添加班级成功!')
        // 隐藏添加班级的对话框
        this.addDialogVisible = false
        // 重新获取班级的列表
        this.getClassList()
      })
    },
    // 展示编辑班级的对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`userapi/class/${id}`)
      if (!res.returnCode) return this.$message.error('获取学生信息失败')
      this.editForm = res.data
    },
    // 修改班级信息并提交
    editClass () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起修改班级信息的数据请求
        const { data: res } = await this.$http.put('userapi/class', this.editForm)
        if (!res.returnCode) return this.$message.error('修改班级信息失败!')
        this.$message.success('修改班级信息成功!')
        // 隐藏修改班级的对话框
        this.editDialogVisible = false
        // 重新获取班级列表
        this.getClassList()
      })
    },
    // 监听修改班级对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的用户信息
    async removeClassById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该班级, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('userapi/class/' + id)
      if (!res.returnCode) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')
      this.getClassList()
    },
    // 展示分配教师对话框
    setTeacher (classInfo) {
      this.classInfo.classId = classInfo.classId
      this.classInfo.className = classInfo.name
      this.classInfo.teacherIdList = classInfo.teacherIdList
      this.setTeacherDialogVisible = true
    },
    // 获取教师列表
    async getTeacherList () {
      const { data: res } = await this.$http.get('userapi/teacher/list')
      if (!res.returnCode) return this.$message.error('获取教师列表失败!')
      this.teachers = res.data
    },
    // 监听分配教师对话框关闭
    setTeacherDialogClose () {
      this.$refs.setTeacherFormRef.resetFields()
    },
    // 分配教师并提交
    async setTeacherCommit () {
      const { data: res } = await this.$http.put('userapi/class/teacher', this.classInfo)
      if (!res.returnCode) return this.$message.error('分配角色失败!')
      this.$message.success('分配角色成功!')
      // 隐藏修改班级的对话框
      this.setTeacherDialogVisible = false
      // 重新获取班级列表
      this.getClassList()
    },
    // 当用户对某一行展开或者关闭的时候触发
    expandChange (row) {
      if (row.classId === this.lastExpandRow.classId) return false
      if (this.lastExpandRow !== null) {
        // 关闭上一行
        this.$refs.classListRef.toggleRowExpansion(this.lastExpandRow, false)
      }
      // 保存当前行
      this.lastExpandRow = row
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 3px;
}
</style>

<style lang="css">
.el-table__expanded-cell[class*=cell] {
  padding: 10px 10px 10px 50px !important;
}
</style>
