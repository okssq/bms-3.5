<template>
    <div class="operation" v-loading="loading">
        <div class="dTble">
            <div class="schCnt-expall">
                <button class="dbtn dbtn-blue" @click="EVT_expAll" :disabled="expAllDisable">
                    {{expAllName}}
                </button>
            </div>
            <Table :props="DATA_tbProps" @setPage="GET_page"/>
        </div>
    </div>
</template>

<script>

import Table    from 'components/list/table.vue';
import Server   from 'service/mm.jsx';
const _mm = new Server();

export default{
    components:{
        'Table': Table
    },
    data() {
        return {
            loading : false ,
            DATA_tbProps:{
                title:[
                    {name: "车牌号",type: "",prop: "k1",width: ""},
                    {name: "平均速度(km/h)",type: "",prop: "k2",width: ""},
                    {name: "开始时间",type: "",prop: "k3",width: ""},
                    {name: "起始地点",type: "",prop: "k4",width: ""},
                    {name: "结束时间",type: "",prop: "k5",width: ""},
                    {name: "结束地点",type: "",prop: "k6",width: ""},
                ],
                items:[],
                page:{
                    size : 10,
                    total: 0,
                },
            },
            postData:{
                page     : '1',
                vehicleId: '',
                startTime: '',
                endTime  : ''
            },
            expAllName: '导出全部',
            expAllDisable: false
        };
    },
    created(){
        if(!this.$route.query.vehicleId){
            this.$router.push({path:'/data-center/speeding'}); return;
        }
        let _name;
        if(this.$route.query.type      === "view"){
            _name = '查看';
            this.tle = '查看详情';
            this.postData.startTime = this.$route.query.startTime;
            this.postData.endTime   = this.$route.query.endTime;
            this.postData.vehicleId = this.$route.query.vehicleId;
        }
        this.ajax_getInfo(this.postData);
    },
    methods:{
        //other获取单个信息
        ajax_getInfo(data){
            let _this = this ;
            this.loading = true;
            _mm.request({ 
                url:'/basic/vehicle_over_speed_info.json', 
                data:data
            }).then((res)=>{
               if(res.results.length === 0){
                    _this.DATA_tbProps.items      = [];
                    _this.DATA_tbProps.page.total = 0;
                    _this.loading                 = false;
                    return;
                }
                _this.fn_TBList(res);    //渲染表格
                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //渲染表格所需数据
        fn_TBList(res){
            let _this = this;
            let arr = [];
            res.results.forEach((el,index)=>{
                arr.push({
                    k1: el.vehicleLicence,
                    k2: el.avgSpeed,
                    k3: el.startTime,
                    k4: el.startPoiName,
                    k5: el.endTime,
                    k6: el.endPoiName,
                    
                });
            });
            _this.DATA_tbProps.page.total = res.totalCount;
            _this.DATA_tbProps.items      = arr;
        },
        //分页点击
        GET_page(i){
            this.postData.page = i;
            this.DATA_tbProps.page.sync = i;
            this.ajax_getInfo(this.postData);
        },
      
        //导出全部按钮
        EVT_expAll(){
            this.fn_btnDisabled();
            if(this.DATA_tbProps.page.total === 0 || this.DATA_tbProps.page.total ==='0'){
                _mm.msgErr('当前搜索条件没有可下载的数据！');
                return
            }
            let data = {
                endTime       : this.postData.endTime ,
                startTime     : this.postData.startTime ,
                vehicleId     :this.postData.vehicleId ,
            }
            // console.log('$.param(data)',$.param(data));
            window.open("/sicp/basic/down_vehicle_over_speed_info.json"+'?'+$.param(data));
        },
        //导出全部按钮禁止效果
        fn_btnDisabled() {
            let _this = this;
            var c = 10;
            var timer;
            function timedCount() {
                if (c === 0) {
                    _this.expAllName = '导出全部';
                    _this.expAllDisable = false;
                    return;
                }
                _this.expAllName = '导出全部(' + c + ')';
                _this.expAllDisable = true;
                c -= 1;
                //延时1s执行程序，执行自身函数timedCount
                timer = setTimeout(timedCount, 1000);
            };
            timedCount();
        }
    }
    
}
</script>

<style scoped>
    .hbody>.cnt{border:1px solid #DAE0E6;}
    .dTble{position: relative;}
    .schCnt-expall{margin-bottom: 10px;}
</style>
