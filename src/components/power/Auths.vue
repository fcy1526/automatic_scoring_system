<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="authList" border stripe
                :max-height="616"
                :header-cell-style="{background:'#FAFAFA'}">
        <el-table-column label="权限ID" prop="authId"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="grade">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.grade === 1">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.grade === 2">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      authList: []
    }
  },
  created () {
    this.getAuthList()
  },
  methods: {
    // 获取权限列表
    async getAuthList () {
      const { data: res } = await this.$http.get('userapi/auth/list')
      if (!res.returnCode) return this.$message.error('获取权限列表失败!')
      this.authList = res.data
    }
  }
}
</script>

<style scoped>

</style>
