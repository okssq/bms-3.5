<template>
    <div class="operation">
        <div class="v-realTime">
            <div class="dMenu">
                <Menu :data="DATA_menuProps" @serach="EVT_search"  @webSocketUpdate="EVT_updata"  />
            </div>
            <div class="video-view">
                <div class="video-view-box" v-for="(item,index) in items" :key="index">
                    <!-- 顶部 -->
                    <div class="video-view-tle zoom">
                        <div class="ck-vtype">
                            <el-select v-model="items[index].ck_nums" placeholder="视频通道" @change="selectChange">
                                <el-option
                                    v-for="_item in selectOptions"
                                    :key="_item.code+index+_item.name"
                                    :label="_item.name"
                                    :disabled="_item.disabled"
                                    :value="JSON.stringify({name:_item.name,type: _item.type,id:_item.id,pushCode:_item.pushCode,closeCode: _item.closeCode})">
                                </el-option>
                            </el-select>
                        </div>
                        <div class="ck-playbtn zoom">
                            <button 
                                :disabled ="item.playDisabled"
                                :class="{'disabled':item.playDisabled}"
                                class="dbtn dbtn-blue"
                                @click="btnPlay(index)"
                            >{{item.btnPlayName}}</button>
                            <button 
                                :disabled ="item.stopDisabled"
                                :class="{'disabled':item.stopDisabled}"
                                class="dbtn dbtn-blue stopBtn"
                                @click="btnClose(index)"
                            >{{item.btnCloseName}}</button>
                        </div>
                    </div>
                    <!-- 视频区域部分 -->
                    <div 
                        class="video-view-cnt"
                        v-loading="item.loading" 
                    >
                        <div class="realVideo" v-html="item.html"></div>
                        <div class="video-flash" v-if="isFlash">
                            <a href="//www.adobe.com/go/getflashplayer" target="_blank" class="if-open-flash">
                                点击打开flash
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>    
</template>
<script>
    import vlestatuslist from 'components/list/vlestatuslist.vue';
    import Menu from 'components/schMenu/menu.vue';
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        data(){
            return {
                isFlash:true,
                items:[
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    },
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    },
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    },
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    },
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    },
                    {   
                        btnPlayName : '播放',
                        btnCloseName: '停止播放',
                        isPlay      : false,
                        playDisabled : false,
                        stopDisabled : false,
                        html        : "",
                        loading     : false,
                        ck_nums     : ''
                    }
                ],
                DATA_menuProps:{       //菜单栏数据
                    items:[
                        {name:"车牌号码",type:"licenseStatus",key:"vleItem",required:true},
                        {type:"btn",key:"btn",btns:[
                            {name:"获取通道",key:"search",value:"",cls:"dbtn-blue"}
                        ]}
                    ]
                },
                vehicleId     : '',
                selectOptions : [],
                realHeartTimer: ''
            }
        },
        components:{
            'vlestatuslist': vlestatuslist ,
            'Menu'         : Menu
        },
        mounted () {
            let _this = this;
            if(_this.EVT_checkFlash()){_this.isFlash = false ; }
            _this.fn_videoMath();
            //当浏览器窗口大小改变时，设置显示内容的高度  
            window.onresize=function(){  
                _this.fn_videoMath();
            }; 

         
        },
        beforeRouteLeave(to,form,next){
            let _this = this;
            if(this.realHeartTimer){
                clearInterval(this.realHeartTimer);
            }
            if(this.ws)this.ws.close();
            for(let i=0;i<6;i++){
                if(_this.items[i].playTimer){
                    clearInterval(_this.items[i].playTimer);
                }
                if(_this.items[i].stopTimer){
                    clearInterval(_this.items[i].stopTimer);
                }
            }
            next();
        },
        methods: {
            //获取通道按钮
            EVT_search(i){
                let _this = this;
                if(_this.realHeartTimer){
                    clearInterval(_this.realHeartTimer);
                    _this.realHeartTimer='';
                }
                _this.vehicleId = '';     
                _this.selectOptions=[];
                for(let i=0;i<6;i++){               //清除通道数
                    _this.items[i].html='';
                    _this.items[i].ck_nums='';
                    _this.items[i].isPlay=false;
                    _this.items[i].loading=false;
                    if(_this.items[i].playTimer){
                        clearInterval(_this.items[i].playTimer);
                        _this.items[i].btnPlayName = '播放';
                        _this.items[i].playDisabled = false;
                    }
                    if(_this.items[i].stopTimer){
                        clearInterval(_this.items[i].stopTimer);
                        _this.items[i].btnCloseName = '停止播放';
                        _this.items[i].stopDisabled = false;
                    }
                }
                if(i.vleItem.status === '0'){
                    _mm.msgErr('请选择在线车辆!');
                    return;
                }
                _this.vehicleId = i.vleItem.vehicleId;
                _this.ajax_terminal_list({vehicleId:_this.vehicleId})
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
                let _this = this;
                if(bmsNum ==0 && gnssNum==0){
                    _mm.msgErr('该车辆暂无视频信息!');
                    return;
                }
                if(bmsNum == 1){
                    _this.selectOptions.push(
                        {name:'司机视频',type: "1",pushCode:"1001",closeCode:'1002', id:'person'}
                    )
                }
                else if(bmsNum == 2){
                    _this.selectOptions.push(
                        {name:'司机视频',type: "1",pushCode:'1004', closeCode: "1001",id:'person'},
                        {name:'路况视频',type: "2",pushCode:'1004', closeCode: "1002",id:'road'}
                    )
                }
                else if(bmsNum == 3){
                    _this.selectOptions.push(
                        {name:'司机视频',type: "1",pushCode:'1004', closeCode: "1001",id:'person'},
                        {name:'路况视频',type: "2",pushCode:'1004', closeCode: "1002",id:'road'},
                        {name:'第三路视频',type: "1",pushCode: "1004",closeCode: "1003",id:'third'},
                    )
                }
                if(gnssNum ==6){
                     _this.selectOptions.push(
                        {name:'北斗通道一',type: "3",pushCode: "1",id:'bd1'},
                        {name:'北斗通道二',type: "3",pushCode: "2",id:'bd2'},
                        {name:'北斗通道三',type: "3",pushCode: "3",id:'bd3'},
                        {name:'北斗通道四',type: "3",pushCode: "4",id:'bd4'},
                        {name:'北斗通道五',type: "3",pushCode: "5",id:'bd5'},
                        {name:'北斗通道六',type: "3",pushCode: "6",id:'bd6'}
                    )
                }
                _mm.msgSss('获取通道成功,请选择通道播放！');
            },
            //下拉框变化事件
            selectChange(value){
                let _this = this;
                for(let i=0;i<_this.selectOptions.length;i++){
                    let _item =_this.selectOptions[i];
                    let strings =JSON.stringify({name:_item.name,type: _item.type,id:_item.id,pushCode:_item.pushCode,closeCode: _item.closeCode}) 
                    for(let j=0;j<_this.items.length;j++){
                        if(_this.items[j].ck_nums == strings){
                            _this.selectOptions[i].disabled = true;
                            break;
                        }
                        else{
                            _this.selectOptions[i].disabled = false;
                            continue
                        }
                    }
                }
            },
            //播放按钮事件
            btnPlay(index){
                let _this = this;
                _this.items[index].html='';
                if(!_this.vehicleId){
                    _mm.msgErr('请先选择车辆!');
                    return;
                }
                if(!_this.items[index].ck_nums){
                    _mm.msgErr('请选择视频通道!');
                    return;
                }
                _this.fn_playBtnDisabled(index);
                let obj = JSON.parse(_this.items[index].ck_nums);
           
                _this.items[index].loading = true;
                _this.items[index].isPlay  = true;
                if(obj.type === '3'){
                    //北斗推流数据
                    let pushRtmpData = {
                        vehicleId   : _this.vehicleId ,
                        logicChannel: obj.pushCode
                    }
                    _this.ajax_bd_pushCode_video(pushRtmpData,obj,index);
                }
                else{
                    //平台推流数据
                    let pushRtmpData = {
                        vehicleId : _this.vehicleId,
                        msgBody   : obj.pushCode,
                        timeToLive: "60"
                    };
                    _this.ajax_bms_pushCode_video(pushRtmpData,obj,index);
                }
                //心跳连接
                if(!_this.realHeartTimer){
                    _this.realHeartTimer = setInterval(function(){
                        _this.ajax_real_heart_beat({vehicleId : _this.vehicleId})
                    },10000);
                }
            
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
                        _this.items[index].loading = false;
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
                    _this.items[index].loading = false;
                    _mm.msgErr('推流失败，请重试!');
                })
            },

            //停止播放按钮事件
            btnClose(index){
                if(!this.items[index].isPlay && JSON.parse(this.items[index].ck_nums).type != '3'){
                    // console.log('没有执行')
                    return;
                }
                let _this = this;
                if(!_this.items[index].ck_nums){return}
                _this.fn_stopBtnDisabled(index);
                let obj = JSON.parse(_this.items[index].ck_nums);
                 
                    
                console.log('closeOBJ',obj); 
                let num =0;
                for(let i=0;i<_this.items.length;i++){
                    if(_this.items[i].isPlay){
                        num++;
                    }
                }
                _this.items[index].loading = false;
                _this.items[index].html    = '';
                _this.items[index].isPlay  = false;

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
                        if(_this.items[i].ck_nums && _this.items[i].isPlay && (JSON.parse(_this.items[i].ck_nums).type) != '3'){
                            arr.push(JSON.parse(_this.items[i].ck_nums));
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
                    _this.items[index].html = `
                            <video id="`+obj.id+`" class="video-js" x-webkit-airplay="allow" webkit-playsinline width="100%" height="100%" preload="auto"  data-setup="{}">
                                <source src="`+res.rtmpUrl+_this.vehicleId+'_'+obj.type+`" type="application/x-mpegURL">
                            </video>
                        `;
                    },500);
                }
                else{               //渲染北斗video HTML
                    setTimeout(()=>{
                        _this.items[index].html = `
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
                    _this.items[index].loading = false;
                },3000);
            },

            //设置播放按钮禁用按钮样式
            fn_playBtnDisabled(index){
                let _this = this;
                let c     = 5;
                _this.items[index].btnPlayName = '播放' + c;
                _this.items[index].playDisabled = true;
                _this.items[index].playTimer = setInterval(function(){
                    _this.items[index].btnPlayName = '播放' + (c-1);
                    _this.items[index].playDisabled = true;
                    c--;
                    if(c===0){
                        clearInterval(_this.items[index].playTimer);
                        _this.items[index].playTimer = '';
                        _this.items[index].btnPlayName = '播放';
                        _this.items[index].playDisabled = false;
                    }
                },1000);
            },
            //设置停止播放禁用按钮样式
            fn_stopBtnDisabled(index){
                this.items[index].stopDisabled = true;
                let _this = this;
                let c     = 5;
                _this.items[index].btnCloseName = '停止播放' + c;
                _this.items[index].stopTimer = setInterval(function(){
                    _this.items[index].btnCloseName = '停止播放' + (c-1);
                    _this.items[index].stopDisabled = true;
                    c--;
                    if(c===0){
                        clearInterval(_this.items[index].stopTimer);
                        _this.items[index].stopTimer = '';
                        _this.items[index].btnCloseName = '停止播放';
                        _this.items[index].stopDisabled = false;
                    }
                },1000);
                if(_this.items[index].playTimer){
                    clearInterval(_this.items[index].playTimer);
                }
                _this.fn_playBtnDisabled(index);
            },


            //判断是否开启FLASH
            EVT_checkFlash(){
                let hasFlash = 0;　　　　 //是否安装了flash    
                if(document.all) {
                    let swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');  
                    if(swf) {
                        hasFlash = 1;  
                    }
                } else {  
                    if(navigator.plugins && navigator.plugins.length > 0) {  
                        let swf = navigator.plugins["Shockwave Flash"];  
                        if(swf) {  
                            hasFlash = 1;  
                        }  
                    }  
                }  
                return hasFlash; 
            },
            //设置播放器宽高
            fn_videoMath(){
                let _this = this;
                let math169 = 4/3;
                let videoW = $(".video-view-box").width();
                let videoH = videoW/math169;
                $(".video-view-cnt").height(videoH);
                // _this.size.w = videoW;
                // _this.size.h = videoH;
            },
            //websocket更新事件
            EVT_updata(vleItem){
                let _this = this;
                let num = 0;
                for(let i=0;i<_this.items.length;i++){
                    if(_this.items[i].isPlay){
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
                        _this.items[i].html='';
                        _this.items[i].ck_nums='';
                        _this.items[i].isPlay=false;
                        _this.items[i].loading=false;
                    }
                }
            }
            
        },
    
    }
</script>
<style scoped>
    .video-view{margin-top: 10px; display:flex;flex-direction: row;flex-wrap: wrap;justify-content:space-between;align-items:flex-start;}
    .video-view-box{width: calc((100% - 20px) / 3 );margin-bottom: 20px;}
    .video-view-tle{margin-bottom: 10px;}
    .video-view-cnt{height:100px;background:#000;position: relative;overflow:hidden;}
    .video-flash{z-index: 12;width: 100%;height: 100%;position: absolute;left: 0;top: 0;background:url('~assets/img/icon/flash.png') no-repeat;background-position:center calc(50% - 10px);background-size: 60px 60px;}
    .if-open-flash {position: absolute;left:calc(50% - 30px) ;top: calc(50% - 40px);z-index: 12; width: 60px;height: 60px; text-align: center;
    color: #fff;font-size: 16px; display: block;cursor: pointer;word-break:keep-all;white-space:nowrap;text-indent: -20px;line-height: 160px;}

    
    .ck-vtype{float: left;margin-right: 5px;width: 130px;}
    .ck-playbtn{width: 150px;float: left;}
    .ck-playbtn .dbtn {width: 68px;height: 32px;  float: left; margin-right: 5px;cursor: pointer;padding:0 5px;line-height: 32px;box-sizing: border-box; } 
    .ck-playbtn .dbtn.disabled{cursor: not-allowed;}
    .ck-playbtn .dbtn.stopBtn{width: 72px;text-align: center;}
</style>



