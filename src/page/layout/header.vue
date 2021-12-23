<template>
    <header :class="{bigHeader:!fullNav}" :style="{'z-index':(zIndexTop==='nav'?101:100)}">
        <div class="header-main">
            <div class="btn-expand" @click="evt_sideToggle">
                <i :class="fullNav ? 'el-icon-s-fold' : 'el-icon-s-unfold'"></i>
            </div>
            <Curmb />
            <div class="sys-list">
                <div class="item-user">
                    <el-dropdown trigger="click" @command="loginOut" @visible-change="addActive">
                        <span class="el-dropdown-link">
                            <span :class="{active:isActive}">{{realName}}</span>
                            <i class="el-icon-caret-bottom" :class="{'el-icon-caret-top':isActive}"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <div class="item-set" title="报警设置">
                    <el-popover placement="left" title width="160" trigger="click">
                        <div class="item-set-op">
                            <div
                                class="item-setOp-box"
                                v-for="(o,o_index) in setting"
                                :key="o_index"
                            >
                                <el-switch
                                    v-model="o.model"
                                    active-color="rgb(52, 150, 248)"
                                    inactive-color="#DCDFE6"
                                    :active-text="o.label"
                                    @change="EVT_switch(o)"
                                ></el-switch>
                            </div>
                        </div>
                        <div class="item-set-txt" slot="reference"></div>
                    </el-popover>
                </div>
                <div class="item-warn" title="报警信息">
                    <el-popover
                        class="warn-popover"
                        placement="bottom"
                        width="326"
                        trigger="click"
                        v-model="warn_panel_show"
                        @show="ajax_warnList"
                    >
                        <div class="warn-panel" v-loading="loading">
                            <div class="warn-list">
                                <div v-if="warnList.length===0" class="no-warn-list">暂无报警信息</div>
                                <div
                                    v-else
                                    class="warn-list-item"
                                    v-for="item in warnList"
                                    :key="item.id"
                                    @click="warnList_item_click(item);"
                                >
                                    <div class="warn-item-img">
                                        <img :src="item.imageUrl" alt />
                                    </div>
                                    <div class="warn-item-main">
                                        <div class="warn-item-type">报警类型：{{item.warningName}}</div>
                                        <div class="warn-item-aside">
                                            <div class="warn-item-vehicle">{{item.vehicleLicence}}</div>
                                            <div class="warn-item-time">{{item.warningTime}}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="warn-btngroup">
                                <el-button
                                    class="warn-btn-item"
                                    type="danger"
                                    plain
                                    @click="clear_warnList"
                                >清空通知</el-button>
                                <el-button
                                    class="warn-btn-item"
                                    type="primary"
                                    plain
                                    @click="view_moreWarn"
                                >查看更多</el-button>
                            </div>
                        </div>
                        <div class="bell-image" slot="reference">
                            <el-badge :is-dot="warnSocket.isRed" class="item"></el-badge>
                        </div>
                    </el-popover>
                </div>
                <div class="item-bigScreen" @click="EVT_bigScreen" title="大屏展示"></div>
                <div class="item-q-code" title="二维码">
                    <el-popover
                        placement="bottom"
                        popper-class="popover-q-code"
                        width="200"
                        trigger="hover"
                    >
                        <div class="q-code-tle">请使用手机浏览器扫码下载</div>
                        <div class="q-code-panel">
                            <div class="code-item">
                                <div class="item-code-image">
                                    <span class="code-icon apple"></span>
                                    <span class="q-code-text">平台APP(苹果版)</span>
                                </div>
                                <div class="code-img">
                                    <img :src="require('assets/img/top/plat-app-ios.png')" alt="">
                                </div>
                            </div>
                            <div class="code-item">
                                <div class="item-code-image ">
                                    <span class="code-icon android"></span>
                                    <span class="q-code-text">平台APP(安卓版)</span>
                                </div>
                                <div class="code-img">
                                    <img :src="require('assets/img/top/plat-app.png')" alt="">
                                </div>
                            </div>
                            <div class="code-item">
                                <div class="item-code-image ">
                                    <span class="code-icon android"></span>
                                    <span class="q-code-text">装机APP(安卓版)</span>
                                </div>
                                <div class="code-img">
                                    <img :src="require('assets/img/top/install-app.png')" alt="">
                                </div>
                            </div>
                        </div>
                        <div class="q-code" slot="reference"></div>
                    </el-popover>
                </div>
                <audio
                    preload
                    muted="muted"
                    src="https://dsm.xiaozhenkj.com/cdn/others/warnAudio.mp3"
                    controls="controls"
                    id="bgMusic"
                    style="position:absolute;bottom:0px;left:0px;opacity:0;z-index:-1;"
                ></audio>
            </div>
            <el-dialog
                :visible.sync="dialogVisible"
                width="400px"
                :append-to-body="true"
                :close-on-click-modal="false"
            >
                <div slot="title" class="dialog-header">{{dialog_data.vehicleLicence}}</div>
                <div class="dialog-main">
                    <img :src="dialog_data.imageUrl" alt />
                    <div class="dialog-item">
                        <span>报警类型：</span>
                        <span>{{dialog_data.warningName}}</span>
                    </div>
                    <div class="dialog-item">
                        <span>上传时间：</span>
                        <span>{{dialog_data.warningTime}}</span>
                    </div>
                    <div class="dialog-item">
                        <span>上传地点：</span>
                        <span>{{dialog_data.warningPlace}}</span>
                    </div>
                    <div class="dialog-audioTitle">语音提醒</div>
                    <div class="dialog-item dialog-item-opreation">
                        <el-input v-model="dialog_data.text" placeholder="请输入要发送的内容"></el-input>
                        <el-button class="send_text_btn" type="primary" @click="send_text">发送语音</el-button>
                    </div>
                </div>
            </el-dialog>
        </div>
    </header>
