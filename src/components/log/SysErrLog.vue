<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>日志管理</el-breadcrumb-item>
      <el-breadcrumb-item>系统异常日志</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 课程列表 -->
      <el-table :data="logList" border stripe
                :header-cell-style="{background:'#FAFAFA'}" :row-key="logList.logId">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <span>{{ scope.row.message }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户id" prop="sysUserId"></el-table-column>
        <el-table-column label="真实姓名" prop="sysTrueName"></el-table-column>
        <el-table-column label="操作时间" prop="opertime"></el-table-column>
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
      // 日志列表
      logList: [],
      // 获取日志列表的查询参数
      queryInfo: {
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 日志总数
      total: 0
    }
  },
  created () {
    this.getLogList()
  },
  methods: {
    // 查询日志
    async getLogList () {
      const { data: res } = await this.$http.get('logapi/log/sysErrLog', { params: this.queryInfo })
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.logList = res.data.list
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getLogList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getLogList()
    }
  }
}
</script>

<style scoped>

</style>
