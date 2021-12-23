<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search"/>
        </div>
        <el-button-group class="btn-group">
            <el-button 
                :type="btnType==='driver' ? 'primary' : ''" 
                icon="el-icon-user"
                @click="warnType_change(1)"
            >司机报警</el-button>
            <el-button 
                :type="btnType==='vehicle' ? 'primary' : ''"
                icon="el-icon-truck" 
                @click="warnType_change(2)"
            >车辆报警</el-button>
        </el-button-group>
        <div class="dcharts">
            <div id="sec-chart" :style="{height: chartsHeight +'px'}"></div>
        </div>
    </div>
</template>

<script>
    import Menu from "components/schMenu/menu.vue";
    import Server from "service/mm.jsx";
    const _mm = new Server();
    let s_chart =null;
    export default {
        components: {
            Menu: Menu,
        },
        computed:{
            chartsHeight:function(){
                return this.warnTypes.length *85 > 0 ? this.warnTypes.length *85 - 20 : 0;
            }
        },
        data() {
            return {
                btnType:"driver",
                loading: false,
                DATA_menuProps: {
                    items: [
                        {
                            name: "日期",
                            type: "date",
                            key: "time",
                            value: _mm.getDate({type:'easyToday'}),
                            required: true
                        },
                        {
                            type: "btn",
                            key: "btn",
                            btns: [
                                {
                                    name: "搜索",
                                    key: "search",
                                    model: "search",
                                    cls: "dbtn-blue"
                                },
                            ]
                        }
                    ]
                },
                hours : [ '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
                    '07:00', '08:00', '09:00','10:00','11:00',
                    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
                ],
                warnTypes :[],
                hissdata : [],
                warn_maxNum:14,
                hiData:{
                    tooltip: {
                        trigger: 'axis',
                        position: 'top',
                        formatter: function(params,tickt){
                            return `时间：${params[0].name}<br>数量：${params[0].data[1]}`
                        },
                        backgroundColor: "rgba(255,255,255,.95)",
                        borderColor: "rgb(223,223,223)",
                        borderWidth:1,
                        textStyle: {
                            color: "rgba(0,0,0,.65)"
                        },
                        padding:10
                    },
                    title: [],
                    singleAxis: [],
                    series: [],
                    color:[
                        '#333399','#FF0033','rgb(59,81,97)','#CC3366','#009999',
                        '#FF6600','#339933','#0099CC','#003399','#f00000','#0066CC'
                    ]
                },
                postData: {
                    time: "",
                    warningType:"1"
                },
            };
        },
      
        mounted(){
            s_chart = echarts.init(document.getElementById("sec-chart"));
            this.EVT_search();
            setTimeout(function (){
                window.onresize = function () {
                    s_chart.resize();
                }
            },200)
        },
        methods: {
            //搜索按钮
            EVT_search(data) {
                this.postData = { ...this.postData, ...data };
                this.ajax_search(this.postData);
            },
            //搜索接口
            ajax_search(data) {
                let _this = this;
                s_chart.clear();

                _this.loading = true;
                _mm.request({
                    url: "/count/hour_warn.json",
                    data: data
                }).then(
                    res => {
                        _this.warn_maxNum = res.max;
                        _this.fn_data(res.list);
                    },
                    function(err) {
                        _this.loading = false;
                    }
                );
            },
            warnType_change(data){
                this.btnType = data === 1 ? 'driver' : 'vehicle';
                this.EVT_search({warningType:data});
            },
            //渲染ECHARTS所需数据
            fn_data(res) {
                // s_chart.clear();
                this.warnTypes=[];
                this.hissdata = [];
                this.hiData.series = [];
                this.hiData.singleAxis = [];
                this.hiData.title=[];
                for(let i=0;i<res.length;i++){
                    this.warnTypes.push(res[i].name);
                }
                for(let i=0;i<res.length;i++){
                    for(let j=0;j<res[i].data.length;j++){
                        this.hissdata.push([i,j,res[i].data[j]])
                    }
                }
                this.fn_echarts(res.length);
            },
            fn_echarts(length){
                let _this = this;
                echarts.util.each(_this.warnTypes, function (warnType, idx) {
                    _this.hiData.title.push({
                        textBaseline: 'middle',
                        top: (idx * 85) + 30,
                        text: warnType,
                        link:'/#/home?id=1&&ab=11',
                        target:'self',
                        textStyle:{
                            fontSize:14,
                            color:"#555"
                        },
                        padding: [15, 0, 0,20]
                    });
                    _this.hiData.singleAxis.push({
                        left: 130,
                        right:20,
                        type: 'category',
                        boundaryGap: false,
                        data: _this.hours,
                        top: idx * 85 ,
                        height: 40,
                        axisLine:{
                            lineStyle:{
                                color:"#888"
                            }
                        }
                    });
                    _this.hiData.series.push({
                        singleAxisIndex: idx,
                        coordinateSystem: 'singleAxis',
                        type: 'scatter',
                        data: [],
                        symbolSize: function (value,params) {
                            if(!value[1]){return 0;}
                            else{
                                return  value[1] / _this.warn_maxNum * 35;
                            }
                        }
                    });
                });

                echarts.util.each(_this.hissdata, function (dataItem) {
                    _this.hiData.series[dataItem[0]].data.push([dataItem[1], dataItem[2]]);
                });
                s_chart.setOption( _this.hiData);
                _this.loading = false;
                setTimeout(function(){
                    s_chart.resize();
                },1000)
                
            },

        },
        destroyed(){
            echarts.dispose();
            window.onresize = null;
        }
    };
</script>

<style scoped>
    .btn-group {
        position: absolute;
        right: 35px;
        top: 15px;
    }
    .dcharts {
        width: 100%;
        margin-top: 15px;
        position: relative;
    }

    .d-operation {
        width: 100%;
    }

    .dcharts .dchart-tle {
        height: 40px;
        line-height: 40px;
        text-indent: 30px;
        position: relative;
        font-size: 13px;
        font-weight: bold;
    }

    .dcharts .dchart-tle::before {
        content: "";
        display: block;
        width: 6px;
        height: 6px;
        position: absolute;
        left: 18px;
        top: 17px;
        background: #3496f8;
    }

    .dchart-tip {
        width: 100%;
        height: 100%;
        text-align: center;
        color: #ccc;
        position: absolute;
        left: 0;
        top: 0;
        line-height: 400px;
    }

    .dchart-unit {
        width: calc(100% - 70px);
        height: 40px;
        position: relative;
        left: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chart-item {
        height: 200px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }
</style>
