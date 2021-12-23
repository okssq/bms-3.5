<template>
    <div class="dCard">
        <div class="dCard-header zoom">
            <div class="dCard-header-text">
                <el-autocomplete
                    class="inline-input"
                    v-model="search.input"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入车牌"
                    :trigger-on-focus="false"
                    @select="handleSelect"
                    clearable
                ></el-autocomplete>
            </div>
            <div class="dCard-header-btn" @click="EVT_cardInfo"><i :class="search.btnCls?'el-icon-close':'el-icon-tickets'"></i></div>
            
        </div>
        <!-- <loadCarData /> -->
        <d-cars ref="ref_cars" :propsRef="dCars" v-show="dCars.is" @rback="rback_cars" />
    </div>
</template>

<script>
    import LoadCarData from '@/store/car/load.vue';
    import dCars from './cars.vue';

    import Server  from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        props:['propsRef'],
        data(){
            return {
                search:{
                    input:'',
                    btnCls:false
                },
                dCars:{
                    is:true,
                    filter:""
                },
                list_one:[]
            }
        },
        components:{
            'loadCarData':LoadCarData,
            'dCars':dCars
        },
        created () {
            
        },
        mounted(){
            

            
        },
        computed:{
            dataCars(){
                return this.$store.state.dataCars;
            }
        },
        watch:{
            search:{
                handler:function(val,oldval){
                    if(!val.input){
                        this.dCars.filter = "";
                    }
                },
                deep:true//对象内部的属性监听，也叫深度监听
                
            },

            propsRef:{
                handler:function(val,oldval){
                    this.search.input = val.checked;
                    this.dCars.filter = val.checked;
                    if(val.checked){
                        this.search.btnCls = true;
                        this.dCars.is = true;
                    }
                },
                deep:true//对象内部的属性监听，也叫深度监听
                
            },
        },
        methods: {
            //收起车辆列表
            EVT_cardInfo(){
                this.search.btnCls = !this.search.btnCls;
                this.dCars.is = !this.dCars.is;
            },

            //检索id所在的zindex
            fn_check_zindex(res){
                let _id = res.id;
                let _lists = this.list_one;
                for(let i=0;i<_lists.length;i++){
                    if(_lists[i].id == _id){
                        let _data = _lists[i];
                        this.$refs.ref_cars.EVT_select({
                            id:_data.id,
                            value:_data.name,
                            zIndex:_data.zIndex,
                            zIndexId:_data.zIndexId,
                            state:_data.data.state
                        });
                        break;
                    }
                }
            },

            //选中相应数据
            handleSelect(item) {
                this.dCars.is = true;
                this.search.btnCls = true;
                this.dCars.filter = item.value;

                this.$refs.ref_cars.EVT_select({
                    id:item.id,
                    value:item.name,
                    zIndex:item.zIndex,
                    zIndexId:item.zIndexId,
                    state:item.data.state
                });

                let _getData = item.data;
                let _obj = {
                    type:"click",
                    vehicleId:_getData.vehicleId,
                    vehicleLicence:_getData.vehicleLicence,
                    state:_getData.state,
                    lnglat:[_getData.gpsLon,_getData.gpsLat],
                }
                this.$store.commit('updata_gpsChecked',_obj);
            },

            querySearch(queryString, cb) {
                var restaurants = this.list_one;
                var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },

            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.toUpperCase().indexOf(queryString.toUpperCase()) > -1);
                };
            },

            rback_cars(res){
                if(res.type === "dataCarsList")this.list_one = res.data.items;

                if(res.type === "current"){
                    let _getData = res.data.node;
                    let _obj = {
                        type:"click",
                        vehicleId:_getData.vehicleId,
                        vehicleLicence:_getData.vehicleLicence,
                        state:_getData.state,
                        lnglat:[_getData.gpsLon,_getData.gpsLat],
                    }
                    this.$store.commit('updata_gpsChecked',_obj);
                }
            }
        },
        beforeDestroy() {
            
        }

    }

</script>

<style scoped> 
    .dCard{position:absolute;top:10px;right:10px;width:300px;background:#fff;box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);z-index:110}
    .dCard-header{}
    .dCard-header-text{float:left;width:calc(100% - 71px);padding-left:30px;background-image:url('https://dsm.xiaozhenkj.com/cdn/img/icon/iconTop.png');background-repeat:no-repeat;background-size:20px;background-position:10px 10px}
    .dCard-header-btn{float:right;width:40px;height:40px;border-left:1px solid #eee;cursor: pointer;}
    .dCard-header-btn{text-align:center;line-height:44px;}
    .dCard-header-btn i{font-size:18px;}
</style>
