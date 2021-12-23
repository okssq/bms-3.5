<template>
    <div v-loading="loading" class="home">
        <!-- 四个卡片 -->
        <div class="four-card">
            <div class="card-item hoverBox" v-for="(item , index) in  fourCard" :key="index">
                <div class="card-item-tle">
                    <span>{{item.title}}</span>
                    <i class="el-icon-warning-outline"></i>
                </div>
                <div class="card-item-numble" :class="'card-rate'+(index+1)">{{item.info}}{{item.suffix}}</div>
                <div class="card-item-rate">
                    同比{{compareTime}}
                    <span v-if="item.rate && item.rate.replace('%','')>0">
                        <i style="color:rgb(82,196,26)" class="el-icon-caret-top"></i>
                        {{item.rate}}
                    </span>
                    <span v-else>
                        <i
                            style="color:rgb(245,34,45)"
                            class="el-icon-caret-bottom"
                        ></i>
                        {{item.rate && item.rate.slice(1) || ''}}
                    </span>
                </div>
            </div>
        </div>
        <!-- 两个echart图表 -->
        <div class="two-chart-graphics">
            <div class="chart-form hoverBox">
                <div class="chart-form-tle">
                    <span>报警次数-时间趋势</span>
                </div>
                <ve-histogram
                    width="100%"
                    height="320px"
                    :grid="histogramData.grid"
                    :legend-visible="false"
                    :series="histogramData.series"
                    :tooltip="histogramData.tooltip"
                    :yAxis="histogramData.yAxis"
                    :xAxis="histogramData.xAxis"
                    :data-empty="histogramData.series[1].data.length===0&&histogramData.series[0].data.length===0"
                ></ve-histogram>
            </div>
            <div class="chart-form hoverBox">
                <div class="chart-form-tle">
                    <span>报警类型占比</span>
                </div>
                <ve-pie
                    height="320px"
                    :legend-visible="false"
                    :data-empty="pieChartData.series[0].data.length>0?false:true"
                    :series="pieChartData.series"
                    :tooltip="pieChartData.tooltip"
                    :colors="pieChartData.colors"
                ></ve-pie>
            </div>
        </div>
        <!-- 两个排行榜 -->
        <div class="two-chart-rank">
            <div class="chart-form hoverBox" v-for="item in twoTable" :key="item.path">
                <div class="chart-form-tle">
                    <span>{{item.tbName}}</span>
                    <span class="more" @click="$router.push(item.path)">更多</span>
                </div>
                <div class="chart-form-main">
                    <div class="chart-form-th">
                        <span style="width:20px"></span>
                        <div class="form-th-item" style="flex:1;margin:0 15px;">{{item.tle}}</div>
                        <div class="form-th-item">{{item.rate}}</div>
                    </div>
                    <div class="chart-form-th" v-for="(_it,_index) in item.data" :key="_index">
                        <span
                            style="width:20px"
                            :class="[_index>2?'num-more3':'num-small3','num'+(_index+1)]"
                        >{{_index+1}}</span>
                        <div style="flex:1;margin:0 15px;" class="form-th-item">{{_it.label}}</div>
                        <div class="form-th-item">{{_it.value}}</div>
                    </div> 
                    <div class="rank-form-empty" v-if="(item.data||[]).length===0"><span>暂无数据</span></div>
                </div>
            </div>
        </div>
        <div class="search-type">
            <el-popover
                placement="left"
                width="126"
                popper-class="el-popover-stb"
                v-model="searchTypeShow"
                trigger="click">
                <div class="searchTypeBtns">
                    <el-button class="st-btn-item" :type="searchType==='1'?'primary':null"  @click="searchType_change('1')">昨日</el-button>
                    <el-button class="st-btn-item" :type="searchType==='2'?'primary':null"  @click="searchType_change('2')">近7天</el-button>
                    <el-button class="st-btn-item" :type="searchType==='3'?'primary':null"  @click="searchType_change('3')">近30天</el-button>
                </div>
                <div
                    slot="reference"
                    class="search-type-btn"
                >{{searchType=== '1'?'昨':searchType==='2'?'7':'30'}}</div>
            </el-popover>
        </div>
    </div>
</template>

