<template>
    <div
        class="mainMap"
        :style="{'min-height': road_checked && driver_checked ? '800px' : '580px' }"
    >
        <div id="map"></div>
        <div class="v-r-left">
            <div class="video-panel">
                <div class="video-panel-item" v-show="driver_checked || pvideo_must_show">
                    <div class="vp-tle">
                        <span>司机视频</span>
                        <i class="el-icon-close" @click="evt_check_driverPlayer(false)"></i>
                    </div>
                    <div
                        class="vp-cnt"
                        v-loading="driver_loading"
                        element-loading-text="拼命加载中"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.8)"
                    >
                        <XzVideo
                            v-if="driver_isPlay"
                            :src="rtmpUrl+infoPanel.vehicleId+'_1'"
                            @play="evt_play('driver')"
                            @end="video_end('driver')"
                        />
                    </div>
                </div>
                <div class="video-panel-item"  :style="{'marginTop':(driver_checked || pvideo_must_show)?'15px':0}"    v-show="road_checked || rvideo_must_show">
                    <div class="vp-tle">
                        <span>道路视频</span>
                        <i class="el-icon-close" @click="evt_check_roadPlayer(false)"></i>
                    </div>
                    <div
                        class="vp-cnt"
                        v-loading="road_loading"
                        element-loading-text="拼命加载中"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.8)"
                    >
                        <XzVideo
                            v-if="road_isPlay"
                            :src="rtmpUrl+infoPanel.vehicleId+'_2'"
                            @play="evt_play('road')"
                            @end="video_end('road')"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="v-r-right">
            <div class="m-menu">
                <Menu :data="DATA_menuProps" @serach="evt_search" @refresh="evt_refresh" />
            </div>
            <div class="info-panel" v-show="card_show">
                <div class="info-panel-item">
                    <div
                        class="ip-tle pointer"
                        :style="{'border-bottom':(!card_fade ? 'none' :'1px solid #ccc'),'margin-bottom':(!card_fade ? '0' :'14px')}"
                        @click="card_fade = !card_fade"
                    >
                        <span class="mr15">{{infoPanel.vehicleLicence}}</span>
                        <i :class="card_fade ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"></i>
                    </div>
                    <div class="ip-cnt" v-show="card_fade && card_show">
                        <div class="play-mode">播放模式：</div>
                        <template v-if="infoPanel.channel_nums > 0">
                            <div
                                class="el-checkbox"
                                @click="evt_check_driverPlayer(!driver_checked)"
                            >
                                <span
                                    class="el-checkbox__input"
                                    :class="{'is-checked' : driver_checked}"
                                >
                                    <span class="el-checkbox__inner"></span>
                                </span>
                                <span>司机视频</span>
                            </div>
                        </template>
                        <template v-if="infoPanel.channel_nums === 2">
                            <div class="el-checkbox" @click="evt_check_roadPlayer(!road_checked)">
                                <span
                                    class="el-checkbox__input"
                                    :class="{'is-checked' : road_checked}"
                                >
                                    <span class="el-checkbox__inner"></span>
                                </span>
                                <span>道路视频</span>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="info-panel-item" v-show="card_fade && card_show">
                    <div class="ip-tle">
                        <span>语音播报</span>
                    </div>
                    <div class="ip-cnt">
                        <el-input v-model="audio_text" placeholder="请输入对话内容"></el-input>
                        <button class="dbtn dbtn-blue btn-send" @click="evt_send_audioText">发送</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import XzVideo from "components/video/index.vue";
import Menu from "components/schMenu/menu.vue";
import Server from "service/mm.jsx";
const  _mm = new Server();
let map;

