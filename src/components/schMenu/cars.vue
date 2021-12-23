<template>
    <div>
        <el-popover
            ref="popover4"
            popper-class="popper-xb-car"
            placement="bottom-start"
            width="300"
            @show="EVT_show"
            v-model="popover_show"
            trigger="click">
                <div class="dTree-main" v-loading="tree.loading">
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
                    <div class="dTree-tabs" v-if="tab.is">
                        <el-tabs class="dTrss-tabs-pading" :stretch="true" v-model="tab.type" @tab-click="EVT_tabClick">
                            <el-tab-pane :label="tab.label" :name="tab.name" v-for="tab in tab.lists" :key="tab.name"></el-tab-pane>
                        </el-tabs>
                        <div class="dTree-tabs-refresh" @click="EVT_refresh"><i class="el-icon-refresh"></i></div>
                    </div>
                    <el-tree 
                        :style="{'margin-top':tab.is?'-10px':'10px'}"
                        class="dTree"
                        :data="tree.lists" 
                        node-key="id" 
                        :highlight-current="tree.isShowGaoliang"
                        :show-checkbox="tree.isCheckbox"
                        :props="tree.defaultProps" 
                        :default-expanded-keys="[tree.lists[0]?tree.lists[0].id:'']"
                        @node-click="EVT_currClick"
                        @check="EVT_checkChange"
                        ref="tree2"
                        >
                    </el-tree>
                </div>
                <el-button 
                    slot="reference" 
                    plain class="popover-btn" 
                    :class="{'input-placeholder':title ==='请选择车辆'}" 
                    icon="el-icon-truck">
                    {{title}}
                </el-button>
        </el-popover>
    </div>
</template>

