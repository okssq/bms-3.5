<template>
    <div class="big-screen">
        <div id='container' class="big-map"></div>
        <div class="ab-top">
            <div class="logo"><img src="~img/bigScreen/top-tle.png" alt=""></div>
            <div class="exit-btn" @click="EVT_out"><img src="~img/bigScreen/top-exit.png" alt=""></div>
        </div>
        <div class="ab-l-one">
            <p class="charTle">运营走势</p>
            <div class="chartUnit"><span>里程（百公里）</span><span>时长（h）</span></div>
            <div id="l_one" class="l_one" v-show="!(l_one_echartData.series[0].data.length === 0)"></div>
            <div class="c-count-del" v-show="!(l_one_echartData.series[0].data.length === 0)">
                <div class="ccd-item" v-for="(item, index) in l_one_tbData" :key="index">
                    <span>{{item.name}}</span> <span>{{item.value}}{{item.unit}}</span>
                </div>
            </div>
            <div class="ab-noData" v-show="l_one_echartData.series[0].data.length === 0">暂无数据</div>
        </div>
        <div class="ab-l-two">
            <p class="charTle">高风险车辆排行榜</p>
            <div id="l_two" class="l_two" v-show="l_two_proData.length !== 0">
                <div class="rank-item" v-for="(item, index) in l_two_proData" :key="index">
                    <span class="ri-span-1">{{item.name}}</span>
                    <div class="d-prog"><div class="d-prog-item"><div class="d-prog-has" :style="{width:item.percentage+'%'}"></div></div></div>
                    <span class="ri-span-2">{{item.value}}{{item.unit}}</span>
                </div>
            </div>
            <div class="ab-noData" v-show="l_two_proData.length === 0">暂无数据</div>
        </div>
        <div class="ab-r-one">
            <p class="charTle">风控概览</p>
            <div class="chartUnit"><span>风险数/百公里</span></div>
            <div id="r_one" class="r_one" v-show="r_one_echartData.series[0].data.length !== 0"></div>
            <div class="c-count-del" v-show="r_one_echartData.series[0].data.length !== 0">
                <div class="ccd-item" v-for="(item, index) in r_one_tbDate" :key="index">
                    <span>{{item.name}}</span> <span>{{item.value}}{{item.unit}}</span>
                </div>
            </div>
            <div class="ab-noData" v-show="r_one_echartData.series[0].data.length === 0">暂无数据</div>
        </div>
        <div class="ab-r-two">
            <p class="charTle">高风险事件分布</p>
            <div id="r_two" class="r_two" v-show="r_two_echartData.series[0].data.length !== 0"></div>
            <div class="ab-noData" v-show="r_two_echartData.series[0].data.length === 0" >暂无数据</div>
        </div>
        <div class="ab-center">
            <div class="all-count-text" v-for="item in all_count_text" :key="item.name">
                <span>&nbsp;{{item.name}}&nbsp;</span>
                <span class="count-number">&nbsp;{{item.value}}<span>辆</span>&nbsp;</span>
            </div>
        </div>
    </div>
</template>

