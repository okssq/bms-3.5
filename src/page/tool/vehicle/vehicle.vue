<template>
    <div v-loading="loading" class="operation">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt-btn">
                <button class="dbtn dbtn-blue" @click="EVT_something_del">批量删除</button>
            </div>
            <Table 
                :props="DATA_tbProps" 
                @setPage="GET_page" 
                @delOne="EVT_delOne" 
                @setTable="GET_table" 
                @AIsetting="EVT_setting"
                @unbind ="EVT_unbind"
            />
        </div>
        <div class="dAlertBox" v-if="dAlertIsShow">
            <div class="dAlert-bg"></div>
            <div class="dAlert">
                <div class="dAlert-xxx" @click="EVT_closeDAlert"><i class="el-icon-error"></i></div>
                <div class="dAlert-cnt">
                    <router-view />
                </div>
               
            </div>
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
                    {name:"车牌ID",type:"text",key:"vehicleId",value:"",maxlength:"11"},
                    { 
                        key: "companyId", 
                        name: "所属公司", 
                        type: "singleCompany", 
                        value: "" ,
                        options:[]
                    },
                    {name:"关联设备",type:"text",key:"terminalId",value:"",maxlength:"20"},
                    {name:"操作者",type:"select",key:"appUserId",value:"",options:[]},
                    {name:"操作日期",type:"date",key:"createTime",value:""},
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                        {name:"清除",key:"clear",model:"clear"}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {type:"selection",prop:"set",width:"50"},
                    {name:"ID",type:"",prop:"k1",width:""},
                    {name:"车牌号码",type:"",prop:"k2",width:""},
                    {name:"关联设备",type:"",prop:"k3",width:""},
                    {name:"所属公司",type:"",prop:"k4",width:""},
                    {name:"最后操作日期",type:"",prop:"k5",width:""},
                    {name:"最后操作者",type:"",prop:"k6",width:""},
                ],
                items:[],
                opeations:[
                    {name:"查看",evt:"seeEdit",path:"/tool-vehicle/detail"},
                    {name:"编辑",evt:"edit",path:"/tool-vehicle/detail"},
                    {name:"删除",evt:"remove"}
                ],
                page:{
                    // size :2,
                    total:0,
                },
            },
            checks:[],
            postData:[],
            dAlertIsShow:false,
            // 弹窗表格数据
            Set_DATA_tbProps:{
                schVal:'100',
                title:[
                    {name: "序号",type  : "",prop: "k1",width: ""},
                    {name: "启用状态",type: "",prop: "k2",width: ""},
                    {name: "报警类型",type: "",prop: "k3",width: ""},
                    {name: "展示方式",type: "",prop: "k4",width: ""},
                ],
                items:[],
                opeations:[
                    {name:"设置",evt:"AIsetting"},
                ],
                page:{
                    size :10,
                    total:0,
                },
            },    
        }
    },
    components:{
        'Menu'      : Menu,
        'Table'     : Table,
    },
    created(){
     
        let loginData =_mm.getStorage('login');
        // console.log('loginData',typeof loginData.companyId)
        if(loginData.roleId === '1' || loginData.companyId === '33'){
            this.DATA_tbProps.opeations.push(
                {name:"AI",evt:"AIsetting"},
                {name:'解绑',evt:'unbind'}
            );
        }
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
            this.DATA_menuProps.items[2]['options'] = arr;
            return arr;
        },
        fn_userList(res){
            let arr =[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push({value:res[i].userName,name:res[i].realName});
            }
            this.DATA_menuProps.items[4].options = arr;
        },

        //搜索按钮
        EVT_search(i){
            let postData = {
                appUserId : "",
                companyId : "",
                terminalId: "",
                vehicleId : "",
                vehicleLicence : "",
                createTime: '',
            };
            if(i){
                postData.appUserId   = i.appUserId;
                postData.companyId   = i.companyId;
                postData.createTime  = i.createTime;
                postData.terminalId  = i.terminalId;
                postData.vehicleId   = i.vehicleId;
                postData.vehicleLicence   = i.vehicleLicence;   
            }
            this.postData = postData;
            this.DATA_tbProps.page.sync = 1;
            // console.log(this.postData);
            this.ajax_search(postData);
        },
    
        
        
        
        //搜索接口
        ajax_search(set){
            this.loading = true;
            let _this=this;
            _mm.request({ 
                url:'/vehicle/vehicles.json', 
                data:set
            }).then((res)=>{
                let arr = [];
                for(let i=0,len=res.results.length;i<len;i++){
                    let set = res.results[i];
                    let _json  = {
                        set:{vehicleId:set.vehicleId,id:set.id},
                        k1:set.vehicleId,
                        k2:set.vehicleLicence,
                        k3:set.terminalId,
                        k4:set.companyName,
                        k5:set.createTime,
                        k6:set.realName
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
        //删除接口  
        ajax_del(set){
            let _this = this;
            this.loading = true;
            _mm.request({ 
                url:'/vehicle/del_vehicle_batch.json',  
                data:set
            }).then((res)=>{
                _this.ajax_search(this.postData);
                _this.loading = false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //解绑接口
        ajax_unbind(set){
            let _this = this;
            this.loading = true;
            _mm.request({ 
                url:'/vehicle/unbind_terminal.json',  
                data:set
            }).then((res)=>{
                _this.ajax_search(_this.postData);
                _mm.msgSss('解绑成功');
                _this.loading = false;
            },function(err){
                _mm.msgErr('解绑失败');
                console.log(err);
                _this.loading=false;
            })
        },
        
        //关闭每个车辆ai打开的窗口
        EVT_closeDAlert(){
            this.$store.commit('update_zIndexTop','nav');
            this.dAlertIsShow = false;
            window.history.back();
        },
        
        
        //清除按钮
        EVT_clear(){this.checks=[];},
        //批量删除
        EVT_something_del(){
            let arr=[];
            let data= this.checks;
            for(let i=0,len=data.length;i<len;i++){
                arr.push(data[i].vehicleId);
            }
            if(arr.length ===0){
                _mm.msgErr('请至少选择一条数据');    
                return
            }
            _mm.confirmBox({
                info:"真的要删除吗？",
                callBOk:function(){
                    let strArr = JSON.stringify(arr);
                    let postdata={ ids :strArr};
                    // console.log('删除postdata',postdata);
                    this.ajax_del(postdata);    
                }
            });
        },
        //删除单个
        EVT_delOne(item){
            let arr= [item.vehicleId];      
            let strArr =JSON.stringify(arr);
            let postdata={ids:strArr};
            // console.log('postdata',postdata);
            this.ajax_del(postdata);
        },
        //AI按钮
        EVT_setting(item){
            this.$store.commit('update_zIndexTop','main');
            this.dAlertIsShow=true;
            this.$router.push({path:'tool-vehicle/ai-setting',query:item.set});
        },
        //设置按钮
        Set_EVT_setting(item){
            // console.log('设置的item',item);
        },
        //解绑按钮
        EVT_unbind(vid){
            let arr= [vid];      
            let strArr =JSON.stringify(arr);
            let postdata={ids:strArr};
            this.ajax_unbind(postdata);
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
        },
        Set_GET_page(data){

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
