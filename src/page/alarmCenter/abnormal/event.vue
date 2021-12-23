<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <Table :props="DATA_tbProps" @setPage="GET_page"/>
        </div>
    </div>
</template>


<script>
    import Menu from 'components/schMenu/menu.vue';
    import Table    from 'components/list/table.vue';
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    const picker  = {               //选择日期范围限制
        disabledDate(time) {
            return (time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime() - 1) || time.getTime() <
                new Date((new Date()).getTime() - 86400000 * 60));
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
                        {   
                            name:"选择日期",
                            type:"datetimerange",
                            key:"time",
                            value:[_mm.getDate({type:"yesterdayFirst_seven"}),_mm.getDate({type:"yesterdayLast_all"})],picker:picker
                        },
                        {name:"车辆ID",type:"text",key:"vehicleId",value:'',maxlength:11},
                        {name:"车牌号码",type:"license_search",key:"vehicleLicence",value:''},
                        { 
                            key: "companyId", 
                            name: "所属公司", 
                            type: "singleCompany", 
                            value: "" ,
                            options:[]
                        },
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                            {name:"清除",key:"clear",model:"clear"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    height:500,
                    des:"行驶车辆最近时间内(默认七天),报警率小于5%的车辆信息。",
                    title:[
                        {name: "车辆ID",type: "",prop: "k1",width: "110px",fixed:true},
                        {name: "车牌号码",type: "",prop: "k2",width: "96px",fixed:true},
                        {name: "所属公司",type: "",prop: "k3",width: "180px",fixed:true},
                        {name: "总里程（km）",type: "",prop: "k4",width: "120px"},
                        {name: "总报警（条）",type: "",prop: "k5",width: "120px",center:true},
                        {name: "报警率 （总报警/总里程 %）",type: "",prop: "k6",width: "220px",center:true},
                        {name: "时间",type: "",prop: "k7",width: "180px"},
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
                this.DATA_menuProps.items[3]['options'] = arr;
                return arr;
            },
            //搜索按钮
            EVT_search(i){
                let _this = this;
                let data ={
                    startTime     : '',
                    endTime       : '',
                    vehicleId     : '',
                    vehicleLicence: '',
                    companyId     : '',
                    page          : '1'
                }
                if(i){
                    data.startTime      = i.time.start;
                    data.endTime        = i.time.end;
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
                    url:'/report/warn_percentage_report.json', 
                    data:data
                }).then((res)=>{
                    if(res.results.length === 0){
                        _this.DATA_tbProps.items      = [];
                        _this.DATA_tbProps.page.total = 0;
                        _this.loading                 = false;
                        return;
                    }
                    _this.fn_TBList(res);    //渲染表格
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
                        k1:el.vehicleId,
                        k2:el.vehicleLicence,
                        k3:el.companyName,
                        k4:el.sumMileage,
                        k5:el.countWarn,
                        k6:el.percentage,
                        k7:el.time,
                    });
                });
                _this.DATA_tbProps.page.total = res.totalCount;
                _this.DATA_tbProps.items      = arr;
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
