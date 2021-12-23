
<template>
    <div class="mainMap" v-loading="isLoading">
        <div class="dmap" id="map"></div>       
        <vlelist 
            :props    = "DATA_listProps" 
            @vleClick = 'EVT_vleClick'
            @schbtn   = 'EVT_bottomSearch'
            @clebtn   = 'EVT_bottomClear'
            ref="CLD_vleList"
        >
        </vlelist>
        <div class="dmapInfo" v-show="infos && infos.length && infos.length>0">
            <div class="dmapInfo-box">
                <div class="dmapInfo-tle zoom" 
                    @click="cardFade = !cardFade"
                    :style="{'border-bottom':(!cardFade ? 'none' :'1px solid #ccc')}"
                >
                    路线里程<i class="el-icon-caret-bottom" :class="{'el-icon-caret-top': !cardFade}" ></i>
                </div>
                <div class="dmapInfo-cnt" v-show="cardFade">
                    <div class="dmapInfo-item zoom" v-for="item in infos" :key="item.name">
                        <div class="dmapInfo-item-tle">{{item.name}}：</div>
                        <div class="dmapInfo-item-cnt" v-if="item.name === '路线里程'">{{ item.value | tofix2}}公里</div>   
                        <div class="dmapInfo-item-cnt" v-else>{{item.value}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Server from "service/mm.jsx";
    import VleList from './vehicleList.vue';
    const _mm = new Server();

    let map,ajax_type = 2,_this;
    export default{
        components:{
            'vlelist':VleList,
        },
        data(){
            return {
                isLoading:false,
                date     : "",  //选择日期
                vehicleId: "",  //选择车辆
                DATA_listProps:{
                    dateType : "date",
                },
                //tip信息
                infos:[],
                cardFade: true,
                gps_began_end    : [],
                // isPhoto          : false,
                postData         : {},   
                PathSimplifier   : null,
                pathSimplifierIns: null,
                navg             : null
            }
        },
        filters: {
            tofix2: function (value) {
                if (!value) return '0';
                return parseFloat(value).toFixed(2);
            }
        },
        created(){
            _this = this;

            let _login = _mm.getStorage('login');
            ajax_type = '2';
            if(_login.roleId === "1"){
                this.DATA_listProps.dateType = "datetime";
                ajax_type = '1';
            }

        },
        mounted(){
            setTimeout(()=>{
                _this.fn_loadMap();
            },100);
        },
        methods: {
           
            //点击车辆
            EVT_vleClick(vleItem){
                this.vehicleId = vleItem.vehicleId;
            },
            //点击搜索
            EVT_bottomSearch(data){
                if(this.pathSimplifierIns){
                    this.pathSimplifierIns.setData([]);
                }
                this.infos= [];
                if(this.navg){this.navg.stop();}
                this.postData      = data;
                this.postData.type = ajax_type;
                this.date          = data.time;
                this.vehicleId     = data.vehicleId;
                this.ajax_precise_locations(this.postData);
            },
            //点击清除
            EVT_bottomClear(){
                this.date = "";
                this.vehicleId = "";
                this.infos = [];
                map.clearMap();
                if(this.pathSimplifierIns){
                    this.pathSimplifierIns.setData([]);
                }
            },
            //ajax-查找轨迹
            ajax_precise_locations(set){
                map.clearMap();
                let _this = this;
                this.isLoading  = true;
                _mm.request({
                    url:'/gps/precise_locations.json',
                    data:set
                }).then((res)=>{
                    
                    if(res.lonAndLats.length === 0){
                        _mm.msgSss("当前无轨迹");
                        _this.isLoading=false;
                        return;
                    }
                    let _path = {name:"轨迹1",path:res.lonAndLats};
                    let speed = 0;
                    if(res && res.vehicleTrack && res.vehicleTrack[5] && res.vehicleTrack[5].value ){
                        speed = res.vehicleTrack[5].value * 100;
                    }
                    _this.initPage(_this.PathSimplifier,_path,speed);
                    _this.infos    = res.vehicleTrack;
                    _this.cardFade = true ;
        
                    //设置起点终点
                    if(_path.path.length>1){
                        _this.gps_began_end = [_path.path[0],_path.path[_path.path.length-1]];
                        _this.fn_setGps_began_end();//设置起点终点
                    }
                    _this.isLoading=false;
                },(err)=>{
                    _this.isLoading=false;
                });
            },
               
            //设置起点终点
            fn_setGps_began_end(){
                let _gps = this.gps_began_end;
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
                        content: _title
                    },
                    icon : config.icon?config.icon:"",
                    map:map
                });
            },

            //加载地图
            fn_loadMap(){
                let _this = this;
                map = new AMap.Map('map', {
                    zoom:11,//级别
                });
                //加载PathSimplifier，loadUI的路径参数为模块名中 'ui/' 之后的部分 
                AMapUI.load(['ui/misc/PathSimplifier'], function(PathSimplifier) {
                    if (!PathSimplifier.supportCanvas) {
                        alert('当前环境不支持 Canvas！');
                        return;
                    }
                    _this.PathSimplifier = PathSimplifier;

                });
            },
            //实例化
            initPage(PathSimplifier,_path,speed){
                // console.log('_____',_path);
                //创建组件实例
                this.pathSimplifierIns = new PathSimplifier({
                    zIndex               : 100,
                    map                  : map, //所属的地图实例
                    getPath              : function(pathData, pathIndex) {
                        //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                        return pathData.path;
                    },
                    getHoverTitle        : function(pathData, pathIndex, pointIndex) {
                      
                        let _login       = _mm.getStorage('login');
                        //   console.log('---',_login.roleId)
                        if(_login.roleId === "1"){
                            // console.log('111',pointIndex)
                            if(pointIndex){
                                let info = _path.path[pointIndex][2];
                                return info;
                            }
                        }
                    },
                    renderOptions        : { 
                        //轨迹线的样式
                        pathLineStyle: {
                            strokeStyle  : '#CB3333',
                            lineWidth    : 6,
                            dirArrowStyle: true
                        }
                    } 
                });
                
                let path =  _path.path.map(function(val){return [val[0],val[1]]});
                let newPath = {
                    name : _path.name ,
                    path : path
                }
                // _path.path = _path.path.map(function(val){return [val[0],val[1]]});
                
                
                this.pathSimplifierIns.setData([newPath]);
                if(speed > 0){
                    this.navg = this.pathSimplifierIns.createPathNavigator(0,{loop: true, speed: speed});
                    this.navg.start();
                }
            }

        },
        
       
    }

</script>

<style scoped>
    #map{width: 100%;height: 100%;}
    .dmapInfo-switch .default{color:#9FB6CC;}
    .dmapInfo-switch .active{color:#27CC6A;}

    .dmapInfo{}
    .dmapInfo-switch{background:#fff;padding:15px 15px;position:absolute;top:70px;right:630px;}
    .dmapInfo-box{width:300px;background:#fff;padding:0 15px;position:absolute;top:40px;right:330px;}
    .dmapInfo-tle{height:40px;line-height:40px;border-bottom:1px solid #ccc;color: rgb(52, 150, 248);position: relative;font-weight: bold;}
    .dmapInfo-tle>i{position: absolute;right: 0;top: 13px;}
    .dmapInfo-cnt{padding:10px 0;}
    .dmapInfo-item{margin-bottom:10px;}
    .dmapInfo-item:last-child{margin-bottom:0;}
    .dmapInfo-item-tle{float:left;width:72px;font-weight: bold;}
    .dmapInfo-item-cnt{float:left;width:calc(100% - 72px);color:#637180;}
</style>
