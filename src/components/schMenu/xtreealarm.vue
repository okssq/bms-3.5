<template>
    <div class="warn-list">
        <el-input
            placeholder="输入报警类型"
            v-model="filterText">
        </el-input>
        <el-tree
            show-checkbox
            class="filter-tree licenseTree"
            :data="alarms"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :highlight-current="true"
            node-key="id"
            ref="tree2"
            @check-change="EVT_checked">
        </el-tree>
    </div>

</template>

<script>
import Server from 'service/mm.jsx';
const _mm = new Server();
let _this;
export default{
    props:['props','set'],
    data(){
        return {
            filterText  : "",
            defaultProps: {
                children: 'children',
                label   : 'label'
            },
            alarms:[]
        }
    },

    watch: {
        filterText(val) {
            this.$refs.tree2.filter(val);
        }
    },
    computed:{
        
    },
    created(){
        // console.log("props1",this.props);
        this.fn_getData_alarm({type:this.props.type});
        
    },
    mounted(){
        //this.ajax_eventList();
    },
    methods:{
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },

        fn_getData_alarm(set){
            // console.log("set",set);
            let _this = this;
            _mm.request({
                url:'/alarm/warn_info_list.json',
            }).then((res)=>{
                if(res && res.length === 0){return}
                
                // console.log(set.type)
                if(set.type === "alarm"){
                    fn_alarm(res);
                }
                else if(set.type === "alarmDriver"){
                    fn_alarm_driver(res);
                }
                else if(set.type === "alarmVehicle"){
                    fn_alarm_vehicle(res);
                }

                
            });

            function fn_alarm(res){
                let _arr = [];
                res.forEach((el,index)=>{
                    let _one = [];
                    el.warnInfoSelects.forEach((two)=>{
                        _one.push({
                            type:"2",
                            id:two.warningId,
                            label:two.warningName
                        });
                    });

                    _arr.push({
                        type:"1",
                        id:el.warningType,
                        label:el.warningTypeName,
                        children:_one
                    });
                });

                _this.alarms = _arr;
            }

            function fn_alarm_driver(res){
                let _arr = [];
                res.forEach((el,index)=>{
                    if(el.warningType === "2")return;

                    let _one = []
                    el.warnInfoSelects.forEach((two)=>{
                        _one.push({
                            type:"2",
                            id:two.warningId,
                            label:two.warningName
                        });
                    });

                    _arr.push({
                        type:"1",
                        id:el.warningType,
                        label:el.warningTypeName,
                        children:_one
                    });
                });

                _this.alarms = _arr;
            }

            function fn_alarm_vehicle(res){
                let _arr = [];
                res.forEach((el,index)=>{
                    if(el.warningType === "1")return;

                    let _one = [];
                    el.warnInfoSelects.forEach((two)=>{
                        _one.push({
                            type:"2",
                            id:two.warningId,
                            label:two.warningName
                        });
                    });

                    _arr.push({
                        type:"1",
                        id:el.warningType,
                        label:el.warningTypeName,
                        children:_one
                    })
                });

                _this.alarms = _arr;
            }
        },

        /*复选框状态改变事件
            item    :节点对应的数组
            is      :节点是否被选中
            parentIs:你节点是否被选中
        */
        EVT_checked(item,is,parentIs){
            
            let _checkeds = this.$refs.tree2.getCheckedNodes();
            let _arr = [];
            _checkeds.forEach(el=>{
                if(el.type === "2"){
                    _arr.push(el.id);
                }
            });

            this.props.list = _arr;
            if(_arr.length){
                this.props.title = "已选择"+_arr.length+"项";
            }
            else{
                this.props.title = "请选择报警类型";
            }
            
        },

        fn_clear(){
            this.$refs.tree2.setCheckedKeys([]);
        },

        // popover显示时事件
        evt_showRender(){
            this.searchText = '';
        }
    }
    
}
</script>

<style scoped>
.warn-list{

}

</style>

