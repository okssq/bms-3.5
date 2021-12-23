<template>
    <div class="dCars" v-loading="tree.loading">
        <el-tabs v-model="tab.model" @tab-click="EVT_tab">
            <el-tab-pane :label="tab.label" :name="tab.name" v-for="tab in tab.lists" :key="tab.name"></el-tab-pane>
        </el-tabs>
        <div class="dCars-list-f5" @click="EVT_f5"><i class="el-icon-refresh"></i></div>
        <div class="dCars-list">
            <el-tree 
                class="dTree"
                :data="tree.lists" 
                node-key="id" 
                :highlight-current="tree.isShowGaoliang"
                :props="tree.defaultProps" 
                :default-expanded-keys="[tree.lists[0]?tree.lists[0].id:'']"
                @node-click="EVT_currClick"
                ref="tree2"
                >
            </el-tree>
        </div>
    </div>
</template>

<script>
    let _this;
    import Server  from 'service/mm.jsx';
    import { clearInterval } from 'timers';
    const _mm = new Server();

    export default{
        props:['propsRef'],
        data(){
            return {
                tab:{
                    lists:[
                        {label:"全部",name:"all"},
                        {label:"在线",name:"online"},
                        {label:"离线",name:"offline"},
                    ],
                    model:"all"
                },

                //输入建议
                proposal:{
                    lists:[],
                    checked:null,
                },

                //车辆树形结构
                tree:{
                    loading:true,
                    isShowGaoliang:true,//是否显示高亮
                    isCheckbox:false,
                    autoData:true,//数据是否自动获取
                    setData:false,//启动外置数据
                    auto_30s:true,//30秒自动刷新
                    lists:[],//结构数据源
                    defaultProps:{
                        label: 'labelState',
                        children: 'children'
                    },
                    checks:[],//ids
                    nodes:[],//nodes
                },

                count:{
                    all:0,
                    online:0,
                    outline:0
                },
                timer:null
            }
        },
        components:{
            
        },
        created () {
            _this = this;
        },
        mounted(){
            this.ajax_company_vehicle_list();
            this.fn_30s();
        },
        computed:{
            
        },
        watch:{
            
        },
        methods: {
            //标签页点击
            EVT_tab(tab, event) {
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

                        let _type = _nodesMap[key].data.type;
                        if(_type == "1"){
                            let _count = _nodesMap[key].data.count_all;
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                        }
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
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                        }
                        else if(_tabName === "offline"){
                            let _count_offline = _nodesMap[key].data.count_offline;
                            _nodesMap[key].visible = _count_offline?true:false;
                            _nodesMap[key].data.labelState = _nodesMap[key].data.label;
                        }
                    }
                }
            },

            EVT_f5(type){
                if(type !== "30s" && this.tree.auto_30s){
                    this.fn_30s();
                }
                this.ajax_company_vehicle_list();

                this.tab.model = "all";
                
            },

            fn_30s(){
                let _this = this;
                if(this.timer)window.clearInterval(this.timer);
                this.timer = setInterval(()=>{
                    if(!_this.popover_show){
                        _this.EVT_f5("30s");
                    }
                },300000);
            },

            //输入框清空事件
            EVT_clear(){
                this.fn_expanded();//重置树结构节点收起
                this.proposal.checked = null;//输入建议选中的值
            },

            // querySearch(queryString, cb) {
            //     var restaurants = this.proposal.lists;
            //     var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
            //     // 调用 callback 返回建议列表的数据
            //     cb(results);
            // },
            // createFilter(queryString) {
            //     return (restaurant) => {
            //         return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
            //     };
            // },

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
                        lnglat:[_items[i].data.gpsLon,_items[i].data.gpsLat],
                        name:_items[i].label,
                        style:parseInt(_items[i].data.state)
                    })

                    //当前数据是车辆数据
                    if(_items[i].type=="2"){
                        this.count.all++;
                        _cc.count_all++;
                        _items[i].cls = "0";
                        if(this.proposal.checked && this.proposal.checked.id === _items[i].id){
                            this.proposal.checked.state = _items[i].data.state;
                        }

                        if(_items[i].data.state == "0"){
                            this.count.offline++;
                            _cc.offline++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（离线）";
                            
                        }
                        else if(_items[i].data.state == "1"){
                            this.count.online++;
                            _cc.online++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（停车）";
                        }
                        else if(_items[i].data.state == "2"){
                            this.count.online++;
                            _cc.online++;
                            _items[i].labelState = _items[i].data.vehicleLicence + "（行驶）";
                        }
                    }

                    if(_items[i].type == "1"){//当前数据是公司数据
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

            //获取公司车辆并且渲染列表
            ajax_company_vehicle_list(){
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
                        },500);
                    }

                    _this.tree.loading = false;

                    _this.$emit("rback",{
                        type:"dataCarsList",
                        data:{
                            items:_this.proposal.lists
                        }
                    });

                    // if(obj && obj.type === "refresh"){
                    //     _this.$emit("rback",{
                    //         type:"refresh",
                    //         data:{
                    //             isRefresh:true,
                    //             setData:false,
                    //             checked:_this.proposal.checked,
                    //             onlyListChecked:_this.proposal.onlyListChecked
                    //         }
                    //     });
                    // }
                })
            },

            //树形结构点击单项
            EVT_currClick(e,b){
                let _type = e.type;
                if(_type === "2"){
                    let _obj = {
                        lable:e.label,
                        id:e.id,
                        node:e.data
                    }

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
                    state:e.data.state
                }
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
                

                this.tab.model = "all";

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

                    $(".dCars-list").scrollTop(_top);//定位到指定位置
                }
            },
        },
        beforeDestroy() {
            if(this.timer)window.clearInterval(this.timer);
        }

    }

</script>

<style scoped> 
    .dCars{
        position:absolute;
        top:50px;
        right:0px;
        width:300px;
        background:#fff;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        padding:5px 15px 15px 15px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 130px);
    }
    .dCars-list{
        width:100%;
        flex: 1;
        overflow-y: auto;
    }
    .dCars-list-f5{position:absolute;top:7px;right:6px;width:30px;height:30px;line-height:34px;text-align:center;cursor: pointer;}
    .dCars-list-f5 i{font-size:18px;}
</style>
