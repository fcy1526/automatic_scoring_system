<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" style="height: 40px">
        <span>软件工程类实践课自动评分系统</span>
      </div>
      <div>
        <span style="  font-size: 16px;">欢迎，{{username}}</span>
        <el-tooltip class="item" effect="light" placement="bottom">
          <div slot="content">
            <el-row v-auth="'PERSON_INFO'" v-show="false">
              <el-button size="small" @click="userinfoDialogVisible = true">个人信息</el-button>
            </el-row>
            <el-row v-auth="'PERSON_PWD'" v-show="false">
              <el-button size="small" @click="updatePwdDialogVisible = true">修改密码</el-button>
            </el-row>
            <el-row>
              <el-button size="small" @click="logout">退出系统</el-button>
            </el-row>
          </div>
          <el-avatar :size="40" :src="circleUrl"></el-avatar>
        </el-tooltip>
        <!-- 个人信息对话框 -->
        <el-dialog title="个人信息" :visible.sync="userinfoDialogVisible" width="50%" @close="closeUserinfoDialog">
          <el-form :model="userinfo"  ref="userinfoRef" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userinfo.userId" disabled></el-input>
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="userinfo.trueName" :disabled="userFormDisable"></el-input>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio v-model="userinfo.sex" label="MAN" :disabled="userFormDisable">男</el-radio>
              <el-radio v-model="userinfo.sex" label="WOMAN" :disabled="userFormDisable">女</el-radio>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer" v-show="false" v-auth="'PERSON_EDIT'">
              <el-button @click="updateUserinfo" v-show="updateButton">修 改</el-button>
              <el-button type="primary" @click="saveUserinfo" v-show="updateButton === false">保 存</el-button>
          </span>
        </el-dialog>
        <!-- 修改密码对话框 -->
        <el-dialog title="修改密码" :visible.sync="updatePwdDialogVisible" width="50%" @close="updatePwdDialogClosed">
          <el-form :model="passwordForm" ref="passwordRef" label-width="100px" :rules="passwordRules">
            <el-form-item label="新密码" prop="password">
              <el-input v-model="passwordForm.password" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input v-model="passwordForm.checkPass" show-password></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="updatePwd">修 改</el-button>
          </span>
        </el-dialog>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区 -->
        <el-menu background-color="#323744" text-color="#fff"
                 active-text-color="#409BFF" :unique-opened="true"
                 :collapse="isCollapse" :collapse-transition="false"
                 :router="true" :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.menuId + ''" v-for="item in menuList" :key="item.menuId">
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.menuId]"></i>
              <!-- 文本 -->
              <span>{{ item.menuName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="children.menuHref + ''" v-for="children in item.children"
                          :key="children.menuId" @click="saveNavState(children.menuHref)">
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[children.menuId]"></i>
                <!-- 文本 -->
                <span>{{ children.menuName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.passwordForm.checkPass !== '') {
          this.$refs.passwordRef.validateField('checkPass')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      menuList: [],
      iconsObj: {
        // 用户管理
        1: 'iconfont icon-bussiness-man',
        // 学生列表
        101: 'iconfont icon-student',
        // 教师列表
        102: 'iconfont icon-nav_famousTeacher',
        // 班级管理
        2: 'iconfont icon-class',
        // 班级列表
        201: 'iconfont icon-class-o',
        // 小组列表
        202: 'iconfont icon-xiaozu',
        // 权限管理
        3: 'iconfont icon-Authorizationsuccess',
        // 权限列表
        301: 'iconfont icon-class1',
        // 角色列表
        302: 'iconfont icon-role_icon',
        // 课程管理
        4: 'iconfont icon-biaoqiankuozhan_kecheng-147',
        // 课程列表
        401: 'iconfont icon-liebiao',
        // 评分详情
        402: 'iconfont icon-pingfen',
        // 评分事务
        5: 'iconfont icon-shiwu',
        // 学生评分
        501: 'iconfont icon-pingfen1',
        // 小组互评
        502: 'iconfont icon-credit-level',
        // 小组评分
        503: 'iconfont icon-xiaozu1',
        // 小组长评分
        504: 'iconfont icon-leader_xg_xsst',
        // 最终项目评分
        505: 'iconfont icon-end',
        // 日志管理
        6: 'iconfont icon-ziyuanxhdpi'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的地址
      activePath: '',
      // 用户基础信息
      userinfo: {},
      // 头像
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      // 控制用户个人信息对话框显示与隐藏
      userinfoDialogVisible: false,
      // 控制修改密码对话框显示与隐藏
      updatePwdDialogVisible: false,
      // 控制个人信息输入框禁用与解禁
      userFormDisable: true,
      // 控制修改按钮的显示与隐藏
      updateButton: true,
      // 修改密码的验证规则对象
      passwordRules: {
        password: [
          { required: true, validator: validatePassword, trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      passwordForm: {
        // 密码
        password: '',
        // 确认密码
        checkPass: ''
      },
      // 用户名称
      username: ''
    }
  },
  created () {
    this.getUserInfo()
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.global.methods.reset()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      location.reload()
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('userapi/menu')
      if (!res.returnCode) return this.$message.error(res.returnMsg)
      this.menuList = res.data
      // console.log(res)
    },
    // 点击按钮，切换菜单的折叠和展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存当前菜单
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    // 获取用户个人信息
    async getUserInfo () {
      const { data: res } = await this.$http.get('userapi/user')
      if (!res.returnCode) return this.$message.error('获取用户个人信息失败!')
      this.userinfo = res.data
      this.username = this.userinfo.trueName
    },
    // 解禁输入框，修改用户信息
    updateUserinfo () {
      this.userFormDisable = false
      this.updateButton = false
    },
    // 关闭用户信息对话框
    closeUserinfoDialog () {
      this.userFormDisable = true
      this.updateButton = true
      this.$refs.userinfoRef.resetFields()
    },
    // 保存用户信息
    async saveUserinfo () {
      const { data: res } = await this.$http.post('userapi/user', this.userinfo)
      if (!res.returnCode) return this.$message.error('修改个人信息失败!')
      this.$message.success('修改个人信息成功!')
      this.userinfoDialogVisible = false
      this.userinfo = res.data
      this.username = this.userinfo.trueName
      this.userFormDisable = true
      this.updateButton = true
    },
    // 监听修改密码对话框的关闭事件
    updatePwdDialogClosed () {
      this.updatePwdDialogVisible = false
      this.$refs.passwordRef.resetFields()
    },
    // 修改密码
    async updatePwd () {
      const data = { userId: this.userinfo.userId, password: this.passwordForm.password }
      const { data: res } = await this.$http.post('userapi/user/pwd', data)
      if (!res.returnCode) return this.$message.error('修改密码失败!')
      this.$message.success('修改密码成功!')
      this.updatePwdDialogVisible = false
      this.updatePwdDialogClosed()
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373C41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #323744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #EAEDF2;
}
.home-container {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-avatar {
  margin-right: 10px;
}
</style>
<!-- 修改elementui自带样式的话，不能在<style scoped></style>中修改，因为不会生效。-->
<style lang="css">
.el-tooltip__popper[x-placement^="bottom"] {
  padding: 0px !important;
}
</style>
