<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <div class="h-tle">事故报表</div>
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt">
                <div class="schCnt-result">共搜索到<span>{{DATA_tbProps.page.total}}</span>条数据</div>
            </div>
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
                        {name:"车辆id",type:"text",key:"vehicleId",value:'',maxlength:11},
                        {name:"车牌号码",type:"text",key:"vehicleLicence",value:''},
                        {name:"所属公司",type:"select",key:"companyId",value:"",options:[]},
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    title:[
                        {name: "车辆ID",type: "",prop: "k1",width: ""},
                        {name: "车牌号码",type: "",prop: "k2",width: ""},
                        {name: "所属公司",type: "",prop: "k7",width: ""},
                        {name: "事故时间",type: "",prop: "k3",width: ""},
                        {name: "事故内容",type: "",prop: "k4",width: ""},
                        {name: "事故地点",type: "",prop: "k5",width: ""},
                        {name: "是否结案",type: "",prop: "k6",width: ""},
                        {name: "结案金额(元)",type: "",prop: "k8",width: ""}
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
            this.ajax_companys_list();
        },
        methods:{
            //获取公司列表
            ajax_companys_list(){
                let _this = this;
                _mm.request({ 
                    url:'/company/companys.json', 
                    async:false
                }).then((res)=>{
                    let arr =[];
                    for(let i=0,len=res.length;i<len;i++){
                        arr.push({value:res[i].companyId,name:res[i].companyName});
                    }
                    _this.DATA_menuProps.items[2].options = arr;
                    _this.EVT_search();
                })
            },
            //搜索按钮
            EVT_search(i){
                // let _this = this;
                // let data ={
                //     vehicleId     : '',
                //     vehicleLicence: '',
                //     companyId     : '',
                //     page          : '1'
                // }
                // if(i){
                //     data.vehicleId      = i.vehicleId; 
                //     data.vehicleLicence = i.vehicleLicence; 
                //     data.companyId      = i.companyId;
                // }
                // _this.postData               = data;
                // _this.DATA_tbProps.page.sync = 1;
                // _this.ajax_search(data);
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