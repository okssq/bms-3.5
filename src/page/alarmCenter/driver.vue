<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <div class="schCnt">
                <div class="schCnt-btnGroup">
                    <el-button-group>
                        <el-button
                            v-for="(item , index) in btngroup"
                            :key="index"
                            :plain="item.isActive ? false : true"
                            :type="item.isActive ? 'primary' : '' "
                            :icon="index===0 ?'el-icon-tickets':(index===1?'el-icon-picture-outline':'el-icon-video-camera')"
                            @click="EVT_changeShowStyle(item.ajaxType,index)"
                        >{{item.name}}</el-button>
                    </el-button-group>
                </div>
                <div class="schCnt-btn" v-if="btngroup[0].isActive">
                    <el-button @click="EVT_download" type="primary">下载事件记录</el-button>
                    <el-button @click="EVT_allDownload" type="primary">下载全部事件</el-button>
                </div>
            </div>
            <Table
                :bottom_totalShow="true"
                :props="DATA_tbProps"
                v-if="btngroup[0].isActive"
                @setPage="GET_page_table"
                @delOne="EVT_delOne"
                @setTable="GET_table"
            />
            <Img
                :props="DATA_imgProps"
                v-if="btngroup[1].isActive"
                @setPageimg="GET_page_img"
                @imgDelOne="EVT_delOne"
            />
            <Video
                :props="DATA_videoProps"
                v-if="btngroup[2].isActive"
                @setPagevideo="GET_page_video"
                @videoDelOne="EVT_delOne"
            />
        </div>
    </div>
</template>

<script>
import Menu from "components/schMenu/menu.vue";
import Table from "components/list/table.vue";
import Img from "components/list/img.vue";
import Video from "components/list/video.vue";
import Server from "service/mm.jsx";
const _mm = new Server();

var picker = {
    disabledDate(time) {
        return (
            time.getTime() >
                new Date(
                    new Date(new Date().toLocaleDateString()).getTime() +
                        24 * 60 * 60 * 1000 -
                        1
                ) ||
            time.getTime() < new Date(new Date().getTime() - 86400000 * 60)
        );
    }
};

