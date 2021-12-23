<template>
    <div>
        
    </div>
</template>

<script>
import Server from 'service/mm.jsx';
const _mm = new Server();
let _this;

export default{
    data(){
        return {
            count:{
                all:0,
                online:0,
                outline:0
            },
            lists:[],//一级车辆列表
            ws:'',
            timer:''
        }
    },
    created(){
        _this = this;
        this.ajax_company_vehicle_list();//获取公司车辆并且渲染列表
    },
    computed:{
        dataCars(){
            return this.$store.state.dataCars;
        },
        gpsChecked (){
            return this.$store.state.gpsChecked;
        },
        isUpdata(){
            return this.$store.state.dataCars.isUpdata;
        }
    },
    watch:{
        // isUpdata:{
        //     handler:function(val,oldval){
        //         console.log(val)
        //     },
        //     //deep:true//对象内部的属性监听，也叫深度监听
            
        // },

        isUpdata(value){
            console.log(value)
            this.ajax_company_vehicle_list();//获取公司车辆并且渲染列表
        },
    }, 
    mounted(){
        
    },
    methods:{

        //车辆数据自解析
        format_dataCar(res){

            let _items = res.items;

            let _cc = 0;//计数车辆
            for(let i=0;i<_items.length;i++){
                //多维数组下标（id）
                _items[i].zIndexId = res.zIndexId?_mm.objDeepCopy(res.zIndexId):[];
                _items[i].zIndexId.push(_items[i].id);

                //多维数组下标（索引）
                _items[i].zIndex = res.zIndex?_mm.objDeepCopy(res.zIndex):[];
                _items[i].zIndex.push(i);

                //当前数据是车辆数据
                if(_items[i].type=="2"){
                    this.count.all++;
                    _items[i].cls = "0";

                    //输入建议列表
                    _this.lists.push({
                        value:_items[i].label,
                        zIndexId:_items[i].zIndexId,
                        zIndex:_items[i].zIndex,
                        id:_items[i].id
                    })

                    if(_items[i].data.state == "0"){
                        this.count.offline++;
                        _items[i].labelState = _items[i].data.vehicleLicence + "(离线)";
                        
                    }
                    else if(_items[i].data.state == "1"){
                        this.count.online++;
                        _items[i].labelState = _items[i].data.vehicleLicence + "(在线-停车)";
                    }
                    else if(_items[i].data.state == "2"){
                        this.count.online++;
                        _items[i].labelState = _items[i].data.vehicleLicence + "(在线-行驶)";
                    }
                }

                //当前数据是公司数据
                if(_items[i].type == "1"){
                    _items[i].labelState = _items[i].label;
                    if(_items[i].children.length == 0)continue;
                    this.format_dataCar({
                        items:_items[i].children,
                        zIndexId:_items[i].zIndexId,
                        zIndex:_items[i].zIndex
                    });
                }
            }
            return _cc;
        },
        
        //获取公司车辆并且渲染列表
        ajax_company_vehicle_list(){
            this.lists = [];
            let _this = this;
            _mm.request({ 
                url:'/vehicle/vehicle_list_level.json', 
            }).then( res => {
                _this.format_dataCar({items:res});
                _this.dataCars.items = res;
                _this.dataCars.list_one = _this.lists;
                
                _this.dataCars.count = _this.count;
                _this.dataCars.isUpdata = false;
            })
        },

    },
    beforeDestroy() {
        if(this.ws)this.ws.close();
        if(this.timer)clearInterval(this.timer);
    }
    
}
</script>

<style scoped>

</style>
