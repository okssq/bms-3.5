<template>
    <div v-loading="loading" class="operation">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <Table 
                :props="DATA_tbProps"
                @setPage="GET_page" 
                @setTable="GET_table" 
             />
        </div>
        
    </div>
</template>

<script>

import Menu     from 'components/schMenu/menu.vue';
import Table    from 'components/list/table.vue';

import Server from 'service/mm.jsx';
const _mm = new Server();

export default{
    data(){
        return {
            loading :false ,
            DATA_menuProps:{
                title:"车辆管理",
                items:[
                    {name:"车牌号码",type:"license_search",key:"vehicleLicence",value:""},
                    {name:"终端ID",type:"text",key:"terminalId",value:"",maxlength:"15"},
                    {name:"ICCID",type:"text",key:"iccid",value:"",maxlength:"20"},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                        {name:"清除",key:"clear",model:"clear"}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {name:"序号",type:"",prop:"k1",width:"80px"},
                    {name:"车牌号码",type:"",prop:"k2",width:""},
                    {name:"所属公司",type:"",prop:"k3",width:""},
                    {name:"iccid",type:"",prop:"k4",width:""},
                    {name:"终端id",type:"",prop:"k5",width:""},
                    {name:"装机时间",type:"",prop:"k6",width:""},
                    {name:"最近上线时间",type:"",prop:"k7",width:""},
                ],
                items:[],
                page:{
                    // size :2,
                    total:0,
                },
            },
            checks:[],
            postData:[],
        }
    },
    components:{
        'Menu'      : Menu,
        'Table'     : Table
    },
    mounted(){
        this.EVT_search();
    },
    methods:{

        //搜索接口
        ajax_search(set){
            this.loading = true;
            let _this=this;
            _mm.request({ 
                url:'/iccid/iccid_list.json', 
                data:set
            }).then((res)=>{
                let arr = [];
                for(let i=0,len=res.results.length;i<len;i++){
                    let set = res.results[i];
                    let _json  = {
                        set:{terminalId:set.terminalId,iccid:set.iccid},
                        k1:i+1,
                        k2:set.vehicleLicence,
                        k3:set.companyName,
                        k4:set.iccid,
                        k5:set.terminalId,
                        k6:set.createTime,
                        k7:set.updateTime
                    };
                    arr.push(_json);
                }
                _this.DATA_tbProps.page.total =res.totalCount;
                _this.DATA_tbProps.items = arr;
                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        
        //搜索按钮
        EVT_search(i){
            let postData = {
                terminalId: "",
                iccid : "",
                vehicleLicence : "",
            };
            if(i){
                postData.iccid       = i.iccid;
                postData.terminalId  = i.terminalId;
                postData.vehicleLicence   = i.vehicleLicence;   
            }
            this.postData = postData;
            this.DATA_tbProps.page.sync = 1;
            // console.log(this.postData);
            this.ajax_search(postData);
        },

        //回调-表格
        GET_table(data){
            this.checks = data;
        },

        //回调-分页
        GET_page(data){
            this.postData.page=data;
            this.DATA_tbProps.page.sync = data;
            this.ajax_search(this.postData);
        }

    }
    
}
</script>

<style scoped>
    .schCnt-btn{margin-top: 10px;}
    .dAlert{box-shadow: 0 2px 2px rgba(0,0,0,.2);width: 1100px;height:80%; background:#fff;position: fixed;left: calc(50% - 550px);top:10%;z-index: 1001; padding: 20px 10px 20px 20px;}
    .dAlert-bg{position: fixed; width: 100%;height: 100%;content: '';display: block;background-color: rgba(0,0,0,.3);left: 0;top: 0;z-index: 1000;}
    .dAlert-xxx{position: absolute;top:0; right: -50px;width: 50px;height: 50px;padding-left: 10px;cursor: pointer;}
    .dAlert-xxx i {font-size: 40px;color:#fff;font-weight: 100;}
    .dAlert-cnt{overflow-y: scroll;overflow-x: hidden;width: 100%;height: 100%;padding-right: 10px;}
</style>