<script>
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
    data() {
        return {
            compareTime: "前天",
            searchType: "1",
            searchTypeShow: false,
            loading: false,
            fourCard: [
                {
                    title: "车辆上线数",
                    suffix: "辆"
                },
                {
                    title: "车辆使用率",
                    suffix: ""
                },
                {
                    title: "总里程",
                    suffix: "公里"
                },
                {
                    title: "报警次数",
                    suffix: "次"
                }
            ],
            histogramData: {
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "5%",
                    top:"2%",
                    containLabel: true
                },
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
                xAxis: {
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
                },
                yAxis: {
                    type: "value",
                    nameGap:"340",
                    splitLine:{
                        show:true,
                        lineStyle:{
                            color:"#EEEEEE",
                            type:"'dashed'"
                        }
                    }, 
                    axisLine: {
                        lineStyle: {
                            color: "#dae0e6"
                        }
                    },
                    axisLabel: {
                        color: "#323940"
                    }
                },
                series: [
                    {
                        barWidth: 15,
                        name: "司机报警",
                        type: "bar",
                        data: [],
                        itemStyle: { color: "rgb(173,214,255)" }
                    },
                    {
                        barWidth: 15,
                        name: "车辆报警",
                        type: "bar",
                        data: [],
                        itemStyle: {  color: "rgb(88,175,255)" }
                    },
                    {
                        barWidth: 15,
                        name: "报警总计",
                        type: "bar",
                        data: [],
                        itemStyle: { color: "rgb(89,168,247)" }
                    }
                ]
            },
            //饼状图所需数据
            pieChartData: {
                series: [
                    {
                        name: "报警类型占比",
                        type: "pie",
                        radius: "60%",
                        center: ["50%", "50%"],
                        data: [],
                        hoverOffset:15,
                        label: {
                            color: "#637180"
                        },
                    }
                ],
                tooltip: {
                    axisPointer: {
                        type:"none",
                    },
                    formatter:
                        " &nbsp;&nbsp;类型&nbsp;&nbsp;：{b}&nbsp;&nbsp;<br/>&nbsp;&nbsp;次数&nbsp;&nbsp;：{c}次&nbsp;&nbsp;<br>&nbsp;&nbsp;占比&nbsp;&nbsp;：{d}%&nbsp;&nbsp;",
                    backgroundColor: "rgba(255,255,255,.95)",
                    borderColor: "rgb(223,223,223)",
                    borderWidth:1,
                    textStyle: {
                        color: "rgba(0,0,0,.65)"
                    },
                    padding:10,
                },
                colors: []
            },
            //两个排行榜所需数据
            twoTable: [
                {
                    tbName: "高危车辆排行榜",
                    tle: "车牌号码",
                    rate: "报警数/百公里",
                    data: [],
                    path: "/ranking-high-vehicle"
                },
                {
                    tbName: "高危报警排行榜",
                    tle: "报警类型",
                    rate: "报警数/百公里",
                    data: [],
                    path: "/ranking-high-alarm"
                }
            ]
        };
    },
    created() {
        this.ajax_GET_centerData("1");
    },
    methods: {
        //请求数据
        ajax_GET_centerData(dayType) {
            this.loading = true;
            let arr=[],
                _this=this;
            for(let i=1;i<5;i++){
                arr.push(this.ajax_basic_data(dayType,i));
            }
            
            Promise.all(arr).then(function (results) {
                let companyBasicInfosDetails   = results[0].companyBasicInfosDetails;
                let companyWarningTime         = results[1].companyWarningTime;
                let companyWarningTypes        = results[2].companyWarningTypes;
                let companyVehicleWarningInfos = results[3].companyVehicleWarningInfos;
                _this.fn_4card(companyBasicInfosDetails || []);
                _this.fn_histogram(companyWarningTime);
                _this.fn_pieChart(companyWarningTypes || []);
                _this.fn_twoTable(companyVehicleWarningInfos || [],companyWarningTypes.slice(0, 5));
                _this.loading = false;
            }).catch(function (e){
                _mm.msgErr('请求数据失败');
                _this.loading = false;
            });
        },
        // 请求数据
        ajax_basic_data(dayType,modelType){
            return new Promise(function(resolve, reject) {
                _mm.request({
                    url: "/basic/basics_data.json",
                    data: { dayType: dayType,modelType:modelType }
                }).then(
                    res => resolve(res)
                ).catch( e => {
                    console.log(e)
                    reject(e)
                });
            });
        },
        //渲染4个卡片
        fn_4card(res) {
            let _login = _mm.getStorage("login");
            // if(_login.realName === "孙克振"){
            //     this.fourCard = [
            //         {
            //             title: "车辆上线数",
            //             suffix: "4027辆"
            //         },
            //         {
            //             title: "车辆使用率",
            //             suffix: "60.41%"
            //         },
            //         {
            //             title: "总里程",
            //             suffix: "1102533.82公里"
            //         },
            //         {
            //             title: "报警次数",
            //             suffix: "61368次"
            //         }
            //     ]
            //     return;
            // }

            let data = this.fourCard;
            data.forEach((el, index) => {
                data[index] = {
                    ...el,
                    ...(res[index] || { info: "0", rate: "0" })
                };
            });
        },
        //渲染柱状图
        fn_histogram(res) {
            this.histogramData.xAxis.data = res.absList;
            this.histogramData.series[0].data = [];
            this.histogramData.series[1].data = [];
            this.histogramData.series[2].data = [];
            if ((res.driverWarnList || []).length > 0) {
                this.histogramData.series[0].data = res.driverWarnList;
            }
            if ((res.vehicleWarnList || []).length > 0) {
                this.histogramData.series[1].data = res.vehicleWarnList;
            }
            if ((res.driverWarnList || []).length > 0) {
                this.histogramData.series[2].data = res.countWarnList;
            }
        },
        //渲染饼状图
        fn_pieChart(res) {
            let len = res.length;
            if (len >= 0 && len <= 5) {
                this.pieChartData.colors = [
                    "#add6ff",
                    "#59a8f7",
                    "#1d88f2",
                    "#005cbb",
                    "#003d7a"
                ];
            } else if (len > 5 && len <= 10) {
                this.pieChartData.colors = [
                    "#cce6ff",
                    "#add6ff",
                    "#6db2f7",
                    "#59a8f7",
                    "#3496f8",
                    "#1d88f2",
                    "#0066cc",
                    "#005cbb",
                    "#0047bf",
                    "#003d7a"
                ];
            } else if (len > 10 && len <= 15) {
                this.pieChartData.colors = [
                    "#e0f0ff",
                    "#cce6ff",
                    "#add6ff",
                    "#82befa",
                    "#6db2f7",
                    "#59a8f7",
                    "#47a3ff",
                    "#3496f8",
                    "#1d88f2",
                    "#0070e0",
                    "#0066cc",
                    "#005cbb",
                    "#0052a3",
                    "#00478f",
                    "#003d7a"
                ];
            } else {
                this.pieChartData.colors = [
                    "#e0f0ff",
                    "#cce6ff",
                    "#add6ff",
                    "#97cafc",
                    "#82befa",
                    "#6db2f7",
                    "#59a8f7",
                    "#47a3ff",
                    "#3496f8",
                    "#1d88f2",
                    "#0079f2",
                    "#0070e0",
                    "#0066cc",
                    "#005cbb",
                    "#0052a3",
                    "#00478f",
                    "#003d7a",
                    "#003366",
                    "#00264d",
                    "#001a33"
                ];
            }
            this.pieChartData.series[0].data = [];
            res.forEach(el => {
                this.pieChartData.series[0].data.push({
                    value: el.warningNums,
                    name: el.warningName
                });
            });
            
        },
        //渲染两张排行榜
        fn_twoTable(res1, res2) {
            this.twoTable[0].data = [];
            this.twoTable[1].data = [];
            if (res1.length > 0) {
                res1.forEach(el => {
                    el = JSON.parse(
                        JSON.stringify(el).replace(/vehicleLicence/g, "label")
                    );
                    el = JSON.parse(
                        JSON.stringify(el).replace(/warningMileage/g, "value")
                    );
                    this.twoTable[0].data.push(el);
                });
            }
            if (res2.length > 0) {
                res2.forEach(el => {
                    el = JSON.parse(
                        JSON.stringify(el).replace(/warningName/g, "label")
                    );
                    el = JSON.parse(
                        JSON.stringify(el).replace(/warningNums/g, "value")
                    );
                    this.twoTable[1].data.push(el);
                });
            }
        },

        
        searchType_change(data) {
            this.searchTypeShow = false;
            if (this.searchType !== data) {
                this.searchType = data;
                this.ajax_GET_centerData(data);
            }
        }
    }
};
</script>

