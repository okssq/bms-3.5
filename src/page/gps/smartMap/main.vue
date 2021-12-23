<template>
    <div class="mainMap" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" ref="menuComponent" @serach="EVT_search"/>
        </div>
        <div class="dMap">
            <div class="dmapFullScreen" id="map"></div>
            <div class="dmapfs-list" v-show="pull.is">
                <div class="dmapfs-list-tle zoom">
                    <div class="dmap-list-tleInfo">{{dataList.license}}</div>
                    <div class="dmap-list-tleTxt">{{dataList.date}}</div>
                </div>
                <div class="dmap-list-count">共{{dataList.count}}条记录</div>
                <div class="dmap-list-cnt">
                    <div class="dmap-list-box zoom" v-for="(item,index) in dataList.items" :key="index" @click="EVT_warnningMarker(item)">
                        <div class="dmap-list-img"><span :class="item.cls"></span></div>
                        <div class="dmap-list-info">
                            <div class="dmap-listI-tle" :class="item.cls">{{item.name}}</div>
                            <div class="dmap-listI-tle" :class="item.cls">上传时间：{{item.time}}</div>
                        </div>
                        <!-- <div class="dmap-list-txt" :class="item.cls">{{item.time}}</div> -->
                    </div>
                </div>
            </div>
            <div class="dmapfs-list-btn" :class="pull.cls" @click="EVT_pullPush"></div>
            <div class="dmapfs-switch" :class="switchBtn.cls">
                <div class="dmapfs-switch-box">
                    <el-switch
                        v-model="switchBtn.is"
                        inactive-text="事件轮循"
                        active-color="#27cc6a"
                        inactive-color="#9fb6cc" 
                        @change="EVT_changeSwitch">
                        </el-switch>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import Server from 'service/mm.jsx';
import Menu     from 'components/schMenu/menu.vue';
const _mm = new Server();

let t = "";
let t2 = "";