<script>
    /****
     * 
     *  menu组件使用
        <div class="zoom" v-else-if="i.type === 'license123'">
            <div class="tle">{{i.name}}：</div>
            <div class="cnt">
                <cars222 :propsRef="i.init" @rback="rback_license123" />                        
            </div>
        </div>


        最外层页面参数配置
        {name:"车牌号码",type:"license123",key:"license",value:"",txt:"请选择",init:{
            tab:{//标签选项卡
                is:true,//是否开启
                type:'all',//标签索引（默认：'all'）
                lists:[（默认值是下面部分）
                    {label:"全部",name:"all"},
                    {label:"在线",name:"online"},
                    {label:"离线",name:"offline"},
                ],
            },
            tree:{//树型结构
                isCheckbox:true,//开启多选（默认：false）
                autoData:false,//开启自动数据（默认：true）
                setData:false,//开启外部数据（默认：false）
                loading:true,//加载动画（默认：false）
                auto_30s:false,//30秒自动刷新（默认：false，对外部数据不可用）
                defaultProps:{//树型结构的标题字段
                    label: 'labelState',
                    children: 'children'
                },
            }
            
        }},


        回调：
            @rback="rback_license123"
            结构：
                {
                    type:"current",
                    data:{
                        lable:'',
                        id:'',
                        node:{}
                    }
                }

                {
                    type:"checkbox",
                    data:{
                        ids:[],
                        nodes:[{}],
                    }
                }

                {
                    type:"refresh",
                    data:{
                        isRefresh:true,//是否执行了刷新
                        setData:_setData,//是否开启了外部数据
                    }
                }

     */
    

    import Server  from 'service/mm.jsx';
    import { setInterval, clearInterval } from 'timers';
    const _mm = new Server();
    let _this;

    export default{
        props:['propsRef','nowId','onlyListCheckedId'],
        data(){
            return {
                //输入建议
                proposal:{
                    lists:[],
                    checked:null,
                    onlyListChecked:null,
                    model:''
                },
                popover_show:false,
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
                        label: 'labelState',
                        children: 'children'
                    },
                    checks:[],//ids
                    nodes:[],//nodes
                },

                //标签页
                tab:{
                    is:false,
                    type:'all',//标签索引
                    lists:[
                        {label:"全部",name:"all"},
                        {label:"在线",name:"online"},
                        {label:"离线",name:"offline"},
                    ],
                },

                //车辆统计
                count:{
                    all:0,
                    online:0,
                    offline:0
                },

                //标题
                title:'请选择车辆',

                timer:null
            }
        },
        created () {
            _this = this;
            this.tree = {...this.tree,...this.propsRef.tree};
            this.tab = {...this.tab,...this.propsRef.tab};
            
        },
        mounted(){
            if(this.tree.autoData)this.ajax_company_vehicle_list();
            if(this.tree.auto_30s){
                this.fn_30s();
            }
        },
        computed:{
            setData:function(){
                return this.propsRef.tree.setData
            },
            setData_loading:function(){
                return this.propsRef.tree.loading
            }
        },
        watch:{
            setData(value){
                if(!value)return;
                this.watch_setData();
                
            },

            setData_loading(value){
                this.tree.loading = value;
            }
        },
        methods: {
            watch_setData(){
                this.tree.lists = [];
                this.proposal.lists = [];
                this.count = {
                    all:0,
                    online:0,
                    offline:0
                };

                this.count = {...this.count,...this.propsRef.count};
                this.proposal = {...this.proposal,...this.propsRef.proposal};

                this.tree = {...this.tree,...this.propsRef.tree};
                this.tree.lists = this.propsRef.tree.lists;

                let _login = _mm.getStorage("login");
                if(_login.realName === "孙克振"){
                    //this.count.online = 2591;
                    //this.count.offline = this.count.all - 2591;
                }

                this.tab.lists[0].label = "全部(" + this.count.all + ")";
                this.tab.lists[1].label = "在线(" + this.count.online + ")";
                this.tab.lists[2].label = "离线(" + this.count.offline + ")";
            },
            querySearch(queryString, cb) {
                var restaurants = this.proposal.lists;
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
            EVT_currClick(e){
                // console.log(e)
                let _type = e.type;
                if(_type === "2"){
                    this.popover_show = false;
                    let _obj = {
                        lable:e.label,
                        id:e.id,
                        node:e.data
                    }

                    if(this.tree.isCheckbox)return;
                    this.title = e.label;
                    this.$emit("rback",{
                        type:"current",
                        data:_obj
                    })
                }

                this.proposal.checked = {
                    id:e.id,
                    value:e.label,
                    zIndex:e.zIndex,
                    zIndexId:e.zIndexId,
                    data:e.data,
                    state:e.data.state
                }
            },

            //树形结构点击勾选
            EVT_checkChange(item,is){
                
                let _checks = this.$refs.tree2.getCheckedKeys(),
                    _nodes  = this.$refs.tree2.getCheckedNodes();

                let _ids = [];
                let _ids_nodes = [];
                _nodes.forEach(el=>{
                    if(el.type === "2"){
                        _ids.push(el.data.vehicleId);
                        _ids_nodes.push(el.data);
                    }
                });

                this.title = "已选择"+_ids.length+"项";
                this.tree.checks = _ids;
                
                this.$emit("rback",{
                    type:"checkbox",
                    data:{
                        ids:_ids,
                        nodes:_ids_nodes,
                    }
                });
            },

            //车辆数据自解析
            format_dataCar(res){

                let _items = res.items;

                let _cc = {
                    count_all:0,
                    online:0,
                    offline:0
                };//计数车辆
                for(let i=0;i<_items.length;i++){
                    //多维数组下标（id）
                    _items[i].zIndexId = res.zIndexId?_mm.objDeepCopy(res.zIndexId):[];
                    _items[i].zIndexId.push(_items[i].id);

                    //多维数组下标（索引）
                    _items[i].zIndex = res.zIndex?_mm.objDeepCopy(res.zIndex):[];
                    _items[i].zIndex.push(i);

                    //输入建议列表
                    _this.proposal.lists.push({
                        value:_items[i].label,
                        zIndexId:_items[i].zIndexId,
                        zIndex:_items[i].zIndex,
                        id:_items[i].id,
                        data:_items[i].data,
                        type:_items[i].type
                    });

                    //当前数据是车辆数据
                    if(_items[i].type=="2"){
                        this.count.all++;
                        _cc.count_all++;
                        _items[i].cls = "0";
                        if(this.nowId && _this.nowId === _items[i].id){
                            this.proposal.checked = {
                                id:_items[i].id,
                                value:_items[i].label,
                                zIndex:_items[i].zIndex,
                                zIndexId:_items[i].zIndexId,
                                data:_items[i].data,
                                state:_items[i].data.state,
                            };
                        }
                        else if(this.proposal.checked && this.proposal.checked.id === _items[i].id){
                            this.proposal.checked.state = _items[i].data.state;
                        }

                        if(this.onlyListCheckedId && this.onlyListCheckedId == _items[i].id){
                            this.proposal.onlyListChecked = {
                                id:_items[i].id,
                                value:_items[i].label,
                                zIndex:_items[i].zIndex,
                                zIndexId:_items[i].zIndexId,
                                data:_items[i].data,
                                state:_items[i].data.state,
                            };
                        }

                        if(_items[i].data.state == "0"){
                            this.count.offline++;
                            _cc.offline++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（离线）";
                            
                        }
                        else if(_items[i].data.state == "1"){
                            this.count.online++;
                            _cc.online++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（在线-停车）";
                        }
                        else if(_items[i].data.state == "2"){
                            this.count.online++;
                            _cc.online++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（在线-行驶）";
                        }
                    }

                    //当前数据是公司数据
                    if(_items[i].type == "1"){
                        _items[i].count_all = 0;
                        _items[i].count_online = 0;
                        _items[i].count_offline = 0;
                        _items[i].labelState = _items[i].label;
                        if(_items[i].children.length == 0)continue;
                        let _obj = this.format_dataCar({
                            items:_items[i].children,
                            zIndexId:_items[i].zIndexId,
                            zIndex:_items[i].zIndex
                        });
                         
                        _cc.count_all   += _obj.count_all;
                        _cc.online      += _obj.online;
                        _cc.offline     += _obj.offline;
                        
                        _items[i].count_all     = _obj.count_all;
                        _items[i].count_online  = _obj.online;
                        _items[i].count_offline = _obj.offline;
                        _items[i].labelState    = _items[i].label;
                    }
                }
                return _cc;
            },

            //气泡显示事件
            EVT_show(){
                //输入建议选中的值
                if(!this.proposal.checked)return;
                this.EVT_select(this.proposal.checked);
            },

            //输入框清空事件
            EVT_clear(){
                this.fn_expanded();//重置树结构节点收起
                this.proposal.checked = null;//输入建议选中的值
            },

            //刷新数据
            EVT_refresh(type){
                if(type !== "30s" && this.auto_30s){
                    if(this.timer)clearInterval(this.timer);
                    this.fn_30s();
                }

                if(!this.tree.setData){
                    this.ajax_company_vehicle_list({type:"refresh"});
                    return;
                }

                this.$emit("rback",{
                    type:"refresh",
                    data:{
                        isRefresh:true,
                        setData:true,
                    }
                });
            },

            //获取公司车辆并且渲染列表
            ajax_company_vehicle_list(obj){
                let _this = this;
                this.tree.loading = true;
                
                _mm.request({ 
                    url:'/vehicle/vehicle_list_level.json', 
                }).then( res => {
                    _this.tree.lists = [];
                    _this.proposal.lists = [];
                    _this.count = {
                        all:0,
                        online:0,
                        offline:0
                    };

                    let _items = res;
                    _this.format_dataCar({items:_items});
                    _this.tree.lists = _items;

                    let _login = _mm.getStorage("login");
                    if(_login.realName === "孙克振"){
                        //_this.count.online = 2591;
                        //_this.count.offline = _this.count.all - 2591;
                    }

                    _this.tab.lists[0].label = "全部(" + _this.count.all + ")";
                    _this.tab.lists[1].label = "在线(" + _this.count.online + ")";
                    _this.tab.lists[2].label = "离线(" + _this.count.offline + ")";
                    _this.tab.type = "all";

                    //输入建议选中的值不为空时执行
                    if(_this.proposal.checked){
                        setTimeout(()=>{
                            _this.EVT_select(_this.proposal.checked);
                            _this.title = _this.proposal.checked.value;
                        },500);
                    }                

                    if(_this.tree.isCheckbox){
                        // _this.$refs.tree2.setCheckedKeys(_this.tree.checks)
                    }

                    _this.tree.loading = false;

                    if(obj && obj.type === "refresh"){
                        _this.$emit("rback",{
                            type:"refresh",
                            data:{
                                isRefresh:true,
                                setData:false,
                                checked:_this.proposal.checked,
                                onlyListChecked:_this.proposal.onlyListChecked
                            }
                        });
                    }
                })
            },

            fn_30s(){
                let _this = this;
                this.timer = setInterval(()=>{
                    if(!_this.popover_show){
                        _this.EVT_refresh("30s");
                    }
                },300000);
            },

            //重置树结构节点收起
            fn_expanded(){
                let _nodesMap = this.$refs.tree2.store.nodesMap;
                for(var key in _nodesMap) {
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

                    let _type = _nodesMap[key].data.type;
                    if(_type == "1"){
                        let _count = _nodesMap[key].data.count_all;
                        _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                    }
                }

                this.tab.type = "all";

                let _zIndexId = item.zIndexId;
                let _zIndex = item.zIndex;

                for(var key in _nodesMap) {
                    _nodesMap[key].expanded = false;
                }

                for(let i=0;i<_zIndexId.length;i++){
                    _nodesMap[_zIndexId[i]].expanded = true;
                }
                _this.$refs.tree2.setCurrentKey(item.id);

                if(item.type == "2")fn_current();//单选模式下自动选中

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

                    $(".dTree").scrollTop(_top);//定位到指定位置
                }

                //单选模式下自动选中
                function fn_current(){
                    if(_this.tree.isCheckbox)return;
                    let _obj = {
                        lable:item.value,
                        id:item.id,
                        node:item.data
                    }                    
                    
                    _this.title = _obj.lable;
                    _this.$emit("rback",{
                        type:"current",
                        data:_obj
                    })
                }
            },

            //标签页点击
            EVT_tabClick(tab, event) {
                let _tabName = tab.name;
                let _nodesMap = this.$refs.tree2.store.nodesMap;

                this.proposal.model = "";
                this.EVT_clear();

                if(_tabName == "all"){
                    let _id = this.tree.lists[0].id;
                    for(var key in _nodesMap) {
                        _nodesMap[key].visible = true;
                        if(_nodesMap[key].id === _id){
                            _nodesMap[key].expanded = true;
                            continue;
                        }
                        _nodesMap[key].expanded = false;
                    }
                    return;
                };
                
                for(var key in _nodesMap) {
                    let _state = _nodesMap[key].data.data.state;
                    let _type = _nodesMap[key].data.type;
                    _nodesMap[key].visible = true;
                    if(_type == "2"){
                        if(_state == "0"){
                            _state = "offline";
                        }
                        else if(_state == "1" || _state == "2"){
                            _state = "online";
                        }
                        
                        if(_tabName === _state){
                            _nodesMap[key].visible = true;
                        }
                        else{
                            _nodesMap[key].visible = false;
                        }
                    }
                    else if(_type == "1"){
                        if(_tabName === "online"){
                            let _count_online = _nodesMap[key].data.count_online;
                            _nodesMap[key].visible = _count_online?true:false;
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label ;
                        }
                        else if(_tabName === "offline"){
                            let _count_offline = _nodesMap[key].data.count_offline;
                            _nodesMap[key].visible = _count_offline?true:false;
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                        }
                        else{
                            let _count = _nodesMap[key].data.count_all;
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                        }
                    }
                }
            },

            //清空
            fn_clear_checks(){
                if(this.tree.isCheckbox){
                    this.$refs.tree2.setCheckedKeys([]);
                    this.title = '请选择车辆';
                    this.proposal.checked = null;//输入建议选中的值
                }else{
                    this.$refs.tree2.setCurrentKey('');
                    this.title = '请选择车辆';
                }
                this.proposal.model = "";
                this.fn_expanded();//重置树结构节点收起
            },
            
        },
        beforeDestroy() {
            if(this.timer)clearInterval(this.timer);
        }

    }

</script>

<style scoped>
    .dTree-main{
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .dTree{
        overflow-y: AUTO;
        margin-top: -10px;
        flex: 1;
    }

    .dTree-tabs{
        position: relative;
    }

    .dTree-tabs-refresh{
        position:absolute;right:0px;top:0px;
        height:40px;
        line-height: 40px;
        cursor: pointer;
        z-index:9
    }

</style>
