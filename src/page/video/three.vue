<template>
    <div class="mainMap">
        <div id="map"></div>
        <div class="v-r-left">
            
            <div class="video-panel" v-show="playMode || video_must_show">
                <div class="vp-tle">
                    <span>{{video_title}}</span>
                    <i class="el-icon-close" @click="evt_close_video"></i>
                </div>
                <div
                    class="vp-cnt"
                    v-loading="video_loading"
                    element-loading-text="拼命加载中"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    <XzVideo
                        v-if="video_isPlay"
                        :src="video_src"
                        @play="evt_play"
                        @end="video_end"
                    />
                </div>
            </div>
        </div>
        <div class="v-r-right">
            <div class="m-menu">
                <Menu :data="DATA_menuProps" @serach="evt_search" @refresh="evt_refresh" />
            </div>
            <div class="info-panel" v-show="card_show">
                <div
                    class="ip-tle pointer"
                    :style="{'border-bottom':(card_fade ? '1px solid #ccc' :'none'),'margin-bottom':(card_fade ? '14px' :'0')}"
                    @click="card_fade = !card_fade"
                >
                    <span class="mr15">{{infoPanel.vehicleLicence}}</span>
                    <i :class="card_fade ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
                </div>
                <div class="ip-cnt" v-show="card_fade && card_show">
                    <div class="play-mode">播放模式：</div>
                    <el-radio-group
                        v-model="playMode"
                        class="play-modes"
                        @change="evt_palyMode_change"
                    >
                        <el-radio
                            v-for="item in playOptions"
                            :key="item.pushCode"
                            :label="item.msgBody"
                        >{{item.label}}</el-radio>
                    </el-radio-group>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import XzVideo from "components/video/index.vue";
import Menu from "components/schMenu/menu.vue";
import Server from "service/mm.jsx";
const _mm = new Server();
let map,
    timer_videoHeart = 0;