export default {
    data() {
        return {
            resTotal: "0",
            btngroup: [
                { name: "列表", isActive: true, ajaxType: "1" },
                { name: "图片", isActive: false, ajaxType: "2" },
                { name: "视频", isActive: false, ajaxType: "3" }
            ],
            loading: false,
            DATA_menuProps: {
                title: "报警记录",
                items: [
                    {
                        name: "上传时间",
                        type: "datetimerange",
                        key: "time",
                        value: [
                            _mm.getDate({ type: "today" }),
                            _mm.getDate({ type: "todayLast" })
                        ],
                        picker: picker
                    },
                    {
                        name: "车牌号码",
                        type: "vehicleList",
                        key: "license",
                        value: [],
                        init: {
                            tab: {
                                //标签选项卡
                                is: false //是否开启
                            },
                            tree: {
                                //树型结构
                                isCheckbox: true, //开启多选（默认：false）
                                loading: true, //加载动画（默认：false）
                                defaultProps: {
                                    //树型结构的标题字段
                                    label: "labelState",
                                    children: "children"
                                }
                            }
                        }
                    },
                    {
                        name: "报警类型",
                        type: "alarmDriver",
                        key: "alarm",
                        value: "",
                        txt: "请选择"
                    },
                    {
                        key: "companyId",
                        name: "公司名称",
                        type: "singleCompany",
                        value: "",
                        options: []
                    },
                    {
                        type: "btn",
                        key: "btn",
                        btns: [
                            { name: "搜索", key: "search" },
                            { name: "清除", key: "clear" }
                        ]
                    }
                ]
            },
            DATA_tbProps: {
                title: [
                    { type: "selection", prop: "k0", width: "50" },
                    { name: "上传时间", type: "", prop: "k1", width: "" },
                    { name: "车牌号码", type: "", prop: "k2", width: "" },
                    { name: "报警类型", type: "", prop: "k4", width: "" }
                    // {name:"上传地点",type:"",prop:"k3",width:""},
                ],
                items: [],
                opeations: [],
                page: {
                    size: 10,
                    total: 0,
                    sync: 1
                }
            },
            DATA_imgProps: {
                page: {
                    size: 10,
                    total: 0,
                    sync: 1
                },
                list: [],
                options: []
            },
            DATA_videoProps: {
                page: {
                    size: 10,
                    total: 0,
                    sync: 1
                },
                list: [],
                options: []
            },
            checks: [],
            postData: {}
        };
    },
    components: {
        Menu: Menu,
        Table: Table,
        Img: Img,
        Video: Video
    },
    computed: {
        nowSeeType: function() {
            //现在看的type类型是
            return this.btngroup.filter(function(OLD_value) {
                return OLD_value.isActive === true;
            })[0].ajaxType;
        }
    },
    created() {
        this.fn_init();
    },
    // mounted(){
    //     this.EVT_search();//搜索
    // },
    methods: {
        // 初始化事件
        async fn_init() {
            let isDeBang = await this.ajax_isDeBang();
            this.fn_isDeBang(isDeBang);
            let companyList = await this.ajax_company_level();
            this.fn_companyTree_list(companyList);
            this.EVT_search();
        },
        ajax_company_level() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url: "/company/company_level.json"
                }).then(
                    res => {
                        resolve(res);
                    },
                    function(err) {
                        reject(err);
                    }
                );
            });
        },
        fn_companyTree_list(res) {
            let arr = res;
            arr.forEach(el => {
                el.name = el.companyName;
                el.value = el.id;
                el.actived = false;
                if ((el.children || []).length) {
                    this.fn_companyTree_list(el.children);
                }
            });
            this.DATA_menuProps.items[3]["options"] = arr;
            return arr;
        },
        //  判断是否是德邦用户
        ajax_isDeBang() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url: "/close/close_warn.json"
                }).then(
                    res => {
                        resolve(res);
                    },
                    function(err) {
                        reject(err);
                    }
                );
            });
        },
        //  渲染删除按钮
        fn_isDeBang(isDeBang) {
            if (isDeBang == 1) {
                this.DATA_tbProps.opeations = [
                    { name: "查看", evt: "showImg" },
                    { name: "删除", evt: "remove" }
                ];
                this.DATA_imgProps.options = [{ name: "删除", evt: "remove" }];
                this.DATA_videoProps.options = [
                    { name: "删除", evt: "remove" }
                ];
            } else {
                this.DATA_tbProps.opeations = [
                    { name: "查看", evt: "showImg" }
                ];
                this.DATA_imgProps.options = [];
                this.DATA_videoProps.options = [];
            }
        },

        //搜索按钮事件
        EVT_search(i) {
            let _this = this;
            this.DATA_tbProps.page = {};

            let postData = {
                startTime: "",
                endTime: "",
                vehicleId: "",
                warningId: "",
                companyId: "",
                pageSize: 10,
                type: _this.nowSeeType,
                warningType: "1"
            };
            if (i) {
                postData.startTime = i.time.start;
                postData.endTime = i.time.end;
                postData.companyId = i.companyId;
                postData.vehicleId = JSON.stringify(i.license);
                postData.warningId = JSON.stringify(i.alarm);
            }
            _this.DATA_videoProps.page.sync = 1;
            _this.DATA_imgProps.page.sync = 1;
            _this.DATA_tbProps.page.sync = 1;
            this.postData = postData;
            this.ajax_serach(postData);
        },
        //搜索接口
        ajax_serach(set) {
            let _this = this;
            _this.loading = true;
            _mm.request({
                url: "/alarm/alarm_list.json",
                data: set
            }).then(
                res => {
                    _this.DATA_tbProps.items = [];
                    _this.DATA_imgProps.list = [];
                    _this.DATA_videoProps.list = [];
                    if (set.type === "1") {
                        _this.fn_viewList(res);
                    } else if (set.type === "2") {
                        _this.fn_viewImg(res);
                    } else if (set.type === "3") {
                        _this.fn_videoImg(res);
                    }
                    _this.resTotal = res.totalCount;
                    _this.DATA_tbProps.page.total = res.totalCount
                        ? res.totalCount
                        : 0;
                    _this.loading = false;
                },
                function() {
                    _this.loading = false;
                }
            );
        },

        //fn-列表
        fn_viewList(res) {
            let _this = this;
            let arr = [];
            res.results.forEach((el, index) => {
                arr.push({
                    set: {
                        id: el.id,
                        imgsrc: el.imageUrl
                            ?  el.imageUrl
                            : "",
                        videosrc: el.ossVideoUrl
                            ?  el.ossVideoUrl
                            : ""
                    },
                    k1: el.warningTime,
                    k4: el.warningName,
                    k2: el.vehicleLicence
                    // k3:el.warningPlace
                });
            });
            _this.DATA_tbProps.page.total = res.totalCount;
            _this.DATA_tbProps.page.size = 10;
            _this.DATA_tbProps.items = arr;
        },
        //fn-图片列表
        fn_viewImg(res) {
            let _this = this;
            let arr = [];
            res.results.forEach((el, index) => {
                let txts = [
                    { name: "车牌号码", value: el.vehicleLicence },
                    { name: "上传时间", value: el.warningTime },
                    { name: "所属公司", value: el.companyName }
                    // {name :'上传地点',value:el.warningPlace}
                ];
                arr.push({
                    id: el.id,
                    src: el.imageUrl ? el.imageUrl : "",
                    evtTxt: el.warningName,
                    txts: txts
                });
            });
            _this.DATA_imgProps.page.total = res.totalCount;
            _this.DATA_imgProps.page.size = 10;
            _this.DATA_imgProps.list = arr;
        },
        //fn-视频列表
        fn_videoImg(res) {
            let _this = this;
            let arr = [];
            res.results.forEach((el, index) => {
                let txts = [
                    { name: "车牌号码", value: el.vehicleLicence },
                    { name: "上传时间", value: el.warningTime },
                    { name: "所属公司", value: el.companyName }
                    // {name :'上传地点',value:el.warningPlace}
                ];
                arr.push({
                    id: el.id,
                    imgSrc: el.imageUrl
                        ?  el.imageUrl
                        : "",
                    videoSrc: el.ossVideoUrl
                        ? el.ossVideoUrl
                        : "",
                    evtTxt: el.warningName,
                    txts: txts
                });
            });
            _this.DATA_videoProps.page.total = res.totalCount;
            _this.DATA_videoProps.page.size = 10;
            _this.DATA_videoProps.list = arr;
        },

        //点击展示方式
        EVT_changeShowStyle(type, index) {
            let _this = this;
            for (let i = 0; i < _this.btngroup.length; i++) {
                //设置Active样式
                if (index === i) {
                    if (_this.btngroup[i].isActive === true) {
                        return;
                    }
                    _this.btngroup[i].isActive = true;
                    continue;
                }
                _this.btngroup[i].isActive = false;
            }

            _this.DATA_tbProps.page.sync = 1;
            _this.DATA_imgProps.page.sync = 1;
            _this.DATA_videoProps.page.sync = 1;
            _this.postData.page = "1";
            _this.postData.type = _this.nowSeeType;
            this.ajax_serach(_this.postData);
        },

        //回调-表格
        GET_table(data) {
            let arr = [];
            data.forEach((el, index) => {
                arr.push(el.id);
            });
            this.checks = arr;
        },

        //callback-分页改变
        GET_page_table(data) {
            document.getElementsByTagName("main")[0].scrollTop = 0;
            this.postData.page = data;
            this.DATA_tbProps.page.sync = data;
            this.ajax_serach(this.postData);
        },
        GET_page_img(data) {
            document.getElementsByTagName("main")[0].scrollTop = 0;
            this.postData.page = data;
            this.DATA_imgProps.page.sync = data;
            this.ajax_serach(this.postData);
        },
        GET_page_video(data) {
            document.getElementsByTagName("main")[0].scrollTop = 0;
            this.postData.page = data;
            this.DATA_videoProps.page.sync = data;
            this.ajax_serach(this.postData);
        },

        //批量下载
        EVT_download() {
            if (this.checks.length === 0) {
                _mm.msgErr("请至少选择一条数据");
                return;
            }
            let postData = "?ids=" + JSON.stringify(this.checks);
            // console.log('批量下载的地址',postData);
            window.open("/sicp/alarm/down_warning_info.json" + postData);
        },
        //下载全部事件
        EVT_allDownload() {
            if (
                this.DATA_tbProps.page.total === 0 ||
                this.DATA_tbProps.page.total === "0"
            ) {
                _mm.msgErr("当前搜索条件没有可下载的数据！");
                return;
            }
            let data = {
                endTime: this.postData.endTime,
                startTime: this.postData.startTime,
                vehicleId: this.postData.vehicleId,
                warningId: this.postData.warningId,
                warningType: this.postData.warningType
            };
            // console.log('$.param(data)',$.param(data));
            window.open(
                "/sicp/alarm/down_all_warning_info.json" + "?" + $.param(data)
            );
        },

        //删除按钮事件
        EVT_delOne(item) {
            // console.log("item",item)
            this.loading = true;
            let arr = [item.id];
            let data = JSON.stringify(arr);
            let postData = { ids: data };
            this.ajax_delOne(postData);
        },
        //接口-- 删除接口
        ajax_delOne(data) {
            let _this = this;
            _mm.request({
                url: "/alarm/delete_warning_info.json",
                data: data
            }).then(
                res => {
                    _mm.msgSss("删除成功");
                    _this.ajax_serach(_this.postData);
                },
                function(err) {
                    // console.log(err);
                    _mm.msgErr("删除失败");
                    _this.loading = false;
                }
            );
        }
    }
};
</script>

<style scoped>
.schCnt {
    margin-bottom: 15px;
    min-height: 30px;
}
.schCnt-btnGroup button {
    margin-right: 15px;
}
</style>
