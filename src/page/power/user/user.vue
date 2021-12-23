<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt-btn">
                <button class="dbtn dbtn-blue" @click="EVT_delSomething">批量删除</button>
                <button class="dbtn dbtn-blue" @click="EVT_add">新增用户</button>
            </div>
            <Table :props="DATA_tbProps" @setTable="GET_table" @delOne="EVT_delOne"  @setPage="GET_page" />
        </div>
        <sel-cars :propsRef="selCars" v-if="selCars.is" />
    </div>
</template>

<script>

import Menu     from 'components/schMenu/menu.vue';
import Table    from 'components/list/table.vue';
import SelCars  from './selectCars.vue';
import Server   from 'service/mm.jsx';

const _mm = new Server();

export default{
    data(){
        return {
            loading:true,
            DATA_menuProps:{
                title:"用户权限管理",
                items:[
                    { 
                        key: "companyId", 
                        name: "所属公司", 
                        type: "singleCompany", 
                        value: "" ,
                        options:[]
                    },
                    {name:"角色",type:"select",key:"roleId",value:"",options:[]},
                    {name:"创建日期",type:"date",key:"createTime",value:""},
                    {name:"用户名",type:"text",key:"userName",value:""},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",value:"search",cls:"dbtn-blue"},
                        {name:"清除",key:"clear",value:"clear"}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {type:"selection",prop:"k0",width:"50"},
                    {name:"用户名",type:"",prop:"k1",width:""},
                    {name:"所属公司",type:"",prop:"k2",width:""},
                    {name:"角色",type:"",prop:"k3",width:""},
                    {name:"最后登录日期",type:"",prop:"k4",width:""},
                    {name:"访问次数",type:"",prop:"k5",width:""},
                ],
                items:[],
                opeations:[
                    {name:"查看",evt:"seeEdit",path:"/power-user/detail"},
                    {name:"编辑",evt:"edit",path:"/power-user/detail"},
                    {name:"分配车辆",evt:"selCars",fn:this.EVT_selCars},
                    {name:"删除",evt:"remove"}
                ],
                page:{
                    total:0
                }
            },
            checks:[],
            postData:{},  
            selCars:{
                is:false,
                data:{}
            }
        }
    },
    components:{
        'Menu'   : Menu,
        'Table'  : Table,
        'selCars': SelCars
    },
    created(){
        this.fn_init();
    },
  
    methods:{
        EVT_selCars(i){
            this.selCars.is = true;
            this.selCars.data.id = i.set.userId;
            this.$store.commit("update_zIndexTop", "main");
        },

        //回调-表格
        GET_table(data){
            this.checks = data;
        },
        //回调-页码
        GET_page(data){
            this.postData.page =data;
            this.DATA_tbProps.page.sync = data;
            this.ajax_search( this.postData);
        },

        // 初始化事件
        async fn_init(){
            let companyList = await this.ajax_company_level();
            let roleList    = await this.ajax_role_list();
            this.fn_companyTree_list(companyList);
            this.fn_roleList(roleList);
            this.EVT_search();
        },
        //获取公司列表
        ajax_company_level(){
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
        //获取角色列表接口
        ajax_role_list(){
            let _this= this;
            return new Promise((resolve, reject) => {
                _mm.request({ 
                    url:'/user/role_list.json', 
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
        fn_roleList(res){
            let arr =[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push({value:res[i].roleId,name:res[i].roleName});
            }
            this.DATA_menuProps.items[1].options = arr;
        },
        //查询接口--带有分页
        ajax_search(set){
            let _this= this;
            this.loading = true;
            _mm.request({ 
                url:'/user/users.json', 
                data:set
            }).then((res)=>{
                let arr=[];
                for(let i=0,len=res.results.length;i<len;i++){
                    let set = res.results[i];
                
                    let _json  = {
                        set:{userId:set.userId,roleId:set.roleId},
                        k1:set.userName,
                        k2:set.companyName,
                        k3:set.roleName,
                        k4:set.createTime,
                        k5:set.number ? set.number : 0
                    };
                    arr.push(_json);
                }
                _this.DATA_tbProps.page.total=res.totalCount;
                _this.DATA_tbProps.items = arr;
                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //删除接口
        ajax_del(data){
            let _this = this;
            this.loading = true;
            _mm.request({ 
                url:'/user/del_user_batch.json', 
                data:data
            }).then((res)=>{
                _this.EVT_search(_this.postData);
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },

        //搜索按钮
        EVT_search(i){
            let postData = {
                companyId : "",
                roleId    : "",
                createTime: "",
                userName  : "",
            };
            if(i){
                postData.companyId   = i.companyId;
                postData.roleId      = i.roleId;
                postData.createTime  = i.createTime;
                postData.userName    = i.userName;
            }
            this.postData   = postData;
            this.DATA_tbProps.page.sync = 1;
            this.ajax_search(this.postData);
        },
        //清除按钮
        EVT_clear(){
            this.checks=[];
        },
        //删除单个按钮
        EVT_delOne(item){
          
            let arr = [item.userId];
            let data = JSON.stringify(arr);
            let postdata = {'ids' : data}
            // console.log('postdata',postdata);
            this.ajax_del(postdata);
        },
        //批量删除按钮
        EVT_delSomething(){
            let _this = this;
            let arr=[];
            for(let i=0,len=_this.checks.length;i<len;i++){
                if(_this.checks[i].roleId ==="2"){
                    _mm.msgErr('管理员角色不可删除'); 
                    return;
                }
                else if(_this.checks[i].roleId ==="1"){
                    _mm.msgErr('超管不可删除'); 
                    return;
                }
                arr.push(_this.checks[i].userId);
            }
            if(arr.length ===0){
                _mm.msgErr('请至少选择一条数据'); 
                return
            }
            _mm.confirmBox({
                info:"真的要删除吗？",
                callBOk:function(){
                    let data = JSON.stringify(arr);
                    let postdata = {'ids' : data};
                    _this.ajax_del(postdata);    
                }
            });
        },
        //新增用户按钮
        EVT_add(){
            this.$router.push({path:'/power-user/detail',query:{type:"add"}});
        },

        

        

        
        
        
        

        
    }
    
}
</script>

<style scoped>
    .schCnt-btn{margin-top: 10px;}
</style>
