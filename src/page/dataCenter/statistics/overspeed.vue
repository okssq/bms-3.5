<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu 
                :data   = "DATA_menuProps" 
                @serach = "EVT_search" 
                @expAll = "EVT_expAll"
            />
        </div>
        <div class="dcharts">
            <div class="dchart-tle">超速统计图</div>
            <div class="dchart-unit" ><span>超速次数（次）</span><span>平均速度(km/h)</span> </div>
            <div class="d-speeding">
                <ve-histogram 
                    width="100%"
                    height="100%"
                    :data-empty="echartData.series[0].data.length === 0"
                    :tooltip="echartData.tooltip"
                    :grid="echartData.grid"
                    :xAxis="echartData.xAxis"
                    :yAxis="echartData.yAxis"
                    :series="echartData.series"
                />
            </div>
        </div>
        <div class="dTble">
            <Table :props="DATA_tbProps" @setPage="GET_page"/>
        </div>
    </div>
</template>


<script>
import echarts from 'echarts/lib/echarts'
import Menu from 'components/schMenu/menu.vue';
import Table    from 'components/list/table.vue';
import Server from 'service/mm.jsx';
const _mm = new Server();

const picker  = {               //选择日期范围限制
    disabledDate(time){
        return (time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime()-1) || time.getTime() < new Date((new Date()).getTime()-86400000*60));
    }
};


