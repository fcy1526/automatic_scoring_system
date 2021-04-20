<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      <el-breadcrumb-item>成绩查询</el-breadcrumb-item>
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
      </el-row>
      <!-- 课程列表 -->
      <el-table :data="courseList" border stripe
                :header-cell-style="{background:'#FAFAFA'}"
                :row-key="courseList.courseId">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="学生表现评分:">
                <span>{{ scope.row.studentScore }}</span>
              </el-form-item>
              <el-form-item label="小组评分:">
                <span>{{ scope.row.groupScore }}</span>
              </el-form-item>
              <el-form-item label="小组互评分:">
                <span>{{ scope.row.mutualScore }}</span>
              </el-form-item>
              <el-form-item label="小组长评分:">
                <span>{{ scope.row.leaderScore }}</span>
              </el-form-item>
              <el-form-item label="最终项目评分:">
                <span>{{ scope.row.teacherScore }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="课程名称" prop="name"></el-table-column>
        <el-table-column label="总成绩" prop="score"></el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15]"
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
      // 课程列表
      courseList: [],
      // 获取课程列表的查询参数
      queryInfo: {
        // 课程名称
        name: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 课程总数
      total: 0
    }
  },
  created () {
    this.getCourseList()
  },
  methods: {
    // 查询课程
    async getCourseList () {
      const { data: res } = await this.$http.get('scoreapi/score/userScore', { params: this.queryInfo })
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
    }
  }
}
</script>

<style scoped>

</style>
