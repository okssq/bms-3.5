<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt">
                <div class="schCnt-btn">
                    <button class="dbtn dbtn-blue" @click="evt_export">导出报表</button>
                </div>
            </div>
            <Table :props="DATA_tbProps" @setPage="GET_page"/>
        </div>
    </div>
</template>
<script>
    import Menu from 'components/schMenu/menu.vue';
    import Table    from 'components/list/table.vue';
    import Server from 'service/mm.jsx';
    import qs from 'qs';
    const _mm = new Server();

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
                        {name:"车辆ID",type:"text",key:"vehicleId",value:'',maxlength:11},
                        {name:"车牌号码",type:"license_search",key:"vehicleLicence",value:''},
                        { 
                            key: "companyId", 
                            name: "所属公司", 
                            type: "singleCompany", 
                            value: "" ,
                            options:[]
                        },
                        {
                            name:"离线大于天数",
                            key :"day",
                            min : 1,
                            type:"number",
                            value:"2",
                        },
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                            {name:"清除",key:"clear",model:"clear"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    height:600,
                    des:'车辆最近一次上线时间到目前时间，时间周期相差大于2*24小时未上线的设备信息。',
                    title:[
                        {name: "车辆ID",type: "",prop: "k1",width: "96px",fixed:true},
                        {name: "车牌号码",type: "",prop: "k2",width: "96px",fixed:true},
                        {name: "所属公司",type: "",prop: "k3",width: "180px",fixed:true},
                        {name: "最近上线时间",type: "",prop: "k4",width: "150px"},
                        {name: "最近上线所在地点",type: "",prop: "k5",width: "180px"},
                        {name: "GPS坐标",type: "",prop: "k6",width: "180px"},
                        {name: "最近当天在线时长（时）",type: "",prop: "k7",width: "180px"},
                        {name: "最近当天在线总里程（km）",type: "",prop: "k8",width: "200px"},
                        {name: "离线天数（天）",type: "",prop: "k9",width: "120px"},
                    ],
                    items:[],
                    page:{
                        size :10,
                        total:0,
                    },
                },
                postData: {},
            }
        },
        created(){
            this.fn_init();
        },
        methods:{
            // 初始化事件
            async fn_init(){
                let companyList = await this.ajax_company_level();
                this.fn_companyTree_list(companyList);
                this.EVT_search();
            },
            ajax_company_level(){
                let _this = this;
                return new Promise((resolve, reject) => {
                    _mm.request({
                        url:'/company/company_level.json',
                    }).then((res)=>{
                        resolve(res);
                    },function(err){
                        reject(err)
                    });
                })
            },
            fn_companyTree_list(res){
                let arr = res;
                arr.forEach(el => {
                    el.name = el.companyName;
                    el.value = el.id;
                    el.actived = false;
                    if ((el.children || []).length) {
                        this.fn_companyTree_list(el.children);
                    }
                });
                this.DATA_menuProps.items[2]['options'] = arr;
                return arr;
            },
            //搜索按钮
            EVT_search(i){
                let _this = this;
                let data ={
                    day           : '2',
                    vehicleId     : '',
                    vehicleLicence: '',
                    companyId     : '',
                    page          : '1'
                }
                if(i){
                    data.day            = i.day;
                    data.vehicleId      = i.vehicleId; 
                    data.vehicleLicence = i.vehicleLicence; 
                    data.companyId      = i.companyId;
                }
                _this.postData               = data;
                _this.DATA_tbProps.page.sync = 1;
                _this.ajax_search(data);
            },
            //搜索接口
            ajax_search(data){
                let _this = this;
                _this.loading = true;
                _mm.request({ 
                    url:'/report/off_line_report.json', 
                    data:data
                }).then((res)=>{
                    if(res.results.length === 0){
                        _this.DATA_tbProps.items      = [];
                        _this.DATA_tbProps.page.total = 0;
                        _this.loading                 = false;
                        return;
                    }
                    _this.fn_TBList(res);    //渲染表格
                },function(err){
                    _this.fn_TBList({
                        totalCount:0,
                        results:[]
                    }); 
                })
            },
            //渲染表格所需数据
            fn_TBList(res){
                let _this = this;
                let arr = [];
                res.results.forEach((el,index)=>{
                    arr.push({
                        // set:{},
                        k1:el.vehicleId,
                        k2:el.vehicleLicence,
                        k3:el.companyName,
                        k4:el.endTime,
                        k5:el.poiName,
                        k6:el.gps,
                        k7:el.trackTimes,
                        k8:el.trackMileage,
                        k9:el.day
                        
                    });
                });
                this.DATA_tbProps.page.total = res.totalCount;
                this.DATA_tbProps.items      = arr;
                this.loading = false;
            },
            //分页点击
            GET_page(i){
                this.postData.page          = i;
                this.DATA_tbProps.page.sync = i;
                this.ajax_search(this.postData);
            },
            //导出报表按钮
            evt_export(){
                if((this.DATA_tbProps.items || []).length === 0 || this.DATA_tbProps.page.total === 0){
                    this.$message('当前搜索条件没有数据！');
                    return;
                }
                let {vehicleId,vehicleLicence,companyId,day} = this.postData;
                let str = qs.stringify({
                    vehicleId,
                    vehicleLicence,
                    companyId,
                    day
                });
                // console.log('str...',str);
                window.open(`/sicp/report/down_offline_report.json?${str}`);
            },
        },
    }
</script>

