<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <Table :props="DATA_tbProps" @setPage="GET_page" />
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
                items:[
                    { 
                        key: "userName", 
                        name: "用户名", 
                        type: "text", 
                        value: "" ,
                    },
                    {type:"btn",key:"btn",btns:[
                        {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                        {name:"清除",key:"clear",model:"clear"}
                    ]}
                ]
            },
            DATA_tbProps:{
                title:[
                    {name:"用户名",type:"",prop:"userName",width:""},
                    {name:"公司名称",type:"",prop:"companyName",width:""},
                    {name:"IP地址",type:"",prop:"host",width:""},
                    {name:"时间",type:"",prop:"times",width:""},
                ],
                items:[],
                page:{
                    size:10,
                    total:0
                }
            },
            postData:{
                userName:"",
                page:"1"
            }
        }
    },
    components:{
        'Menu'      : Menu,
        'Table'     : Table
    },
    created(){
        this.EVT_search();
    },
    methods:{
        //搜索按钮
        EVT_search(i){
            if(i){
                this.postData.userName  = i.userName;
            }
            this.DATA_tbProps.page.sync = 1;
            this.postData.page = 1;
            this.ajax_search(this.postData);
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
                url:'/log/login_log.json ', 
                data:data
            }).then((res)=>{
                if(res.results.length){
                    _this.fn_list(res);
                }else{
                    _this.DATA_tbProps.items      = [];
                    _this.DATA_tbProps.page.total =  0;
                }
                _this.loading = false;
            })

            
        },

        fn_list(res){
            let arr=[];
            for(let i=0,len=res.results.length;i<len;i++){
                res.results[i].set =res.results[i];
                arr.push(res.results[i])
            }
            this.DATA_tbProps.items      = arr;
            this.DATA_tbProps.page.total =  res.totalCount;
            
        }
    }
    
}
</script>


