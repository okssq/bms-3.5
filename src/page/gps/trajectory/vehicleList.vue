<template>
    <div class="vleListBox">
        <!-- 菜单栏 -->
        <div class="vleListBox-menu">选择列表</div>
        <!-- 其他情况下的搜索栏 -->
        <slot name="vleListBox-schBar-data">
            <div class="vleListBox-schBar-data">
                <div class="vleListBox-schBar-tle">选择日期</div>
                <div v-if="props && props.dateType==='date'?true:false">
                    <el-date-picker
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        v-model="selectDate"
                        type="date"
                        align="right"
                        :picker-options="picker"
                        placeholder="选择日期">
                    </el-date-picker>
                </div>
                <div v-else>
                    <el-date-picker
                        value-format="yyyy-MM-dd HH:mm:ss"
                        format="yyyy-MM-dd HH:mm:ss"
                        v-model="selectDate"
                        default-time="23:59:59"
                        type="datetime"
                        align="right"
                        :picker-options="picker"
                        placeholder="选择日期">
                    </el-date-picker>
                </div>
            </div>
        </slot>
        <!-- 车牌号码搜索栏 -->
        <div class="vleListBox-schBar">
            <div class="vleListBox-schBar-tle">选择车辆</div>
            <div class="vleListBox-schBar-cnt zoom">
                <el-autocomplete
                        style="width:100%"
                        class="inline-input"
                        clearable
                        v-model="proposal.model"
                        :fetch-suggestions="querySearch"
                        placeholder="请输入查询车牌号"
                        @select="EVT_select"
                        @clear="EVT_clear"
                        :trigger-on-focus="false"
                        >
                    </el-autocomplete>
            </div>
        </div> 

        <!-- 列表及结果区 -->
        <div class="vleListBox-result zoom">
            <!-- 公司/车辆列表展示区 -->
            <div class="vleListBox-result-group">
                <el-tree 
                    class="dTree"
                    :data="dataCars.items" 
                    node-key="id" 
                    :highlight-current="tree.isShowGaoliang"
                    :show-checkbox="tree.isCheckbox"
                    :props="tree.defaultProps" 
                    :default-expanded-keys="[dataCars.items[0]?dataCars.items[0].id:'']"
                    @node-click="EVT_currClick"
                    ref="tree2"
                    >
                </el-tree>
            </div>
            
            <!-- SLOT******下方清除/搜索按钮区 -->
        </div> 
        <slot name="vleListBox-btn">
            <div class="vleListBox-btn" >
                <button class="dbtn" @click="EVT_buttonClear">清除</button><button class="dbtn dbtn-blue" @click="EVT_buttonSearch">搜索</button>
            </div>
        </slot>
    </div>
</template>


