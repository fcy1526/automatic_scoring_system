<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      <el-breadcrumb-item>评分详情</el-breadcrumb-item>
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
            <el-row type="flex" align="middle">
              <el-col :span="2">
                <span style="margin-left: 10px">当前阶段: </span>
              </el-col>
              <el-col :span="3">
                <el-select v-model="scope.row.currentStage" placeholder="请选择"
                           @change="changeStage">
                  <el-option
                    v-for="stage in scope.row.stages"
                    :key="stage.stageId"
                    :label="'阶段' + stage.stageId"
                    :value="stage.stageId">
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="14">
                <el-table :data="scoreProgress" :show-header="false">
                  <el-table-column label="评分类型" width="120px" prop="name"></el-table-column>
                  <el-table-column label="评分进度" prop="percent">
                    <template slot-scope="scope">
                      <el-progress
                        type="line"
                        :stroke-width="20"
                        :text-inside="true"
                        :percentage="scope.row.percent">
                      </el-progress>
                    </template>
                  </el-table-column>
                  <el-table-column label="count" prop="count" width="80px">
                    <template slot-scope="scope">
                      <span>{{scope.row.count}} / 50</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80px">
                    <template slot-scope="">
                      <!-- 查看详情按钮 -->
                      <el-button size="mini">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170px"></el-table-column>
        <el-table-column label="结束时间" prop="endTime" width="170px"></el-table-column>
        <el-table-column label="状态" prop="status" width="80px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'WAIT'">未开始</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 'PROCESS'">进行中</el-tag>
            <el-tag type="warning" v-else>结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阶段数" prop="stageNum" width="65px"></el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="">
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
      // 上一个展开的行
      lastExpandRow: {},
      // 列表总数
      total: 0,
      // 阶段值
      stageNum: 0,
      // 评分进度
      scoreProgress: [
        {
          name: '学生表现评分',
          percent: 70,
          count: 30
        },
        {
          name: '小组成绩',
          percent: 70,
          count: 30
        },
        {
          name: '小组互评',
          percent: 70,
          count: 30
        },
        {
          name: '小组长评分',
          percent: 70,
          count: 30
        },
        {
          name: '教师评分',
          percent: 70,
          count: 30
        }
      ]
    }
  },
  created () {
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
    // 更换阶段值
    changeStage () {
    }
  }
}
</script>

<style lang="less" scoped>
.span_center {
  display: flex;
  align-items: center;
  > span {
    margin-left: 15px;
  }
}
</style>
