<template>
    <div class="role-alert">
        <div class="role-al-bg"></div>
        <div class="role-al-main  role-alert-power">
            <div class="tle">
                <span>分配车辆</span>
                <span @click="evt_alertXXX">X</span>
            </div>
            <div class="cnt" v-if="!isAdmin">
                <div class="cnt-item">
                    <label class="cnt-item-label" for>是否查看所有的车辆：</label>
                    <div class="cnt-item-right">
                        <el-switch
                            v-model="cars.isAll"
                            active-color="#409eff"
                            inactive-color="#ccc"
                            @change="EVT_isAll">
                        </el-switch>
                    </div>
                </div>
                <div class="cnt-item" v-if="!cars.isAll">
                    <label class="cnt-item-label" for>请选择车辆：</label>
                    <div class="cnt-item-right cntTree">
                        <el-input v-model="search" class="selCars_search" :clearable="true"></el-input>
                        <el-tree 
                            :data="cars.items"
                            :props="defaultProps"
                            ref="tree"
                            node-key="id"
                            show-checkbox
                            :filter-node-method="filterNode"
                           >
                        </el-tree>
                    </div>
                </div>
                <div class="btns">
                    <div class="dbtn" @click="evt_alertXXX">取消</div>
                    <div class="dbtn dbtn-blue" @click="evt_alertSure">确定</div>
                </div>
            </div>
            <div class="cnt" v-show="isAdmin">
                管理员默认可以查看全部车辆
            </div>
        </div>
    </div>
</template>
<script>
    import Server from "service/mm.jsx";
    const _mm = new Server();
    export default {
        props:['propsRef'],
        data() {
            return {
                isAdmin:false,
                cars:{
                    isAll:false,
                    items:[]
                },
                search:'',
                defaultProps: {
                    children: 'children',
                    label: 'label'
                }
            };
        },
        created() {
            this.ajax_cars_list({userId:this.propsRef.data.id});
        },
        watch: {
            search(val) {
                this.$refs.tree.filter(val);
            }
        },
        mounted(){           
            
        },
        methods: {
            //获取车辆列表
            ajax_cars_list(set){
                let _this = this;
                _mm.request({ 
                    url:'/vehicle/echo_distribution_vehicles.json', 
                    data:set,
                    
                }).then((res)=>{
                    let _isWatchAll = res.isWatchAll==="1"?true:false;
                    _this.cars.isAll = _isWatchAll;
                    _this.cars.items = res.vehicleLevelLists;

                    if(!_isWatchAll){
                        _this.$refs.tree.setCheckedKeys(res.vehicleIds);
                    }
                    
                })
            },

            //分配车辆
            ajax_update(set){
                let _this = this;
                _mm.request({ 
                    url:'/vehicle/distribution_vehicles.json', 
                    data:set
                }).then((res)=>{
                    _mm.msg("操作成功");
                    _this.evt_alertXXX();
                })
            },
            
            // 编辑，添加弹框
            evt_alertXXX() {
                this.$store.commit("update_zIndexTop", "nav");
                this.propsRef.is = false;
            },
            evt_alertSure() {
                let _vehicleIds = "";

                let _isAll = this.cars.isAll?"1":"0";
                if(_isAll === "1"){
                    _vehicleIds="";
                    
                }else{
                    let _checks = this.$refs.tree.getCheckedNodes();
                    let _arr = [];
                    _checks.forEach(el=>{
                        if(el.type === "2"){
                            _arr.push(el.id);
                        }
                    });
                    
                    var _parentArr = this.$refs.tree.getHalfCheckedKeys();

                    _parentArr.forEach(el=>{
                        //_arr.push(el);
                    });
                    _vehicleIds = JSON.stringify(_arr);
                }
                
                this.ajax_update({
                    userId:this.propsRef.data.id,
                    vehicleIds: _vehicleIds,
                    isWatchAll: _isAll
                });
                
            },

            EVT_isAll(){
                let _isAll = this.cars.isAll;
            },

            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            }
            
        }
        
    };
</script>
<style scoped>
.selCars_search{margin-bottom:10px;margin-right:10px;}

.role-al-tree{
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    min-width: 500px;
    max-height:300px;
}
.role-al-btns{
    display: flex;padding: 20px;justify-content: flex-end;align-items: center;
    border-top: 1px solid #ccc;
}
.role-al-power{
    display: flex;flex-direction: column;
}
.role-alert-power{
    min-height: 100px;
    padding-bottom :10px;
}
.role-alert {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 4000;
}
.role-al-bg {
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
}
.role-al-main {
    z-index: 2;
    background-color: #fff;
}

.role-al-main .tle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #ccc;
}
.role-al-main .tle > span:first-of-type {
    font-size: 18px;
}
.role-al-main .tle > span:last-of-type {
    font-size: 16px;
    cursor: pointer;
}
.role-al-main .cnt {
    /* width:400px; */
    padding: 20px 40px 10px;
}
.role-al-main .cnt .cnt-item {
    display: flex;
    margin-bottom: 20px;
    width: 400px;
}
.role-al-main .cnt .cnt-item-right {
    width: 280px;
    text-align:left;
}
.role-al-main .cnt .cnt-item-label {
    flex: 1;
    font-size: 16px;
    text-align: right;
    padding-right: 20px;
    box-sizing: border-box;
}
.role-al-main .cnt .cntTree{
    max-height:300px;
    overflow:hidden;
    overflow-y:scroll;
}
.role-al-main .btns {
    display: flex;
    justify-content: flex-end;
}
</style>
