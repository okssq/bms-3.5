<template>
    <div class="playback">
        <Menu :data="DATA_menuProps" @serach="evt_search" @refresh="evt_refresh"></Menu>
        <div class="main">
            <div
                class="video-cnt"
                ref="videoCnt"
                v-loading="loading"
                element-loading-text="拼命加载中,请稍等~"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
            >
                <div id="videoBox">
                    <XzVideo v-if="isPlay" :src="videoSrc" @play="play" @end="video_end"></XzVideo>
                </div>
            </div>
            <div class="video-list">
                <div class="vl-tle">
                    <span class="vehicle-license">{{infoPanel.vehicleLicence}}</span>
                    <span class="vehicle-time">{{infoPanel.date}}</span>
                </div>
                <div class="vl-total">共{{list.length}}条记录</div>
                <div class="vl-main" v-loading="listLoading">
                    <template v-if="list.length < 1">
                        <div class="none-data">暂无数据</div>
                    </template>
                    <template v-else>
                        <div
                            class="vl-item"
                            v-for="(item , index) in list"
                            :key="index"
                            :class="{active:item.active}"
                            @click="evt_playVideo(item,index)"
                        >{{item.beginTime}}</div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Menu from "components/schMenu/menu.vue";
import Server from "service/mm.jsx";
const _mm = new Server();
import XzVideo from "components/video/index.vue";

let timer_itemPlay, timer_search;

