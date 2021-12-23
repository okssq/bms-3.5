<template>
    <div class="operation">
        <div class="video-list">
            <div class="video-item" v-for="(item,index) in list" :key="index">
                <div class="video-item-tle">
                    <!-- 车辆列表选择器 -->
                    <VehicleTree :propsRef="init" @rback="carTree_click($event,item,index)" />

                    <!-- 视频通道下拉框 -->
                    <el-select v-model="item.ck_channel" placeholder="请选择" class="channel_select">
                        <el-option
                            v-for="(_item,_index) in item.ck_options"
                            :key="_index"
                            :label="_item.name"
                            :value="_item.code"
                        ></el-option>
                    </el-select>
                    <!-- 播放或停止按钮 -->
                    <el-button
                        v-if="item.isShowPlay"
                        class="dbtn dbtn-blue"
                        :class="{'disabled':item.btnDisabled}"
                        @click="playBtn(index)"
                        :disabled="item.btnDisabled"
                    >{{item.btnName}}</el-button>
                    <el-button v-else class="dbtn dbtn-blue" @click="stopBtn(index)">停止</el-button>
                </div>
                <div class="video-item-cnt" v-loading="item.loading">
                    <XzVideo
                        v-if  ="item.isPlay"
                        :src  ="item.src"
                        @play ="evt_play(item,index)"
                        @end  ="evt_videoEnd(item,index)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Server from "service/mm.jsx";
const _mm = new Server();
import XzVideo from "components/video/index.vue";
import VehicleTree from "components/schMenu/cars.vue";

