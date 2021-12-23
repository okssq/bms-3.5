<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt">
                <div class="schCnt-btn">
                    <button class="dbtn dbtn-blue" @click="EVT_del_someThing">批量删除</button>
                    <button class="dbtn dbtn-blue" @click="EVT_add">新增司机</button>
                </div>
            </div>
            <Table :props="DATA_tbProps" @setTable="GET_table" @setPage="GET_page" @delOne="EVT_del"/>
        </div>   
    </div>
</template>

<script>

import Menu     from 'components/schMenu/menu.vue';
import Table    from 'components/list/table.vue';
import Server   from 'service/mm.jsx';

const _mm = new Server();
let picker = {
    disabledDate(time){
        return time.getTime() > new Date() || time.getTime() < new Date((new Date()).getTime()-86400000*60);
    }
};

export default{
    data(){
        return {
            loading:false,
            DATA_menuProps:{
                title:"司机管理",
                items:[
                    { 
                        key: "companyId", 
                        name: "所属公司", 
                        type: "singleCompany", 
                        value: "" ,
                        options:[]
                    },
                    {
                        name:"关联车辆",
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
                    {name:"司机姓名",type:"text",key:"driverName",value:"",options:[]},
                    {name:"操作者",type:"select",key:"createUuid",value:"",options:[]},
                    {name:"操作日期",type:"date",key:"updateTime",value:"",picker:picker},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                        {name:"清除",key:"clear",model:"clear"}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {type:"selection",prop:"set",width:"50"},
                    {name:"司机姓名",type:"",prop:"k1",width:""},
                    {name:"关联车辆",type:"",prop:"k2",width:""},
                    {name:"所属公司",type:"",prop:"k3",width:""},
                    {name:"最后操作日期",type:"",prop:"k4",width:""},
                    {name:"最后操作者",type:"",prop:"k5",width:""},
                ],
                items:[],
                opeations:[
                    {name:"查看",evt:"seeEdit",path:"tool-driver/detail"},
                    {name:"编辑",evt:"edit",path:"tool-driver/detail"},
                    {name:"删除",evt:"remove"}
                ],
                page:{
                    size:10,
                    total:0
                }
            },
            checks:[],
            postData:{
                companyId:"",
                vehicleId:"",
                driverName:"",
                createUuid:"",
                updateTime:""
            }
        }
    },
    components:{
        'Menu'      : Menu,
        'Table'     : Table
    },
    created(){
        this.fn_init();
    },
    methods:{
        // 初始化事件
        async fn_init(){
            let companyList = await this.ajax_company_level();
            let userList    = await this.ajax_app_user();
            this.fn_companyTree_list(companyList);
            this.fn_userList(userList);
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
        //获取操作者
        ajax_app_user(){
            let _this= this;
            return new Promise((resolve, reject) => {
                _mm.request({ 
                    url:'/vehicle/app_user_info.json', 
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
            this.DATA_menuProps.items[0]['options'] = arr;
            return arr;
        },
        fn_userList(res){
            let arr =[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push({value:res[i].userName,name:res[i].realName});
            }
            this.DATA_menuProps.items[3].options = arr;
        },
        //搜索按钮
        EVT_search(i){
            if(i){
                this.postData.companyId  = i.companyId;
                this.postData.vehicleId  = i.vehicleId;
                this.postData.driverName = i.driverName;
                this.postData.createUuid = i.createUuid;
                this.postData.updateTime = i.updateTime;
            }
            this.DATA_tbProps.page.sync = 1;
            this.ajax_search(this.postData);
        },
        //批量删除
        EVT_del_someThing(){
            let _this = this;
            if(!_this.checks || _this.checks.length === 0){
                _mm.msgErr("请至少选择一条数据");
                return;
            }

            _mm.confirmBox({
                 info:"真的要删除吗？",
                 callBOk:function(){
                    let arr = [];
                    _this.checks.forEach((el,index)=>{
                        arr.push(el.driverId);
                    });
                    let propsData = {ids:JSON.stringify(arr)};
                    _this.ajax_del(propsData);
                 }
            });
        },
        //新增用户按钮
        EVT_add(){
            this.$router.push({path:'tool-driver/detail',query:{type:"add"}});
        },
         //单个删除按钮
        EVT_del(data){
            let arr = [data.driverId];
            let postData = {
                ids:JSON.stringify(arr)
            };
            this.ajax_del(postData);
        },

        //回调-表格
        GET_table(data){
            this.checks = data;
        },
        //回调-分页
        GET_page(i){
            this.postData.page = i;
            this.DATA_tbProps.page.sync = i;
            this.ajax_search(this.postData);
        },

        //获取表格
        ajax_search(data){
            let _this = this;
            _this.loading = true;
            _mm.request({ 
                url:'/driver/driver_list.json', 
                data:data
            }).then((res)=>{
                _this.loading = false;
                let arr=[];
                let _items = _mm.format_arr(res.results);
                for(let i=0,len=_items.length;i<len;i++){
                    arr.push({
                        set:_items[i],
                        k1 :_items[i].driverName,
                        k2 :_items[i].vehicleLicence,
                        k3 :_items[i].companyName,
                        k4 :_items[i].updateTime,
                        k5 :_items[i].realName  ,
                    })
                }
                _this.DATA_tbProps.items      = arr;
                _this.DATA_tbProps.page.total =  res.totalCount;
            })
        },
        
        //删除接口--------------------
        ajax_del(set){
            let _this = this;
            _mm.request({ 
                url:'/driver/del_driver_batch.json', 
                data:set
            }).then((res)=>{
                _mm.msg("操作成功");
                _this.EVT_search();
            })
        },
    }
    
}
</script>

<style scoped>
    .schCnt-btn{margin-top: 10px;}
</style>