<script>
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        props:['props'],
        data(){
            return {
                selectDate    : '',             //选择日期值

                //输入建议
                proposal:{
                    lists:[],
                    checked:null,
                    model:''
                },
                //车辆树形结构
                tree:{
                    loading:false,
                    isShowGaoliang:true,//是否显示高亮
                    isCheckbox:false,
                    autoData:true,//数据是否自动获取
                    setData:false,//启动外置数据
                    auto_30s:false,//30秒自动刷新
                    lists:[],//结构数据源
                    defaultProps:{
                        label: 'label',
                        children: 'children'
                    },
                    checks:[],//ids
                    nodes:[],//nodes
                },
                picker        : {               //选择日期范围限制
                    disabledDate(time){
                        return time.getTime() > new Date((new Date()).getTime()-86400000) || time.getTime() < new Date((new Date()).getTime()-86400000*120);
                    }
                },
            }
        },
        created() {
            let _login = _mm.getStorage("login");

            // 超级管理员日期不限
            if(_login.roleId === "1"){
                this.picker = "";
            }
        },
        mounted(){
            let _this = this;
            let _id = _this.$route.query.id;
            let _label = _this.$route.query.label;
            let _today = _this.$route.query.today;
            if(_id && _today){
                setTimeout(()=>{
                    _this.selectDate = _today;
                    _this.proposal.model = _label;
                    _this.proposal.checked = {
                        id:_id,
                        value:_label,
                        zIndex:"",
                        zIndexId:"",
                        state:{}
                    }
                    //_this.EVT_buttonSearch();
                
                },200);
                
    
            }
            
        },
        computed:{
            dataCars(){
                return this.$store.state.dataCars;
            },
        }, 
        methods:{
            querySearch(queryString, cb) {
                var restaurants = this.dataCars.list_one;
                var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
                };
            },

            //树形结构点击单项
            EVT_currClick(e,b){
                let _type = e.type;
                if(_type === "2"){
                    this.popover_show = false;
                    let _obj = {
                        lable:e.label,
                        id:e.id,
                        node:e.data
                    }

                    this.proposal.model = e.label;

                    this.proposal.checked = {
                        id:e.id,
                        value:e.label,
                        zIndex:e.zIndex,
                        zIndexId:e.zIndexId,
                        state:e.data.state
                    }
                }
            },

            //输入框清空事件
            EVT_clear(){
                this.fn_expanded();//重置树结构节点收起
                this.proposal.checked = null;//输入建议选中的值
            },

            //重置树结构节点收起
            fn_expanded(){
                let _nodesMap = this.$refs.tree2.store.nodesMap;
                for(var key in _nodesMap) {
                    if(key == this.dataCars.items[0].id)continue;
                    _nodesMap[key].expanded = false;
                }
            },

            //查询结果点击
            EVT_select(item) {
                let _this = this;

                this.fn_expanded();//重置树结构节点收起

                this.proposal.checked = item;//输入建议选中的值

                let _nodesMap = this.$refs.tree2.store.nodesMap;
                for(var key in _nodesMap) {
                    _nodesMap[key].visible = true;
                }

                let _zIndexId = item.zIndexId;
                let _zIndex = item.zIndex;

                for(var key in _nodesMap) {
                    _nodesMap[key].expanded = false;
                }

                for(let i=0;i<_zIndexId.length;i++){
                    _nodesMap[_zIndexId[i]].expanded = true;
                }
                _this.$refs.tree2.setCurrentKey(item.id);

                setTimeout(()=>{
                    fn_setScroll();//定位到指定位置
                },500);
                
                //定位到指定位置
                function fn_setScroll(){
                    let _n = 0;
                    for(let i=0;i<_zIndex.length;i++){
                        _n += _zIndex[i]+1;
                    }

                    _n = _n>5?_n-5:0;
                    let _top = _n*26;

                    $(".vleListBox-result").scrollTop(_top);//定位到指定位置
                }
            },

            //清空
            fn_clear_checks(){
                this.proposal.model = "";
                this.fn_expanded();//重置树结构节点收起
            },

            //底部清除按钮
            EVT_buttonClear(){
                let _this = this;
                this.selectDate = '';//清空日期
                //输入建议
                this.proposal = {
                    lists:[],
                    checked:null,
                    model:''
                },
                this.fn_expanded();//重置树结构节点收起

                this.$emit('clebtn');
            },

            //底部搜索按钮
            EVT_buttonSearch(){
                if(!this.selectDate){
                    _mm.msg("请选择日期");
                    return;
                }
                if(!this.proposal.checked.id){
                    _mm.msg("请选择车辆");
                    return;
                }
                let data    = {
                    time     : this.selectDate,
                    vehicleId: this.proposal.checked.id
                }
                console.log("21312",data)
                this.$emit('schbtn',data);
            },
        },
        beforeDestroy(){
            
        }
        
    }
</script>