let timer_vehicleList = 0;
export default {
    data() {
        return {
            init: {
                tab: {
                    //标签选项卡
                    is: true //是否开启
                },
                tree: {
                    //树型结构
                    autoData: false, //开启自动数据（默认：true）
                    setData: false, //开启外部数据（默认：false）
                    loading: false,
                    lists: [], //外部数据源
                    defaultProps: {
                        //树型结构的标题字段
                        label: "labelState",
                        children: "children"
                    }
                },
                //输入建议
                proposal: {
                    lists: [],
                    checked: null,
                    model: ""
                },
                //车辆统计
                count: {
                    all: 0,
                    online: 0,
                    offline: 0
                }
            },
            list: [
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                },
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                },
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                },
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                },
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                },
                {
                    loading: false,
                    isPlay: false,
                    ck_channel: "",
                    ck_options:[],
                    src: "",
                    isShowPlay: true,
                    btnDisabled: false,
                    btnName: "播放",
                    timer: 0,
                    vehicleId:"",
                    state:'',
                    vehicleLicence:"",
                    video_reqCount:0,
                }
            ]
        };
    },
    components: {
        XzVideo,
        VehicleTree
    },
    created() {
        this.ajax_vehicleList();
    },
    mounted() {
        timer_vehicleList = setInterval( () => {
            this.ajax_vehicleList('refresh');
        },120000)
    },
    methods: {
      
        // 获取车辆列表
        ajax_vehicleList(type) {
            this.init.tree.loading = true;
            if (type && type === "refresh") {
                if (timer_vehicleList) {
                    clearInterval(timer_vehicleList);
                    timer_vehicleList = 0;
                }
            }
            _mm.request({
                url: "/vehicle/vehicle_list_level.json"
            }).then(
                res => {
                    // console.log('type',type)
                    this.init.tree.lists     = [];
                    this.init.proposal.lists = [];
                    this.init.count = {
                        all: 0,
                        online: 0,
                        offline: 0
                    };

                    this.init.tree.setData = true;
                    
                    this.format_dataCar({ items: res },type);
                    this.init.tree.lists = res;
                    if (type && type === "refresh") {
                        timer_vehicleList = setInterval(() => {
                            this.ajax_vehicleList("refresh");
                        }, 120000);
                    }
                    this.init.tree.loading = false;
                },
                function(err) {
                    console.log(err);
                }
            );
        },

        // 车辆数据自解析
        format_dataCar(res,type) {
            // console.log('执行了要看的',type)
            let _this = this;
            let _items = res.items;

            let _cc = {
                count_all:0,
                online:0,
                offline:0
            };
            for (let i = 0; i < _items.length; i++) {
                //多维数组下标（id）
                _items[i].zIndexId = res.zIndexId
                    ? _mm.objDeepCopy(res.zIndexId)
                    : [];
                _items[i].zIndexId.push(_items[i].id);

                //多维数组下标（索引）
                _items[i].zIndex = res.zIndex
                    ? _mm.objDeepCopy(res.zIndex)
                    : [];
                _items[i].zIndex.push(i);

                //输入建议列表
                _this.init.proposal.lists.push({
                    value: _items[i].label,
                    zIndexId: _items[i].zIndexId,
                    zIndex: _items[i].zIndex,
                    id: _items[i].id
                });

                //当前数据是车辆数据
                if (_items[i].type == "2") {
                    this.init.count.all++;
                    _cc.count_all++;
                    _items[i].cls = "0";

                    if (_items[i].data.state == "0") {
                        this.init.count.offline++;
                        _cc.offline++;
                        _items[i].labelState =
                            _items[i].data.vehicleLicence + "(离线)";
                    } else if (_items[i].data.state == "1") {
                        this.init.count.online++;
                        _cc.online++;
                        _items[i].labelState =
                            _items[i].data.vehicleLicence + "(在线-停车)";
                    } else if (_items[i].data.state == "2") {
                        this.init.count.online++;
                        _cc.online++;
                        _items[i].labelState =
                            _items[i].data.vehicleLicence + "(在线-行驶)";
                    }
                    if(type && type === 'refresh'){
                        for(let j=0,len=this.list.length;j<len;j++){
                            if(!this.list[j].vehicleId){continue}
                            if(this.list[j].vehicleId && _items[i].id === this.list[j].vehicleId){
                                this.list[j].state = _items[i].data.state;
                                if(_items[i].data.state === "0"){
                                    if(this.list[j].isPlay){
                                        _mm.msgErr('车辆'+this.list[j].vehicleLicence+'已离线！');
                                    }
                                    this.stopBtn(j);
                                }
                                // console.log(
                                //     'vehicleId:'
                                //     + this.list[j].vehicleId
                                //     +"- vehicleLicence:"
                                //     +this.list[j].vehicleLicence
                                //     +"state:"
                                //     +this.list[j].state);
                                    // break;
                            }
                        }
                    }
                }

                //当前数据是公司数据
                if (_items[i].type == "1") {
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

   
        // 车辆点击事件或刷新事件
        carTree_click(rbackData, item, index) {
            // 车辆点击
            if(rbackData.type === "current"){
                let data = {
                    vehicleId: rbackData.data.id,
                    state: rbackData.data.node.state,
                    vehicleLicence: rbackData.data.node.vehicleLicence
                };
                // 判断是否重复选择车辆
                if (data.vehicleId === item.vehicleId) {
                    return;
                }
                this.list[index].vehicleId      = data.vehicleId;
                this.list[index].state          = data.state;
                this.list[index].vehicleLicence = data.vehicleLicence;
            
                if (data.state === "0") {
                    _mm.msgErr("车辆未在线或刷新列表！");
                    return;
                }
                if (!this.evt_checkIsSelcet(data, index)) {
                    _mm.msgErr("您已在其他播放区域选择了该车辆！");
                    return;
                }
                this.ajax_camera_nums({ vehicleId: data.vehicleId }, index);
            }
            // 刷新点击
            else if(rbackData.type === "refresh"){
                this.ajax_vehicleList('refresh');
            }
        },
        // 判断车辆是否已在其他div选择
        evt_checkIsSelcet(data, index) {
            let vehicleId = data.vehicleId;
            for (let i = 0, len = this.list.length; i < len; i++) {
                if (index === i) {
                    continue;
                }
                if (vehicleId === this.list[i].vehicleId) {
                    return false;
                }
            }
            return true;
        },
        // 获取通道事件
        ajax_camera_nums(data, index) {
            this.list[index].ck_options = [];
            this.list[index].ck_channel = "";
            let _this = this;
            _mm.request({
                url: "/video/camera_nums.json",
                data: data
            }).then(
                res => {
                    if (res.cameraNums) {
                        const arr = [
                            { name: "司机视频", type: "1", code: "1001" },
                            { name: "路况视频", type: "2", code: "1002" },
                            { name: "第三路视频", type: "2", code: "1003" }
                        ];
                        let num = parseInt(res.cameraNums, 10);
                        _this.list[index].ck_options = arr.slice(0, num);
                    } else {
                        _mm.msgErr("该车辆暂无视频通道！");
                    }
                },
                function(err) {
                    console.log(err);
                }
            );
        },


        // 点击播放按钮事件
        playBtn(index) {
            let _this = this;
            //清除定时器,对应video内容
            if (_this.list[index].timer) {
                clearInterval(_this.list[index].timer);
                _this.list[index].timer = 0;
            }
            _this.list[index].isPlay = false;
            _this.list[index].src = "";

            if (
                !_this.list[index].vehicleId ||
                _this.list[index].state === "0"
            ) {
                _mm.msgErr("请选择在线车辆或刷新车辆列表!");
                return;
            }
            if (!_this.list[index].ck_channel) {
                _mm.msgErr("请选择视频通道!");
                return;
            }

            

            let pushRtmpData = {
                vehicleId: _this.list[index].vehicleId,
                msgBody: _this.list[index].ck_channel,
                timeToLive: "60"
            };
            let fnVideoData = {
                vehicleId: _this.list[index].vehicleId,
                type: _this.list[index].ck_channel === "1002" ? "_2" : "_1",
                index: index
            };
            //推流并渲染视频内容
            _this.ajax_pushCode_video(pushRtmpData, fnVideoData);
            
        },
        // 设置播放器禁用按钮样式
        fn_btnDisabled(i) {
            let _this = this;
            let c = 10;
            let timer;
            function timedCount() {
                if (c === 0) {
                    _this.list[i].btnName = "播放";
                    _this.list[i].btnDisabled = false;
                    _this.list[i].isShowPlay = false;
                    return;
                }
                _this.list[i].btnName = "播放" + c;
                _this.list[i].btnDisabled = true;
                c -= 1;
                //延时1s执行程序，执行自身函数timedCount
                timer = setTimeout(timedCount, 1000);
            }
            timedCount();
        },
        // 点击停止按钮事件
        stopBtn(index) {
            if (this.list[index].timer) {
                clearInterval(this.list[index].timer);
                this.list[index].timer = 0;
            }
            this.list[index].loading = false;
            this.list[index].isPlay = false;
            this.list[index].src = "";
            this.list[index].isShowPlay = true;
            this.list[index].btnDisabled = false;
            this.list[index].btnName = "播放";
            this.list[index].video_reqCount = 0;
        },
        // 推流接口
        ajax_pushCode_video(pushRtmpData, fnVideoData) {
            let _this = this;
            _this.list[fnVideoData.index].loading = true;
            _this.list[fnVideoData.index].isPlay = false;
            _mm.request({
                url: "/video/down_real_video.json",
                data: pushRtmpData
            }).then(
                res => {
                    _this.fn_btnDisabled(fnVideoData['index']);
                    _this.list[fnVideoData.index].src =
                        res.rtmpUrl + fnVideoData.vehicleId + fnVideoData.type;
                    _this.list[fnVideoData.index].isPlay = true;
                },
                function(err) {
                    _this.stopBtn(fnVideoData['index'])
                }
            );
        },
        // 心跳接口
        ajax_real_heart_beat(set) {
            let _this = this;
            _mm.request({
                url: "/video/real_heart_beat.json",
                data: set
            }).then(res => {});
        },
        // 视频播放成功
        evt_play(item,index){
            item.loading = false;
            item.video_reqCount = 0;
            let _this = this;
            //连接视频心跳
            if(!this.list[index].timer){
                this.list[index].timer = setInterval(function() {
                    _this.ajax_real_heart_beat({vehicleId:item.vehicleId});
                }, 30000);
            }
        },
        // 视频播放失败
        evt_videoEnd(item, index) {
            item.isPlay = false;
            item.video_reqCount = item.video_reqCount+1;
            console.log('--- 2：第'+(index+1)+'个div拉流失败第：'+item.video_reqCount+' 次');
            if(item.video_reqCount < 4) {
                console.log('--- 3：第'+(index+1)+'个div重新拉流第：'+item.video_reqCount+' 次');
                setTimeout(() => {
                    item.loading= true;
                    item.isPlay = true;
                }, 500);
            }
            else{
                this.stopBtn(index);
                _mm.msgErr(
                    item.vehicleLicence +
                        "视频播放失败，请检查车辆是否在线或其他问题！"
                );
            }
            
        }
    },
    beforeDestroy(){
        if (timer_vehicleList) {
            clearInterval(timer_vehicleList);
            timer_vehicleList = 0;
        }
        let _this = this;
        for(let i=0;i<_this.list.length;i++){
            // console.log('i',_this.list[i].timer);
            if(_this.list[i].timer){
                clearInterval(_this.list[i].timer);
                _this.list[i].timer = 0;
            }
        }
    }
};
</script>
<style scoped>
.video-list {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
}
.video-item {
    width: calc((100% - 30px) / 3);
    margin-bottom: 20px;
}
.video-item-tle {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 12px;
}
.video-item-cnt {
    width: 100%;
    height: 0;
    padding-bottom: 75%;
    background-color: #000;
}

.dbtn.dbtn-blue {
    margin-right: 0;
    cursor: pointer;
    padding: 0 20px;
    color: #fff;
    height: 30px;
    box-sizing: border-box;
}
.dbtn.dbtn-blue.disabled {
    color: #ccc;
    cursor: not-allowed;
}
.single-vehicle-tree-input {
    flex: 1;
    min-width: 160px;
}
</style>
