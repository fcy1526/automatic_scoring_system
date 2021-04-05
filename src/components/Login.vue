<template>
  <div class="login_container">
    <div class="login_box">
      <!--  头像区    -->
      <div class="avatar_box">
        <img src="../assets/logo.png">
      </div>
      <!--  登录表单区    -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 学号 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.userId" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-lock" type="password"></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-form-item prop="captcha" class="captcha_form">
              <el-input v-model="loginForm.captcha">
                <template slot="prepend">验证码：</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7" class="captcha_form">
            <img :src="'data:image/png;base64,'+captchaStr" @click="getCaptcha">
          </el-col>
        </el-row>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="resetLoginForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是验证码图片base64码
      captchaStr: '',
      // 这是登录表单的数据绑定对象
      loginForm: {
        userId: '116052017107',
        password: '123456',
        captcha: '',
        // 这是验证码图片的加密值
        imageHashCode: ''
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        userid: [
          { required: true, message: '请输入学号', trigger: 'blur' }
          // { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' }
          // { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.getCaptcha()
  },
  methods: {
    // 重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('userapi/login', this.loginForm)
        // returnCode: 0失败 1成功
        if (!res.returnCode) return this.$message.error('登录失败,' + res.returnMsg)
        this.$message.success('登录成功')
        // 将登录成功之后的token，保存到客户端的sessionStorage中
        window.sessionStorage.setItem('token', 'Bearer ' + res.data.access_token)
        // 发起请求，获取前端按钮权限表
        await this.global.methods.getAllBtn()
        // 发起请求，获取当前用户按钮权限表
        await this.global.methods.getUserBtn()
        // 通过编程式导航跳转到后台主页
        await this.$router.push('/home')
      })
    },
    // 获取验证码
    async getCaptcha () {
      const { data: image } = await this.$http.get('userapi/login/captcha')
      // console.log(image)
      this.captchaStr = image.imageBase64
      this.loginForm.imageHashCode = image.imageHashCode
    }
  }
}
</script>

<style lang="less" scoped>

.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 350px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
    border: #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.captcha_form {
  margin-right: 5px;
}
</style>
