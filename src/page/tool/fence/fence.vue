<template>
    <div v-loading="loading" class="operation">
        <div class="dTble">
            <div class="schCnt-btn">
                <button class="dbtn dbtn-blue" @click="EVT_add">新建围栏</button>
                <button class="dbtn dbtn-blue" @click="EVT_removeArr">删除</button>
                <button class="dbtn dbtn-blue" @click="EVT_add" v-if="is_all">查看全部</button>
            </div>
            <div class="schCnt-btnGroup">
                <button 
                    class   ="dbtn" 
                    v-for   ="(item , index) in btngroup" 
                    :key    ="index+1" 
                    :class  ="{active : item.isActive}" 
                    @click  ="EVT_changeShowStyle(item.type,index)"
                >
                    {{item.name}}
                </button>
            </div>
            <Table :props="DATA_tbProps" @setPage="GET_page" @delOne="EVT_delOne" @setTable="GET_table"/>
        </div>  
    </div>
</template>

<script>

import Table    from 'components/list/table.vue';

import Server from 'service/mm.jsx';
const _mm = new Server();

export default{
    data(){
        return {
            btngroup:[
                {name: "点围栏" , isActive: true  ,type: "round" },
                {name: "区域围栏" , isActive: false ,type: "region" }
            ],
            btngroup_type:"round",
            DATA_tbProps:{
                schVal:'100',
                title:[
                    {name: "序号",type :"selection",prop: "k1",width: "50"},
                    {name: "围栏名称",type: "",prop: "k2",width: ""},
                    {name: "围栏地址",type: "",prop: "k3",width: ""},
                    {name: "半径(米)",type: "",prop: "k4",width: ""},
                ],
                items:[],
                opeations:[
                    {name:"查看",evt:"seeEdit",path:"/tool-fence/map"},
                    {name:"编辑",evt:"edit",path:"/tool-fence/map"},
                    {name:"删除",evt:"remove"}
                ],
                page:{
                    size :10,
                    total:0,
                },
            },
            checks:[],
            postData:{
                fenceType:"1",
                companyId:""
            },
            is_all:false,//是否显示查看全部按钮
            loading:true,
            totalCount:0,//共搜索到多少条数据
        }
    },
    components:{
        'Table'     : Table
    },
    mounted(){
        let _this = this;
        let _query = this.$route.query;
        if(_query && _query.type === "region"){
            _this.btngroup = [
                {name: "点围栏" , isActive: false  ,type: "round" },
                {name: "区域围栏" , isActive: true ,type: "region" }
            ];
            _this.DATA_tbProps.title = [
                {name: "序号",type :"selection",prop: "k1",width: "50"},
                {name: "围栏名称",type: "",prop: "k2",width: ""},
                {name: "围栏地址",type: "",prop: "k3",width: ""},
            ];
            _this.DATA_tbProps.opeations = [
                {name:"编辑",evt:"edit",path:"tool-fence/region"},
                {name:"删除",evt:"remove"}
            ];

            this.btngroup_type = _query.type;

            let _login = _mm.getStorage('login');
            this.ajax_search({
                fenceType:2,
                companyId:_login.companyId
            });
        }
    },
    created(){
        let _login = _mm.getStorage('login');
        this.ajax_search({
            fenceType:"1",
            companyId:_login.companyId
        });
    },
    methods:{
        //搜索接口
        ajax_search(set){
            this.loading = true;
            let _this=this;
            _mm.request({ 
                url:'/fence/fence_list.json', 
                data:set
            }).then((res)=>{
                let arr = [];
                _this.is_all = res.results.length===0?false:true;

                let _type = _this.btngroup_type;

                res.results.forEach((el,index)=>{
                    let _fencePointsInfo = JSON.parse(el.fencePointsInfo);

                    let _json  = {
                        set:{fenceId:el.fenceId,id:el.fenceId},
                        k2:el.fenceName,
                        k3:el.poiName
                    };
                    if(_type === "round"){
                        _json  = {
                            set:{fenceId:el.fenceId,id:el.fenceId},
                            k2:el.fenceName,
                            k3:el.poiName,
                            k4:_fencePointsInfo.radius
                        };
                    }
                    
                    arr.push(_json);
                });

                _this.totalCount = res.totalCount;
                _this.DATA_tbProps.page.total =res.totalCount;
                _this.DATA_tbProps.items = arr;
                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },

        //ajax-删除
        ajax_remove(set){
            _mm.request({ 
                url:'/fence/del_batch_fence.json', 
                data:set
            }).then((res)=>{
                let _type = this.btngroup_type;
                if(_type === "round"){
                    this.postData.fenceType = "1";
                }else if(_type === "region"){
                    this.postData.fenceType = "2";
                }
                _mm.msg("删除成功");
                this.ajax_search(this.postData);
            });
        },

        //删除
        EVT_delOne(data){
            let _this = this;
            let _postData = {
                ids:JSON.stringify([data.fenceId])
            };
            _this.ajax_remove(_postData);
        },

        //新增按钮
        EVT_add(){
            if(this.btngroup_type === "round"){
                this.$router.push({path:'/tool-fence/map'});
            }else if(this.btngroup_type === "region"){
                this.$router.push({path:'/tool-fence/region'});
            }
        },

        //批量删除
        EVT_removeArr(){
            let _arr = this.checks;
            if(_arr.length === 0){
                _mm.msg("请选择一项");
                return;
            }

            let _this = this;
            _mm.confirmBox({
                info:"真的要删除吗？",
                callBOk:function(){
                    let _postData = {
                        ids:JSON.stringify(_arr)
                    };
                    _this.ajax_remove(_postData);
                }
            });
        },

        //点击展示方式
        EVT_changeShowStyle(type,index){
            let _this = this;
            _this.DATA_tbProps.page.sync = 1;
            for(let i=0;i<_this.btngroup.length;i++){       //设置Active样式
                if(index === i){_this.btngroup[i].isActive = true; continue}
                _this.btngroup[i].isActive = false;
            }

            if(type === "round"){
                this.postData.fenceType = "1";
                this.$router.push({path: '/tool-fence'});
                _this.DATA_tbProps.title = [
                    {name: "序号",type :"selection",prop: "k1",width: "50"},
                    {name: "围栏名称",type: "",prop: "k2",width: ""},
                    {name: "围栏地址",type: "",prop: "k3",width: ""},
                    {name: "半径(米)",type: "",prop: "k4",width: ""},
                ];
                _this.DATA_tbProps.opeations = [
                    {name:"查看",evt:"seeEdit",path:"/tool-fence/map"},
                    {name:"编辑",evt:"edit",path:"/tool-fence/map"},
                    {name:"删除",evt:"remove"}
                ];
            }else if(type === "region"){
                this.postData.fenceType = "2";
                _this.DATA_tbProps.title = [
                    {name: "序号",type :"selection",prop: "k1",width: "50"},
                    {name: "围栏名称",type: "",prop: "k2",width: ""},
                    {name: "围栏地址",type: "",prop: "k3",width: ""},
                ];
                _this.DATA_tbProps.opeations = [
                    {name:"编辑",evt:"edit",path:"/tool-fence/region"},
                    {name:"删除",evt:"remove"}
                ];
            }

            this.btngroup_type = type;

            let _login = _mm.getStorage('login');
            this.ajax_search({
                fenceType:index+1,
                companyId:_login.companyId
            });
        },

        //回调-表格
        GET_table(data){
            let arr = [];
            data.forEach((el,index)=>{
                arr.push(el.id);
            });
            this.checks = arr;
        },
        //回调-分页
        GET_page(data){
            this.postData.page=data;
            this.DATA_tbProps.page.sync = data;
            this.ajax_search(this.postData);
        },
    }
    
}
</script>

<style scoped>
    .schCnt-btnGroup>.dbtn{margin-right: 0;}
    .schCnt-btnGroup>.dbtn:last-of-type{border-left: none;}
    .schCnt-btnGroup>.dbtn.active{color: #fff;background-color: rgb(63,158,255);}
    .schCnt-btn{margin-bottom: 10px;}
    .dTble{position: relative;}
    .schCnt-btnGroup{
        position: absolute;
        right: 0;top: 0;
    }
    
</style>