</template>

<script>
import Server from "service/mm.jsx";
import Curmb from "@/page/layout/crumb.vue";
const _mm = new Server();
let _this = "";

export default {
    props: ["fullNav"],
    components: {
        Curmb
    },
    data() {
        return {
            setting: [
                { label: "AI报警弹窗", type: "warn", model: false },
                { label: "报警声音", type: "audio", model: false }
            ],
            value2: false,
            isRed: false,
            realName: "",
            isActive: false,
            alarmCountNum: "1",
            is_old: false,
            isBigScreen: true,
            ws: "",
            config: {
                audio: true,
                alert: false,
                redPoint: true
            },
            warnType: "1",
            warnList: [],
            loading: false,
            warn_panel_show: false,
            dialogVisible: false,
            dialog_data: {
                vehicleLicence: "",
                imageUrl: "",
                warningTime: "",
                warningPlace: "",
                warningName: "",
                text: ""
            },
            plat_app: require("img/top/plat-app.png"),
            install_app: require("img/top/install-app.png"),
            openVoice:false,
            plat_app_ios: require("img/top/plat-app-ios.png"),
            install_app: require("img/top/install-app.png"),
        };
    },
    computed: {
        //层级关系
        zIndexTop(){
            return this.$store.state.zIndexTop;
        },
        warnInfo() {
            return this.$store.state.warning.info;
        },
        warnSocket() {
            return this.$store.state.warnSocket;
        }
    },
    created() {
        _this = this;
        this.realName = _mm.getStorage("login")
            ? _mm.getStorage("login")["realName"]
            : "null";
    },
    mounted() {
        this.ajax_noticeInfo();
        



        let _login = _mm.getStorage('login'),
            
            websocket = null;
        if('WebSocket' in window){
            websocket = new WebSocket("wss://dsm.xiaozhenkj.com/vehicle/info");
            setTimeout(()=>{
                websocket.send(JSON.stringify({companyId:_login.companyId,code:"101"}));
            },1000)
            
        }
        else{
            alert('Not support websocket')
        }
        

        //接收到消息的回调方法
//         websocket.onmessage =  function(event){
//             console.log(event)
//             _this.EVT_switch(event);
//         }

        websocket.onmessage = (event) => {
            this.ws_update(event);
        }


       
                
      
    },
    methods: {
        // 获取系统公告
        ajax_noticeInfo() {
            let _this = this;
            _mm.request({
                url: "/notice/notice_info.json"
            }).then(
                res => {
                    if (!res) {
                        return;
                    }
                    let nowTime = new Date().getTime();
                    let { startTime, endTime, content } = res;
                    startTime = new Date(startTime).getTime();
                    endTime = new Date(endTime).getTime();
                    if (nowTime >= startTime && nowTime <= endTime) {
                        _this.$notify({
                            title: "系统公告",
                            message: content,
                            type: "success",
                            position: "bottom-right",
                            duration: 15000
                        });
                    }
                },
                err => {
                    // console.log('1111afafafaf');
                }
            );
        },

        //打开AI报警弹层
        open_notify(obj) {
            let _this = this;
            let stringObj = JSON.stringify(obj);
            let _notify = this.$notify({
                dangerouslyUseHTMLString: true,
                // duration:0,
                offset: 65,
                customClass: "d-notify",
                message:
                    `
                        <div class="notify">
                            <div class="notify-tle">
                                ` +
                    (obj.vehicleLicence || "车牌号") +
                    `
                            </div>
                            <div class="notify-item zoom">
                                <div class="notify-item-name">` +
                    (obj.warningName || "报警名字") +
                    `</div>
                                <div class="notify-btn checkAiAlert" info=\'` +
                    stringObj +
                    `\'>查看</div>
                            </div>
                        </div>
                    `
            });

            //点击查看
            $(document)
                .off("click", ".checkAiAlert")
                .on("click", ".checkAiAlert", function() {
                    let _obj = JSON.parse($(this).attr("info"));
                    _this.warnSocket.is = true;
                    _this.warnSocket.data = _obj;
                    _this.warnSocket.isAuto = false;
                    _notify.close();
                });
        },

        

        //更新报警状态
        ws_update(obj) {
            let _this = this;
            let _obj = JSON.parse(obj.data);
            // console.log("_obj",_obj)

            if (!_obj.result) return;

            let _result = _obj.result;
            let _msg = _result.msg;
            if (_result.type != "2") return;
            if (_msg && _msg.length > 0) {
                _this.$store.commit("update_warnSocket", { isRed: true });
                if (_this.warnSocket.isAuto) {
                    _msg[0].imageUrl = _msg[0].imageUrl;
                    _this.open_notify(_msg[0]); //打开AI报警弹层
                    console.log("_msg[0]",_msg[0])
                }

                if (!_this.warnSocket.isAudio) return;
                this.audioPlay();
                        
                  
                
            //     let _audio = document.getElementById("bgMusic");
            //     _audio.addEventListener("canplaythrough",
            //         function() {
            //             _audio.play();
            //         },
            //     false);
            //     _audio.load();
            //     if(_audio.paused){
            //         _audio.play();
            // 　　}else{
            //         _audio.pause();
            // 　　}
            }
        },
        audioPlay(){
            var audio = document.getElementById('bgMusic');
           
        
            if(this.openVoice){
                audio.play();
            }
                // audio.currentTime = 0;//设置播放的音频的起始时间
                // audio.volume = 0.5;//设置音频的声音大小
                // audio.muted = false;//关闭静音状态
            
        },
       

        //大小导航切换
        evt_sideToggle() {
            this.$emit("evt_sideToggle", this.fullNav);
            this.$store.commit("update_fullNav", !this.fullNav);
        },

        //退出
        loginOut: function() {
            let _this = this;
            _mm.request({
                url: "/admin/quit_login.json"
            }).then(function(res) {
                _this.config.alert = false;
                _this.$store.commit('update_websocket',{
                    is : false,
                    isAuto : false,
                    isAudio : false
                });
                $(".el-notification").hide();
                if (_this.ws) {
                    _this.ws.close();
                }
                // console.log('执行了ws关闭');
                _mm.ToLogin();
            });
        },

        //添加状态
        addActive: function() {
            this.isActive = !this.isActive;
        },

        // 清除通知
        clear_warnList() {
            this.$store.commit("update_warnSocket", { isRed: false });
            this.warnList = [];
            this.warn_panel_show = false;
        },
        // 查看更多
        view_moreWarn() {
            this.clear_warnList();
            this.$router.push({ path: "/alarm-driver" });
        },
        // 铃铛点击事件
        ajax_warnList() {
            this.loading = true;
            let _this = this;
            _mm.request({
                url: "/alarm/alarm_list.json",
                data: { warningType: 1, type: 1, page: 1, pageSize: 5 }
            }).then(
                res => {
                    // console.log('res',res)
                    // console.log('res',res.results);
                    _this.warnList = res.results;
                    _this.loading = false;
                },
                err => {
                    // console.log('1111afafafaf');
                    _this.loading = false;
                }
            );
        },
        // 报警单条点击
        warnList_item_click(item) {
            this.clear_warnList();
            this.dialog_data = { ...item };
            this.dialogVisible = true;
            // console.log('item',item)
        },
        // 发送语音
        send_text() {
            let _text = this.dialog_data.text;
            if (!_text) {
                _mm.msgErr("请输入对话内容");
                return;
            }
            /**设置推流数据    4000*/
            let push_data = {
                groupName: this.dialog_data.vehicleId, //车辆id
                msgBody: "5000ABAB" + _text, //A4545.MP4
                timeToLive: "60" //离线时常
            };

            _mm.request({
                url: "/jpush/down_common_jpush.json",
                data: push_data
            }).then(
                res => {
                    _mm.msgSss("发送成功");
                    _this.dialog_data.text = "";
                },
                err => {
                    _mm.msgErr("发送失败");
                }
            );
        },

        //点击大屏按钮
        EVT_bigScreen() {
            this.config.alert = false;
            $(".el-notification").hide();
            if (this.ws) {
                this.ws.close();
            }
            // console.log('执行了ws关闭');
            this.$router.push({ path: "/big-Screen" });
            this.fn_viewFullScreen();
        },

        //
        fn_viewFullScreen() {
            var docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm = document.body; //overwrite the element (for IE)
                docElm.msRequestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        },

        //AI弹窗开关控制
        EVT_switch(item) {
            if (item.type === "warn") {
                this.warnSocket.isAuto = item.model;
            } else if (item.type === "audio") {
                var audio = document.getElementById('bgMusic');
                if(audio){
                    audio.muted = false;
                    this.openVoice = item.model;
                }else{
                    setTimeout( () => {
                        var audio = document.getElementById('bgMusic');
                        audio.muted = false;
                        this.openVoice = item.model;
                    },1500)
                }
                this.warnSocket.isAudio = item.model;
            }
        }
    }
};
</script>