export default {
    data() {
        return {
            card_show: false,
            card_fade: false,
            DATA_menuProps: {
                items: [
                    {
                        required: true,
                        name: "车牌号码",
                        type: "vehicleList",
                        key: "vehicleId",
                        value: "",
                        otherData: {},
                        nowId: "",
                        onlyListCheckedId: "",
                        init: {
                            tab: {
                                //标签选项卡
                                is: true, //是否开启
                                type: "all", //标签索引（默认：'all'）
                                lists: [
                                    { label: "全部", name: "all" },
                                    { label: "在线", name: "online" },
                                    { label: "离线", name: "offline" }
                                ]
                            },
                            tree: {
                                //树型结构
                                isCheckbox: false, //开启多选（默认：false）
                                autoData: true, //开启自动数据（默认：true）
                                setData: false, //开启外部数据（默认：false）
                                loading: true, //加载动画（默认：false）
                                auto_30s: true, //30秒自动刷新（默认：false，对外部数据不可用）
                                setList: [], //外部数据源
                                defaultProps: {
                                    //树型结构的标题字段
                                    label: "labelState",
                                    children: "children"
                                }
                            }
                        }
                    },
                    {
                        type: "btn",
                        key: "btn",
                        btns: [
                            {
                                name: "搜索",
                                key: "search",
                                value: "",
                                cls: "dbtn-blue"
                            }
                        ]
                    }
                ]
            },
            infoPanel: {
                vehicleLicence: "", //当前车辆号码
                vehicleId: "", //当前车牌ID
                state: "" //当前车辆状态
            },
            video_loading: false,
            video_isPlay: false,
            video_title: "",
            video_src: "",
            playOptions: [
                { label: "司机视频", msgBody: "1001", type: "1" },
                { label: "道路视频", msgBody: "1002", type: "2" },
                { label: "第三路视频", msgBody: "1003", type: "2" }
            ],
            playMode: "",
            pathSimplifierIns: null,
            video_reqCount:0,
            video_must_show:false,
        };
    },
    components: {
        Menu: Menu,
        XzVideo,
    },
    
    mounted() {
        this.fn_loadMap();
    },
    methods: {
        
        //加载地图
        fn_loadMap() {
            let _this = this;
            map = new AMap.Map("map", {
                zoom: 13 //级别
            });
            //加载PathSimplifier，loadUI的路径参数为模块名中 'ui/' 之后的部分
            AMapUI.load(["ui/misc/PathSimplifier"], function(PathSimplifier) {
                if (!PathSimplifier.supportCanvas) {
                    alert("当前环境不支持 Canvas！");
                    return;
                }
                _this.pathSimplifierIns = new PathSimplifier({
                    zIndex: 100,
                    map: map, //所属的地图实例
                    autoSetFitView: false,
                    getPath: function(pathData, pathIndex) {
                        return pathData.path;
                    },
                    getHoverTitle: function(pathData, pathIndex, pointIndex) {
                        return false;
                    },
                    renderOptions: {
                        //轨迹线的样式
                        pathLineStyle: {
                            strokeStyle: "#CB3333",
                            lineWidth: 6,
                            dirArrowStyle: true
                        }
                    }
                });
            });
        },

        //车辆列表更新回调
        evt_refresh(data) {
            // console.log('refresh--data',data);
            let nowData  = data.checked,showData = data.onlyListChecked;
            let otherData = this.DATA_menuProps.items[0].otherData;
            if(showData){
                otherData.state = showData.state;
            }
            if(this.infoPanel.vehicleId && nowData){
                this.infoPanel.state = nowData.state;
                if(nowData.state === "0"){
                    _mm.msgErr("车辆"+this.infoPanel.vehicleLicence+"已离线！");
                     this.fn_initData();
                }
            }
        },

        //搜索按钮
        evt_search(data) {
            // 是否离线
            let otherData = this.DATA_menuProps.items[0].otherData;
            if (otherData.state === "0") {
                _mm.msgErr("当前车辆离线或刷新车辆列表更新车辆状态！");
                this.fn_initData();
                return;
            }

            // 重置状态
            this.fn_initData();
            this.card_show = true;
            this.card_fade = true;
            this.infoPanel = { ...this.infoPanel, ...otherData };
        },

        //数据初始化
        fn_initData() {
            this.infoPanel = {
                ...{
                    vehicleLicence: "",
                    vehicleId: "",
                    state: ""
                }
            };
            this.card_show = false;
            this.card_fade = false;
            this.video_loading = false;
            this.video_isPlay = false;
            this.video_src = "";
            this.video_title = "";
            this.video_reqCount=0;
            this.video_must_show=false;
            if (timer_videoHeart) {
                clearInterval(timer_videoHeart);
                timer_videoHeart = 0;
            }
            this.playMode = "";
        },

        //视频播放成功
        evt_play(){
            this.video_loading = false;
            this.video_reqCount  = 0;
            this.video_must_show = false;
            let _this = this;
            if (!timer_videoHeart) {
                timer_videoHeart = setInterval(() => {
                    let _obj = { vehicleId: _this.infoPanel.vehicleId };
                    _this.ajax_real_heart_beat(_obj);
                }, 30000);
            }
        },
        //视频播放不了
        video_end() {
            this.video_isPlay = false;
            this.video_reqCount = this.video_reqCount + 1;
            this.video_must_show = true;
            console.log('--- 2：拉流失败第：'+this.video_reqCount+' 次');
            if(this.video_reqCount < 4) {
                console.log('--- 3：重新拉流第：'+this.video_reqCount+' 次');
                setTimeout(() => {
                    this.video_loading= true;
                    this.video_isPlay = true;
                }, 500);
            }
            else{
                this.video_must_show = false;
                 this.video_reqCount=0;
                _mm.msgErr("视频播放失败~");
                this.evt_close_video();
            }
            
        },
        //关闭视频
        evt_close_video() {
            this.playMode = "";
            this.video_isPlay = false;
            this.video_loading = false;
            this.video_reqCount  = 0;
            this.video_must_show = false;
            this.video_src = "";
            if (timer_videoHeart) {
                clearInterval(timer_videoHeart);
                timer_videoHeart = 0;
            }
        },

        //播放模式改变
        evt_palyMode_change(value) {
            this.card_fade = false;
            this.video_reqCount  = 0;
            this.video_must_show = false;
            let item =
                value === "1001"
                    ? this.playOptions[0]
                    : value === "1002"
                    ? this.playOptions[1]
                    : this.playOptions[2];
            this.video_title = item.label;
            let pushData = {
                vehicleId: this.infoPanel.vehicleId,
                timeToLive: 60,
                msgBody: value
            };
            this.ajax_pushCode_video(pushData, item);
        },

        //推流
        ajax_pushCode_video(pushData, item) {
            let _this = this;
            this.video_loading = true;
            this.video_isPlay = false;
            _mm.request({
                url: "/video/down_real_video.json",
                data: pushData
            }).then(
                res => {
                    _mm.msg("推流成功,请等待视频加载！");
                    
                    _this.video_src =
                        res.rtmpUrl + pushData.vehicleId + "_" + item.type;
                    _this.video_isPlay = true;
                },
                function(err) {
                    if (err.code === 3000 && err.msg === "该车辆已离线！") {
                        _this.fn_initData();
                        _this.infoPanel.state = "0";
                        let _otherData =
                            _this.DATA_menuProps.items[0].otherData;
                        if (
                            _otherData.vehicleId === _this.infoPanel.vehicleId
                        ) {
                            _otherData.state = "0";
                        }
                    }
                    else if(err && err.code == 5002){
                        _this.playMode = '';
                        _this.evt_close_video();
                    }
                    // console.log("aaa", err);
                }
            );
        },
        //心跳
        ajax_real_heart_beat(set) {
            let _this = this;
            _mm.request({
                url: "/video/real_heart_beat.json",
                data: set
            }).then(res => {});
        }
    },
    beforeDestroy() {
        if (timer_videoHeart) {
            clearInterval(timer_videoHeart);
        }
    }
};
</script>
<style scoped>
.mr15 {
    margin-right: 30px;
}
.el-icon-close {
    font-weight: bolder;
    cursor: pointer;
}
.pointer {
    cursor: pointer;
}
.mainMap {
    position: relative;
}
#map {
    width: 100%;
    height: 100%;
}

.v-r-left {
    position: absolute;
    left: 15px;
    top: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.v-r-right {
    position: absolute;
    right: 15px;
    top: 15px;
}

.m-menu {
    background-color: #fff;
    padding: 15px 15px 2px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* 右边 */
.video-panel {
    background-color: #fff;
    padding: 0 16px 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    min-height: 320px;
}
.info-panel {
    background-color: #fff;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
.vp-tle,
.ip-tle {
    height: 40px;
    line-height: 40px;
    color: #3496f8;
    position: relative;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
}
.ip-cnt {
    display: flex;
    flex-direction: row;
    padding-bottom: 16px;
    align-items: flex-start;
}
.vp-cnt {
    width: 420px;
    background-color: #000;
}
.play-modes {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}
.play-modes .el-radio {
    padding-bottom: 5px;
}
</style>
