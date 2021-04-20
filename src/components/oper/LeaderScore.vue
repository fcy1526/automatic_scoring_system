<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>评分事务</el-breadcrumb-item>
      <el-breadcrumb-item>小组长评分</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 课程列表 -->
      <el-table :data="courseList" border stripe
                :header-cell-style="{background:'#FAFAFA'}"
                ref="courseListRef">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="状态" prop="status" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'WAIT'">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 'PROCESS'">进行中</el-tag>
            <el-tag type="warning" v-else>结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分进度" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.scoreCount / scope.row.totalCount*100"
                         :status="scope.row.scoreCount === scope.row.totalCount ? 'success' : ''"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150px">
          <template slot-scope="scope">
            <!-- 评分按钮 -->
            <el-tooltip class="item" effect="dark" content="评分" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit"
                         @click="showScoreDialog(scope.row)"></el-button>
            </el-tooltip>
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
    <!-- 学生表现评分的对话框 -->
    <el-dialog title="小组长评分" :visible.sync="scoreDialogVisible" width="40%"
               :close-on-click-modal="false">
      <el-table :data="studentList" border stripe style="margin-top: 0px"
                :header-cell-style="{background:'#FAFAFA'}"
                ref="studentListRef">
        <el-table-column label="学号" prop="userId"></el-table-column>
        <el-table-column label="姓名" prop="trueName"></el-table-column>
        <el-table-column label="评分" prop="score">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.score"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="scoreDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveScore">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取课程列表的查询参数
      queryInfo: {
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 课程列表
      courseList: [],
      // 学生列表
      studentList: [],
      // 课程总数
      total: 0,
      // 小组id
      groupId: '',
      // 控制评分对话框的显示与隐藏
      scoreDialogVisible: false,
      // 课程id
      courseId: ''
    }
  },
  created () {
    this.getCourseList()
  },
  methods: {
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
    // 查询课程
    async getCourseList () {
      const { data: res } = await this.$http.get('scoreapi/course/leader', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.courseList = res.data.list
      this.total = res.data.total
      console.log(res)
    },
    // 获取小组成员列表
    async getStudentList (courseId) {
      const { data: res } = await this.$http.get('scoreapi/score/leader/' + courseId + '/' + this.groupId)
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.studentList = res.data
    },
    // 获取小组长列表
    async getLeaderList (courseId) {
      const { data: res } = await this.$http.get('scoreapi/score/teacher/' + courseId)
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.studentList = res.data
    },
    // 展示评分对话框
    async showScoreDialog (row) {
      this.groupId = row.groupId
      this.courseId = row.courseId
      if (row.groupId === null) {
        // 教师
        await this.getLeaderList(row.courseId)
      } else {
        await this.getStudentList(row.courseId)
      }
      this.scoreDialogVisible = true
    },
    // 保存评分
    async saveScore () {
      const { data: res } = await this.$http.post('scoreapi/score/leader/' + this.courseId, this.studentList)
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.$message.success('保存评分成功!')
      this.scoreDialogVisible = false
      this.getCourseList()
    }
  }
}
</script>

<style scoped>

</style>
