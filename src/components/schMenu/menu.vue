<template>
    <div class="schMenu">
        <div class="cnt zoom" :style="data.style||{}">
            <div class="item zoom" v-for="i in data.items" :key="i.key">
                <!--  时间区域选择框  '00:00:00', '23:59:59' -->
                <template class="zoom" v-if="i.type === 'datetimerange'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-date-picker
                            v-model="i.value"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            format="yyyy-MM-dd HH:mm:ss"
                            type="daterange"
                            unlink-panels
                            :picker-options="i.picker||picker"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']"
                        >
                        </el-date-picker>
                    </div>
                </template>
                <!--  日期选择框  'yyyy-MM-dd' -->
                <template class="zoom" v-else-if="i.type === 'date'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-date-picker
                            v-model="i.value"
                            value-format="yyyy-MM-dd"
                            type="date"
                            :picker-options="i.picker||picker"
                            placeholder="选择日期">
                        </el-date-picker>
                    </div>
                </template>
                <!--  文本输入框  -->
                <template class="zoom" v-else-if="i.type === 'text'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-input
                            placeholder="请输入内容"
                            v-model.trim="i.value"
                            :maxlength="i.maxlength || 10"
                            clearable>
                        </el-input>
                    </div>
                </template>
                <!--  数字  -->
                <template class="zoom" v-else-if="i.type === 'number'">
                    <div class="tle menu-label-number">{{i.name}}：</div>
                    <div class="cnt menu-cnt-number">
                        <el-input-number 
                            class="menu-number"
                            v-model="i.value"
                            :min="i.min ? i.min : 0"
                            :placeholder="i.placeholder || '离线大于天数'"
                            clearable
                        >
                        </el-input-number>
                    </div>
                </template>

                <!-- 下拉复选框  -->
                <template class="zoom" v-else-if="i.type === 'select'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-select 
                            v-model="i.value" 
                            clearable  
                            :filterable="i.filterable || true"
                            placeholder="请选择"
                            @change="i.EVT_change?i.EVT_change(i,data):function(){}">
                            <el-option
                            v-for="(item,index) in i.options"
                            :key="item.value + index"
                            :label="item.name"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </template>
                <!-- 单选框  -->
                <template class="zoom" v-else-if="i.type === 'radio'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-radio 
                            size="small"
                            v-for="item in i.options"
                            :key="item.value"
                            v-model="i.value" 
                            :label="item.value">
                            {{item.name}}
                        </el-radio>
                    </div>
                </template>
                <!-- 车辆输入带建议  -->
                <template class="zoom" v-else-if="i.type === 'license_search'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-autocomplete
                            class="inline-input"
                            v-model="i.value"
                            :fetch-suggestions="querySearch"
                            placeholder="请输入内容"
                            :trigger-on-focus="false"
                            clearable
                            ></el-autocomplete>
                    </div>
                </template>

                <!-- 车 树 xb -->
                <template class="zoom" v-else-if="i.type === 'vehicleList'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <VehicleTree ref="xb_carTree" :propsRef="i.init" :nowId="i.nowId" :onlyListCheckedId="i.onlyListCheckedId" @rback="rback_license($event,i)" />                        
                    </div>
                </template>
                <!-- 报警类型 -->
                <template class="zoom" v-else-if="i.type === 'alarm' || i.type === 'alarmDriver' || i.type === 'alarmVehicle'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <el-popover
                            ref="popover3"
                            popper-class="popover-warnType"
                            placement="bottom-start"
                            width="300"
                            @show = "popover_warn_show"
                            trigger="click">
                                <xtreealarm ref="ref_alarm" :props="dataAlarm" />
                                <el-button class="popover-btn" :class="{'input-placeholder':dataAlarm.title ==='请选择报警类型'}"  slot="reference" plain icon="el-icon-sunset">{{dataAlarm.title}}</el-button>
                        </el-popover>
                    </div>
                </template>
             
                <!-- 公司 单选 树 -->
                <template class="zoom" v-else-if="i.type === 'singleCompany'">
                    <div class="tle">{{i.name}}：</div>
                    <div class="cnt">
                        <SingleCompanyTree
                            ref="rer_singleCompany"
                            :list="i.options"
                            @evt_setId="i.value = $event.id"
                        />
                    </div>
                </template>
                <!--  菜单栏按钮组  -->
                <div v-else-if="i.type === 'btn'" class="schMenu-btngroup">
                    <el-button 
                         v-for="c in i.btns" 
                        :key="c.key" 
                        :disabled="c.disabled"
                        @click="c.EVT_click?c.EVT_click():ck_btn(c,i.btns)"
                        :type="c.key==='clear' ? '' : 'primary'"
                        :plain="c.key==='clear'"
                    >
                        {{c.name}}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import VehicleTree from "./cars.vue"
    import xtreealarm from './xtreealarm.vue';
    import SingleCompanyTree from 'components/schMenu/singleCompanyTree.vue'
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        props:['data'],
        data(){
            return {
                picker:{
                    disabledDate(time){
                        return time.getTime() > Date.now();
                    }
                },
                dataAlarm:{
                    title:"请选择报警类型",
                    type:"alarmDriver",
                    show:false,
                    updated:[],
                    list:[],        
                },
                timer:[]
            }
        },
        components:{
            'xtreealarm':xtreealarm,
            'SingleCompanyTree':SingleCompanyTree,
            'VehicleTree':VehicleTree
        },
        created(){
            let _this = this;
            if(this.data.items.length === 0)return;
            this.data.items.forEach((el,index)=>{
                if(el.type === "alarm"){
                    _this.dataAlarm.type = el.type;
                }else if(el.type === "alarmDriver"){
                    _this.dataAlarm.type = el.type;
                }else if(el.type === "alarmVehicle"){
                    _this.dataAlarm.type = el.type;
                }
            });
        },
        computed:{
            dataCars(){
                return this.$store.state.dataCars;
            },
        }, 
        mounted(){
            let _this = this;
            var btns = this.data.items[this.data.items.length-1].btns;
            for(let i= 0;i<btns.length;i++){
                if(btns[i].disNum){
                    _this.timer.push({timeOut:''});
                }
            }
        },
        methods:{
            //搜索或者清楚按钮
            ck_btn(c,btns){
                let _this      = this;
                let callB_data = {};
                let _items     = this.data.items;
                var btnNumber  = c.disNum;
                var btnName    = c.name;
               
                //查找
                function search(){
                    if(_this.timer && _this.timer.length > 0){
                        for(let i = 0;i<_this.timer.length;i++){
                            clearTimeout(_this.timer[i].timeOut);
                        }
                        for(let i=0;i<btns.length;i++){
                            if(btns[i].disNum === undefined){
                                continue;
                            }
                            btns[i].disNum = 10;
                            btns[i].name = btns[i].name.replace(/\(.*?\)/g,'');
                            btns[i].disabled = false;
                        }
                    }
                    for(let i=0;i<_items.length;i++){
                        let _itm = _items[i];
                        //日期和时间
                        if(_itm.type === "datetimerange"){
                            if( _itm.value === null && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                callB_data = false;
                                break;
                            }else{
                                callB_data[_itm.key] = {
                                    start:_itm.value&&_itm.value.length>0 ?_itm.value[0] : '',
                                    end:_itm.value&&_itm.value.length>0 ?_itm.value[1] : '',
                                };
                            }              
                        }
                        else if(_itm.type === "singleCompany"){
                            callB_data[_itm.key] = _itm.value;
                        }else if(_itm.type === "number"){
                            callB_data[_itm.key] = _itm.value;
                        }
                        else if(_itm.type === "alarm" || _itm.type === "alarmDriver" || _itm.type === "alarmVehicle" ){
                            if(_this.dataAlarm.list.length === 0 && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                if(_this.dataAlarm.show){
                                    _this.alarm_btnCencle();
                                }
                                callB_data[_itm.key] = _this.dataAlarm.list;
                            }
                        }else if(_itm.type === "select"){
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                            }
                        }else if(_itm.type === "date"){
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                            }
                        }else if(_itm.type === "text"){
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                            }
                        }else if(_itm.type === "license_search"){
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                            }
                        }else if(_itm.type === "radio"){
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                            }
                        }
                        else if(_itm.type === "vehicleList"){   //车树
                            if(!_itm.value && _itm.required){
                                _mm.msg("请选择"+_itm.name);
                                return;
                            }else{
                                callB_data[_itm.key] = _itm.value;
                                _itm.nowId = _itm.value;
                            }
                        }
                    }
                    if(!callB_data)return;
                    _this.$emit("serach",callB_data);
                }
                //清空
                function clear(){
                    for(let i=0;i<_items.length;i++){
                        if(_items[i].type === 'alarm' || _items[i].type === 'alarmDriver' ||_items[i].type === 'alarmVehicle' ){
                            _this.dataAlarm.show=false;
                            _this.dataAlarm.title  ='请选择报警类型';
                            _this.$refs.ref_alarm[0].fn_clear();
                            continue;
                        }
                        else if(_items[i].type === 'singleCompany'){
                            _this.$refs.rer_singleCompany[0].evt_clearInput();
                        }
                        else if(_items[i].type === 'vehicleList'){
                            if(_items[i].init.tree.isCheckbox){
                               _items[i].value = [];
                            }
                            else {
                                _items[i].value = '';
                                _items[i].nowId = '';
                            }
                            _this.$refs.xb_carTree[0].fn_clear_checks();
                            continue
                        }
                    _items[i].value='';
                    }
                }
                //按钮类型
                if(c.key === "search"){
                    search();//查找
                }else if(c.key === "clear"){
                    clear();//清空
                    _mm.msgSss('清空成功！');
                    _this.$emit("clear");
                }
                else if(c.key === "expAll"){
                    _this.$emit("expAll");
                }

            },

          
          
            
            // 报警类型poppver显示时事件
            popover_warn_show(){
                this.$refs.ref_alarm[0].filterText = '';
            },  
            

          
            // xb车树回调函数
            rback_license(data,item){
                // 点击回调
                if(data.type === 'current'){
                    item.value     = data.data.id;
                    item.otherData = data.data.node;
                    item.onlyListCheckedId = data.data.id;
                }
                // 刷新回调
                if(data.type === "refresh"){
                    this.$emit('refresh',data.data);
                }
                if(data.type === "checkbox"){
                    item.value = data.data.ids;
                }
                
                
            },

            querySearch(queryString, cb) {
                var restaurants = this.dataCars.list_one;
                // console.log("restaurants",restaurants)
                var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
                };
            },
        }
        
    }