<style scoped>
.home {
    position: relative;
}
.search-type {
    position: fixed;
    right: 10px;
    top: 180px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.search-type-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
    line-height: 48px;
    text-align: center;
    background: #1890ff;
    border-radius: 4px 0 0 4px;
    color: #fff;
    cursor: pointer;
}
.searchTypeBtns {
    display: flex;
    flex-direction: column;
}
.st-btn-item{
    width: 100px;
    margin-left: 0;
    padding: 6px;
    box-sizing: border-box;
    font-size: 12px;
}
.st-btn-item+.st-btn-item{
    margin-top: 10px;
}
.searchTypeBtns.show > div {
    z-index: 3000;
}

.st-btn-item.active{
    color: #fff;
    background-color: rgb(24,144,255);
}
.searchTypeBtns.show .search-type-btn1 {
    transform: translate(-48px, -66px);
}
.searchTypeBtns.show .search-type-btn2 {
    transform: translateX(-100px);
}
.searchTypeBtns.show .search-type-btn3 {
    transform: translate(-48px, 66px);
}


.four-card {
    display: flex;
    margin-bottom: 10px;
}
.four-card > .card-item + .card-item {
    margin-left: 10px;
}
.card-item {
    flex: 1;
    padding: 20px 24px 8px;
    background-color: #fff;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    font-variant: tabular-nums;
    font-feature-settings: "tnum";
    border-radius: 2px;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.card-item-tle {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
}
.card-item-tle > span:first-of-type {
    color: rgba(0, 0, 0, 0.45);
}
.card-item-numble {
    color: rgba(0, 0, 0, 0.85);
    font-size: 30px;
    line-height: 38px;
    padding: 6px 0 20px;
    flex: 1;
}
.card-item-rate {
    border-top: 1px solid #e8e8e8;
    padding-top: 8px;
}
.chart-form {
    background: #fff;
    border-radius: 2px;
    transition: all 0.3s;
}
.chart-form-tle {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 24px;
}
.chart-form-tle > span:first-of-type {
    color: rgba(0, 0, 0, 0.85);
    font-size: 16px;
}
.chart-form-tle .more {
    cursor: pointer;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
}
.chart-form-main {
    padding: 0 24px 24px;
    margin-top: -10px;
    position: relative;
    min-height: 210px;
}
.rank-form-empty{
    position: absolute;
    background-color: #fff;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #888;
}
.chart-form-th {
    display: flex;
    justify-content: space-between;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.65);
}