export default {
    data() {
        return {
            infoPanel: {
                vehicleLicence: "", //当前车辆号码
                vehicleId: "", //当前车牌ID
                channel_nums: 0, //通道数
                state: "" //当前车辆状态
            },
            driver_checked: false, //司机视频是否勾选
            road_checked: false, //道路视频是否勾选
            card_show: false, //面板显示
            card_fade: true, //面板伸缩
            audio_text: "", //语音播报文字
            driver_isPlay: false, //是否加载司机视频div
            road_isPlay: false, //是否加载道路视频div
            driver_loading: false, //司机视频外部loading
            road_loading: false, //道路视频外部loading
            driver_src: "", //司机视频src
            road_src: "", //道路视频src
            DATA_menuProps: {
                items: [
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
            rtmpUrl: "",
            GPS_time: "",
            real_locationTimer: "",
            real_heartTimer: "",
            pathSimplifierIns: null,
            real_location_arr: [],
            real_location_group: [[]],
            real_location_new: [],
            real_location_new_group: [[]],
            gps_began_end: [], //起点终点
            video_p_count:0,
            video_r_count:0,
            pvideo_must_show:false,
            rvideo_must_show:false,
        };
    },
    components: {
        Menu,
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
            //加载PathSimplifier，loadUI的路径参数为模块名中'ui/'之后的部分
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
        evt_refresh(data){
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
            // // 先判断是否选择了正在看的车辆
            // if (data.vehicleId === this.infoPanel.vehicleId) {
            //     _mm.msg("您已选择此车辆,请选择视频观看！");
            //     return;
            // }
            
            // 重置状态
            this.fn_initData();
            
            // 获取通道数
            this.ajax_camera_nums(data, otherData);
        },

        //数据初始化
        fn_initData() {
            map.clearMap();
            this.infoPanel = {
                ...{
                    vehicleLicence: "",
                    vehicleId: "",
                    channel_nums: 0,
                    state: ""
                }
            };
            this.driver_checked = false; //司机视频是否勾选
            this.road_checked = false; //道路视频是否勾选
            this.card_show = false; //面板显示
            this.card_fade = true; //面板伸缩
            this.audio_text = ""; //语音播报文字
            this.driver_isPlay = false; //是否加载司机视频div
            this.road_isPlay = false; //是否加载道路视频div
            this.driver_loading = false; //司机视频外部loading
            this.road_loading = false; //道路视频外部loading
            this.driver_src = ""; //司机视频src
            this.road_src = ""; //道路视频src
            this.GPS_time = "";
            this.rtmpUrl = "";
            this.rvideo_must_show = false;
            this.pvideo_must_show = false;
            this.video_p_count=0;
            this.video_r_count=0;
            this.real_location_arr = [];
            if (this.pathSimplifierIns) {
                this.pathSimplifierIns.setData([]);
            }
            if (this.real_locationTimer) {
                clearInterval(this.real_locationTimer);
                this.real_locationTimer = 0;
            }
            if (this.real_heartTimer) {
                clearInterval(this.real_heartTimer);
                this.real_heartTimer = 0;
            }
        },

        //获取通道数
        ajax_camera_nums(data, vleData) {
            let _this = this;
            _mm.request({
                url: "/video/camera_nums.json",
                data: data
            }).then(
                res => {
                    if (!res.cameraNums || res.cameraNums === "0") {
                        _mm.msgErr("该车辆暂无视频信息!");
                        return;
                    }
                    _this.fn_playOptions(res.cameraNums, vleData);
                },
                function(err) {
                    console.log(err);
                }
            );
        },

        // 渲染弹窗面板等
        fn_playOptions(cameraNums, vleData) {
            this.card_show = true;
            this.card_fade = true;
            this.infoPanel = { ...this.infoPanel, ...vleData };
            this.infoPanel.channel_nums =
                parseInt(cameraNums, 10) > 2 ? 2 : parseInt(cameraNums, 10);
        },
        //司机视频切换
        evt_check_driverPlayer(data) {
            this.pvideo_must_show = false;
            this.video_p_count = 0;
            this.driver_checked = data;
            if (this.driver_checked) {
                this.driver_isPlay = true;
                this.driver_loading = true;
                if (!this.real_heartTimer) {
                    this.evt_pushRtmp();
                }
            } else {
                this.driver_isPlay = false;
                this.driver_loading = false;
                this.pvideo_must_show = false;
                this.video_p_count = 0;
                if (!this.road_checked) {
                    this.when_nothing_video();
                }
            }
        },

        //道路视频切换
        evt_check_roadPlayer() {
            this.road_checked = !this.road_checked;
            this.rvideo_must_show = false;
                this.video_r_count = 0;
            if (this.road_checked) {
                this.road_loading = true;
                this.road_isPlay = true;
                if (!this.real_heartTimer) {
                    this.evt_pushRtmp();
                }
            } else {
                this.road_isPlay = false;
                this.video_r_count = 0;
                if (!this.driver_checked) {
                    this.when_nothing_video();
                }
            }
        },

        // 没选视频时
        when_nothing_video() {
            if (this.pathSimplifierIns) {
                this.pathSimplifierIns.setData([]);
            }
            if (this.real_locationTimer) {
                clearInterval(this.real_locationTimer);
                this.real_locationTimer = 0;
            }
            if (this.real_heartTimer) {
                clearInterval(this.real_heartTimer);
                this.real_heartTimer = 0;
            }
            this.video_p_count=0;
            this.video_r_count=0;
            this.pvideo_must_show=false;
            this.rvideo_must_show=false;
            this.GPS_time = "";
            this.vAudioText = "";
            map.clearMap();
            this.real_location_arr = [];
            clearInterval(this.real_heartTimer);
            this.real_heartTimer = 0;
            clearInterval(this.real_locationTimer);
            this.real_locationTimer = 0;
        },

        //点击列表中的item播放事件
        evt_pushRtmp() {
            let _this = this;
            let pushData = {
                vehicleId : _this.infoPanel.vehicleId,
                msgBody   : "1004",
                timeToLive: "60"
            };
            _mm.request({
                url: "/video/down_real_video.json",
                data: pushData
            }).then(
                res => {
                    _this.rtmpUrl = res.rtmpUrl;
                },
                function(err) {
                    if(err.code === 3000 && err.msg ==='该车辆已离线！'){
                        _this.fn_initData();
                        _this.infoPanel.state = "0";
                        let _otherData = _this.DATA_menuProps.items[0].otherData;
                        if(_otherData.vehicleId === _this.infoPanel.vehicleId){
                            _otherData.state = "0"
                        }
                    }
                    else if(err && err.code == 5002){
                        _this.driver_checked = false;
                        _this.road_checked   = false;
                        _this.when_nothing_video();
                    }
                    // console.log('aaa',err)
                }
            );
            this.ajax_real_location({
                vehicleId: _this.infoPanel.vehicleId, 
                time: _this.GPS_time
            });
            if (!_this.real_locationTimer) {
                _this.real_locationTimer = setInterval(function() {
                    _this.ajax_real_location({
                        vehicleId: _this.infoPanel.vehicleId,
                        time: _this.GPS_time
                    });
                }, 10000);
            }
        },

        fn_path(obj) {
            let _this = this;
            var oldLine = new AMap.Polyline({
                path: obj.path,
                strokeWeight: 8,
                strokeOpacity: obj.strokeOpacity,
                strokeColor: obj.color,
                showDir: true,
                map: map
            });
            map.setFitView();
        },

        // 视频播放成功
        evt_play(type){
            let _this = this;
            if (!_this.real_heartTimer) {
                _this.real_heartTimer = setInterval(function() {
                    _this.ajax_real_heart_beat({vehicleId:_this.infoPanel.vehicleId}); //连接心跳
                }, 30000);
            }
            if(type === 'driver'){
                this.driver_loading = false;
                this.video_p_count  = 0;
                this.pvideo_must_show = false;
            }
            else{
                this.road_loading = false;
                this.video_r_count= 0;
                this.rvideo_must_show = false;
            }
        },

        // 视频播放失败
        video_end(type) {
            let _msg = type === "driver" ? "司机" : "道路";
            if(type === 'driver'){
                this.driver_isPlay = false;
                this.video_p_count = this.video_p_count + 1;
                this.pvideo_must_show = true;
                console.log('--- 2：对人拉流失败第：'+this.video_p_count+' 次');
                if(this.video_p_count < 4) {
                    console.log('--- 3：对人重新拉流第：'+this.video_p_count+' 次');
                    setTimeout(() => {
                        this.driver_loading= true;
                        this.driver_isPlay = true;
                    }, 500);
                }
                else{
                    this.driver_loading  = false;
                    this.driver_isPlay   = false;
                    this.pvideo_must_show = false;
                    this.video_p_count=0;
                    _mm.msgErr(_msg + "视频播放失败~");
                    this.driver_checked = false;
                    if(!this.road_isPlay){
                        this.fn_initData();
                    }
                }
            }
            else{
                this.road_isPlay = false;
                this.video_r_count = this.video_r_count + 1;
                this.rvideo_must_show = true;
                console.log('--- 2：对路拉流失败第：'+this.video_r_count+' 次');
                if(this.video_r_count < 4) {
                    console.log('--- 3：对路重新拉流第：'+this.video_r_count+' 次');
                    setTimeout(() => {
                        this.road_loading= true;
                        this.road_isPlay = true;
                        
                    }, 500);
                }
                else{
                    this.road_loading  = false;
                    this.road_isPlay   = false;
                    this.rvideo_must_show = false;
                    this.road_checked  = false;
                    this.video_r_count= 0;
                    _mm.msgErr(_msg + "视频播放失败~");
                    if(!this.driver_isPlay){
                        this.fn_initData();
                    }
                }
            }
        },

        //心跳
        ajax_real_heart_beat(set) {
            let _this = this;
            _mm.request({
                url: "/video/real_heart_beat.json",
                data: set
            }).then(res => {});
        },

        //获取实时轨迹
        ajax_real_location(set) {
            let _this = this;
            _mm.request({
                url: "/video/real_location.json",
                data: set
            }).then(
                res => {
                    let _sss = 497;

                    let _len = res.vehicleLocations.length;
                    if (_len === 0) return;
                    _this.GPS_time = res.vehicleLocations[_len - 1].tm;

                    res.vehicleLocations.forEach((el, index) => {
                        _this.real_location_arr.push(el);
                    });
                    let _len_2 = _this.real_location_arr.length;
                    let _floor = Math.floor(_len_2 / _sss);
                    let _group = _this.real_location_group;
                    _group = [[]];
                    _this.real_location_new_group = [];
                    if (_floor > 0) {
                        for (let i = 0; i < _floor; i++) {
                            _group.push([]);
                        }
                    }

                    _this.real_location_arr.forEach((el, index) => {
                        let _num = Math.floor(index / _sss);
                        if (
                            index >= (_num + 1) * _sss - 3 &&
                            index < (_num + 1) * _sss
                        ) {
                            if (!_group[_num + 1]) return;
                            _group[_num + 1].push({
                                x: el.x,
                                y: el.y,
                                ag: el.ag,
                                sp: el.sp,
                                tm: el.tm
                            });
                        }
                        _group[_num].push({
                            x: el.x,
                            y: el.y,
                            ag: el.ag,
                            sp: el.sp,
                            tm: el.tm
                        });
                    });

                    _this.real_location_new = [];

                    _group.forEach((el, index) => {
                        for (let i = 0; i < el.length; i++) {
                            if (i === 0) continue;
                            el[i].tm = el[i].tm - el[0].tm;
                        }

                        _this.real_location_new_group.push([]);

                        fn_graspRoad({
                            path: el,
                            index: index,
                            count: _group.length
                        });
                    });

                    // console.log("_group", _group);

                    let _sign111 = 0;
                    function fn_graspRoad(obj) {
                        let graspRoad = new AMap.GraspRoad();
                        graspRoad.driving(obj.path, function(error, result) {
                            _sign111++;
                            if (error) {
                                console.log(error);
                                // console.log("obj", obj);

                                // if (_sign111 === obj.count){
                                //     _this.real_location_arr = [];
                                // }
                            }
                            if (!error) {
                                let _points = [];

                                result.data.points.forEach(el => {
                                    _this.real_location_new_group[
                                        obj.index
                                    ].push([el.x, el.y]);
                                });

                                if (_sign111 === obj.count) {
                                    let _arr2 = [];
                                    _this.real_location_new_group.forEach(
                                        el => {
                                            for (
                                                let i = 0;
                                                i < el.length;
                                                i++
                                            ) {
                                                _arr2.push([
                                                    el[i][0],
                                                    el[i][1]
                                                ]);
                                            }
                                        }
                                    );
                                    map.clearMap();
                                    // _this.fn_path({
                                    //     path:_arr,
                                    //     color:'red',
                                    //     strokeOpacity:1,
                                    // })

                                    _this.fn_path({
                                        path: _arr2,
                                        color: "#0091ea",
                                        strokeOpacity: 0.8
                                    });

                                    if (_arr2.length > 1) {
                                        _this.gps_began_end = [
                                            _arr2[0],
                                            _arr2[_arr2.length - 1]
                                        ];
                                    }

                                    if (_arr2.length === 1) {
                                        _this.gps_began_end = [_arr2[0]];
                                    }

                                    _this.fn_setGps_began_end();
                                }
                            }
                        });
                    }
                },
                function(err) {
                    console.log(err);
                }
            );
        },

        //设置起点终点
        fn_setGps_began_end() {
            let _gps = this.gps_began_end;

            let _obj_start = {
                lnglat: _gps[0],
                title: "",
                icon: _mm.hostUrl() + "/cdn/img/map/start.png"
            };
            this.fn_marker(_obj_start);

            if (_gps.length === 1) return;

            let _obj_end = {
                lnglat: _gps[1],
                icon: _mm.hostUrl() + "/cdn/img/map/end.png",
                title: ""
            };
            this.fn_marker(_obj_end);
        },

        //fn_新建点标记
        fn_marker(config) {
            let _this = this;
            let _lnglat = config.lnglat,
                _title = config.title || "",
                _offset = config.offset || new AMap.Pixel(15, 25);

            new AMap.Marker({
                position: _lnglat, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: _title,
                label: {
                    content: _title
                },
                icon: config.icon ? config.icon : "",
                map: map
            });
        },

        //发送语音信息
        evt_send_audioText() {
            let _text = this.audio_text;
            if (!_text) {
                _mm.msgErr("请输入对话内容");
                return;
            }
            /**设置推流数据    4000*/
            let push_data = {
                groupName: this.infoPanel.vehicleId, //车辆id
                msgBody: "5000ABAB" + _text, //A4545.MP4
                timeToLive: "60" //离线时常
            };
            let _this = this;
            _mm.request({
                url: "/jpush/down_common_jpush.json",
                data: push_data
            }).then(res => {
                _mm.msg("发送成功");
                _this.audio_text = "";
            });
        }
    },
    beforeDestroy() {
        if (this.real_locationTimer) {
            clearInterval(this.real_locationTimer);
            this.real_locationTimer = 0;
        }
        if (this.real_heartTimer) {
            clearInterval(this.real_heartTimer);
            this.real_heartTimer = 0;
        }
    }
};
</script>
<style scoped>
.test{
    position: absolute;
    width: 100px;
    left: 400px;
    top:15px;
    display: flex;
    flex-direction: column;
}
.test button + button{
    margin-top: 6px;
}




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
.info-panel-item,
.video-panel-item {
    background-color: #fff;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    
}
.video-panel-item {
    padding: 0 16px 16px;
    box-sizing: border-box;
    min-height: 370px;
}
.info-panel-item + .info-panel-item {
    margin-top: 16px;
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
    align-items: center;
}
.vp-cnt {
    width: 420px;
    background-color: #000;
}
.play-mode {
    margin-right: 10px;
}
.dbtn.btn-send {
    height: 32px;
    line-height: 32px;
    width: 80px;
    margin-left: 10px;
}

.dbtn {
    margin: 0;
    height: 40px;
    line-height: 40px;
}
</style>