</script>

<style scoped>
.selMulti{position:absolute;top:230px;left:320px;z-index:999;background:#fff;box-shadow:0 0px 6px 3px rgba(0,0,0,0.05)}
.selMulti-main{position: relative;}
.selMulti-main:before{content:"";position: absolute;top:-14px;left:40px;border-top:7px solid transparent;border-right:7px solid transparent;border-left:7px solid transparent;border-bottom:7px solid #fff;}
.selM-list{width:150px;height:200px;float:left;border-right:1px solid #dae0e6;padding:10px 15px;}
.selM-list:last-child{border-right:0;}
.selM-list li{position: relative;}
.selM-list li label{height:40px;line-height:40px;background-image:url("~img/icon/checkbox.png");background-repeat:no-repeat;padding-left:22px;background-position:left center;background-size:14px;position: relative;}
.selM-list li label:before{position:absolute;top:0px;right:0px;}
.selM-list li input{position:absolute;top:0px;left:0px;z-index:-1;opacity:0;}

.d-div-vsl{height: auto !important;}
.d-div-vslCnt{width:150px;font-size: 12px;background-color: #fff;border: 1px solid #dcdfe6;padding: 0 15px;line-height: 28px;height:28px;}

.selM-btn{border-top:1px solid #dae0e6;}
.selM-btn button{border:0;background:none;height:40px;float:right;width:50px;}
.selM-btn-ok{color:#409eff;}
.selM-btn-cancel{color:#909399;}

.schMenu-btngroup .dbtn{margin-right:20px;}
.schMenu-btngroup .dbtn:last-of-type{margin-right:0;}



.test-cnt{
    width: 130px;
    border: 1px solid #dcdfe6;
    padding: 0 10px;
    cursor: pointer;
    box-sizing: border-box;
    color: #606266;
    background-color: #fff;
}

</style>
