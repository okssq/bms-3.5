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
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    height:600,
                    des:"tf中最近时间周期中未存在视频文件，如，起始时间为该车最后一条视频文件的上传时间，至该车最后在线时间，之间的时间间隔超过2天为tf异常。",
                    title:[
                        {name: "车辆ID",type: "",prop: "k1",width: "110px",fixed:true},
                        {name: "车牌号码",type: "",prop: "k2",width: "96px",fixed:true},
                        {name: "所属公司",type: "",prop: "k3",width: "180px",fixed:true},
                        {name: "开始时间",type: "",prop: "k6",width: "180px"},
                        
                        {name: "最后上线时间",type: "",prop: "k5",width: "180px"},
                        {name: "最后车辆上线地点",type: "",prop: "k4",width: "180px"},
                        {name: "损坏时间间隔（天）",type: "",prop: "k7",width: "150px"},
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
                    vehicleId     : '',
                    vehicleLicence: '',
                    companyId     : '',
                    page          : '1'
                }
                if(i){
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
                    url:'/report/tf_bad_report.json', 
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
                        k4:el.poiName,
                        k5:el.stopTime,
                        k6:el.playTime,
                        k7:el.day,
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
