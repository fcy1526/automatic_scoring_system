<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      <el-breadcrumb-item>课程列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.name" clearable @clear="getCourseList">
            <template slot="prepend">课程名称：</template>
            <el-button slot="append" icon="el-icon-search" @click="getCourseList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加课程</el-button>
        </el-col>
      </el-row>
      <!-- 课程列表 -->
      <el-table :data="courseList" border stripe :max-height="620"
                :header-cell-style="{background:'#FAFAFA'}"
                :row-key="courseList.courseId"
                @expand-change="expandChange"
                ref="courseListRef">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-steps :active="scope.row.currentStage" finish-status="success">
              <el-step title="创建" :description="scope.row.createTime"></el-step>
              <el-step v-for="stage in scope.row.stages"
                       :key="stage.stageId"
                       :title="'阶段' + stage.stageIndex">
                <template slot="description">
                  <div v-if="scope.row.currentStage > stage.stageIndex">
                    <span>{{ stage.startTime }}</span>
                    <br>
                    <span>{{ stage.endTime }}</span>
                  </div>
                  <div v-else-if="scope.row.currentStage === stage.stageIndex">
                    <span>{{ stage.startTime }}</span>
                  </div>
                </template>
              </el-step>
              <el-step title="结束" :description="scope.row.endTime"></el-step>
            </el-steps>
          </template>
        </el-table-column>
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="状态" prop="status" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'WAIT'">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 'PROCESS'">进行中</el-tag>
            <el-tag type="warning" v-else-if="scope.row.status === 'FINISH'">结束</el-tag>
            <el-tag type="info" v-else>已完成</el-tag>
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
        <el-table-column label="实践班级" prop="classList">
          <template slot-scope="scope">
            <el-tag
              :key="name"
              v-for="name in scope.row.classList">
              {{name}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <div v-if="scope.row.status === 'COMPLETE' ? false : true">
              <div v-if="(scope.row.currentStage > 0 && scope.row.currentStage <= scope.row.stageNum)
                              ? scope.row.status === 'PROCESS' : false">
                <!-- 结束当前阶段按钮 -->
                <el-tooltip class="item" effect="dark" content="结束当前阶段" placement="top">
                  <el-button size="mini" icon="el-icon-close" type="danger"
                             @click="stopCurrentStage(scope.row)"></el-button>
                </el-tooltip>
                <!-- 开启互评阶段按钮 -->
                <el-tooltip class="item" effect="dark" content="开启互评" placement="top">
                  <el-button size="mini" icon="el-icon-collection-tag" type="warning"
                             @click="startMutual(scope.row)"></el-button>
                </el-tooltip>
              </div>
              <!-- 开启下一阶段按钮 -->
              <div v-else-if="scope.row.status !== 'FINISH'">
                <el-tooltip class="item" effect="dark" content="开启下一阶段" placement="top">
                  <el-button size="mini" type="primary" icon="el-icon-check"
                             @click="startNewStage(scope.row)"></el-button>
                </el-tooltip>
              </div>
              <!-- 统计总分 -->
              <div v-show="scope.row.status === 'FINISH'">
                <el-tooltip class="item" effect="dark" content="统计总分" placement="top">
                  <el-button size="mini" type="success" icon="el-icon-coin"
                             @click="showTotalDialog(scope.row)"></el-button>
                </el-tooltip>
              </div>
            </div>
            <div v-else>
              <!-- 显示评分结果 -->
              <el-tooltip class="item" effect="dark" content="显示评分结果" placement="top">
                <el-button size="mini" type="success" icon="el-icon-tickets"
                           @click="showScoreDialog(scope.row)"></el-button>
              </el-tooltip>
            </div>
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
    <!-- 添加课程的对话框 -->
    <el-dialog title="添加课程" :visible.sync="addDialogVisible" width="40%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="120px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="评分阶段数">
          <el-input-number v-model="addForm.stageNum" :min="3" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="预期结束时间" required>
          <el-col :span="11">
            <el-form-item prop="endDate">
              <el-date-picker
                v-model="addForm.endDate"
                type="date"
                style="width: 100%;"
                :picker-options="expireTimeOption"
                value-format="yyyy-MM-dd"
                placeholder="选择结束日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col align="center" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-time-picker
                v-model="addForm.endTime"
                :picker-options="{
                  selectableRange: '8:30:00 - 18:00:00'
                }"
                style="width: 100%;"
                value-format="HH:mm:ss"
                placeholder="选择结束时间">
              </el-time-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="实践班级" prop="classIds">
          <el-select v-model="addForm.classIds" placeholder="请选择" multiple collapse-tags>
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
        <el-button type="primary" @click="addCourse">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 设置分数占比的对话框 -->
    <el-dialog title="设置分数占比" :visible.sync="showTotalDialogVisible" width="30%"
               @close="totalDialogClosed">
      <el-form :model="proportionForm" ref="proportionFormRef" label-width="120px">
        <el-form-item label="学生表现评分">
          <el-input v-model.number="proportionForm.studentScore" class="inputStyle">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="小组评分">
          <el-input v-model.number="proportionForm.groupScore" class="inputStyle">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="小组互评">
          <el-input v-model.number="proportionForm.mutualScore" class="inputStyle">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="小组长评分">
          <el-input v-model.number="proportionForm.leaderScore" class="inputStyle">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最终项目评分">
          <el-input v-model.number="proportionForm.teacherScore" class="inputStyle">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="showTotalDialog = false">取 消</el-button>
        <el-button type="primary" @click="count">统 计</el-button>
      </span>
    </el-dialog>
    <!-- 查看课程评分结果对话框 -->
    <el-dialog title="评分结果" :visible.sync="showScoreVisible" width="80%">
      <div v-for="(val, key) in this.score" :key="key">
        <span>{{ key }} :</span>
        <el-table :data="val" border stripe :max-height="620"
                  :header-cell-style="{background:'#FAFAFA'}">
          <el-table-column label="学号" prop="studentId"></el-table-column>
          <el-table-column label="真实姓名" prop="trueName"></el-table-column>
          <el-table-column label="学生表现评分" prop="studentScore"></el-table-column>
          <el-table-column label="小组评分" prop="groupScore"></el-table-column>
          <el-table-column label="小组互评分" prop="mutualScore"></el-table-column>
          <el-table-column label="小组长评分" prop="leaderScore"></el-table-column>
          <el-table-column label="最终项目评分" prop="teacherScore"></el-table-column>
          <el-table-column label="总分" prop="score"></el-table-column>
        </el-table>
      </div>
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
      // 控制添加课程对话框显示与隐藏
      addDialogVisible: false,
      // 添加课程的表单数据
      addForm: {
        // 课程名称
        name: '',
        // 评分阶段数
        stageNum: 5,
        // 实践班级
        classIds: [],
        // 结束日期
        endDate: '',
        // 结束时间
        endTime: ''
      },
      // 添加课程表单的验证规则
      addFormRules: {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },
      // 设置日期选择器 今天之前的日期不可选择
      expireTimeOption: {
        disabledDate (date) {
          // disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      // 上一个展开的行
      lastExpandRow: {},
      // 控制统计总分对话框的显示与隐藏
      showTotalDialogVisible: false,
      // 分数占比表单
      proportionForm: {
        studentScore: 0,
        groupScore: 0,
        mutualScore: 0,
        leaderScore: 0,
        teacherScore: 0
      },
      // 待统计的课程id
      totalCourseId: '',
      // 控制查看评分结果对话框的显示与隐藏
      showScoreVisible: false,
      // 课程评分结果
      score: [{
        className: '',
        totalScore: {
          studentId: '',
          trueName: '',
          studentScore: '',
          groupScore: '',
          mutualScore: '',
          leaderScore: '',
          teacherScore: ''
        }
      }]
    }
  },
  created () {
    this.getCourseList()
    this.getClassList()
  },
  methods: {
    // 查询课程
    async getCourseList () {
      const { data: res } = await this.$http.get('scoreapi/course', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.courseList = res.data.list
      this.total = res.data.total
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
    // 获取教学班级列表
    async getClassList () {
      const { data: res } = await this.$http.get('userapi/class/teacher')
      if (!res.returnCode) return this.$message.error('获取班级列表失败! 原因: ' + res.returnMsg)
      this.classList = res.data
    },
    // 监听添加课程对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加课程
    async addCourse () {
      this.$refs.addFormRef.validate(async valid => {
        this.addForm.endTime = this.addForm.endDate + ' ' + this.addForm.endTime
        const { data: res } = await this.$http.post('scoreapi/course', this.addForm)
        if (!res.returnCode) return this.$message.error('添加课程失败! 原因: ' + res.returnMsg)
        this.$message.success('添加课程成功!')
        // 隐藏添加课程的对话框
        this.addDialogVisible = false
        // 重新获取课程列表
        this.getCourseList()
      })
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
    // 结束当前阶段
    async stopCurrentStage (row) {
      const { data: res } = await this.$http.put('scoreapi/course/stop',
        { courseId: row.courseId, currentStage: row.currentStage })
      if (!res.returnCode) return this.$message.error('结束阶段失败! 原因: ' + res.returnMsg)
      this.$message.success('结束阶段成功!')
      this.getCourseList()
    },
    // 开始新阶段
    async startNewStage (row) {
      const { data: res } = await this.$http.put('scoreapi/course/start',
        { courseId: row.courseId, currentStage: row.currentStage })
      if (!res.returnCode) return this.$message.error('开启阶段失败! 原因: ' + res.returnMsg)
      this.$message.success('开启阶段成功!')
      this.getCourseList()
    },
    // 统计总分
    async getTotalScore (row) {
      const { data: res } = await this.$http.put('scoreapi/score/total',
        { courseId: row.courseId })
      if (!res.returnCode) return this.$message.error('统计总分失败! 原因: ' + res.returnMsg)
      this.$message.success('统计总分完毕!')
      this.getCourseList()
    },
    // 开启互评
    async startMutual (row) {
      const { data: res } = await this.$http.post('scoreapi/course/openMutual',
        { courseId: row.courseId })
      if (!res.returnCode) return this.$message.error('开启互评失败! 原因: ' + res.returnMsg)
      this.$message.success('开启互评成功!')
    },
    // 展示统计总分对话框
    showTotalDialog (row) {
      this.showTotalDialogVisible = true
      this.totalCourseId = row.courseId
    },
    // 监听统计总分对话框关闭事件
    totalDialogClosed () {
      this.$refs.proportionFormRef.resetFields()
    },
    // 统计总分
    async count () {
      const { data: res } = await this.$http.post('scoreapi/score/count/' + this.totalCourseId, this.proportionForm)
      if (!res.returnCode) return this.$message.error('统计总分失败! 原因: ' + res.returnMsg)
      this.$message.success('统计总分成功!')
      this.showTotalDialogVisible = false
      this.getCourseList()
    },
    // 显示评分结果
    async showScoreDialog (row) {
      const { data: res } = await this.$http.get('scoreapi/score/course/' + row.courseId)
      if (!res.returnCode) return this.$message.error('评分结果获取失败! 原因: ' + res.returnMsg)
      this.score = res.data
      this.showScoreVisible = true
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 3px;
}
.inputStyle {
  width: 110px;
}
</style>
