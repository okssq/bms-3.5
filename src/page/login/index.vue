<template>
    <div class="login_bg"  :style="{backgroundImage: 'url('+bgImg+')' }">
        <div class="loginBox">
            <div class="login-info">
                <div class="lt-logo" v-if="ltzn"><img :src="ltlogo" alt=""></div>
                <div class="login-logo"><img class="login-text" :src="logo" alt=""></div>
                <el-input placeholder="用户名" v-model="username" class="login_input" size="large"></el-input>
                <el-input type="password" readonly onfocus="this.removeAttribute('readonly');" placeholder="密码" v-model="pwd"  @keyup.enter.native="login" class="login_input" size="large"></el-input>
                <div class="dbtn" @click="login">登录</div>  
            </div>
            <!-- <div class="qrcode">
                <img src="~img/icon/qrcode.png" alt="">
                <div class="app-txt">扫码下载安卓装机APP</div>
            </div> -->
        </div>
        <div v-if="dbwl" class="icp"><a href="http://www.beian.miit.gov.cn">粤ICP备17039620号-3</a> 广东中科天中工业物联网有限公司 技术支持</div>
    </div>
    
</template>

<script>
import Server from 'service/mm.jsx';
import Qs from 'qs';
const _mm = new Server();

export default{
    data(){
        return {
            username:"",
            pwd:"",
            logo:require("img/login/login_text.png"),
            dbwl:false, //是否德邦物流域名
            ltzn:false, //是否龙图智能域名
            ltlogo:require("img/login/lt_logo.jpg"), //龙图智能logo图片,
            bgImg:''
        }
    },
    created(){
        this.evt_change_logo();
        this.evt_change_bg();
    },
    methods:{
        // logo改变
        evt_change_logo(){
            let _href = window.location.href;
            if(_href.indexOf("dbwl168") > -1){
                this.logo  = require("img/login/login_text.png");
                this.dbwl = true;
            }
            else if(_href.indexOf("zlzk.idas168.com") > -1){
                this.logo  = require("img/login/login_hnxf.png");
            }
            if(_href.indexOf('jiugongjituan') > -1){
                this.ltzn = true;
            }
        },
        // 背景改变
        evt_change_bg(){
            let _href = window.location.href;
            let _reg     = /companyName=[a-zA-Z0-9]{1,16}$/;
            let _hash    = window.location.hash;
            let _result  = _reg.exec(decodeURIComponent(_hash));
            let _index   = _result ? _result['index'] : 0;
            let _str     = _result ? _result['input'].substring(_index+12) : null;
            if(_href.indexOf("zlzk.idas168.com") > -1){
                this.bgImg = require("img/login/hnxf.jpg");
            }else{
                this.bgImg  = get_bg(_str);
            }
            function get_bg(str){
                switch(str) {
                    case 'zhgcqcfw':
                        return require("img/login/zhgcqcfw.jpg");
                        break;
                    default:
                        return require("img/login/5.jpg");
                }    
            }
        },
        login(){
            let _this     = this;
            let _username = this.username,
                _pwd      = this.pwd;
            
            if(!_username){
                _mm.msg("请输入用户名");
                return;
            }else if(!_pwd){
                _mm.msg("请输入密码");
                return;
            }

            let postData = {
                userName:_username,
                password:_pwd
            };
   
            _mm.request({
                url:'/admin/login.json',
                data:postData
            }).then((res)=>{
                _mm.setStorage("login",res);
                this.$store.commit('update_websocket',{
                    is      : false,
                    isAuto  : false,
                    isAudio : false
                })
                if(_this.$route.query.redirect){
                    _this.ajax_load();
                }else{
                    _this.$router.push({path:"/gps-position"});
                }
                //
            },function(err){
                console.log(err)
            })
        },
        ajax_load(){
            let _this = this;
            _mm.request({
                url: "/menu/user_menu_level.json",
            }).then(res=>{
                if(res.length === 0){
                    _this.$router.push({path:"/no-power"});
                    return;
                }
                fn_next(res)
            });

            function fn_next(res){
                let _arr = [];
                let _sign = false;
                let _redirect = _this.$route.query.redirect?_this.$route.query.redirect:"/gps-position";
                res.forEach(el=>{
                    if(el.children.length > 0){
                        el.children.forEach(two=>{
                            if(two.to === _redirect){
                                _sign = true;
                            }
                        });
                    }
                    
                    
                });
                
                if(!_sign){
                    _redirect = "/gps-position"
                }
                _this.$router.push({path:_redirect});
            }
        },
    }
    
}
</script>

<style >

    
    .login-logo{ width: 320px;height: 45px;;text-align:center;margin-bottom:15px;}
    .login-logo-debang{ width: 320px;height: 125px;;text-align:center;}
    .login-text,.login-logo-debang img{height:100%;}
    .login_bg{
        width:100%;
        height: 100%;background-repeat: no-repeat;box-sizing: border-box;
        background-position: center center;background-size:cover;background-color: #000;}
    .login_bg_hnxf{background-image: url("~img/login/hnxf.jpg");}
    .loginBox{
        width: 600px;
        position: absolute;
        top: 100px;
        right: 0%;
    }


    .login-info{width: 320px;float: left;}
    .qrcode{width: 240px;float: right;position: relative;text-align: right;}
    .qrcode::before{position: absolute;content: '';width: 1px;background-color: rgba(255,255,255,.7);height: 160px;left: 15px;top:-3px;transform:scale(0.5,1);}
    .login_input input{text-align: center; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);margin-bottom: 15px;border: none;color: #303133;height: 50px;background-color: rgba(255,255,255,.95)}
    .login_input input::-webkit-input-placeholder{color: #93a9bf;}
    .login_input input::-moz-placeholder{color: #93a9bf;}
    .login_input input:-moz-placeholder{color: #93a9bf;}
    .login_input input:-ms-input-placeholder{color: #93a9bf;}
    .loginBox .dbtn{border: none;margin-right: 0;color: #fff;height: 50px;background-color: #3496f8;line-height: 50px;}
    .qrcode img{width: 170px;position: absolute;right: 0;top: -20px;}
    .app-txt{position: absolute;right: 0;top:160px;height: 20px;line-height: 20px;width: 170px;text-align: center;color: #fff;font-weight: bold;}

    .icp{position:absolute;bottom:20px;left:50%;margin-left:-160px;width:450px;text-align:center;height:50px;line-height:50px;background:rgba(0,0,0,0.3);color:#fff;}
    .icp a{color:#fff;text-decoration:none;}
    .lt-logo {
        text-align: center;
        margin-bottom: 10px;
    }
    .lt-logo img{
        height: 110px;
    }
</style>
