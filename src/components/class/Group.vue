<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>班级列表</el-breadcrumb-item>
      <el-breadcrumb-item>小组列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="3">
          <!-- 班级下拉框区域 -->
          <el-select v-model="queryInfo.classId" @change="getCourseList" placeholder="请选择">
            <el-option
              v-for="item in classList"
              :key="item.classId"
              :label="item.name"
              :value="item.classId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear="getCourseList">
            <template slot="prepend">课程名称：</template>
            <el-button slot="append" icon="el-icon-search" @click="getCourseList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 课程评分列表 -->
      <el-table :data="courseList" border stripe :max-height="620"
                :header-cell-style="{background:'#FAFAFA'}"
                :row-key="courseList.courseId"
                @expand-change="expandChange"
                ref="courseListRef">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row>
              <el-col :span="20">
                <el-table :data="scope.row.groupList" ref="groupListRef"
                          style="margin-top: 0px" :max-height="300">
                  <el-table-column type="index" label="#" :index="getIndex" align="center" width="100px"></el-table-column>
                  <el-table-column label="组长" prop="leaderName" width="100px" align="center"></el-table-column>
                  <el-table-column label="组员" prop="members">
                    <template slot-scope="scope">
                      <el-tag v-for="name in scope.row.members"
                              :key="name" v-show="name !== scope.row.leaderName">
                        {{name}}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                      <!-- 修改按钮 -->
                      <el-button size="mini" type="warning" icon="el-icon-edit"
                                 @click="showEditDialog(scope.row)"></el-button>
                      <!-- 删除按钮 -->
                      <el-button size="mini" type="danger" icon="el-icon-delete"
                                 @click="showDeleteDialog(scope.row)"></el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="小组数" prop="groupList.length" width="65px" align="center"></el-table-column>
        <el-table-column label="状态" prop="status" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'WAIT'">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 'PROCESS'">进行中</el-tag>
            <el-tag type="warning" v-else>结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170px"></el-table-column>
        <el-table-column label="结束时间" prop="endTime" width="170px"></el-table-column>
        <el-table-column label="操作" align="center" width="70px">
          <template slot-scope="scope">
            <!-- 添加按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-plus"
                       @click="showAddDialog(scope.row)"></el-button>
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
    <!-- 添加小组的对话框 -->
    <el-dialog title="添加小组" :visible.sync="addDialogVisible" width="40%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item label="课程名称">
          <span>{{addCourse.name}}</span>
        </el-form-item>
        <el-form-item label="组长" prop="leaderId">
          <el-select v-model="addForm.leaderId" placeholder="请选择">
            <el-option
              v-for="item in studentList"
              :key="item.userId"
              :label="item.trueName"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="小组成员" prop="members">
          <el-select v-model="addForm.members" placeholder="请选择" multiple>
            <el-option
              v-for="item in studentList"
              :key="item.userId"
              :label="item.trueName"
              :value="item.userId"
              :disabled="item.userId === addForm.leaderId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGroup">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改小组信息" :visible.sync="editDialogVisible" width="40%"
               @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item label="课程名称">
          <span>{{editCourse.name}}</span>
        </el-form-item>
        <el-form-item label="组长" prop="leaderId">
          <el-select v-model="editForm.leaderId" placeholder="请选择">
            <el-option
              v-for="item in this.studentList"
              :key="item.userId"
              :label="item.trueName"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="小组成员" prop="members">
          <el-select v-model="editForm.members" placeholder="请选择" multiple>
            <el-option
              v-for="item in this.studentList"
              :key="item.userId"
              :label="item.trueName"
              :value="item.userId"
              :disabled="item.userId === editForm.leaderId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGroup">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 班级列表
      classList: [],
      // 课程列表
      courseList: [],
      // 学生列表
      studentList: [],
      // 获取课程列表的查询参数
      queryInfo: {
        // 班级id
        classId: '',
        // 课程名称
        name: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 上一个展开的行
      lastExpandRow: {},
      // 列表总数
      total: 0,
      // 控制添加小组对话框的显示与隐藏
      addDialogVisible: false,
      // 添加小组的课程
      addCourse: {},
      // 修改小组的课程
      editCourse: {},
      // 添加小组表单
      addForm: {
        // 课程id
        courseId: '',
        // 组长id
        leaderId: '',
        // 小组成员
        members: [],
        // 班级id
        classId: ''
      },
      // 添加小组表单验证规则
      addFormRules: {
        leaderId: [
          { required: true, message: '请选择组长', trigger: 'change' }
        ],
        members: [
          { required: true, message: '请选择小组成员', trigger: 'change' }
        ]
      },
      // 控制编辑小组对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑小组的表单数据
      editForm: {
        // 小组id
        groupId: '',
        // 组长id
        leaderId: '',
        // 小组成员
        members: []
      },
      // 编辑小组表单验证规则
      editFormRules: {
        leaderId: [
          { required: true, message: '请选择组长', trigger: 'change' }
        ],
        members: [
          { required: true, message: '请选择小组成员', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.getClassList()
  },
  methods: {
    // 查询课程
    async getCourseList () {
      const { data: res } = await this.$http.get('scoreapi/course/group', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.courseList = res.data.list
      this.total = res.data.total
    },
    // 获取未分组学生列表
    async getStudentList (courseId) {
      const { data: res } = await this.$http.get(
        'scoreapi/group/student/' + this.queryInfo.classId + '/' + courseId)
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.studentList = res.data
    },
    // 当用户对某一行展开或者关闭的时候触发
    expandChange (row) {
      if (row.courseId === this.lastExpandRow.courseId) return false
      if (this.lastExpandRow !== null) {
        // 关闭上一行
        this.$refs.courseListRef.toggleRowExpansion(this.lastExpandRow, false)
      }
      // 保存当前行
      this.lastExpandRow = row
    },
    // 获取班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class/teacher')
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.classList = res.data
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCourseList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCourseList()
    },
    // 展示添加小组对话框
    showAddDialog (row) {
      this.addDialogVisible = true
      this.addCourse = row
      this.addForm.courseId = row.courseId
      this.addForm.classId = this.queryInfo.classId
      this.getStudentList(row.courseId)
    },
    // 监听添加小组对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加小组
    addGroup () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 发起添加小组的网络请求
        const { data: res } = await this.$http.post('scoreapi/group', this.addForm)
        if (!res.returnCode) return this.$message.error('添加小组失败! 原因: ' + res.returnMsg)
        this.$message.success('添加小组成功!')
        // 隐藏添加小组的对话框
        this.addDialogVisible = false
        // 更新小组列表
        this.addCourse.groupList = res.data
      })
    },
    // 自定义索引
    getIndex (index) {
      index = index + 1
      return '第 ' + index + ' 组'
    },
    // 显示修改对话框
    async showEditDialog (row) {
      this.editCourse = row
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`scoreapi/group/${row.groupId}`)
      if (!res.returnCode) return this.$message.error('获取小组信息失败! 原因: ' + res.returnMsg)
      this.editForm = res.data
      // 获取为分组学生列表
      await this.getStudentList(row.courseId)
      // list数组追加方式
      for (var i = 0; i < res.data.memberList.length; i++) {
        this.studentList.push(res.data.memberList[i])
      }
      for (var j = 0; j < this.editForm.members.length; j++) {
        if (this.editForm.members[j] === this.editForm.leaderId) {
          this.editForm.members.splice(j, 1)
          break
        }
      }
    },
    // 监听修改小组对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改小组并提交
    editGroup () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        // 发起修改小组信息的数据请求
        const { data: res } = await this.$http.put('scoreapi/group', this.editForm)
        if (!res.returnCode) return this.$message.error('修改小组信息失败!')
        this.$message.success('修改小组信息成功!')
        // 隐藏修改小组的对话框
        this.editDialogVisible = false
        this.editCourse.leaderId = this.editForm.leaderId
        this.editCourse.members = res.data
      })
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 3px;
}
</style>
