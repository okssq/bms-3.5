<template>
    <div class="dCars" v-loading="loading1">
        <el-tabs v-model="tab.model" @tab-click="EVT_tab">
            <el-tab-pane :label="tab.label" :name="tab.name" v-for="tab in tab.items" :key="tab.name"></el-tab-pane>
        </el-tabs>
        <div class="dCars-list-f5" @click="EVT_f5"><i class="el-icon-refresh"></i></div>
        <div class="dCars-list">
            <el-tree 
                :data="lists" 
                :props="defaultProps"
                node-key="id" 
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
                :default-expanded-keys="[lists[0]?lists[0].id:'']"
                ref="tree2"
                >

            </el-tree>
        </div>
    </div>
</template>

<script>
    let _this;
    import Server  from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        props:['propsRef'],
        data(){
            return {
                tab:{
                    items:[
                        {label:"全部",name:"all"},
                        {label:"在线",name:"online"},
                        {label:"离线",name:"outline"},
                    ],
                    model:"all"
                },
                defaultProps:{
                    children: 'children',
                    label: 'labelState'
                },
                lists:[],
                lists_one:[],
                count:{
                    all:0,
                    online:0,
                    outline:0
                },
                timer:'',
                loading1:true
            }
        },
        components:{
            
        },
        created () {
            _this = this;
            
        
        },
        mounted(){
            this.ajax_company_vehicle_list();
        },
        computed:{
            gpsChecked (){//当前选中车辆的信息
                return this.$store.state.gpsChecked;
            },
            filter(){
                return this.propsRef;
            },
            dataCars(){
                return this.$store.state.dataCars;
            }
        },
        watch:{
            filter:{
                handler:(val,oldVal)=>{   
                    _this.filter_tree(val.filter);
                },
                deep:true//对象内部的属性监听，也叫深度监听
            }
        },
        methods: {
            //车辆数据自解析
            format_dataCar(items){
                let _cc = 0;//计数车辆
                for(let i=0;i<items.length;i++){
                    if(items[i].type=="2"){
                        this.count.all++;

                        //一级车辆列表
                        this.lists_one.push({
                            value:items[i].label,
                            id:items[i].id,
                            data:items[i].data,
                            lnglat:[items[i].data.gpsLon,items[i].data.gpsLat],
                            name:items[i].label,
                            style:parseInt(items[i].data.state)
                        });

                        if(items[i].data.state == "0"){
                            this.count.outline++;
                            items[i].labelState = items[i].data.vehicleLicence + "(离线)";
                        }
                        else if(items[i].data.state == "1" || items[i].data.state == "2"){
                            this.count.online++;
                            items[i].labelState = items[i].data.vehicleLicence + "(在线)";
                        }
                    }

                    if(items[i].type == "1"){
                        items[i].labelState = items[i].label;
                        if(items[i].children.length == 0)continue;
                        this.format_dataCar(items[i].children);
                        //items[i].label += ("("+items[i].data.count+")");
                    }
                }
                return _cc;
            },
            
            //获取公司车辆并且渲染列表
            ajax_company_vehicle_list(){
                let _this = this;
                _this.loading1 = true;
                _this.lists_one = [];
                _this.dataCars.lists_is = false;//一级列表是否准备好
                _this.count = {
                    all:0,
                    online:0,
                    outline:0
                };

                _mm.request({ 
                    url:'/vehicle/vehicle_list_level.json', 
                }).then( res => {
                    _this.count.all = 0;
                    _this.count.online = 0;
                    _this.count.outline = 0;
                    _this.lists_one = [];

                    _this.format_dataCar(res);
                    _this.loading1 = false;
                    _this.lists = res;
                    _this.dataCars.lists = _this.lists_one;
                    _this.dataCars.lists_is = true;//一级列表是否准备好
                    // setTimeout(()=>{
                    //     if(_this.propsRef.filter){
                    //         _this.filter_tree(_this.propsRef.filter);
                    //     }
                        
                    // },1); 
                    _this.tab.items[0].label = "全部(" + _this.count.all + ")";
                    _this.tab.items[1].label = "在线(" + _this.count.online + ")";
                    _this.tab.items[2].label = "离线(" + _this.count.outline + ")";
                })
            },

            EVT_tab(i){
                let _sign = "";
                if(i.name === "online"){
                    _sign = "在线";
                }
                else if(i.name === "outline"){
                    _sign = "离线";
                }
                this.filter_tree(_sign);
            },

            EVT_f5(){
                let _this = this;
                _this.ajax_company_vehicle_list();

                this.tab.model = "all"
                
            },

            //点击了车辆树结构的一项
            handleNodeClick(data) {
                let _getData = data.data;
                let _obj = {
                    type:"click",
                    vehicleId:_getData.vehicleId,
                    vehicleLicence:_getData.vehicleLicence,
                    state:_getData.state,
                    lnglat:[_getData.gpsLon,_getData.gpsLat],
                }
                this.$store.commit('updata_gpsChecked',_obj);
                
            },

            //车辆树结构过滤
            filter_tree(val){
                this.$refs.tree2.filter(val);
                if(!val || val == "在线" || val == "离线"){
                    let _nodesMap = this.$refs.tree2.store.nodesMap;
                    for(var key in _nodesMap) {
                        if(_nodesMap[key].id === 1){
                            _nodesMap[key].expanded = true;
                            continue;
                        }
                        _nodesMap[key].expanded = false;
                    }
                }

                if(val != "在线" && val != "离线")this.tab.model = "all";
            },

            //过滤车辆的方法
            filterNode(value, data) {
                if (!value) return true;
                return data.labelState.indexOf(value) !== -1;
            },
        },
        beforeDestroy() {
            if(this.timer)clearInterval(this.timer);
        }

    }

</script>

<style scoped> 
    .dCars{position:absolute;top:50px;right:0px;width:270px;background:#fff;box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);padding:5px 15px 15px 15px;}
    .dCars-list{width:100%;max-height:500px;overflow-y: scroll;}
    .dCars-list-f5{position:absolute;top:7px;right:6px;width:30px;height:30px;line-height:34px;text-align:center;cursor: pointer;}
    .dCars-list-f5 i{font-size:18px;}
</style>