.card-rate1{color:#479ff7;}
.card-rate2{color:#64da8b;}
.card-rate3{color:rgb(254, 190, 107);}
.card-rate4{color:#ff895e;}

.two-chart-graphics{
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}
.two-chart-rank{
     display: flex;
    justify-content: space-between;
}
.two-chart-graphics > div:first-of-type {
    width: 65%;
}
.two-chart-graphics > div:last-of-type {
    flex: 1;
    margin-left: 10px;
}
.two-chart-rank > div {
    width: calc(50% - 5px);
}

.chart-form-main .chart-form-th + .chart-form-th {
    padding-top: 16px;
}
.num-small3 {
    color: #fff;
    background-color: #314659;
    border-radius: 10px;
    text-align: center;
}
.num-more3 {
    text-align: center;
    border-radius: 10px;
    background-color: #f5f5f5;
    color: #fff;
}
.num1 {
    background-color: #f54949;
}
.num2 {
    background-color: #f5993d;
}
.num3 {
    background-color: #f5da56;
}
.num4,
.num5 {
    background-color: #b1cbe6;
}

.hoverBox{
    transition: box-shadow .3s linear;
}
.hoverBox:hover{
   box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 四个卡片 */
/* .dataCard{
    width:100%;
    display:flex;
    justify-content:space-between;
    flex-wrap: wrap;
    align-content:space-between;
} */

</style>