export default {
    data() {
        return {
            isPlay: false,
            loading: false, // 是否显示加载
            DATA_menuProps: {
                //菜单栏数据
                items: [
                    {
                        name: "视频日期",
                        type: "date",
                        key: "time",
                        value: "",
                        required: true
                    },
                    {
                        required: true,
                        name: "车牌号码",
                        type: "vehicleList",
                        key: "vehicleId",
                        value: "",
                        otherData: {},
                        nowId:'',
                        onlyListCheckedId:'',
                        init:{
                            tab:{//标签选项卡
                                is:true,//是否开启
                                type:'all',//标签索引（默认：'all'）
                                lists:[
                                    {label:"全部",name:"all"},
                                    {label:"在线",name:"online"},
                                    {label:"离线",name:"offline"},
                                ],
                            },
                            tree:{//树型结构
                                isCheckbox:false,//开启多选（默认：false）
                                autoData:true,//开启自动数据（默认：true）
                                setData:false,//开启外部数据（默认：false）
                                loading:true,//加载动画（默认：false）
                                auto_30s:true,//30秒自动刷新（默认：false，对外部数据不可用）
                                setList:[],//外部数据源
                                defaultProps:{//树型结构的标题字段
                                    label: 'labelState',
                                    children: 'children'
                                },
                            }
                        }
                    },
                    {
                        name: "视频类型",
                        type: "select",
                        key: "playType",
                        value: "A",
                        options: [
                            { name: "司机视频", value: "A" },
                            { name: "路况视频", value: "B" }
                        ],
                        required: true
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
                vehicleLicence: "",
                date: "",
                vehicleId: "",
                state: "0"
            },
            postData: {}, //搜索保存的数据
            list: [],
            videoSrc: "",
            reqCount:0,
            listLoading:false
        };
    },
    components: {
        Menu: Menu,
        XzVideo: XzVideo,
    },
    mounted() {
        let _this = this;
        setTimeout(() => {
            _this.fn_videoMath();
            //当浏览器窗口大小改变时，设置显示内容的高度  
            window.onresize=function(){  
                _this.fn_videoMath();
            }   
        }, 3000);
        
    },
    methods: {
        fn_videoMath(){
            let _4p3 = 3/4;
            let container_w =this.$refs.videoCnt.clientWidth; 
            let container_h =this.$refs.videoCnt.clientHeight;
            if(container_w * _4p3 > container_h){
                $("#videoBox").width(container_h / _4p3);
                $("#videoBox").height(container_h);
            }
            else{
                $("#videoBox").width(container_w);
                $("#videoBox").height(container_w*_4p3);
            }
        },
    
        //车辆列表更新回调
        evt_refresh(data){
            // console.log('refresh--data',data);
            let nowData  = data.checked,showData = data.onlyListChecked;
            let otherData = this.DATA_menuProps.items[1].otherData;
            if(showData){
                otherData.state = showData.state;
            }
            if(this.infoPanel.vehicleId && nowData){
                this.infoPanel.state = nowData.state;
                if(nowData.state === "0"){
                    _mm.msgErr("车辆"+this.infoPanel.vehicleLicence+"已离线！");
                    this.isPlay = false;
                    this.loading = false;
                    this.videoSrc = "";
                    this.list = [];
                    this.infoPanel = {
                        ...{
                            vehicleLicence: "",
                            date: "",
                            vehicleId: "",
                            state: "0"
                        }
                    };
                    this.postData = {};
                    
                }
            }
        },
        //搜索按钮事件
        evt_search(data) {
            clearTimeout(timer_search);
            timer_search = 0;
            let _this = this;
            timer_search = setTimeout(() => {
                let _data = _this.DATA_menuProps.items[1].otherData;
                let _date = _this.DATA_menuProps.items[0].value;
                if (_data.state === "0") {
                    _mm.msgErr("当前车辆不在线！");
                    return;
                }
                this.listLoading = true;
                this.reqCount = 0;
                this.infoPanel = {
                    ...this.infoPanel,
                    ..._data
                };
                this.infoPanel.date = _date;
                _this.postData = {..._data,...data};
                this.ajax_videoList(this.postData);
            }, 600);
        },
        //获取视频列表
        ajax_videoList(data) {
            let _this = this;
            _mm.request({
                url: "/history/video_list.json",
                data: data
            }).then(
                res => {
                    _this.list = [];
                    //倘若没有视频
                    if (res.length === 0) {
                        _this.listLoading = false;
                        _mm.msgErr("当日车辆无数据！");
                    } else {
                        let arr = [];
                        res.forEach(el => {
                            arr.push({
                                id: el.id,
                                videoName: el.historyVideoName,
                                beginTime: el.beginTime,
                                active: false
                            });
                        });
                        
                        _this.list = Object.freeze(arr);
                        _this.listLoading = false;
                    }
                },
                function(err) {
                    _this.listLoading = false;
                    console.log(err);
                }
            );
        },

        //点击列表中的item播放事件
        evt_playVideo(item, index) {
            if(item.active && this.isPlay){
                return;
            }
            this.isPlay = false;
            clearTimeout(timer_itemPlay);
            timer_itemPlay = 0;
            
            let _this = this;
            this.loading = true;
            timer_itemPlay = setTimeout(() => {
                this.reqCount = 0;                
                _this.fn_listActive(index);
                let push_data = {
                    groupName: _this.infoPanel.vehicleId, //车辆id
                    msgBody: "4000," + item.videoName, //A4545.MP4
                    timeToLive: "60" //离线时常
                };
                _this.ajax_push_video(push_data);
            }, 600);
            return;
        },

        //推流
        ajax_push_video(data) {
            let _this = this;
            _mm.request({
                url: "/jpush/down_common_jpush.json",
                data: data
            }).then(
                res => {
                    _this.videoSrc = `${res.rtmpUrl}${
                        _this.postData.vehicleId
                    }_${_this.postData.playType === "A" ? 3 : 4}`;
                    _this.isPlay = true;
                },
                function(err) {
                    _this.loading = false;
                    if(err.code === 3000 && err.msg ==='该车辆已离线！'){
                        _this.isPlay = false;
                        _this.loading = false;
                        _this.videoSrc = "";
                        if(_this.postData && _otherData.vehicleId === _this.postData.vehicleId){
                            _otherData.state = "0"
                        }
                        _this.postData = {};
                        _this.infoPanel= {
                            vehicleLicence: "",
                            date: "",
                            vehicleId: "",
                            state: "0"
                        };
                        _this.list = [];
                    }
                }
            );
        },

        // 设置列表点击效果
        fn_listActive(index) {
            this.list.forEach((el, _index) => {
                el.active = index === _index ? true : false;
            });
            return true;
        },
        // 视频播放成功
        play(){
            this.loading  = false;
            this.reqCount = 0;
        },
        // 视频播放失败
        video_end() {
            this.isPlay = false;
            this.reqCount = this.reqCount + 1;
            console.log('--- 2：拉流失败第：'+this.reqCount+' 次');
            if(this.reqCount < 4) {
                console.log('--- 3：重新拉流第：'+this.reqCount+' 次');
                setTimeout(() => {
                    this.loading= true;
                    this.isPlay = true;
                }, 500);
            }
            else{
                this.loading  = false;
                this.videoSrc = "";
                this.reqCount =0;
                this.fn_listActive(-1);
                _mm.msgErr("信号不好或视频流已结束！");
            }
        }
	}
};
</script>

<style scoped>
.playback {
    display: flex;
    flex-direction: column;
    background: #fff;
    margin: 10px;
    padding: 15px;
    box-sizing: border-box;
    height: calc(100% - 20px);
    overflow: auto;
}
.video-box {
    /* width: 768px;
    height: 568px; */
}
.main {
    display: flex;
    flex-direction: row;
    flex:1;
    overflow: hidden;
    width: 100%;
}
.video-cnt {
    background-color: #000;
    width: calc(100% - 320px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.video-list {
    width: 300px;
    min-width: 300px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
}

.vl-tle {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #323940;
    height: 50px;
    padding: 0 15px;
    background-color: rgba(52, 150, 248, 0.08);
}
.vl-total {
    padding: 10px 15px;
    color: #95aabf;
    border-bottom: 1px solid #eee;
}
.vl-main {
    flex: 1;
    overflow-y: auto;
}
.vl-item {
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    padding: 0 10px;
}

.vl-item:hover,
.vl-item.active {
    background-color: rgba(52, 150, 248, 0.08);
    color: #3496f8;
}
.none-data {
    padding: 15px;
    color: #95aabf;
}
</style>

