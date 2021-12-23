<template>
    <div class="mainMap" v-loading="loading">
        <div class="dmap" id="map"></div>
        <dCard @rbackInfoWin="rback_infoWin" :propsRef="car" ref="ref_dCard" />
        <div class="dMap-Video">
            <dVideo :propsRef="video.driver" v-if="video.driver.is" :videoType="'driver'" />
            <dVideo :propsRef="video.road" v-if="video.road.is"     :videoType="'road'"/>
        </div>
    </div>
</template>

<script>
    import Server  from 'service/mm.jsx';
    import dCard from './card.vue';
    import dVideo from './video.vue';
    const _mm = new Server();

    export default{
        data(){
            return {
                markers:[],
                map       : {
                    el:''
                },
                infoWin:{
                    el:'',
                    id:''
                },
                car:{
                    checked:'',
                    lists:[],
                    onlyOne:true,
                },
                timer:'',
                massMarks:'',
                loading   : true,
                video:{
                    driver:{
                        title:"司机视频",
                        vehicleId:'',
                        is:false,
                        num:""
                    },
                    road:{
                        title:"道路视频",
                        vehicleId:'',
                        is:false,
                        num:""
                    }
                }
            }
        },
        components:{
            'dCard':dCard,
            'dVideo':dVideo,
        },
    
        mounted(){
            let _this = this;
            
            //初始化地图
            this.map.el = new AMap.Map('map', {
                zoom:11,//级别
            });

            // 地图图块加载完成后触发
            this.map.el.on('complete', function(){
                
                _this.ajax_allGps();//获取所有车辆坐标
                _this.car.onlyOne = false;
                _this.timer = setInterval(()=>{
                    _this.ajax_allGps();//获取所有车辆坐标
                },300000);
            });
            
            //点击清空所有自定义窗体
            $(".mainMap").off("click",".d-mapWindow-xxx").on("click",".d-mapWindow-xxx",function(){
                _this.infoWin.el.close();
                _this.infoWin.id = '';
                
            });

            //自定义窗体点击播放视频
            $(".mainMap").off("click",".cnt-alink").on("click",".cnt-alink",function(){
                let _data = $(this).attr("d-data");
                _data = JSON.parse(_data);

                if(_data.nowStatus == 0){
                    _mm.msgErr("当前车辆已离线");
                    return;
                }

                let _tt = $(this).find("span").html();
                if(_tt === "司机"){
                    if(_this.video.driver.vehicleId == _data.vehicleId)return;
                    _this.video.driver.is = false;
                    setTimeout(()=>{
                        _this.video.driver.vehicleId = _data.vehicleId;
                        _this.video.driver.msgBody = "1004";
                        _this.video.driver.is = true;
                        _this.video.driver.num = "_1";
                        _this.video.driver.title = "司机视频（"+_data.vehicleLicence+"）"
                        _mm.setStorage('driver_req_count',0);
                    },10)
                    
                }
                else{
                    if(_this.video.road.vehicleId == _data.vehicleId)return;
                    _this.video.road.is = false;
                    setTimeout(()=>{
                        _this.video.road.vehicleId = _data.vehicleId;
                        _this.video.road.msgBody = "1004";
                        _this.video.road.is = true;
                        _this.video.road.num = "_2";
                        _this.video.road.title = "道路视频（"+_data.vehicleLicence+"）"
                        _mm.setStorage('road_req_count',0);
                    },10);
                }
            });

            //自定义窗体点击播放视频
            $(".mainMap").off("click",".cnt-trajectory").on("click",".cnt-trajectory",function(){
                let _data = $(this).attr("d-data");
                _data = JSON.parse(_data);

                console.log("111",_data);
                let _today = _mm.getDate({
                                type:"today",
                                num:0
                            });
                console.log("_today",_today);
                _this.$router.push({ path:"/gps-trajectory",query:{
                    id:_data.vehicleId,
                    label:_data.vehicleLicence,
                    today:_today
                }});
            });
        },
        computed:{
            gpsChecked (){
                return this.$store.state.gpsChecked;
            },
            dataCars(){
                return this.$store.state.dataCars;
            },
        },
        watch:{
            gpsChecked:{
                handler:function(val,oldval){
                    if(!val.vehicleId)return;
                    this.rback_infoWin(val);
                },
                deep:true//对象内部的属性监听，也叫深度监听
                
            },
        },
        methods: {
            
            //获取所有车辆坐标
            ajax_allGps(){
                let _this     = this;
                _mm.request({ 
                    url:'/gps/vehicle_positions.json', 
                }).then((res)=>{
                    _this.markers = [];
                    if(_this.car.onlyOne)_this.car.lists = [];
                    res.forEach(function(el,index){
                        if(!el.gpsLon || !el.gpsLat)return;

                        if(_this.infoWin.id === el.vehicleId){
                            let obj = {
                                lnglat        : [el.gpsLon,el.gpsLat],
                                vehicleId     : el.vehicleId,
                                vehicleLicence: el.vehicleLicence,
                                type          : "markerClick"
                            };
                            _this.fn_infoWin(obj);
                        }

                        if(_this.car.onlyOne){
                            //一级车辆列表
                            _this.car.lists.push({
                                value:el.vehicleLicence,
                                id:el.vehicleId,
                                data:el
                            });
                        }

                        _this.markers.push({
                            lnglat:[el.gpsLon,el.gpsLat],
                            id:el.vehicleId,
                            name:el.vehicleLicence,
                            style:parseInt(el.nowStatus)
                        })
                        let _obj = {
                            vehicleId     : el.vehicleId,
                            vehicleLicence: el.vehicleLicence,
                            lnglat        : [el.gpsLon,el.gpsLat],
                            index         : index,
                            state         : el.nowStatus,
                        }
                    });

                    _this.fn_mapData(_this.markers);
                    _this.loading = false;
                },function(err){
                    console.log(err);
                    _this.loading=false;
                })
            },

            fn_mapData(){
                let items = this.markers;
                let _this = this;
                //_this.map.el.clearMap();
                if(_this.massMarks)_this.massMarks.clear();
                var style = [
                    {
                        url: _mm.hostUrl()+"/cdn/img/icon/vehicle_icon_offline.png",
                        anchor: new AMap.Pixel(4, 20),
                        size: new AMap.Size(21, 21)
                    }, {
                        url: _mm.hostUrl()+"/cdn/img/icon/vehicle_icon_default.png",
                        anchor: new AMap.Pixel(4, 20),
                        size: new AMap.Size(21, 21)
                    }, {
                        url: _mm.hostUrl()+"/cdn/img/icon/vehicle_icon_default.png",
                        anchor: new AMap.Pixel(4, 20),
                        size: new AMap.Size(21, 21)
                    }
                ];

                if(items.length === 0)return;

                _this.massMarks = new AMap.MassMarks(items,{
                    zIndex: 5,  // 海量点图层叠加的顺序
                    zooms: [3, 19],  // 在指定地图缩放级别范围内展示海量点图层
                    style: style  // 设置样式对象
                });

                _this.massMarks.setMap(_this.map.el);

                _this.massMarks.on("click",(e)=>{
                    let obj = {
                        lnglat        : e.data.lnglat,
                        vehicleId     : e.data.id,
                        vehicleLicence: e.data.name,
                        type          : "markerClick"
                    };
                    _this.fn_infoWin(obj);
                    _this.ajax_allGps();
                });
                

            },

            //车辆信息卡片
            fn_infoWin(obj){
                let _this = this;

                ajax_cardInfo({
                    vehicleId :	obj.vehicleId
                });

                //ajax-获取卡片信息
                function ajax_cardInfo(set){
                    let _this = this;
                    _mm.request({ 
                        url:'/gps/vehicle_position_detail.json', 
                        data: set
                    }).then((res)=>{
                        if(!res){
                            _mm.msg('该车辆没有定位信息');
                            return;
                        }

                        fn_next(res);
                    });
                }

                function fn_next(res){
                    let _type = '';
                    let _cls ='';
                    if(res.nowStatus == "0"){
                        _type="离线";_cls="offline"
                    }
                    else if(res.nowStatus == "1"){
                        _type="停车";_cls="pause";
                    }
                    else if(res.nowStatus == "2"){
                        _type="行驶";_cls="going"
                    }
                    let info = {
                        license:res.vehicleLicence,
                        items:[
                            {tle:"时间",cnt:res.locationTime,cls:""},
                            {tle:"车速",cnt:res.speed+"km/h",cls:""},
                            {tle:"地址",cnt:(res.provinceName?res.provinceName:'')+(res.cityName?res.cityName:'')+(res.poiName?res.poiName:''),cls:""},
                            {tle:"状态",cnt:_type,cls:_cls},
                            {tle:"视频",t1:"司机",t2:"道路",cls:"",type:"alink"},
                            {tle:"轨迹",cnt:"查看"},
                        ]
                    };

                    let html = ''
                    info.items.forEach(function(el,index){
                        if(el.type === "alink"){
                            let _cls = res.nowStatus==0?"out":"online";
                            html += `
                                <div class="cnt-item zoom">
                                    <div class="cnt-item-name">`+el.tle+`：</div>
                                    <div class="cnt-item-detail"><span class="cnt-alink" d-data=\'`+JSON.stringify(res)+`\'><i class="el-icon-camera-solid `+_cls+`"></i><span class="`+_cls+`">`+el.t1+`</span></span><span class="cnt-alink" d-data=\'`+JSON.stringify(res)+`\'><i class="el-icon-camera-solid `+_cls+`"></i><span class="`+_cls+`">`+el.t2+`</span></span></div>
                                </div>
                            `;
                        }else if(el.tle === "轨迹"){
                            html += `
                                <div class="cnt-item zoom">
                                    <div class="cnt-item-name">`+el.tle+`：</div>
                                    <div class="cnt-item-detail cnt-trajectory cnt-trajectory-iconBG" d-data=\'`+JSON.stringify(res)+`\'>`+el.cnt+`</div>
                                </div>
                            `;
                        }else{
                            html += `
                                <div class="cnt-item zoom">
                                    <div class="cnt-item-name">`+el.tle+`：</div>
                                    <div class="cnt-item-detail `+el.cls+`">`+el.cnt+`</div>
                                </div>
                            `;
                        }
                        
                    });
                    html +=`<div class="cnt-"item zoom">`

                    let content = `
                        <div class="d-mapWindow">
                            <div class="d-mapWindow-top zoom">
                                <div class="d-mapWinTop-tle">`+info.license+`</div>
                                <div class="d-mapWindow-xxx el-icon-close"></div> 
                            </div>
                            <div class="d-mapWindow-cnt ">`+html+`</div>
                        </div>
                    `;
                    //_this.map.el.setCenter(obj.lnglat);

                    _this.infoWin.el = new AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        content: content,
                        autoMove:false,
                        offset: new AMap.Pixel(10, -40)
                    });

                    _this.infoWin.id = obj.vehicleId;
                    _this.infoWin.name = obj.vehicleLicence,
                    _this.infoWin.lnglat = [res.gpslon,res.gpslat];

                    if(obj.type && obj.type === "markerClick")_this.car.checked=res.vehicleLicence;

                    _this.infoWin.el.open(_this.map.el,[res.gpslon,res.gpslat]);
                    _this.map.el.setCenter([res.gpslon,res.gpslat]);
                    //打开车辆所在的列表位置
                    if(obj.type && obj.type === "markerClick"){
                        _this.$refs.ref_dCard.fn_check_zindex({id:res.vehicleId});
                    }
                }
            },

            //返回信息
            rback_infoWin(res){
                let _this = this;
                if(res.type && res.type === "click"){
                    let obj = {
                        lnglat        : res.lnglat,
                        vehicleId     : res.vehicleId,
                    };
                    this.fn_infoWin(obj);
                    //_this.ajax_allGps();
                }                

                if(this.infoWin.id === res.vehicleId){
                    let obj = {
                        lnglat        : res.lnglat,
                        vehicleId     : res.vehicleId,
                        type          : res.type,
                    };
                    this.fn_infoWin(obj);
                }

                
            }
        },
        beforeDestroy() {
            this.map.el.destroy();
            if(this.infoWin.el){
                this.infoWin.el.close();
                this.infoWin.el = "";
                this.infoWin.id = "";
            }
            if(this.timer)window.clearInterval(this.timer);
            _mm.removeStorage('driver_req_count');
            _mm.removeStorage('road_req_count');
            setTimeout(()=>{
                console.log('gps地图',this.map.el);
            },2000)
        }

    }

</script>

<style scoped> 
    .dmap{width: 100%;height: 100%;}
    .dMap-Video{
        position:absolute;
        top:10px;
        left:10px;
        z-index:110;
    }
    .cnt-alink{
        margin-right:5px
    }
</style>