<script>
import Server from 'service/mm.jsx';
const _mm = new Server();
let map;
let l_one,l_two,r_one,r_two;
export default{
    data(){
        return {
            all_count_text:[
                {name:'车辆总数',value:'--'},
                {name:'高风险车辆',value:'--'},
                {name:'行驶车辆',value:'--'},
                {name:'静止车辆',value:'--'},
                {name:'离线车辆',value:'--'},
            ],
            l_one_echartData:{
                
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        lineStyle: {
                            opacity:'0'
                        }
                    },
                    backgroundColor:'rgba(0,0,0,.3)',
                    confine :true
                },
                grid: {
                    show:false,
                    top: '0',
                    left: '16px',
                    right: '16px',
                    bottom: '22px',
                },
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : [],
                        axisLabel:{
                            color:'#666',
                            interval:0,
                        },
                        axisTick:{
                            show:false,
                        }
                    }
                ],
                yAxis : [
                    {
                        show :false,
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'日均时长',
                        type:'line',
                        stack: '总量',
                        areaStyle: {normal: {}},
                        data:['1'],
                        // data:[],
                        symbol:'none',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, .5,[
                                    {offset: 0,color: "rgba(18,229,212,.4)"},
                                    {offset: 1,color: "rgba(18,229,212,.1)"}
                                ])
                            },
                        },
                        lineStyle :{
                            color:'#12e5d4'
                        },
                     
                    },
                    {
                        name:'日均里程',
                        type:'line',
                        stack: '总量',
                        symbol:'none',
                        areaStyle: {normal: {}},
                        data:[],
                        // data:[],
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0,color: "rgba(0,141,242,.4)"},
                                    {offset: 1,color: "rgba(0,141,242,.1)"}
                                ])
                            }
                        },
                        lineStyle :{
                            color:'#008df2'
                        }
                    },
                ]


            },
            l_one_tbData:[
                {name:'日均里程',value:'0',unit:'百公里',type:'dayMileage'},
                {name:'日均时长',value:'0',unit:'小时',type:'dayTimes'},
                {name:'平均速度',value:'0',unit:'km/h',type:'speed'}
            ],
            l_two_proData:[],
            r_one_echartData:{
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    confine :true
                },
                grid: {
                    show:false,
                    top: '0',
                    left: '16px',
                    right: '16px',
                    bottom: '22px',
                },
                xAxis : [
                    {
                        boundaryGap : false,
                        type : 'category',
                        data : [],
                        axisLabel:{
                            color:'#666',
                            interval:0,
                            lineStyle:{color:'rgba(0, 0, 0, 0.5)'}
                        },
                        axisLine:{
                            show:false
                        }
                    }
                ],
                yAxis : [
                    {
                        show :false,
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'司机风险',
                        type:'bar',
                        stack: '风险',
                        data:['1'],
                        // data:[],
                        itemStyle :{
                            color :'#008df2',
                        },
                        barWidth:16
                    },
                    {
                        name:'ADAS风险',
                        type:'bar',
                        stack: '风险',
                        // data:[],
                        data:[220, 182, 191, 234, 290, 330, 310],
                        itemStyle :{
                            color :'#12e5d4',
                        }
                    },
                ]
            },
            r_one_tbDate:[
                {name:'风险总数',value:'234',unit:'次/百公里',type:'count'},
                {name:'司机风险',value:'123',unit:'次/百公里',type:'countDriverWarn'},
                {name:'ADAS风险',value:'534',unit:'次/百公里',type:'countAdasWarn'}
            ],
            r_two_echartData:{
                backgroundColor: 'rgba(0,0,0,0)',
                tooltip : {
                     trigger: 'item',
                     formatter: "{a} <br/>{b} : {c} ({d}%)",
                     confine :true
                },
                visualMap: {
                    show: false,
                    min: 35,
                    max: 374,
                    inRange: {
                        colorLightness: [0.3, 0.7]
                    },
                    color: '#008df2',
                },
                series : [
                    {
                        name:'高风险事件分布',
                        type:'pie',
                        radius : '75%',
                        center: ['50%', '50%'],
                        data:[
                            {value:35, name:'直接访问'},
                        ].sort(function (a, b) { return a.value - b.value; }),
                        roseType: 'radius',
                        label: {
                            normal: {
                                textStyle: {
                                    color: '#666'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                lineStyle: {color: 'rgba(255, 255, 255, 0.3)'},
                                smooth: 0.1,
                                length: 5,
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#008df2',
                                shadowBlur: 200,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function (idx) {
                            return Math.random() * 200;
                        }
                    }
                ]
            },
            mapData:{
                icon:{
                    red:_mm.hostUrl()+'/cdn/img/bigScreen/icon/red.png',
                    green:_mm.hostUrl()+'/cdn/img/bigScreen/icon/green.png',
                    yellow:_mm.hostUrl()+'/cdn/img/bigScreen/icon/yellow.png',
                    orange:_mm.hostUrl()+'/cdn/img/bigScreen/icon/orange.png',
                    gray:_mm.hostUrl()+'/cdn/img/bigScreen/icon/gray.png',
                },
                data:{
                    zoom3_6:[
                        {lnglat:[121.5090465546,31.2364354183],tle:"上海",icon:"yellow"},
                        {lnglat:[116.4990234375,39.7747694853],tle:"北京",icon:"yellow"},
                        {lnglat:[113.3129882813,22.9786239704],tle:"广州",icon:"yellow"},
                    ],
                    zoom7_18:[]
                }
            },
        }
    },
    created() {
        // $('.el-notification').hide();
        // this.$emit('closeAiAlert');
        // console.log('进入big页面了。');
    },
    mounted(){
        let _this = this;
        window.addEventListener('keyup', _this.myMethod())
        l_one = echarts.init(document.getElementById("l_one"));
        r_one = echarts.init(document.getElementById("r_one"));
        r_two = echarts.init(document.getElementById("r_two"));
        //窗口大小切换柱状等图自适应
        setTimeout(function (){
            window.onresize = function () {
                l_one.resize();
                r_one.resize();
                r_two.resize();
            }
        },200)

        _this.ajax_warn_report();

        map = new AMap.Map('container', {
            zoom:11,//级别
            mapStyle: 'amap://styles/b145f9ddd2725134ba768884eab58db5',
        });

        
        _this.fn_mapData(this.mapData.data.zoom7_18);

        map.on("zoomend",function(a,b,c){
            let _getZoom = map.getZoom();
            if(_getZoom > 6){
                _this.fn_mapData(_this.mapData.data.zoom7_18);
            }else{
                _this.fn_mapData(_this.mapData.data.zoom3_6);
            }
        });

        _this.ajax_vehicle_report();
        _this.ajax_vehicle_positions_report();

    },
    methods:{
        myMethod(event){
            // console.log('event',event);
        },
        EVT_out(){
            this.fn_cancelFullScreen();
            window.history.go(-1);
        },
        fn_cancelFullScreen(){
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        },

        fn_mapData(items){
            let _this = this;
            map.clearMap();
            var style = [
                {
                    url: _this.mapData.icon.red,
                    anchor: new AMap.Pixel(4, 4),
                    size: new AMap.Size(21, 21)
                }, {
                    url: _this.mapData.icon.green,
                    anchor: new AMap.Pixel(4, 4),
                    size: new AMap.Size(21, 21)
                }, {
                    url: _this.mapData.icon.orange,
                    anchor: new AMap.Pixel(4, 4),
                    size: new AMap.Size(21, 21)
                }, {
                    url: _this.mapData.icon.gray,
                    anchor: new AMap.Pixel(4, 4),
                    size: new AMap.Size(21, 21)
                }, {
                    url: _this.mapData.icon.yellow,
                    anchor: new AMap.Pixel(4, 4),
                    size: new AMap.Size(21, 21)
                }
            ];

            if(items.length === 0)return;

            var massMarks = new AMap.MassMarks(items,{
                zIndex: 5,  // 海量点图层叠加的顺序
                zooms: [3, 19],  // 在指定地图缩放级别范围内展示海量点图层
                style: style  // 设置样式对象
            });

            massMarks.setMap(map);

            
            // items.forEach(el=>{
            //     _arr.push({
            //         lnglat:[el.gpsLon,el.gpsLat],
            //         name:el.vehicleLicence,
            //         style:parseInt(el.nowStatus)
            //     });
            // });

            // items.forEach((el,index)=>{
            //     let _icon = "";
            //     if(el.icon === "red"){
            //         _icon = _this.mapData.icon.red;
            //     }else if(el.icon === "green"){
            //         _icon = _this.mapData.icon.green;
            //     }else if(el.icon === "orange"){
            //         _icon = _this.mapData.icon.orange;
            //     }else if(el.icon === "gray"){
            //         _icon = _this.mapData.icon.gray;
            //     }else if(el.icon === "yellow"){
            //         _icon = _this.mapData.icon.yellow;
            //     }

            //     new AMap.Marker({
            //         position: el.lnglat,
            //         offset: new AMap.Pixel(-10, -10),
            //         icon: _icon, // 添加 Icon 实例
            //         title: el.tle,
            //         map:map
            //     });
            // });
        },

        //请求数据
        ajax_warn_report(){
            let _this = this;
            this.loading = true;
            _mm.request({ 
                url:'/index/warn_report.json', 
            }).then((res)=>{
                l_one.clear();
                r_one.clear();
                r_two.clear();
                //fn左一
                let lOneData = _this.l_one_echartData;
                lOneData.xAxis[0].data  = res.dayOperates.X;
                lOneData.series[0].data = res.dayOperates.times;
                lOneData.series[1].data = res.dayOperates.mileage;
                l_one.setOption(lOneData);
                for(let i=0,len=_this.l_one_tbData.length;i<len;i++){
                    _this.l_one_tbData[i].value= res.dayOperates[_this.l_one_tbData[i].type];
                }
                // fn左二
                _this.l_two_proData= res.weekWarnDescDtos;
                
                //fn右一
                let rOneData = _this.r_one_echartData;
                rOneData.xAxis[0].data  = res.risks.X;
                rOneData.series[0].data = res.risks.driverWarn;
                rOneData.series[1].data = res.risks.adasWarn;
                r_one.setOption(rOneData);
                for(let i=0,len=_this.r_one_tbDate.length;i<len;i++){
                    _this.r_one_tbDate[i].value= res.risks[_this.r_one_tbDate[i].type];
                }
                //fn右二
                _this.r_two_echartData.series[0].data = res.warningTypes;
                if(res.warningTypes || res.warningTypes.length !== 0 ){
                    let max = _this.r_two_echartData.series[0].data.sort(function(a,b){
                        return b.value-a.value;
                    });
                    _this.r_two_echartData.visualMap.max = max.length> 0 ? max[0].value :0 ;
                    let min = _this.r_two_echartData.series[0].data.sort(function(a,b){
                        return a.value-b.value;
                    });
                    _this.r_two_echartData.visualMap.min = min.length> 0 ? min[0].value :0 ;
                }
                r_two.setOption(_this.r_two_echartData);

                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },

        //ajax-车辆在线
        ajax_vehicle_report(){
            let _this = this;
            _mm.request({ 
                url:'/index/vehicle_report.json', 
            }).then((res)=>{
                _this.all_count_text = [
                    {name:'车辆总数',value:res.countVehicle||"--"},
                    {name:'高风险车辆',value:res.countWarnVehicle||"--"},
                    {name:'行驶车辆',value:res.countRunVehicle||"--"},
                    {name:'静止车辆',value:res.countStopVehicle||"--"},
                    {name:'离线车辆',value:res.countOffLineVehicle||"--"},
                ]
            })
        },

        //ajax-车辆列表
        ajax_vehicle_positions_report(){
            let _this = this;
            _mm.request({ 
                url:'/index/vehicle_positions_report.json', 
            }).then((res)=>{
                if(res.address){
                    map.setCity(res.address);
                }

                if(res.vehiclePositions && res.vehiclePositions.length > 0){
                    let arr_Positions = [];
                    res.vehiclePositions.forEach((el,index)=>{
                        if(!el.gpsLon || !el.gpsLat)return;
                        arr_Positions.push({
                            lnglat:[el.gpsLon,el.gpsLat],
                            name:el.vehicleLicence,
                            style:parseInt(el.nowStatus)
                        })
                        // let state = "gray";
                        // if(el.nowStatus === "0"){
                        //     state = "gray";
                        // }else if(el.nowStatus === "1"){
                        //     state = "orange";
                        // }else if(el.nowStatus === "2"){
                        //     state = "green";
                        // }else if(el.nowStatus === "3"){
                        //     state = "red";
                        // }
                        // arr_Positions.push({
                        //     lnglat:[el.gpsLon,el.gpsLat],
                        //     tle:el.vehicleLicence,
                        //     icon:state
                        // })
                    });

                    _this.mapData.data.zoom7_18 = arr_Positions;
                }              

                if(res.vehicleCityCountDtos && res.vehicleCityCountDtos.length > 0){
                    let arr_CityPositions = [];
                    res.vehicleCityCountDtos.forEach((el,index)=>{  
                        if(!el.gpsLon || !el.gpsLat)return;                 
                        arr_CityPositions.push({
                            lnglat:[el.gpsLon,el.gpsLat],
                            tle:el.cityName,
                            icon:"yellow"
                        })
                    });

                    _this.mapData.data.zoom3_6 = arr_CityPositions;
                }

                _this.fn_mapData(this.mapData.data.zoom7_18);
                
            })
        }
    },
    
}
</script>

<style>
.big-map{width: 100%; position: absolute;top: 0;left: 0;right: 0;bottom: 0;}
.big-screen{width: 100%;height: 100%;position: relative;min-width: 1280px;min-height: 765px;}
.ab-top,.ab-l-one,.ab-l-two,.ab-r-one,.ab-r-two,.ab-center{position: absolute;background-color:rgba(22,25,28,.93);box-shadow: 0 0 20px rgba(0,0,0,.5)}

.ab-top{width: 100%;height: 80px;left: 0;top: 0;} 
.logo{position: absolute;left: calc(50% - 171px);top: calc(50% - 14px);text-align: center;}
.logo>img{width: 90%;}
.exit-btn{position: absolute;width: 22px;height: 20px;right: 40px;top: 30px;}
.exit-btn>img{width: 100%;cursor: pointer;} 

.ab-l-one,.ab-l-two{left: 10px;}
.ab-r-one,.ab-r-two{right: 10px;}
.ab-l-one,.ab-r-one,.ab-center{top: 90px;}
.ab-l-one,.ab-r-one{width: 320px;height: 460px;}
.ab-l-two,.ab-r-two{width: 320px;height: 285px;top: 560px;}
.ab-center{width: calc(100% - 680px); height: 50px;left: 340px;display: flex;align-items: center;}

/*暂无数据样式*/
.ab-noData{width: 100%;height: 100%;position: absolute;left: 0;top: 0;text-align: center;color: #666;display: flex;
align-items: center;justify-content: center;}


/* center模块 */
.all-count-text{
    width: 20%;text-align: center;color: #fff;position: relative;
    display: flex; flex-wrap:wrap;justify-content: center;align-items: center;align-content:center;
}
.all-count-text::after{position: absolute;width: 1px;height: 100%;right: 0;top: 0;background-color: #333;content: '';}
.all-count-text span.count-number{font-weight: bold;}
.all-count-text:nth-of-type(1){color:#f4E952; }
.all-count-text:nth-of-type(2){color: #ff4242;}
.all-count-text:nth-of-type(3){color: #27cc6a;}
.all-count-text:nth-of-type(4){color: #ff9710;}
.all-count-text:nth-of-type(5){color: #999;}
.all-count-text:nth-of-type(5)::after{content: none;}

.l_one,.r_one,.l_two,.r_two{width: calc(100% - 30px);position: relative;left: 15px;}
.l_one,.r_one{height: 210px;}
.chartUnit{color: #666;display: flex;justify-content:space-between;width: calc(100% - 50px);position: relative;left: 32px;}
.l_two,.r_two{height: 195px;}
.l_two{width: calc(100% - 64px);position: relative;left: 32px;}
.c-count-del{height: 120px;padding-bottom: 15px;width: calc(100% - 64px);position: relative;left: 32px;
    display: flex;flex-direction: column; flex-wrap: nowrap;justify-content:space-around;    top: 10px;
}
.ccd-item{display: flex;justify-content:space-between;color: #ccc;position: relative;}
.ccd-item::after{content: '';position: absolute;width: 100%;height: 1px;bottom: -6px;left: 0;background-color: #333;}
.c-count-del .ccd-item:nth-last-of-type(1)::after{height: 0;}


/* echar外部公用样式 */
.charTle{
    color: #ccc;text-align: center;width: calc(100% - 30px);position: relative;left: 15px;font-size: 18px;height: 50px;line-height: 50px;
}
.charTle::after{position: absolute;width: 100%;content: '';bottom: 0;height: 2px;left: 0;
 background: url('~img/bigScreen/line-gradient.png') no-repeat;background-size: 100%;
}
/* .charTle::after{} */

/* 左1 */

/* 左2 */
.ri-span-1,.ri-span-2,.d-prog{float: left;}
.ri-span-1{width: 72px;}
.ri-span-2{width: 66px;text-align: right;}
.rank-item{height: 24px;margin-bottom: 15px;color: #666;}
.d-prog{width: 118px;height: 14px; background-color: #202529;border-radius: 10px;position: relative;margin-top: 3px;}
.d-prog-item{width:calc(100% - 8px);height: 8px; position: absolute;left: 4px;top: 3px;border-radius: 8px;overflow: hidden; }
.d-prog-item .d-prog-has{
    border-radius: 8px;
    height: 100%;background-color:#008df2; 
    background: -webkit-linear-gradient(left, #008df2 , #12e5d4); /* Safari 5.1 - 6.0 */
    background: -o-linear-gradient(right, #008df2 , #12e5d4); /* Opera 11.1 - 12.0 */
    background: -moz-linear-gradient(right, #008df2 , #12e5d4); /* Firefox 3.6 - 15 */
    background: linear-gradient(to right, #008df2  , #12e5d4); /* 标准的语法 */
}

</style>
