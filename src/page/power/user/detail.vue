<template>
    <div class="operation" v-loading="loading">
        <div class="cnt zoom">
            <Form :props="DATA_formProps" @setForm="GET_form" @setCancel="GET_cancel"/>
        </div>
    </div>
</template>

<script>

import Form from 'components/form/form.vue';
import Server from 'service/mm.jsx';

const _mm = new Server();

export default{
    data() {
        return {
            tle:'',
            loading: true,
            routData:{},
            userId :'',
            DATA_formProps: {
                btn:{
                    show:true
                },
                list:[
                    [
                        {name:"子公司名称",type:"select",key:"id",value:"",required:true,options:[],EVT_change:this.EVT_select_company},
                        {name:"角色",type:"select",key:"roleId",value:"",required:true,options:[]},
                        {name:"用户名",type:"text",key:"userName",value:"",required:true},
                        {name:"真实姓名",type:"text",key:"realName",value:"",required:true},
                        {name:"密码",type:"password",key:"userPassword",value:"",required:true},
                        {name:"请重复密码",type:"password",key:"confirmUserPassword",value:"",required:true}
                    ],
                    [
                        {name:"联系电话",type:"text",key:"telephone",value:""},
                        {name:"邮箱",type:"text",key:"email",value:""},
                        {name:"通讯地址",type:"text",key:"address",value:""},
                    ]
                ]
            },
            resData:{}
        };
    },
    components:{
        'Form':Form
    },

    created(){
     
        this.ajax_companys_list();  
        this.DATA_formProps.type = this.$route.query.type;

        if(this.DATA_formProps.type === "add" ){
            this.tle = '新增用户'; 
            this.loading=false;
            this.DATA_formProps.list[0][1].options={name:'普通用户',value:'3'}
        }

        if(this.DATA_formProps.type === "view"){
            this.DATA_formProps.btn.show =false;
            this.tle = '查看用户'; 
            this.userId = this.$route.query.userId;
            this.DATA_formProps.list.forEach((el,index)=>{
                for(let i=0;i<el.length;i++){
                    el[i].disabled = true;
                }
            });

            if(this.userId){
                this.ajax_editOrView({userId:this.userId});
            }
            else{
                this.$router.push({path:'/power-user'})
            }    
        }
        else if(this.DATA_formProps.type === "edit"){
            this.tle = '编辑用户'; 
            this.userId = this.$route.query.userId;
            this.DATA_formProps.list[0][0].disabled = "disabled";
            this.DATA_formProps.list[0][1].disabled = "disabled";
            if(this.userId){
                this.ajax_editOrView({userId:this.userId});
            }
            else{
                this.$router.push({path:'/power-user'})
            }
        }
               
    },
    methods:{
        EVT_select_company(item){
            if(!item.value)return;
            this.DATA_formProps.list[0][1].value = "";
            this.ajax_role_list({companyId:item.value});
        },
        //回掉 表格 保存按钮
        GET_form(data){
            if(data.userPassword !== data.confirmUserPassword){
                _mm.msgErr('两次密码不一致');
                return ;
            }
            let propsData  =data;
            propsData.type =1 ;
            // console.log("data",data)
            this.ajax_updateInfo(data);
        },
        //取消按钮
        GET_cancel(){
          
            let _crumbs = [
                {name:"权限管理",to:"",key:"1"},
                {name:"用户权限管理",to:"/mng-user/user",key:"2"},
            ];
            this.$emit("setlayout",[
                {type:"crumbs",data:_crumbs},
            ]);
            this.$router.push({path:'/power-user'});
        },

        //获取公司列表
        ajax_companys_list(){
            let _this = this;
            _mm.request({ 
                url:'/company/companys.json', 
                async:false
            }).then((res)=>{
                let arr =[];
                for(let i=0,len=res.length;i<len;i++){
                    arr.push({value:res[i].id,name:res[i].companyName});
                }
                _this.DATA_formProps.list[0][0].options = arr;
            })
        },
        //获取角色列表
        ajax_role_list(set){
            let _this = this;
            _mm.request({ 
                url:'/user/company_role_list.json',
                data:set,
                async:false
            }).then((res)=>{
                let arr =[];
                for(let i=0,len=res.length;i<len;i++){
                    arr.push({value:res[i].roleId,name:res[i].roleName});
                }
                _this.DATA_formProps.list[0][1].options = arr;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //查看编辑接口
        ajax_editOrView(data){
            let _this = this;
            this.loading=true;
            _mm.request({ 
                url:'/user/user_detail.json', 
                data:data
            }).then((res)=>{
                _this.ajax_role_list({companyId:res.companyId});
                _this.DATA_formProps.list[0][0].value =   res.companyId;
                _this.DATA_formProps.list[0][1].value =   res.roleId;
                _this.DATA_formProps.list[0][2].value =   res.userName;
                _this.DATA_formProps.list[0][3].value =   res.realName;
                _this.DATA_formProps.list[0][4].value =   '******';
                _this.DATA_formProps.list[0][5].value =   '******';
                _this.DATA_formProps.list[1][0].value =   res.telephone;
                _this.DATA_formProps.list[1][1].value =   res.email;
                _this.DATA_formProps.list[1][2].value =   res.address;
                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //更新用户信息接口
        ajax_updateInfo(data){   
            let _this = this;
            this.loading=true;
            let propsData = data ;
            if(this.DATA_formProps.type === "edit"){
                propsData.userId =this.userId;
                if(propsData.userPassword.indexOf("*")!==-1){
                    propsData.userPassword='';
                }
                if(propsData.confirmUserPassword.indexOf("*")!==-1){
                    propsData.confirmUserPassword='';
                }  
            }
            _mm.request({ 
                url:'/company/add_update_company.json', 
                data:propsData
            }).then((res)=>{
                _this.loading=false;
                _mm.msg('更新成功');
                _this.$router.push({path:'/power-user'});
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },

    }
    
}
</script>

<style scoped>
    .hbody>.cnt{border:1px solid #DAE0E6;}

    
    
</style>