export default{
    components:{
        'Menu' : Menu,
        'Table': Table
    },
    data(){
        return {
            loading:false,
            DATA_menuProps:{
                items:[
                    {name:"选择日期",type:"datetimerange",key:"time",value:[_mm.getDate({type:'yesterdayFirst_all'}),_mm.getDate({type:'yesterdayLast_all'})],required:true,picker:picker},
                    {name:"车牌号码",type:"license_search",key:"vehicleLicence",value:''},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                        {name:"导出全部",key:"expAll",cls:"dbtn-blue",disNum:10,disTimeOutIndex:0}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {name: "车牌号",type: "",prop: "k1",width: ""},
                    {name: "所属公司",type: "",prop: "k2",width: ""},
                    {name: "平均速度(km/h)",type: "",prop: "k3",width: ""},
                    {name: "超速次数(次)",type: "",prop: "k4",width: ""},
                   
                ],
                opeations:[
                    {name:"详情",evt:"seeEdit",path:"/statistics-overspeed/detail"},
                ],
                items:[],
                page:{
                    size :10,
                    total:0,
                },
            },
            echartData:{
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type:"none",
                    },
                    backgroundColor: "rgba(255,255,255,.95)",
                    borderColor: "rgb(223,223,223)",
                    borderWidth:1,
                    textStyle: {
                        color: "rgba(0,0,0,.65)"
                    },
                    padding:10
                },
                grid: {
                    show: false,
                    top: '15px',
                    left: '70px',
                    right: '72px',
                    bottom: '22px',
                },
                xAxis: [{
                    type: "category",
                    data: [],
                    axisLine: {
                        show:true,
                        lineStyle: {
                            color: "#CDCDCD",
                            width:'1'
                        }
                    },
                    axisLabel: {
                        color: "#323940"
                    }
                }],
                yAxis: [
                    {
                        type: "value",
                        nameGap:"340",
                        splitLine:{show:false}, 
                        axisLine: {
                            show:true,
                            lineStyle: {
                                color: "#dae0e6"
                            }
                        },
                        axisLabel: {
                            color: "#323940"
                        }
                    },
                    {
                        position: 'right',
                        type: "value",
                        nameGap:"340",
                        splitLine:{show:false}, 
                        axisLine: {
                            show:true,
                            lineStyle: {
                                color: "#dae0e6"
                            }
                        },
                        axisLabel: {
                            color: "#323940"
                        }
                    }
                ],
                series: [
                    {
                        name:'超速次数',
                        type:'bar',
                        data:[],
                        barGap :'0%',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0,color: "#68c6fa"},
                                    {offset: 1,color: "#2586e8"}
                                ])
                            }
                        },
                        barWidth:30, 
                    },
                    {
                        name:'平均速度',
                        type:'bar',
                        yAxisIndex: 1,
                        data:[],
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0,color: "#4dfff8"},
                                    {offset: 1,color: "#08dccb"}
                                ])
                            }
                        },
                        barWidth:30
                    }
                ],
            },
            postData: {},
        }
    },
    mounted(){
        this.EVT_search();
    },
    methods:{
        //搜索按钮
        EVT_search(i){
            let _this = this;
            let data ={
                startTime     : '',
                endTime       : '',
                vehicleLicence: '',
                page          : '1',
            }
            if(i){
               data.startTime      = i.time.start; 
               data.endTime        = i.time.end; 
               data.vehicleLicence = i.vehicleLicence; 
            }
            _this.postData               = data;
            _this.DATA_tbProps.page.sync = 1;
            _this.ajax_search(data);
        },
        //搜索接口
        ajax_search(data){
            let _this     = this;
            _this.loading = true;
            _mm.request({ 
                url:'/basic/vehicle_over_speed_list.json', 
                data:data
            }).then((res)=>{
                if(res.results.length === 0){
                    _this.DATA_tbProps.items        = [];
                    _this.DATA_tbProps.page.total   = 0;
                    _this.echartData.xAxis[0].data  = [];
                    _this.echartData.series[0].data = [];
                    _this.loading = false;
                    return;
                }
                _this.fn_TBList(res);    //渲染表格
                _this.fn_echarts(res);   //渲染echarts
                _this.loading = false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //导出全部按钮
        EVT_expAll(){
            if(this.DATA_tbProps.page.total === 0 || this.DATA_tbProps.page.total ==='0'){
                _mm.msgErr('当前搜索条件没有可下载的数据！');
                return
            }
            let data = {
                endTime       : this.postData.endTime ,
                startTime     : this.postData.startTime ,
                vehicleLicence: this.postData.vehicleLicence ,
            }
            window.open("/sicp/basic/down_vehicle_over_speed_list.json"+'?'+$.param(data));
        },
        //渲染表格所需数据
        fn_TBList(res){
            let _this = this;
            let arr = [];
            res.results.forEach((el,index)=>{
                arr.push({
                    set:{vehicleId:el.vehicleId,startTime:this.postData.startTime,endTime:this.postData.endTime},
                    k1:el.vehicleLicence,
                    k2:el.companyName,
                    k3:el.avgSpeed,
                    k4:el.overSpeedSize,
                    
                });
            });
            _this.DATA_tbProps.page.total = res.totalCount;
            _this.DATA_tbProps.items      = arr;
        },
        //渲染ECHARTS所需数据
        fn_echarts(res){
            let _this= this;
         
                _this.echartData.series[0].data=res.results.map(function (OLD_value){
                    return OLD_value.overSpeedSize;
                })
                _this.echartData.series[1].data=res.results.map(function (OLD_value){
                    return OLD_value.avgSpeed;
                })
                _this.echartData.xAxis[0].data=res.results.map(function (OLD_value){
                    return OLD_value.vehicleLicence;
                })
       
            
        },
        //分页点击
        GET_page(i){
            this.postData.page          = i;
            this.DATA_tbProps.page.sync = i;
            this.ajax_search(this.postData);
        }
    },
}
</script>

<style scoped>
.dcharts{
    width: 100%;
    height: 460px;
    margin-top: 15px;
    position: relative;
}
.d-speeding{
    height: 360px; 
}
.dcharts .dchart-tle{
    height:40px;
    line-height:40px;
    text-indent:30px;
    position:relative;
    font-size: 13px;
    font-weight: bold;
}
.dcharts .dchart-tle::before{
    content:"";
    display:block;
    width:6px;
    height:6px;
    position:absolute;
    left:18px;
    top:17px;
    background:#3496f8;
}

.dchart-unit{

    height: 40px;
    display: flex;
    justify-content:space-between;
    align-items: center;
}
 
</style>
