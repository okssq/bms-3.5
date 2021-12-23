<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="hor_cplust" v-loading="loading">
            <div class="dchart-tle">高危车辆排行榜</div>
            <div class="char-plus-form">
                <div id="dchart">
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
                <div class="dTble">
                    <Table :props="DATA_tbProps" @setPage="GET_page"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import Menu from 'components/schMenu/menu.vue';
import Table    from 'components/list/table.vue';
import Server from 'service/mm.jsx';
const _mm = new Server();

let picker={                   //选择日期范围限制
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
            loading:true,
            isEchartData:true,
            DATA_menuProps:{
                title:"高危车辆排行榜",
                items:[
                    {name:"选择日期",type:"datetimerange",key:"time",value:[_mm.getDate({type:'yesterdayFirst_all'}),_mm.getDate({type:'yesterdayLast_all'})],required:true,picker:picker},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"}
                    ]}
                ]
            },
            DATA_tbProps:{
                height:"468",
                title:[
                    {name: "车牌号",type: "",prop: "k1",width: ""},
                    {name: "报警次数(次)",type: "",prop: "k2",width: ""},
                    {name: "行驶里程(公里)",type: "",prop: "k3",width: ""},
                    {name: "报警数/百公里",type: "",prop: "k4",width: ""},
                ],
                items:[],
                page:{
                    size :8,
                    total:0,
                },
            },
            echartData:{
                tooltip: {
                    trigger: "axis",
                    axisPointer: {lineStyle: {opacity:'0'},},
                    formatter:'车牌号: {b0}<br />报警数/百公里: {c0}',
                    backgroundColor:'rgba(0,0,0,.3)',
                },
                yAxis: {
                    name :'车牌号',
                    interval: 1,
                    data: [],
                    nameTextStyle:{color:'#323940',},
                    axisLine:{show:true, lineStyle:{color:'#dae0e6',width:'1'}},
                    axisLabel:{color:'#323940'}
                },
                xAxis: {
                    type:'value',
                    name :'报警数/百公里',
                    // splitLine: {show: false} ,
                    nameTextStyle:{color:'#323940',},
                    axisLine:{show:true, lineStyle:{color:'#dae0e6'}},
                    axisLabel:{color:'#323940'},
                },
                series: [{
                            barWidth: 15,
                            type: "bar",
                            data: [],
                            itemStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                        {offset: 0,color: "#2586e8"},
                                        {offset: 1,color: "#68c6fa"}
                                    ])
                                }
                            }
                        }],
                grid: {top: 50,bottom: 5,left: 20,right: 100},
            },
            postData: {},
        }
    },
    created(){
        this.EVT_search();
    },
    methods:{
        //搜索按钮
        EVT_search(i){
            let _this = this;
            let data ={
                startTime:'',
                endTime:'',
                page:'1',
                pageSize:'8',
            }
            if(i){
               data.startTime = i.time.start ; 
                data.endTime  = i.time.end ; 
            }
            _this.postData = data;
            _this.DATA_tbProps.page.sync = 1;
            _this.ajax_search(data);
        },
        //搜索接口
        ajax_search(data){
            let _this = this;
            _this.loading = true;
            _mm.request({ 
                url:'/basic/high_risk_vehicle_list.json', 
                data:data
            }).then((res)=>{
                if(res.results.length === 0){
                    _this.isEchartData = true;
                    _this.DATA_tbProps.items = [];
                    _this.DATA_tbProps.page={
                        size:8,
                        total:0
                    };
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
        //渲染表格所需数据
        fn_TBList(res){
            let _this = this;
            let arr = [];
            res.results.forEach((el,index)=>{
                arr.push({
                    set:{id:el.vehicleId},
                    k1:el.vehicleLicence,
                    k2:el.warningNums,
                    k3:el.mileages,
                    k4:el.warningMileage,
                });
            });
            _this.DATA_tbProps.page.total = res.totalCount;
            _this.DATA_tbProps.page.size  = 8;
            _this.DATA_tbProps.items      = arr;
        },
        //渲染ECHARTS所需数据
        fn_echarts(res){
            let _this= this;
            _this.isEchartData = false;
            _this.echartData.yAxis.data=res.results.map(function (OLD_value){
                return OLD_value.vehicleLicence;
            })
            _this.echartData.series[0].data=res.results.map(function (OLD_value){
                return OLD_value.warningMileage;
            })
            _this.echartData.series[0].data = _this.echartData.series[0].data.reverse();
            _this.echartData.yAxis.data     = _this.echartData.yAxis.data.reverse();
        },

        
        //分页点击
        GET_page(i){
            this.postData.page= i;
            this.DATA_tbProps.page.sync = i;
            this.ajax_search(this.postData);
        }
    },
}
</script>

<style scoped>
    .char-plus-form{
        display: flex;
        flex-direction: row;
    }
    .char-plus-form>div{
        flex: 1;
    }
    .dcharts{
        box-sizing:border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        }
    .dchart-tle{color: #323940; height:40px;line-height:40px;text-indent:15px;position:relative;font-size: 13px;font-weight: bold;}
    .dchart-tle::before{content:"";display:block;width:6px;height:6px;position:absolute;left:4px;top:17px;background:#3496f8;}
    #dchart{box-sizing:border-box;flex: 1;height: 468px;}
    .dTble{padding-left: 10px;overflow-y: auto;}
    
    .dchart-tip{ height: 100%; text-align: center;color: #ccc;position: absolute;left: 0;top: 0; width:100%;line-height: 330px;}
    
    
</style>
