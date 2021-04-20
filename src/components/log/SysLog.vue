<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>日志管理</el-breadcrumb-item>
      <el-breadcrumb-item>日常操作日志</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 类型下拉框区域 -->
          <el-select v-model="queryInfo.type" clearable @change="getLogList" placeholder="请选择">
            <el-option
              v-for="item in type"
              :key="item.label"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <!-- 课程列表 -->
      <el-table :data="logList" border stripe
                :header-cell-style="{background:'#FAFAFA'}">
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="用户id" prop="sysUserId" width="150px"></el-table-column>
        <el-table-column label="真实姓名" prop="sysTrueName" width="150px"></el-table-column>
        <el-table-column label="操作时间" prop="opertime" width="200px"></el-table-column>
        <el-table-column label="操作类型" prop="type" align="center" width="100px"></el-table-column>
        <el-table-column label="操作表" prop="opertable" width="220px"></el-table-column>
        <el-table-column label="操作说明" prop="operation"></el-table-column>
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
      type: [{
        label: '登录'
      }, {
        label: '新增'
      }, {
        label: '更新'
      }, {
        label: '删除'
      }],
      // 日志列表
      logList: [],
      // 获取日志列表的查询参数
      queryInfo: {
        // 日志类型
        type: '',
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
      const { data: res } = await this.$http.get('scoreapi/log/sysLog', { params: this.queryInfo })
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
