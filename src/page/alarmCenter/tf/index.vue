<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search"/>
        </div>
        <div class="dcharts">
            <div class="dchart-tle">TF卡状态报表</div>
            <div class="d-speeding">
                <div class="dchart-unit" ><span>容量(G)</span></div>
                <ve-histogram 
                    width="100%"
                    height="100%"
                    :data-empty="echartData.series[0].data.length === 0"
                    :tooltip="echartData.tooltip"
                    :grid="echartData.grid"
                    :xAxis="echartData.xAxis"
                    :yAxis="echartData.yAxis"
                    :series="echartData.series"
                    :legend="echartData.legend"
                    :toolbox="echartData.toolbox"
                />
            </div>
        </div>
        <div class="dTble">
            <!-- <div class="schCnt">
                
                <div class="schCnt-btn">
                    <el-button @click="EVT_download" type="primary">导出</el-button>
                </div>
            </div> -->
            <Table :props ="DATA_tbProps" @setPage="GET_page"/>
        </div>  
    </div>
</template>

<script>
  
    import Menu     from 'components/schMenu/menu.vue';
    import Table    from 'components/list/table.vue';
    import Server   from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        data(){
            return {
                loading: false,
                DATA_menuProps:{
                    title:"报警记录",
                    items:[
                        {
                            name:"车牌号码",
                            type:"vehicleList",
                            key:"strVehicleIds",
                            value:[],
                            init:{
                                tab:{//标签选项卡
                                    is:false,//是否开启
                                },
                                tree:{//树型结构
                                    isCheckbox:true,//开启多选（默认：false）
                                    loading:true,//加载动画（默认：false）
                                }
                            }
                        },
                        { 
                            key: "tfStatus", 
                            name: "插入状态", 
                            type: "select", 
                            value: "" ,
                            options:[
                                {name:"未插入",value:"0"},
                                {name:"已插入",value:"1"},
                            ]
                        },
                        { 
                            key: "warnStatus", 
                            name: "存储状态", 
                            type: "select", 
                            value: "" ,
                            options:[
                                {name:"异常",value:"0"},
                                {name:"正常",value:"1"},
                            ]
                        },
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                            {name:"清除",key:"clear",model:"clear"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    title:[
                        {name:"车牌号码",type:"",prop:"k2",width:""},
                        {name:"所属公司",type:"",prop:"k3",width:""},
                        {name:"监听时间",type:"",prop:"k5",width:""},
                        {name:"插入状态",type:"",prop:"k6",width:""},
                        {name:"存储总量(GB)",type:"",prop:"k7",width:""},
                        {name:"已使用量(GB)",type:"",prop:"k8",width:""},
                        {name:"剩余使用量(GB)",type:"",prop:"k9",width:""},
                        {name:"存储状态",type:"",prop:"k10",width:""},
                        {name:"备注",type:"",prop:"k11",width:""},
                    ],
                    opeations:[
                        {name:"详情",evt:"seeEdit",path:"/alarm-tcard/detail"}
                    ],
                    items:[],
                    page:{
                        size:10,
                        total:0
                    }
                },
                echartData:{
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data:['已使用量','剩余使用量']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis : [
                        {
                            type : 'category',
                            // data : ['浙A12340','浙A12341','浙A12342','浙A12343','浙A12344','浙A12345','浙A12346','浙A12347','浙A12348','浙A12349'],
                            data:[]
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            axisLine: {
                                show:true,
                                lineStyle: {
                                    color: "#333"
                                }
                            },
                        }
                    ],
                    series : [
                        {
                            name:'已使用量',
                            type:'bar',
                            stack: '容量',
                            // data:[1,2,3,4,5,6,7,8,9,10],
                            data:[],
                            barWidth:40,
                            itemStyle:{
                                color:"#26a0da"
                            }
                        },
                        {
                            name:'剩余使用量',
                            type:'bar',
                            stack: '容量',
                            barWidth:40,
                            // data:[1,2,3,4,5,6,7,8,9,10],
                            data:[],
                            itemStyle:{
                                color:"#ccc"
                            }
                        },
                    ]
                },
                postData: {
                    strVehicleIds:[],
                    tfStatus:'',
                    warnStatus:'',

                },
            }
        },
        components:{
            'Menu' : Menu,
            'Table': Table,
        },
        created(){
            this.EVT_search();
        },
        methods:{
            //搜索按钮事件
            EVT_search(i){
                let _this = this;
                let data ={
                    strVehicleIds : JSON.stringify([]),
                    warnStatus : '',
                    tfStatus   : '',
                    page      : '1',
                }

                if(i){
                    data.strVehicleIds       = JSON.stringify(i.strVehicleIds); 
                    data.warnStatus  = i.warnStatus; 
                    data.tfStatus  = i.tfStatus;
                }
                _this.postData               = data;
                _this.DATA_tbProps.page.sync = 1;
                _this.ajax_serach(data);
            },

            //搜索接口
            ajax_serach(set){
                let _this = this;
                _this.loading = true;
                _mm.request({
                    url:'/tf/tf_status_info.json',
                    data:set
                }).then((res)=>{
                    if (res.results.length === 0) {
                        _this.DATA_tbProps.items        = [];
                        _this.DATA_tbProps.page.total   = 0;
                        _this.echartData.xAxis[0].data  = [];
                        _this.echartData.series[0].data = [];
                        _this.echartData.series[1].data = [];
                        _this.loading = false;
                        return;
                    }
                    _this.fn_list(res);
                    _this.fn_echarts(res); //渲染echarts
                    _this.loading  = false;
                    
                },function(){
                    _this.loading = false;
                });
            },

            //fn-列表
            fn_list(res){
                let _this = this;
                let arr = [];
                res.results.forEach((el,index)=>{
                    arr.push({
                        set:{
                            vehicleId      : el.vehicleId,
                        },
                        k2: el.vehicleLicense,
                        k3: el.companyName,
                        k5: el.locationTime,
                        k6: el.tfStatus,
                        
                        k7: el.countData,
                        k8: el.useData,
                        k9: el.surplusData,
                        k10: el.warnStatus,
                        k11: el.remark
                    });
                });
                _this.DATA_tbProps.page.total = res.totalCount;
                _this.DATA_tbProps.page.size  = 10;
                _this.DATA_tbProps.items      = arr;
                
            },
            //渲染ECHARTS所需数据
            fn_echarts(res) {
                let _this = this;
                _this.echartData.xAxis[0].data = res.results.map(function (OLD_value) {
                    return OLD_value.vehicleLicense;
                })
                _this.echartData.series[0].data = res.results.map(function (OLD_value) {
                    return OLD_value.useData;
                })
                _this.echartData.series[1].data = res.results.map(function (OLD_value) {
                    return OLD_value.surplusData;
                })
            },
            //导出
            EVT_download(){
               _mm.msg("硬件正在升级中，预计11月中旬后可查询");
            },

            //分页点击
            GET_page(i) {
                this.postData.page          = i;
                this.DATA_tbProps.page.sync = i;
                this.ajax_serach(this.postData);
            }
        }
        
    }
</script>

<style scoped>
    .schCnt{min-height: 30px;}

    .dcharts{
        width: 100%;
        height: 460px;
        margin-top: 15px;
        position: relative;
    }
    .d-speeding{
        height: 360px; 
        position: relative;
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
        position: absolute;
        top:-8px;
        left:17px;
        height: 40px;
        display: flex;
        justify-content:space-between;
        align-items: center;
    }
</style>
