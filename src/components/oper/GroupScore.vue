<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>评分事务</el-breadcrumb-item>
      <el-breadcrumb-item>小组评分</el-breadcrumb-item>
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
      <!-- 课程列表 -->
      <el-table :data="courseList" border stripe
                :header-cell-style="{background:'#FAFAFA'}"
                ref="courseListRef">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="状态" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'WAIT'">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 'PROCESS'">进行中</el-tag>
            <el-tag type="warning" v-else>结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前阶段" prop="currentStage" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.currentStage === 0">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.currentStage > scope.row.stageNum">结束</el-tag>
            <div v-else>{{scope.row.currentStage}}</div>
          </template>
        </el-table-column>
        <el-table-column label="总阶段数" prop="stageNum" width="80px" align="center"></el-table-column>
        <el-table-column label="评分进度" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.scoreCount / scope.row.groupCount*100"
                         :status="scope.row.scoreCount === scope.row.groupCount ? 'success' : ''"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="currentStageTime" align="center"></el-table-column>
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
    <!-- 小组的对话框 -->
    <el-dialog  :visible.sync="scoreDialogVisible" width="40%"
               :close-on-click-modal="false" @close="scoreDialogClose">
      <template slot="title">
        <span>小组评分: </span>
        <el-select v-model="groupInfo.leaderId" @change="changeGroup" placeholder="请选择" style="margin-left: 20px">
          <el-option
            v-for="(leader, index) in leaderList"
            :key="leader.userId"
            :label="'第' + (index + 1) + '组, 组长: ' + leader.trueName"
            :value="leader.userId"></el-option>
        </el-select>
      </template>
      <div v-show="showScoreInput">
        <el-form ref="scoreFormRef" label-width="120px">
          <el-form-item label="教师评分">
            <el-input v-model="scoreForm.teacherScore" style="width: 20%"></el-input>
          </el-form-item>
        </el-form>
        <el-form ref="leaderScoreFormRef" label-width="120px">
          <el-form-item label="小组长评分">
            <el-table :data="scoreForm.leaderScore" stripe style="margin-top: 0px !important; width: 85%"
                      :cell-style="{padding:0+'px'}" :show-header="false">
              <el-table-column label="学号" prop="userId" width="120px" style="height: 30px"></el-table-column>
              <el-table-column label="姓名" prop="trueName"></el-table-column>
              <el-table-column label="评分">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.score"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveScore">提 交</el-button>
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
      // 小组长列表
      leaderList: [],
      // 课程列表
      courseList: [],
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
      // 课程总数
      total: 0,
      // 控制评分对话框的显示与隐藏
      scoreDialogVisible: false,
      // 当前评分班级信息
      scoreClassInfo: {
        // 班级id
        classId: '',
        // 课程id
        courseId: ''
      },
      // 成绩列表
      scoreArray: {},
      // 小组信息
      groupInfo: {
        leaderId: ''
      },
      // 小组评分
      scoreForm: {
        // 教师评分
        teacherScore: '',
        // 小组长评分
        leaderScore: []
      },
      // 控制评分填写表格的显示与隐藏
      showScoreInput: false,
      // 当前阶段id
      currentStageId: ''
    }
  },
  created () {
    this.getClassList()
  },
  methods: {
    // 查询课程
    async getCourseList () {
      const { data: res } = await this.$http.get('scoreapi/course/stageGroup', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.courseList = res.data.list
      this.total = res.data.total
    },
    // 获取班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class/teacher')
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.classList = res.data
    },
    // 获取小组长列表
    async getStudentList () {
      const { data: res } = await this.$http.get('scoreapi/group/leader', { params: this.scoreClassInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.leaderList = res.data
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
    // 自定义索引
    getIndex (index) {
      index = index + 1
      return '第 ' + index + ' 组'
    },
    // 展示评分对话框
    async showScoreDialog (row) {
      this.currentStageId = row.currentStageId
      this.scoreClassInfo.classId = this.queryInfo.classId
      this.scoreClassInfo.courseId = row.courseId
      await this.getStudentList()
      this.scoreDialogVisible = true
    },
    // 切换小组
    async changeGroup () {
      const { data: res } = await this.$http.get(
        'scoreapi/score/groupScore/' + this.currentStageId + '/' + this.groupInfo.leaderId)
      if (!res.returnCode) return this.$message.error('切换小组失败!')
      this.showScoreInput = true
      this.scoreForm = res.data
    },
    // 保存评分
    async saveScore () {
      const { data: res } = await this.$http.post(
        'scoreapi/score/group/' + this.currentStageId + '/' +
        this.groupInfo.leaderId + '/' + this.scoreClassInfo.courseId, this.scoreForm)
      if (!res.returnCode) return this.$message.error('保存评分失败!')
      return this.$message.success('保存评分成功!')
    },
    // 监听对话框关闭事件
    scoreDialogClose () {
      this.showScoreInput = false
      this.leaderList = []
      this.groupInfo.leaderId = ''
      this.getCourseList()
    }
  }
}
</script>

<style scoped>
</style>