<style scoped>

header {
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    position: fixed;
    left: 220px;
    top: 0;
    background-color: #fff;
    width: calc(100% - 220px);
    height: 49px;
    transition: all 0.4s ease-in-out;
    z-index: 101;
}
.header-main{
    width: 100%;
    height: 100%;
    min-width: 720px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
.bigHeader {
    left: 50px;
    width: calc(100% - 50px);
}
.btn-expand {
    width: 68px;
    height: 100%;
    transition: background 0.3s;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-width: 68px;
}
.btn-expand:hover {
    background-color: rgba(0, 0, 0, 0.025);
}

.sys-list {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: nowrap;
    align-items: center;
    /* min-width: 350px; */
}
.sys-list > div {
    height: 100%;
    line-height: 49px;
    cursor: pointer;
    background-position: center center;
    background-repeat: no-repeat;
    transition: all 0.3s;
}
.item-user .el-dropdown-link {
    margin: 0 10px;
    color: #303133;
}

.sys-list > div:hover {
    background-color: rgb(249, 249, 249);
}
.item-bigScreen {
    width: 44px;
    height: 100%;
    background-image: url("~assets/img/top/bigScreen.png");
    background-size: 24px;
    opacity: 0.8;
}
.item-bell {
    background-image: url("~assets/img/top/bell.png");
    width: 39px;
    height: 100%;
    position: relative;
    background-size: 24px;
    opacity: 0.5;
}
.item-bell span {
    position: absolute;
    width: 8px;
    height: 8px;
    right: 22px;
    top: 12px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    background-color: #f56c6c;
    color: #fff;
    border-radius: 10px;
}
.item-set {
    width: 40px;
}
.item-set-txt {
    height: 100%;
    width: 40px;
    background-image: url("~assets/img/top/set.png");
    background-size: 20px;
    background-position: center center;
    background-repeat: no-repeat;
    opacity: 0.8;
}

.ht-list-bigScreen {
    cursor: pointer;
}
.ht-list-bigScreen > span {
    position: absolute;
    width: 8px;
    height: 8px;
    right: 23px;
    top: 23px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    background-color: #f56c6c;
    color: #fff;
    border-radius: 10px;
}

.item-q-code {
    height: 100%;
    width: 40px;
}
.q-code {
    height: 100%;
    width: 40px;
    background-image: url("~assets/img/top/top-code.png");
    background-size: 20px;
    background-position: center center;
    background-repeat: no-repeat;
}

.bell-image {
    height: 49px;
    width: 40px;
    background-image: url("~assets/img/top/bell.png");
    background-size: 22px;
    background-position: center center;
    background-repeat: no-repeat;
    opacity: 0.6;
}
.item-setOp-box {
    margin-bottom: 10px;
}
.item-setOp-box:last-child {
    margin-bottom: 0;
}

.warn-popover {
    padding: 0;
}

.warn-btngroup {
    display: flex;
    margin-top: 10px;
}
.warn-btngroup .warn-btn-item {
    flex: 1;
    transition: all 0.3s;
    font-size: 14px;
}
.warn-list {
    box-sizing: border-box;
}
.warn-list-item {
    border-bottom: 1px solid #e8e8e8;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    padding: 10px;
    align-items: center;
}
.warn-list-item:last-of-type {
    border: none;
}
.warn-list-item:hover {
    background-color: rgb(230, 247, 255);
}
.warn-item-img {
    width: 60px;
    display: flex;
    align-items: center;
}
.warn-item-img > img {
    width: 100%;
}
.warn-item-main {
    flex: 1;
    flex-direction: column;
    padding-left: 15px;
}
.warn-item-aside {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.dialog-header {
    color: #3496f8;
    font-weight: 700;
}
.dialog-main > img {
    width: 100%;
    margin-top: -26px;
}
.dialog-item {
    display: flex;
}
.dialog-item > span:first-of-type {
    width: 70px;
    color: #323940;
    font-weight: bold;
}
.dialog-item > span:last-of-type {
    flex: 1;
    overflow: hidden;
    word-wrap: break-word;
}
.dialog-item {
    padding-top: 10px;
}

.dialog-audioTitle {
    color: #323940;
    text-indent: 15px;
    position: relative;
    font-size: 15px;
    font-weight: bold;
    padding: 10px 0;
    margin-top: 10px;
    border-top: 1px solid #dae0e6;
}
.dialog-audioTitle::before {
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    position: absolute;
    left: 0;
    top: 18px;
    background: #3496f8;
}
.dialog-item.dialog-item-opreation {
    padding:f 0;
}
.send_text_btn {
    margin-left: 10px;
}
.no-warn-list {
    text-align: center;
    height: 60px;
    line-height: 60px;
}

.q-code-panel {
    /* display: flex;
    flex-direction: row;
    justify-content: space-between; */
    margin: 5px 5px 0 5px;
}



.q-code-text {
   transition: color .2s;
    font-size: 12px;
}

.item-code-image{
    height: 36px;
    line-height: 36px;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    
    
}
.code-icon{
    width: 32px;
    height: 32px;
}
.code-icon.apple{
    background: center center / 22px no-repeat url("~assets/img/top/apple.png"),
            center center/ 0 no-repeat url("~assets/img/top/apple-active.png");
    transition: background .3s;
}
.item-code-image:hover .apple{
    background: 36px / 0 no-repeat url("~assets/img/top/apple.png"),
                center center/ 22px no-repeat url("~assets/img/top/apple-active.png");
}
.item-code-image:hover ~ .code-img{
    right: 202px;
    z-index: 666;
    opacity: 1;
    
}
.header-main .popover-q-code{
    position: relative;
}
.code-img{
    position: absolute;
    /* right: 182px; */
    right: 182px;
    top: 0;
    width: 160px;
    opacity: 0;
    /* transition: all .3s; */
    z-index: -1;
    transition: right .4s;
    background-color: #fff;
    text-align: center;
    padding: 10px 0;
    font-size: 0;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    border-radius: 4px;
}
.code-img img{
    height: 140px;
}
.code-icon.android{
     background: center center/ 22px no-repeat url("~assets/img/top/android.png"),
            center / 0 no-repeat url("~assets/img/top/android-active.png");
    transition: background .3s;
}
.item-code-image:hover .android{
    background: 36px / 0 no-repeat url("~assets/img/top/android.png"),
                center / 22px no-repeat url("~assets/img/top/android-active.png");
}
.item-code-image:hover .q-code-text,
.item-code-image:hover .q-code-text{
    color: #409eff;
}



.q-code-tle {
    margin: 0px 0px 7px 4px;
    font-size: 14px;
    font-weight: bold;
}
</style>