export default{
    data(){
        return {
            loading:false,
            map:{
                target:"",
                pathSimplifierIns:"",
                gps_begin_end:[
                    [100.340417, 27.376994],
                    [124.905846, 42.232876]
                ]
            },
            DATA_menuProps:{
                items:[
                    {name:"查询日期",type:"date",key:"checkDate",required: true},
                    {name:"车牌号码",type:"vehicleList",key:"license",value:"",required: true,txt:"请选择",
                        init:{
                            tab:{//标签选项卡
                                is:true,//是否开启
                            },
                            tree:{//树型结构
                                auto_30s:true,//30秒自动刷新（默认：false，对外部数据不可用）
                            }
                        }
                    },
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"}
                    ]}
                ]
            },
            dataList:{
                license:"",
                date:"",
                count:"0",
                items:[]
            },
            pull:{
                is:false,
                cls:"dmapfs-lbtn-push"
            },
            switchBtn:{
                is:false,
                cls:"dmapfs-switch-push"
            },
            timerCount:0,
            timerNum:0,
            timer:{
                t:[],
                isPlaying:false
            }

        }
    },
    components:{
        'Menu' : Menu
    },
    mounted() {
        let _this = this;
        let _pathSI = this.map.pathSimplifierIns;
        
        //初始化地图
        _this.map.target = new AMap.Map('map', {
            zoom:11,//级别
        });

        //加载PathSimplifier，loadUI的路径参数为模块名中 'ui/' 之后的部分 
        AMapUI.load(['ui/misc/PathSimplifier'], function(PathSimplifier) {

            if (!PathSimplifier.supportCanvas) {
                alert('当前环境不支持 Canvas！');
                return;
            }

            //启动页面
            initPage(PathSimplifier);
        });

        function initPage(PathSimplifier) {
            //创建组件实例
            _this.map.pathSimplifierIns = new PathSimplifier({
                zIndex: 100,
                map: _this.map.target, //所属的地图实例
                getPath: function(pathData, pathIndex) {
                    //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                    return pathData.path;
                },
                getHoverTitle: function(pathData, pathIndex, pointIndex) {
                    let _login = _mm.getStorage('login');

                    if(_login.roleId === "1"){
                        // console.log("trajectory",_mm.hostUrl());
                        if(pointIndex){
                            let info = pathData.path[pointIndex][2];
                            return info;
                        }
                    }
                },
                renderOptions: {
                    //轨迹线的样式
                    pathLineStyle: {
                        strokeStyle: '#CB3333',
                        lineWidth: 6,
                        dirArrowStyle: true
                    }
                }
            });
        }

        if(!_this.$route.query.set)return;
        let _gain = JSON.parse(_this.$route.query.set);

        //this.$refs.menuComponent.$refs.cld_vlestatuslist[0].vehicleLicence = _gain.vehicleLicence;
        //this.$refs.menuComponent.vlestatuslist_vleItem.vehicleId = _gain.vehicleId;
        
        this.dataList.license = _gain.vehicleLicence;

        _this.DATA_menuProps = {
            items:[
                {name:"查询日期",type:"date",value:_gain.time,key:"checkDate"},
                {name:"车牌号码",type:"vehicleList",key:"license",value:_gain.vehicleId,required: true,
                    nowId:_gain.vehicleId,
                    onlyListCheckedId:_gain.vehicleId,
                    init:{
                        tab:{//标签选项卡
                            is:true,//是否开启
                        },
                        tree:{//树型结构
                            auto_30s:true,//30秒自动刷新（默认：false，对外部数据不可用）
                        }
                    }
                },
                {type:"btn",key:"btn",btns:[
                    {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"}
                ]}
            ]
        };

        let search_json = {
            checkDate:_gain.time,
            license:_gain.vehicleId,
        };

        setTimeout(()=>{_this.EVT_search(search_json);_this.dataList.license = _gain.vehicleLicence;},500);
        
    },
    methods:{
        //搜索按钮事件
        EVT_search(i){
            let _this = this;

            console.log(i)

            let postData = {
                time:i.checkDate,
                vehicleId:i.license
            };
            
            this.loading = true;

            this.timerNum = 0;
            this.timerCount = 0;
            this.fn_timer_close();//关闭定时器

            let _map = this.map.target;
            _map.clearMap();
            _map.clearInfoWindow();
            this.dataList.items = [];
            this.dataList.count = 0;

            this.postData = postData;
            this.ajax_alarm_positions(postData);
            this.dataList.license = i.license.name;

            let _pathSI = this.map.pathSimplifierIns;
            if(_pathSI)_pathSI.setData([]);
        },

        //事件-事件是否轮徇
        EVT_changeSwitch(){
            let _this = this;
            if(this.switchBtn.is){
                // console.log(this.timer.isPlaying)
                let _sign = $(".mapDS-media-btngroup .active").html();
                if(!this.timer.isPlaying || _sign === "照片")this.fn_timer();
            }else{
                this.fn_timer_close();//关闭定时器
            }
        },

        //关闭定时器
        fn_timer_close(){
            this.switchBtn.is = false;
            this.timer.isPlaying = false;
            clearTimeout(this.timer.t[0]);
            clearTimeout(this.timer.t[1]);
        },

        //事件轮徇定时器
        fn_timer(){
            let _this = this;
            this.timerNum = this.timerNum?this.timerNum:0;

            function fn_timeout(){
                _this.timer.t[0] = setTimeout(()=>{
                    if(_this.timerNum>=_this.dataList.items.length){
                        return;
                    };
                    _this.dataList.items.forEach((el,index)=>{
                        el.cls = "default";
                    });
                    _this.dataList.items[_this.timerNum].cls = "active";
                    if(_this.EVT_warnningMarker(_this.dataList.items[_this.timerNum],"auto")){
                        _this.timer.t[1] = setTimeout(()=>{
                            let myVideo=document.getElementById("auto_video");
                            if(myVideo === null)return;
                            myVideo.play();
                            myVideo.addEventListener("playing",function(){
                                _this.timer.isPlaying = true;
                            });
                            myVideo.addEventListener("ended",function(){
                                _this.timer.isPlaying = false;
                                _this.timerNum++;
                                if(_this.switchBtn.is)fn_timeout();                                
                            });
                        },500);
                    }else{
                        _this.timerNum++;
                        if(_this.switchBtn.is)fn_timeout();
                    }
                },2000);
            }

            fn_timeout();
        },

        //点击事件列表
        EVT_warnningMarker(i,type){
            let obj = i.info;
            let _lnglat = [obj.gpsLon,obj.gpsLat];
            let _this = this;
            let _map = this.map.target;

            _this.timerNum = i.index;

            _map.clearMap();
            _map.clearInfoWindow();
            _this.fn_setGps_begin_end();//设置起点终点

            _this.dataList.items.forEach((el,index)=>{
                el.cls = "default";
            });
            i.cls = "active";

            let html_btnNav = `
                <div class="mapDS-media-cnt">
                    <img src="/src/assets/img/other/test.png">
                </div>
            `;
  
            if(obj.imageUrl && obj.ossVideoUrl){
                let _style_img = type==='auto'?' style="display:none;"':"";
                let _style_video = type==='auto'?' style="display:block;"':"";
                let _active_img = type==='auto'?'':"active";
                let _active_video = type==='auto'?'active':"";
                html_btnNav = `
                    <div class="mapDS-media-cnt">
                        <img src="`+obj.imageUrl+`" `+_style_img+` />
                        <video src="`+obj.ossVideoUrl+`" `+_style_video+` id="auto_video" type="video/mp4" controls="controls"></video>                          
                    </div>
                    <div class="mapDS-media-btngroup">
                        <button class="dbtn `+_active_img+`">照片</button><button class="dbtn `+_active_video+`">视频</button>
                    </div>
                `;
            }else if(obj.imageUrl && !obj.ossVideoUrl){
                html_btnNav = `
                    <div class="mapDS-media-cnt">
                        <img src="`+obj.imageUrl+`">
                    </div>
                `;
            }else if(!obj.imageUrl && obj.ossVideoUrl){
                html_btnNav = `
                    <div class="mapDS-media-cnt">
                        <video src="`+obj.ossVideoUrl+`" id="auto_video" type="video/mp4"></video> 
                    </div>
                `;
            }else{return;}

            let content = `
                <div class="mapDangerScene">
                    <div class="mapDS-menu zoom">
                        <div class="mapDS-menu-tle">`+obj.vehicleLicence+`</div>
                        <div class="mapDS-menu-xxx el-icon-close"></div>
                    </div>
                    <div class="mapDS-media">
                        `+html_btnNav+`
                    </div>
                    <div class="mapDS-cnt">
                        <div class="mapDS-cnt-item zoom">
                            <div class="mapDS-citem-name">
                                上传时间：
                            </div>
                            <div class="mapDS-citem-value">
                                `+obj.warningTime+`
                            </div>
                        </div>
                        <div class="mapDS-cnt-item zoom">
                            <div class="mapDS-citem-name">
                                上传地点：
                            </div>
                            <div class="mapDS-citem-value">
                                `+obj.warningPlace+`
                            </div>
                        </div>
                    </div>
                    <div class="mapDS-alarmType">
                        <div>`+obj.warningName+`</div>
                    </div>
                </div> 
            `;

            let _obj_test = {
                lnglat:_lnglat,
                //icon:_mm.hostUrl()+"/cdn/img/map/blue.png",
                content:content
            };
            _this.fn_marker_click(_obj_test);

            let _infoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                content: content,
                offset: new AMap.Pixel(10,-50)//定位
            });
            _infoWindow.open(_map,_lnglat);

            if(type !== "auto"){
                _this.fn_timer_close();//关闭定时器
                return true;
            }

            if(obj.imageUrl && obj.ossVideoUrl){
                return true;
            }else if(obj.imageUrl && !obj.ossVideoUrl){
                return false;
            }else if(!obj.imageUrl && obj.ossVideoUrl){
                return false;
            }else{return true;}
        },

        //ajax-获取报警信息
        ajax_alarm_positions(set){
            let _this = this;
            let _map = this.map.target;
            let _pathSI = _this.map.pathSimplifierIns;
            
            _mm.request({
                url:'/alarm/alarm_positions.json',
                data:set
            }).then((res)=>{
                _this.loading = false;
                if(!res || !res.lonAndLats || res.lonAndLats.length === 0){
                    _mm.msg("当前无轨迹数据");
                    return;
                };

                _this.map.gps_begin_end = [
                    res.lonAndLats[0],
                    res.lonAndLats[res.lonAndLats.length-1]
                ];

                _map.clearMap();
                _map.clearInfoWindow();
                
                _pathSI.setData([{
                    name:"1",
                    path:res.lonAndLats
                }]);

                _this.fn_setGps_begin_end();//设置起点终点
                
                $(document).off("click",".mapDS-media-btngroup button").on("click",".mapDS-media-btngroup button",function(){
                    _this.fn_timer_close();//关闭定时器
                    $(".mapDS-media-btngroup button").attr("class","dbtn");
                    $(this).addClass("active");

                    let myVideo=document.getElementById("auto_video");
                    let _t = $(this).html();
                    if(_t === "照片"){
                        $(this).parent().siblings(".mapDS-media-cnt").find("img").show();
                        $(this).parent().siblings(".mapDS-media-cnt").find("video").hide();
                        if(myVideo !== null){
                            myVideo.pause();
                        }
                    }else{
                        $(this).parent().siblings(".mapDS-media-cnt").find("img").hide();
                        $(this).parent().siblings(".mapDS-media-cnt").find("video").show(); 

                        if(myVideo !== null){
                            myVideo.addEventListener("playing",function(){
                                _this.timer.isPlaying = true;
                            });
                            myVideo.addEventListener("ended",function(){
                                _this.timer.isPlaying = false;
                                _this.timerNum++;
                                if(_this.switchBtn.is)_this.fn_timer();                                
                            });
                        }
                    }
                });

                //点击清空所有自定义窗体
                $(document).off("click",".mapDS-menu-xxx").on("click",".mapDS-menu-xxx",function(){
                    _map.clearInfoWindow();
                    _this.fn_timer_close();//关闭定时器
                });

                //点击查看图片
                $(document).off("click",".mapDS-media-cnt img").on("click",".mapDS-media-cnt img",function(){
                    let _src = $(this).attr("src");
                    _mm.imgAlert({imgSrc:_src});
                });

                //_this.dataList.license = "";
                _this.dataList.date = set.time;
                _this.dataList.count = res.alarmInfoDto.length;
                _this.dataList.items = [];

                if(!res.alarmInfoDto || res.alarmInfoDto.length === 0)return;

                let _gain = "";
                if(_this.$route.query.set){
                    _gain = JSON.parse(_this.$route.query.set);
                    _this.fn_timer_close();//关闭定时器
                }

                _this.pull = {
                    is:true,
                    cls:"dmapfs-lbtn-pull"
                };

                _this.switchBtn = {
                    is:true,
                    cls:"dmapfs-switch-pull"
                };

                res.alarmInfoDto.forEach((el,index)=>{
                    if(_gain && _gain.id == el.id){
                        _this.timerCount = index;
                    }

                    let _lnglat = [el.gpsLon,el.gpsLat];

                    _this.dataList.items.push({
                        name:el.warningName,time:el.simpleTime,cls:"default",info:el,index:index
                    });
                });

                _this.fn_timer();
            },(err)=>{
                _this.loading = false;
            });
        },

        //点击打开或收起面板
        EVT_pullPush(){
            let _this = this;
            let _isPull = _this.pull.is;
            if(!_isPull){
                _this.pull.cls = "dmapfs-lbtn-pull";
                _this.switchBtn.cls = "dmapfs-switch-pull";
            }else{
                _this.pull.cls = "dmapfs-lbtn-push";
                _this.switchBtn.cls = "dmapfs-switch-push";
            }
            _this.pull.is = !_this.pull.is;
        },

        //fn_新建点标记
        fn_marker(config){
            let _this = this;
            let _lnglat = config.lnglat,
                _title  = config.title ||"",
                _offset = config.offset||new AMap.Pixel(15, 25);

            new AMap.Marker({
                position: _lnglat,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: _title,
                label: {
                    content: _title,
                    //offset : _offset
                },
                icon    : config.icon?config.icon:"",
                map:_this.map.target
            });
           
        },

        //fn_新建点标记-可点击
        fn_marker_click(config){
            let _this = this;
            let _map = _this.map.target;
            let _lnglat = config.lnglat,
                _title  = config.title ||"",
                _offset = config.offset||new AMap.Pixel(15, 25);

            let _m = new AMap.Marker({
                position: _lnglat,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: _title,
                label: {
                    content: _title,
                    offset : _offset
                },
                offset  : new AMap.Pixel(0, -25),
                icon    : config.icon?config.icon:"",
                map:_map
            });            

            _m.on('click',function(e){
                _map.clearInfoWindow();
                let _infoWindow = new AMap.InfoWindow({
                    isCustom: true,  //使用自定义窗体
                    content: config.content,
                    offset: new AMap.Pixel(10,-50)//定位
                });
                _infoWindow.open(_map,_lnglat);
                _this.timer.isPlaying = false;
                _this.EVT_changeSwitch();
            });
        },

        //设置起点终点
        fn_setGps_begin_end(){
            let _gps = this.map.gps_begin_end;
            let _obj_start = {
                lnglat:_gps[0],
                title:"",
                icon:_mm.hostUrl()+"/cdn/img/map/start.png",
            };
            this.fn_marker(_obj_start);

            let _obj_end = {
                lnglat:_gps[1],
                icon:_mm.hostUrl()+"/cdn/img/map/end.png",
                title:"",
            };
            this.fn_marker(_obj_end);
        }
    }
}
</script>

