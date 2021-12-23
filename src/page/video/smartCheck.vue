<template>
    <div class="operation">
        <Menu :data="DATA_menuProps" @serach="evt_search" />
        <div class="main">
            <div class="video-item" v-for="(item,index) in videoList" :key="index"> 
                <div class="video-item-tle">
                    {{ item.license || '监控车辆'+(index+1) }}
                </div>
                <div 
                    class="video-item-cnt" 
                    v-loading="item.loading"
                    element-loading-text="拼命加载中"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    <XzVideo  :repeatReq="false" v-if="item.isPlay" :src="item.src" @play="item.loading = false" @end="evt_videoEnd(item)" />
                </div>
            </div>
        </div>
        <FiveMinAlert @evt_close_move="evt_stop"/>
    </div>
</template>

<script>
    import Menu from 'components/schMenu/menu.vue';
    import FiveMinAlert from 'components/tool/FiveMinAlert.vue'
    import XzVideo from "components/video/index.vue";
    import Server from 'service/mm.jsx';
    const _mm = new Server();

    let timer_play;
    export default{
        data(){
            return {
                timer:"",
                timerFiveMinAlert:'',

                DATA_menuProps:{
                    items:[
                        {
                            name:"视频线路",
                            type:"select",
                            key:"videoType",
                            value:"1",
                            options:[
                                {name:"司机",key:"0",value:"1"},
                                {name:"道路",key:"1",value:"2"},
                            ],
                            required:true,
                        },
                        {type:"btn",key:"btn",btns:[
                            {name:"开始轮循",key:"search",value:"",cls:"dbtn-blue",disabled:false},
                            {name:"停止轮循",key:"stop",value:"",cls:"dbtn-blue",EVT_click:this.evt_stop,},
                        ]}
                    ]
                },
                postData:{},
                videoList:[
                    {license:"",isPlay:false,loading:false,src:''},
                    {license:"",isPlay:false,loading:false,src:''},
                    {license:"",isPlay:false,loading:false,src:''},
                    {license:"",isPlay:false,loading:false,src:''},
                    {license:"",isPlay:false,loading:false,src:''},
                    {license:"",isPlay:false,loading:false,src:''}
                ]
            }
        },
        components:{
            Menu,
            FiveMinAlert,
            XzVideo,
        },
        computed:{
            fiveMinStart(){
                return this.$store.state.fiveMinAlert.start;
            },
            fiveMinShow() {
                return this.$store.state.fiveMinAlert.show;
            }
        },
       
        beforeDestroy(){
            this.evt_stop();

        },
        methods: {
            
            //开始轮询按钮 ---设置车辆id及右侧车牌号码文字
            evt_search(data ){
                if(timer_play){
                    clearInterval(timer_play);
                    timer_play = 0;
                }
                this.fn_btnDisabled();
                this.postData  = data;
                this.ajax_play_poll_video(this.postData);
                timer_play = setInterval(()=>{
                    this.ajax_play_poll_video(this.postData)
                },30000);      
            },
            //获取播放所需资源
            ajax_play_poll_video(set){
                this.fn_clearVideo();
                let _this = this;
                 _mm.request({ 
                    url:'/poll/play_poll_video.json',
                    data:set
                }).then((res)=>{
                    _this.fn_videoPlayer(res.vehicles);
                    if(!_this.fiveMinStart && !_this.fiveMinShow){
                        _this.$store.dispatch('set_FiveMin_start');
                    }
                },err=>{
                   _this.evt_stop();
                });
            },
            //清空播放器
            fn_clearVideo(){
                this.videoList.forEach( el => {
                    el.license = '';
                    el.isPlay  = false;
                    el.loading = true;
                    el.src     = '';
                })
            },
            //渲染播放器内容
            fn_videoPlayer(res){
                let resLength = res.length;
                let videoType = this.postData.videoType;
                this.videoList.forEach( (el,index) => {
                    if(index < resLength){
                        el.src = res[index]['rtmpUrl']+res[index]['vehicleId']+'_'+videoType;
                        el.loading = true;
                        el.isPlay  = true;
                        el.license = res[index]['vehicleLicence'];
                    }
                    else{
                        el.src = '';
                        el.loading = false;
                        el.isPlay  = false;
                        el.license = '';
                    }
                })
            },
            //设置播放器禁用按钮样式
            fn_btnDisabled(){
                let _this = this;
                let c     = 10;
                let timer;
                function timedCount() {
                    if (c === 0) {
                        _this.DATA_menuProps.items[1].btns[0].name     = '开始轮循';
                        _this.DATA_menuProps.items[1].btns[0].disabled = false;
                        return;
                    }
                    _this.DATA_menuProps.items[1].btns[0].name     = '开始轮循(' + c + ')';
                    _this.DATA_menuProps.items[1].btns[0].disabled = true;
                    c -= 1;
                    //延时1s执行程序，执行自身函数timedCount
                    timer = setTimeout(timedCount, 1000);
                };
                timedCount();
            },
            
            //停止轮循按钮
            evt_stop(){
                
               
                if(timer_play){
                    clearInterval(timer_play);
                    timer_play = 0;
                }
                this.videoList.forEach( el => {
                    el.license = '';
                    el.isPlay  = false;
                    el.loading = false;
                    el.src     = '';
                })
                
                this.ajax_stop_poll_video();
                this.$store.commit("update_zIndexTop", "main");
                this.$store.commit("update_Toggle_fiveMin",false);
            },
            //停止轮循
            ajax_stop_poll_video(){
                let _this = this;
                 _mm.request({ 
                    url:'/poll/stop_poll_video.json',
                }).then((res)=>{
                   
                });
            },
            //videoItem播放失败
            evt_videoEnd(item){
                _mm.msgErr(item.license+'视频播放失败，请检查车辆是否在线或其他问题！');
                item.loading = false;
                item.isPlay  = false;
                item.src     = '';
            }
        },
    
    }
</script>

<style scoped>
   .main{
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
        padding-bottom: 8px;
    }
   .video-item-cnt{
       	width: 100%;
        height: 0;
        padding-bottom: 75%;
        background-color: #000;
   }
</style>
