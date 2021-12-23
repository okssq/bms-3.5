<template>
    <div class="operation">  
        <!-- <Menu :data="DATA_menuProps" @serach="evt_search" @refresh="evt_refresh" />
        <div class="video-list">
            <div class="video-item" v-for="(item,index) in videoList" :key="index">
                <div class="video-item-tle">
                    <el-select class="video-item-tle_select" v-model="item.channel" placeholder="视频通道">
                        <el-option
                            v-for="(_item,_index) in selectOptions"
                            :key="_index"
                            :label="_item.name"
                            :disabled="_item.disabled"
                            :value="JSON.stringify(_item)">
                        </el-option>
                    </el-select> 
                    
                    <button 
                        :disabled ="item.playDisabled"
                        :class="{'disabled':item.playDisabled}"
                        class="dbtn dbtn-blue"
                        @click="evt_play(index)"
                    >{{item.btnPlayName}}</button>
                    <button 
                        :disabled ="item.stopDisabled"
                        :class="{'disabled':item.stopDisabled}"
                        class="dbtn dbtn-blue stopBtn"
                        @click="btnClose(index)"
                    >{{item.btnCloseName}}</button>
                </div>
                <div class="video-item-cnt" v-loading="item.loading">
                    <XzVideo v-if="item.isPlay" :src="item.src" />
                </div>
            </div>
        </div>
        <IsFlash /> -->
    </div>    
