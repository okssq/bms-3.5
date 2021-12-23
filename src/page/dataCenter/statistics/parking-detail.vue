<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search"  @expAll="EVT_expAll"/>
        </div>
        <div class="dTble">
            <Table 
                :props  ="DATA_tbProps" 
                @setPage="GET_page" 
                @expAll ="EVT_expAll"
            />
        </div>
    </div>
</template>

<script>
    import Menu from 'components/schMenu/menu.vue';
    import Table from 'components/list/table.vue';
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    export default {
        components: {
            'Table': Table,
            'Menu': Menu,
        },
        data() {
            return {
                loading: false,
                tle: '',
                DATA_menuProps: {
                    items: [{
                            name: "停车状态",
                            type:"select",
                            key:"stopType",
                            value:"",
                            options:[
                                {name:'熄火停车',value:'0'},
                                {name:'怠速停车',value:'1'}
                            ]
                        },
                        {
                            type: "btn",
                            key: "btn",
                            btns: [{
                                    name: "搜索",
                                    key: "search",
                                    model: "search",
                                    cls: "dbtn-blue"
                                },
                                {
                                    name: "导出全部",
                                    key: "expAll",
                                    cls: "dbtn-blue",
                                    disNum:10,
                                    disTimeOutIndex:0
                                }
                            ]
                        }
                    ]
                },
                DATA_tbProps: {
                    title: [{
                            name: "车牌号",
                            type: "",
                            prop: "k1",
                            width: ""
                        },
                        {
                            name: "停车时长(秒)",
                            type: "",
                            prop: "k2",
                            width: ""
                        },
                        {
                            name: "开始时间",
                            type: "",
                            prop: "k3",
                            width: ""
                        },
                        {
                            name: "结束时间",
                            type: "",
                            prop: "k4",
                            width: ""
                        },
                        {
                            name: "地点",
                            type: "",
                            prop: "k5",
                            width: ""
                        },
                        {
                            name: "停车状态",
                            type: "",
                            prop: "k6",
                            width: ""
                        },
                    ],
                    items: [],
                    page: {
                        size: 10,
                        total: 0,
                    },
                },
                postData: {
                    page     : '1',
                    vehicleId: '',
                    startTime: '',
                    endTime  : '',
                    online   : ''
                },
                expAllName   : '导出全部',
                expAllDisable: false
            };
        },
        created() {
            if (!this.$route.query.vehicleId) {
                this.$router.push({
                    path: '/data-center/parking'
                });
                return;
            }
            let _name;
            if (this.$route.query.type === "view") {
                _name  = '查看';
                this.postData.startTime = this.$route.query.startTime;
                this.postData.endTime   = this.$route.query.endTime;
                this.postData.vehicleId = this.$route.query.vehicleId;
            }
            this.EVT_search();
        },
        methods: {
            //搜索按钮
            EVT_search(i) {
                // console.log('i',i)
                let _this = this;
                if (i) { _this.postData.stopType = i.stopType ? i.stopType : '-1'; }
                else {
                    _this.postData.stopType = '-1';
                 }
                _this.postData.page = '1';
                _this.DATA_tbProps.page.sync = 1;
                _this.ajax_getInfo(_this.postData);
            },
            //other获取单个信息
            ajax_getInfo(data) {
                let _this = this;
                this.loading = true;
                _mm.request({
                    url: '/basic/vehicle_stop_info.json',
                    data: data
                }).then((res) => {
                    if (res.results.length === 0) {
                        _this.DATA_tbProps.items      = [];
                        _this.DATA_tbProps.page.total = 0;
                        _this.loading                 = false;
                        return;
                    }
                    _this.fn_TBList(res); //渲染表格
                    _this.loading = false;
                }, function (err) {
                    console.log(err);
                    _this.loading = false;
                })
            },
            //渲染表格所需数据
            fn_TBList(res) {
                let _this = this;
                let arr = [];
                res.results.forEach((el, index) => {
                    arr.push({
                        k1: el.vehicleLicence,
                        k2: el.stopTimes,
                        k3: el.startTime,
                        k4: el.endTime,
                        k5: el.poiName,
                        k6: el.online === '1' ? '怠速停车' : '熄火停车' 
                    });
                });
                _this.DATA_tbProps.page.total = res.totalCount;
                _this.DATA_tbProps.items      = arr;
            },
            //分页点击
            GET_page(i) {
                this.postData.page          = i;
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
                    endTime  : this.postData.endTime ,
                    startTime: this.postData.startTime ,
                    vehicleId: this.postData.vehicleId ,
                    stopType : this.postData.stopType ,
                }
                // console.log('data',data);
                window.open("/sicp/basic/down_vehicle_stop_info.json"+'?'+$.param(data));
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
    .hbody>.cnt {
        border: 1px solid #DAE0E6;
    }
    .dTble{position: relative;}
    .schCnt-expall{position: absolute;right: 0;top:0;}
</style>