<style >
    .btngroup{width: 100%;position: relative;height: 50px;display: flex;border-bottom: 2px solid rgb(229,229,229);line-height: 56px;}
    .btn-item{flex: 1;text-align: center;cursor: pointer;}
    /* .btn-item.active{border-bottom: 2px solid rgb(12,141,255);box-sizing: border-box;height: 50px;box-sizing: border-box;} */
    .animate_blueLine{position: absolute;width: 82px;height: 2px;bottom: -2px;background-color:rgb(12,141,255);transition: all .3s;}

    .vleListBox{ 
        position: absolute;bottom: 15px;top: 15px;right:15px;
        width:250px;background-color:#fff;padding: 15px; display: flex;
        flex-direction: column;box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    .vleListBox-result::-webkit-scrollbar {
        width: 4px;  
    }

    .vleListBox-menu{height:40px;padding:0 15px;background-color:#eff7ff;font-weight:bolder;line-height:40px;font-size: 14px;}
    
    .vleListBox-schBar-data{
        margin-left: 5px;
        width: calc(100% - 5px);
    }
    .vleListBox-schBar{margin-left: 5px;}
    .vleListBox-schBar-tle{font-size:13px;color:#637180;text-indent:15px;height:40px;line-height:40px;position:relative}
    .vleListBox-schBar-tle::before{content:"";display:block;width:6px;height:6px;position:absolute;left:3px;top:16px;background:#3496f8}
    
    .vleListBox-schBar-cnt .input{float:left;height:36px;width:245px}
    .vleListBox-schBar-cnt button.dbtn-blue{height:40px;width:70px;float:right;margin-right:0}
    .vleListBox-schBar-cnt .el-input.date{width: 245px;position: absolute;width: 245px;}
   
   .vleListBox-result {width:100%; margin-top: 15px;position: relative;flex: 1;overflow-y: auto;}

   .vleListBox-result .vleListBox-result-group{overflow-y: auto;}
   .vleListBox-result .search-panel{ position: absolute;left: 0;top: 0; width:245px ;margin-left: 5px;
       border-radius: 5px; background: #fff;box-shadow:0 2px 6px rgba(0,0,0,.15); overflow-y: auto;}

   .vleListBox-result .vleListBox-result-list{overflow: auto;padding-bottom: 8px;}
    .vleListBox-result .companyItem{cursor: pointer; color:#000;}
    .vleListBox-result .companyItem>span{color: #637180;font-size: 13px;}
    .vleListBox-result .vleItem{height: 28px;line-height: 28px;color: #000;display: none;cursor: pointer;width: calc(100% - 15px);float: right;margin-left: 15px;padding:0 10px;display: none;}
    .vleListBox-result .vleItem>span{font-size: 12px;}
    .vleListBox-result .vleItem>span:nth-of-type(2){float: right}
    
    .companyItem div.d-triangle{float:left; width: 18px;height: 20px;background-image:url("~img/icon/d-triangle.png");
        background-repeat: no-repeat;background-position: left center;}
    .companyItem.active div.d-triangle{transform:rotate(180deg);background-position: right center;}
    .d-itemText{float: left;width: calc(100% - 18px);}
    .vleListBox-btn{width: 100%;padding-top:20px;}
    .vleListBox-btn>button{width: calc(50% - 5px);}
    .vleListBox-btn>button:nth-of-type(2){margin-right: 0;}

    .vleListBox-result .vleItem:hover,
    .vleListBox-result .vleItem.active,
    .vleListBox-result .search-panel>div:hover{background-color:rgb(234,244,254);color:#3496f8;}
    .vleListBox-result .vleItem.isShow{display: block;}
    
 
    .vleListBox-result .search-panel>div{height: 36px;line-height: 36px;color: #637180;cursor: pointer;box-sizing: border-box;font-size: 12px;padding: 0 15px}
    .vleListBox-result .search-tip{ text-align:center;height:40px;line-height:40px;position:relative}
    .vleListBox-result .search-tip::before{content:"";display:block;width:30px;height:1px;position:absolute;left:45px;top:19px;background:#dae0e6}
    .vleListBox-result .search-tip::after{content:"";display:block;width:30px;height:1px;position:absolute;right:46px;top:19px;background:#dae0e6}
    .vleListBox-btn{text-align:center;}

</style>