<style scoped>
.dMenu{
    position: absolute;left: 15px;top: 15px;z-index: 1000;background-color: #fff;
    padding: 15px 15px 0;box-shadow: 0 2px 4px rgba(0,0,0,0.4);
}
.mainMap{display: flex;flex-direction: column;}
.dMap{flex: 1;position: relative;}
.dmapFullScreen{width: 100%;height: 100%;}
.dmapfs-list{position:absolute;top:20px;right:20px;bottom: 20px;z-index:199;width:300px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.4);padding:0 15px;}
.dmapfs-switch{position:absolute;z-index:199;}
.dmapfs-switch-box{background:#fff;padding:15px 20px;box-shadow:0 2px 4px rgba(0,0,0,0.4);}
.dmapfs-switch-pull{top:20px;right:370px;}
.dmapfs-switch-push{top:20px;right:20px;}
.dmapfs-list-tle{height:46px;border-bottom:1px solid #ccc;}
.dmap-list-tleInfo{line-height:46px;float:left;color:#3496f8;font-size:16px;}
.dmap-list-tleTxt{line-height:46px;float:right;}
.dmap-list-count{margin:10px 0;color:#a1b8cd;}
.dmap-list-cnt{height:calc(100% - 86px);overflow:hidden;overflow-y:scroll;}
.dmap-list-box{height:65px;cursor: pointer;}
.dmap-list-box .active{color:#3496f8;}
.dmap-list-box:hover{color:#3496f8;}
.dmap-list-img{float:left;width:17px;height:65px;background-image:url("~img/gps/smartmap/list_bg.png");background-repeat:no-repeat;background-position:8px 20px}
.dmap-list-img span{display:block;width:17px;height:17px;background-repeat:no-repeat;}
.dmap-list-img .default{background-image:url("~img/gps/smartmap/round.png")}
.dmap-list-img .active{background-image:url("~img/gps/smartmap/round_active.png");}

.dmap-list-info{float:left;margin-left:10px;width:calc(100% - 90px);}
.dmap-list-txt{float:right;margin-top:20px;width:60px;}

.dmapfs-list-btn{width:20px;height:55px;position:absolute;top:50%;background-repeat:no-repeat;z-index:110;cursor:pointer;}
.dmapfs-lbtn-pull{background-image:url('~img/gps/smartmap/pull.png');right:324px;}
.dmapfs-lbtn-push{background-image:url('~img/gps/smartmap/push.png');right:20px;}
</style>