</template>
<script>
    // import Server from 'service/mm.jsx';
    // const _mm = new Server();
    // import Menu from 'components/schMenu/menu.vue';
    // import XzVideo from "components/video/index.vue";
    // import IsFlash from "components/tool/IsFlash.vue";
    // let timer_videoHeart =0;

    export default{
        data(){
            return {
                videoList:[
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        playTimer    :0,
                        stopTimer    :0,
                        playDisabled : false,
                        stopDisabled : false,
                        isPlay       : false,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    },
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        isPlay       : false,
                        playDisabled : false,
                        stopDisabled : false,
                        playTimer    :0,
                        stopTimer    :0,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    },
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        isPlay       : false,
                        playDisabled : false,
                        stopDisabled : false,
                        playTimer    :0,
                        stopTimer    :0,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    },
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        isPlay       : false,
                        playDisabled : false,
                        stopDisabled : false,
                        playTimer    :0,
                        stopTimer    :0,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    },
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        isPlay       : false,
                        playDisabled : false,
                        stopDisabled : false,
                        playTimer    :0,
                        stopTimer    :0,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    },
                    {   
                        btnPlayName  : '播放',
                        btnCloseName : '停止播放',
                        isPlay       : false,
                        playDisabled : false,
                        stopDisabled : false,
                        playTimer    :0,
                        stopTimer    :0,
                        src          : "",
                        loading      : false,
                        channel      : ''
                    }
                ],
                DATA_menuProps:{  
                    items:[
                        {
                            required: true,
                            name: "车牌号码",
                            type: "vehicleList",
                            key: "vehicleId",
                            options: [],
                            input: "",
                            value: "",
                            otherData: {},
                            loading: true
                        },
                        {type:"btn",key:"btn",btns:[
                            {name:"获取通道",key:"search",value:"",cls:"dbtn-blue"}
                        ]}
                    ]
                },
                selectOptions : [],
                postData:{},
                vehicleId     : '',
                realHeartTimer: ''
            }
        },
        components:{
            // Menu,
            // XzVideo,
            // IsFlash
        },
        created () {
           
            // this.ajax_vehicleList();
        },
        methods: {
         
            //获取车辆列表
            ajax_vehicleList() {
                let _this = this;
                this.DATA_menuProps.items[0].loading = true;
                _mm
                    .request({
                    url: "/vehicle/vehicle_list_level.json"
                    })
                    .then(
                    res => {
                        _this.DATA_menuProps.items[0].options = res;
                        _this.DATA_menuProps.items[0].loading = false;
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            },
            //刷新车辆按钮
            evt_refresh(){
                this.ajax_vehicleList();
            },
            //获取通道按钮
            evt_search(i){
                // 是否离线
                let otherData = this.DATA_menuProps.items[0].otherData;
                if (otherData.state === "0") {
                    _mm.msgErr("当前车辆离线或刷新车辆列表更新车辆状态！");
                    return;
                }
                this.fn_initData();
                this.postData = i;
                this.ajax_terminal_list(this.postData);
            },
            // 数据初始化
            fn_initData(){
                // 清除心跳定时器
                if(timer_videoHeart){
                    clearInterval(timer_videoHeart);
                    timer_videoHeart = 0;
                }
                this.videoList.forEach( el => {
                    el.channel      = '';
                    el.loading      = false;
                    el.src          = '';
                    el.isPlay       = false;
                    el.playDisabled = false;
                    el.stopDisabled = false;
                    if(el.playTimer){
                        clearInterval(el.playTimer);
                        el.playTimer = 0;
                        el.btnPlayName = '播放';
                    }
                    if(el.stopTimer){
                        clearInterval(el.stopTimer);
                        el.stopTimer = 0;
                        el.btnCloseName = '停止播放';
                    }
                })
            },
            //获取通道数
            ajax_terminal_list(set){
                let _this = this;
                _mm.request({
                    url:'/video/vehicle_terminal_list.json',
                    data:set
                }).then((res)=>{
                    _this.fn_selectOptions(res.bms.cameraNum,res.gnss.cameraNum);
                });
            },
            //渲染下拉列表
            fn_selectOptions(bmsNum,gnssNum){
                this.selectOptions = [];
                const selectOptions = [
                    {name:'司机视频',   value:0, type: "1", pushCode:'1004', closeCode: "1001",disabled:false},
                    {name:'路况视频',   value:1, type: "2", pushCode:'1004', closeCode: "1002",disabled:false},
                    {name:'第三路视频', value:2, type: "1", pushCode: "1004",closeCode: "1003",disabled:false},
                    {name:'北斗通道一', value:3, type: "3", pushCode: "1", id:'bd1',disabled:false},
                    {name:'北斗通道二', value:4, type: "3", pushCode: "2", id:'bd2',disabled:false},
                    {name:'北斗通道三', value:5, type: "3", pushCode: "3", id:'bd3',disabled:false},
                    {name:'北斗通道四', value:6, type: "3", pushCode: "4", id:'bd4',disabled:false},
                    {name:'北斗通道五', value:7, type: "3", pushCode: "5", id:'bd5',disabled:false},
                    {name:'北斗通道六', value:8, type: "3", pushCode: "6", id:'bd6',disabled:false}
                ]
                if(bmsNum === 0 && gnssNum === 0){
                    _mm.msgErr('该车辆暂无视频信息!');
                    return;
                }
                else if(gnssNum ==6){
                    this.selectOptions = selectOptions.slice(3);
                }
                else{
                     this.selectOptions = selectOptions.slice(0,bmsNum);
                }
                _mm.msgSss('获取通道成功,请选择通道播放！');
            },

            //下拉框变化事件
            selectChange(value){
                // console.log('value',value);
                // console.log('videoList',this.videoList);
                // console.log('selectOptions',this.selectOptions);
                // return ;
                // for(let i=0;i<this.selectOptions.length;i++){
                //     let item =this.selectOptions[i];
                //     let strings =JSON.stringify(item); 
                //     console.log('item',i,item);
                //     for(let j=0;j<this.videoList.length;j++){
                //         console.log('channel',j,this.videoList[j].channel)
                //         if(this.videoList[j].channel == strings){
                //             this.selectOptions[i].disabled = true;
                //             break;
                //         }
                //         else{
                //             this.selectOptions[i].disabled = false;
                //             continue
                //         }
                //     }
                // }
            },
            //播放按钮事件
            evt_play(index){
                if(!this.postData.vehicleId){
                    _mm.msgErr('请先选择车辆!');
                    return;
                }
                if(!this.videoList[index].channel){
                    _mm.msgErr('请选择视频通道!');
                    return;
                }

                this.fn_playBtnDisabled(index); //设置播放按钮样式
               
                this.videoList[index].src='';
                let obj = JSON.parse(this.videoList[index].channel);
           
                this.videoList[index].loading = true;
                this.videoList[index].isPlay  = true;
                if(obj.type === '3'){
                    //北斗推流数据
                    let pushRtmpData = {
                        vehicleId   : this.postData.vehicleId ,
                        logicChannel: obj.pushCode
                    }
                    this.ajax_bd_pushCode_video(pushRtmpData,obj,index);
                }
                else{
                    //平台推流数据
                    let pushRtmpData = {
                        vehicleId : this.vehicleId,
                        msgBody   : obj.pushCode,
                        timeToLive: "60"
                    };
                    this.ajax_bms_pushCode_video(pushRtmpData,obj,index);
                }
                 let _this = this;
                //心跳连接
                if(!_this.realHeartTimer){
                    _this.realHeartTimer = setInterval(function(){
                        _this.ajax_real_heart_beat({vehicleId : _this.vehicleId})
                    },10000);
                }
            
            },
            //设置播放按钮禁用按钮样式
            fn_playBtnDisabled(index){
                let _this = this;
                let c     = 5;
                this.videoList[index].btnPlayName = '播放' + c;
                this.videoList[index].playDisabled = true;
                this.videoList[index].playTimer = setInterval(function(){
                    _this.videoList[index].btnPlayName = '播放' + (c-1);
                    _this.videoList[index].playDisabled = true;
                    c--;
                    if(c===0){
                        clearInterval(_this.videoList[index].playTimer);
                        _this.videoList[index].playTimer = '';
                        _this.videoList[index].btnPlayName = '播放';
                        _this.videoList[index].playDisabled = false;
                    }
                },1000);
            },

            //心跳接口
            ajax_real_heart_beat(set){
                let _this = this;
                _mm.request({
                    url:'/video/real_heart_beat.json',
                    data:set
                }).then((res)=>{

                });
            },
            //北斗推流接口
            ajax_bd_pushCode_video(pushData,obj,index){
                let _this = this;
                _mm.request({ 
                    url:"/video/down_gnss_real_video.json", 
                    data:pushData
                }).then((res)=>{
                    _mm.msgSss('推流成功，请稍等，等待视频加载!');
                    _this.fn_videoHtml(obj,index,res);
                },function(err){
                    if(err.code === 3000){
                        _mm.msgErr(err.msg);
                        _this.videoList[index].loading = false;
                    }
                })
            },
            //平台推流接口
            ajax_bms_pushCode_video(pushData,obj,index){
                let _this = this;
                _mm.request({ 
                    url:"/video/down_real_video.json", 
                    data:pushData
                }).then((res)=>{
                    _mm.msgSss('推流成功，请稍等，等待视频加载!');
                    _this.fn_videoHtml(obj,index,res);
                },function(err){
                    console.log(err);
                    _this.videoList[index].loading = false;
                    _mm.msgErr('推流失败，请重试!');
                })
            },

            //停止播放按钮事件
            btnClose(index){
                if(!this.videoList[index].isPlay && JSON.parse(this.videoList[index].ck_nums).type != '3'){
                    // console.log('没有执行')
                    return;
                }
                let _this = this;
                if(!_this.videoList[index].ck_nums){return}
                _this.fn_stopBtnDisabled(index);
                let obj = JSON.parse(_this.videoList[index].ck_nums);
                 
                    
                console.log('closeOBJ',obj); 
                let num =0;
                for(let i=0;i<_this.videoList.length;i++){
                    if(_this.videoList[i].isPlay){
                        num++;
                    }
                }
                _this.videoList[index].loading = false;
                _this.videoList[index].html    = '';
                _this.videoList[index].isPlay  = false;

                if(num == 0 || num == 1 && _this.realHeartTimer){
                    clearInterval(_this.realHeartTimer);
                    _this.realHeartTimer='';
                }
                if(obj.type ==='3'){    //关闭北斗
                    // console.log('执行了关闭北斗')
                    let data = {
                        vehicleId   : _this.vehicleId ,
                        logicChannel: obj.pushCode,
                        comm        : '0'
                    }
                    _this.ajax_bd_closePuse(data);
                }
                else{                   //关闭平台
                    // console.log('执行了关闭bms')
                   

                    let arr = [];
                    for(let i=0;i<6;i++){
                        if(_this.videoList[i].ck_nums && _this.videoList[i].isPlay && (JSON.parse(_this.videoList[i].ck_nums).type) != '3'){
                            arr.push(JSON.parse(_this.videoList[i].ck_nums));
                        }
                    }
                    if(arr && arr.length ===0){
                        let pushRtmpData = {
                            vehicleId : _this.vehicleId,
                            msgBody   : '1005',
                            timeToLive: "60"
                        };
                        _this.ajax_bms_closePuse(pushRtmpData);
                    }
                    else if(arr && arr.length === 1){
                        let code = arr[0].type === '1' ? '1001' : '1002';
                        let pushRtmpData = {
                            vehicleId : _this.vehicleId,
                            msgBody   : code,
                            timeToLive: "60"
                        };
                        _this.ajax_bms_closePuse(pushRtmpData);
                    }
                    // console.log('arr',arr);
                    // console.log('vehicleid',_this.vehicleId);
                    // 
                }
                
            },
            //北斗关流单个接口
            ajax_bd_closePuse(data){
                let _this = this;
                _mm.request({ 
                    url:"/video/gnss_real_video_control.json", 
                    data:data
                }).then((res)=>{
                },function(err){
                    console.log(err);
                })
            },
            //平台关流接口
            ajax_bms_closePuse(data){
                let _this = this;
                _mm.request({ 
                    url:"/video/down_real_video.json", 
                    data:data
                }).then((res)=>{
                },function(err){

                    console.log(err);
                })
            },
            //渲染播放器内容
            fn_videoHtml(obj,index,res){
                let _this = this; 
                if(obj.type !='3'){   //渲染平台video HTML
                    setTimeout(()=>{
                    _this.videoList[index].html = `
                            <video id="`+obj.id+`" class="video-js" x-webkit-airplay="allow" webkit-playsinline width="100%" height="100%" preload="auto"  data-setup="{}">
                                <source src="`+res.rtmpUrl+_this.vehicleId+'_'+obj+`" type="application/x-mpegURL">
                            </video>
                        `;
                    },500);
                }
                else{               //渲染北斗video HTML
                    setTimeout(()=>{
                        _this.videoList[index].html = `
                            <video id="`+obj.id+`" class="video-js" x-webkit-airplay="allow" webkit-playsinline width="100%" height="100%" preload="auto"  data-setup="{}">
                                <source src="`+res.rtmpUrl+_this.vehicleId+'_'+obj.pushCode+`" type="application/x-mpegURL">
                            </video>
                        `;
                    },500);
                }
                setTimeout(()=>{
                    $('#'+obj.id).mediaelementplayer({
                        pauseOtherPlayers:false,//多视频同时播放
                        clickToPlayPause : false,
                        features: ['volume','fullscreen'], 
                        stretching : 'fill',
                        success: function (media, ele, player) {
                            player.play();
                        }
                    });
                },1000);
                setTimeout(()=>{
                    _this.videoList[index].loading = false;
                },3000);
            },

            
            //设置停止播放禁用按钮样式
            fn_stopBtnDisabled(index){
                this.videoList[index].stopDisabled = true;
                let _this = this;
                let c     = 5;
                _this.videoList[index].btnCloseName = '停止播放' + c;
                _this.videoList[index].stopTimer = setInterval(function(){
                    _this.videoList[index].btnCloseName = '停止播放' + (c-1);
                    _this.videoList[index].stopDisabled = true;
                    c--;
                    if(c===0){
                        clearInterval(_this.videoList[index].stopTimer);
                        _this.videoList[index].stopTimer = '';
                        _this.videoList[index].btnCloseName = '停止播放';
                        _this.videoList[index].stopDisabled = false;
                    }
                },1000);
                if(_this.videoList[index].playTimer){
                    clearInterval(_this.videoList[index].playTimer);
                }
                _this.fn_playBtnDisabled(index);
            },


       
           
            //websocket更新事件
            evt_updata(vleItem){
                let _this = this;
                let num = 0;
                for(let i=0;i<_this.videoList.length;i++){
                    if(_this.videoList[i].isPlay){
                        num++
                    }
                }
                if(vleItem.vehicleId === _this.vehicleId && vleItem.status === '0' && num >0){
                    _mm.msgErr('当前车辆已离线，请选择其他车辆观看！');
                    if(_this.realHeartTimer){
                        clearInterval(_this.realHeartTimer);
                        _this.realHeartTimer='';
                    }
                    _this.vehicleId = '';     
                    _this.selectOptions=[];
                    for(let i=0;i<6;i++){               //清除通道数
                        _this.videoList[i].html='';
                        _this.videoList[i].ck_nums='';
                        _this.videoList[i].isPlay=false;
                        _this.videoList[i].loading=false;
                    }
                }
            }
            
        },
    
    }
</script>
<style scoped>
    .video-list{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .video-item{
        width: calc((100% - 30px) / 3);
        margin-bottom: 15px;
    }
    .video-item-tle{
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
        align-videoList: center;
    }
    .video-item-cnt{
        width: 100%;
        height: 0;
        padding-bottom: 75%;
        background-color: #000;
    }
    .dbtn{
        height: 32px;
        line-height: 32px;
        margin-right: 0;
        margin-left: 10px;
    }
    .video-item-tle_select{
        flex: 1;
    }
</style>



