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
        disabledDate(time){
            return time.getTime() > new Date((new Date()).getTime()-86400000) || time.getTime() < new Date((new Date()).getTime()-86400000*60);
        }
    };
    let dchart;
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
                        {name:"选择日期",type:"date",key:"time",value:_mm.getDate({type : 'yesterday'}),required:true,picker:picker},
                        {
                            name:"车牌号码",
                            type:"vehicleList",
                            key:"vehicleId",
                            value:'',
                            init:{
                                tab:{//标签选项卡
                                    is:false,//是否开启
                                },
                                tree:{//树型结构
                                    loading:true,//加载动画（默认：false）
                                    defaultProps:{//树型结构的标题字段
                                        label: 'labelState',
                                        children: 'children'
                                    },
                                }
                            }
                        },
                        { 
                            key: "companyId", 
                            name: "公司名称", 
                            type: "singleCompany", 
                            value: "" ,
                            options:[]
                        },
                        {name:'司机姓名',type:'text',key:'driverName',value:''},
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                            {name:"清除",key:"clear",model:"clear"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    title:[
                        {name: "日期",type: "",prop: "k1",width: ""},
                        {name: "车牌号码",type: "",prop: "k2",width: ""},
                        {name: "所属公司",type: "",prop: "k3",width: ""},
                        {name: "司机姓名",type: "",prop: "k4",width: ""},
                        {name: "事件总数",type: "",prop: "k5",width: ""},
                        {name: "里程",type: "",prop: "k6",width: ""},
                    ],
                    opeations:[
                        {name:"事件回放",evt:"seeEdit",path:"/gps-smartMap"},
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
            //获取公司列表
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
                    time      : '',
                    vehicleId : '',
                    page      : '1',
                    companyId : '',
                    driverName: ''
                }
                if(i){
                    data.time       = i.time; 
                    data.companyId  = i.companyId; 
                    data.vehicleId  = i.vehicleId;
                    data.driverName = i.driverName
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
                    url:'/report/warn_report.json', 
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
                    let data =JSON.stringify({vehicleId:el.vehicleId,time:_this.postData.time ? _this.postData.time : _mm.getDate({type : 'yesterday'}),vehicleLicence:el.vehicleLicence}); 
                    arr.push({
                        set:{set :data},
                        k1:el.time,
                        k2:el.vehicleLicence,
                        k3:el.companyName,
                        k4:el.driverName,
                        k5:el.countWarn,
                        k6:el.trackMileage
                        
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
        }
    }
</script>

<style scoped>
    .dcharts{width: 100%;height: 460px;background-color: rgb(250, 251, 251);margin-top: 15px;position: relative;}
    .d-speeding{width:100%;height: 360px; }
    .dcharts .dchart-tle{height:40px;line-height:40px;text-indent:30px;position:relative;font-size: 13px;font-weight: bold;}
    .dcharts .dchart-tle::before{content:"";display:block;width:6px;height:6px;position:absolute;left:18px;top:17px;background:#3496f8;}
    .dchart-tip{width:100%; height: 100%; text-align: center;color: #ccc;position: absolute;left: 0;top: 0; line-height: 400px;}
    .dchart-unit{width: calc(100% - 70px);height: 40px;position: relative;left: 40px;display: flex;justify-content:space-between;align-items: center;}
</style>
