<template>
    <div class="mapVideo-box">
        <div class="mvbox-title zoom">
            <div class="mvbox-tle-left">{{propsRef.title}}</div>
            <div class="mvbox-tle-right el-icon-close" @click="EVT_close"></div>
        </div>
        <div 
            class="mvbox-cnt" 
            v-loading="loading" 
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
            <XzVideo
                :src="rtmpUrl+vehicleId+num"
                @play="evt_play()"
                @end="video_end()"/>
        </div>
    </div>
</template>

<script>
    let _this;
    import Server  from 'service/mm.jsx';
    import XzVideo from "components/video/index.vue";
    const _mm = new Server();

    export default{
        props:['propsRef','videoType'],
        data(){
            return {
                rtmpUrl:"",
                vehicleId:"",
                loading:false,
                num:"_1",
                timer:"",
                req_count:0,
            }
        },
        components:{
            'XzVideo':XzVideo
        },
        created () {
            _this = this;
            this.vehicleId = this.propsRef.vehicleId;
        },
        mounted(){
            this.loading = true;
            this.num = this.propsRef.num;
            this.down_real_video({
                vehicleId : this.vehicleId,
                msgBody   : this.propsRef.msgBody,
                timeToLive: "60"
            });
        },
        computed:{
            
        },
        methods: {
            // 视频播放成功
            evt_play(type){
                this.loading = false;
                this.set_sessCount(0);
                this.req_count = 0;
                if(!this.timer){
                    this.timer = window.setInterval(function() {
                        _this.ajax_real_heart_beat(); //连接心跳
                    }, 3000);
                }
            },
            
            // 视频播放失败
            video_end() {
                let type = this.videoType === 'driver' ? '司机视频' : '道路视频';
                this.req_count = parseInt((this.videoType === 'driver' ?  window.localStorage.getItem('driver_req_count') : window.localStorage.getItem('road_req_count')),10);
                this.req_count = this.req_count + 1;
                this.set_sessCount(this.req_count);
                console.log(type+"播放失败第 "+this.req_count +" 次")
                this.propsRef.is = false;
                
                if(this.req_count <= 2){
                    setTimeout(() => {
                        this.propsRef.is = true;
                        console.log('重新生成视频~~~')
                    }, 300);
                }
                else{
                    console.log('视频彻底删除。。。')
                    this.req_count = 0;
                    this.set_sessCount(0);
                    this.propsRef.vehicleId="";
                    if (this.timer) {
                        window.clearInterval(this.timer);
                        this.timer = 0;
                    }
                    _mm.msgErr("车辆信号不好或未在线~");
                }
            },

            set_sessCount(value){
                if(this.videoType === 'driver'){
                    _mm.setStorage('driver_req_count',value);
                }else{
                    _mm.setStorage('road_req_count',value);
                }
            },

            //推流
            down_real_video(set) {
                let _this = this;
                _mm.request({
                    url: "/video/down_real_video.json",
                    data: set
                }).then(
                    res => {
                        _this.rtmpUrl   = res.rtmpUrl;
                        _this.vehicleId = set.vehicleId;
                    },
                    function(err) {
                        _this.propsRef.is = false;
                        _this.propsRef.vehicleId=null;
                    }
                );
            },

            //关闭窗口
            EVT_close(){
                if (this.timer) {
                    window.clearInterval(this.timer);
                }
                this.propsRef.is = false;
                this.propsRef.vehicleId=null;
            },

            //心跳
            ajax_real_heart_beat() {
                let _this = this;
                _mm.request({
                    url: "/video/real_heart_beat.json",
                    data: {vehicleId:this.vehicleId}
                }).then(res => {});
            },
        },
        beforeDestroy() {
            if (this.timer) {
                window.clearInterval(this.timer);
                this.timer = 0;
            }
        }

    }

</script>

<style scoped> 
    .mapVideo-box{
        background:#fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        padding:0 10px 10px;
        margin-bottom:10px
    }

    .mvbox-title{
        height:40px;
    }

    .mvbox-tle-left{
        float:left;
        color:#3496f8;
        line-height:40px;
    }

    .mvbox-tle-right{
        float:right;
        color:#3496f8;
        line-height:40px;
        cursor: pointer;
    }

    .mvbox-cnt{
        background:#000;
        width:400px;
        height:300px;
    }
</style>
