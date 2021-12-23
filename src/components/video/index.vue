<template>
    <video-player
        class="vjs-custom-skin xz-video"
        :options="playerOptions"
        @ready="readied"
        @play="play"
        @ended="end"
    />
</template>
<script>
import "videojs-flash";
import "video.js/dist/video-js.css";
import { videoPlayer } from "vue-video-player";
require("vue-video-player/src/custom-theme.css");
export default {
    props: {
        src: {
            type: String,
            default: () => {
                return "";
            }
        },
        repeatReq:{
            type:Boolean,
            default:true
        },
    },
    components: {
        "video-player": videoPlayer
    },
    data(){
        return {
            timer_play : 0, //是否播放定时器
        }
    },
    computed: {
        playerOptions: function() {
            return {
                autoplay: true,
                sources: [
                    {
                        type: "rtmp/mp4",
                        src: this.src
                    }
                ],
                techOrder: ["flash"],
                fluid: true,
                liveui: true,
                controls: true,
                clickToPlayPause: false,
                bigPlayButton: false,
                contautoplay: false,
                aspectRatio: '4:3',
                notSupportedMessage: "视频加载失败！",
                controlBar: {
                    playToggle: false,
                    currentTimeDisplay: false,
                    timeDivider: false, // 时间分割线
                    durationDisplay: false, // 总时间
                    progressControl: false, // 进度条
                    customControlSpacer: false, // 未知
                    fullscreenToggle: true, // 全屏
                    remainingTimeDisplay: false
                },
                flash: {
                    swf: "cdn/swf/video-js.swf"
                }
            };
        }
    },
    methods: {
        readied(){
            console.log('--- 0：视频已准备就绪。');
            if(!this.timer_play && this.repeatReq){
                console.log('--- 1：设置如果15秒未能播放就重新加载视频。');
                this.timer_play = setTimeout(() => {
                    this.$emit('end');
                }, 15000);
            }
        },
        play() {
            console.log('--- 0：视频播放事件启动。');
            if(this.timer_play){
                console.log('--- 1：视频播放成功清除掉45秒的事件。')
                window.clearTimeout(this.timer_play);
            }
            this.$emit("play");
        },
        end(data) {
            console.log('--- 0：视频结束事件启动。');
            if(this.timer_play){
                console.log('--- 1：视频结束成功清除掉45秒的事件。')
                window.clearTimeout(this.timer_play);
            }
            this.$emit("end");
        },
        
        
        
    }
};
</script>
<style scoped>
.xz-video {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
}
</style>


<!-- 

    onPlayerPause(){
        console.log('111-pause');
    },
    onPlayerWaiting(){
        console.log('222-pause');
    },
    onPlayerPlaying(){
        console.log('333-playing');
    },
    onPlayerLoadeddata(){
        console.log('444-onPlayerLoadeddata');
    },
    onPlayerTimeupdate(data){
        // console.log('555-onPlayerTimeupdate',data);
    },
    onPlayerCanplay(){
        console.log('666-onPlayerCanplay');
    },
    onPlayerCanplaythrough(){
        console.log('777-onPlayerCanplaythrough');
    },
    playerStateChanged(state){
        // if(state && state.waiting){
        //     console.log('111-waitting',state)
        // }
        // if(state && state.ended){
        //     console.log('111-stateChangeEnd',state);
        //     this.$emit("end");
        // }
    },

    @pause="onPlayerPause($event)"
    @waiting="onPlayerWaiting($event)"
    @playing="onPlayerPlaying($event)"
    @loadeddata="onPlayerLoadeddata($event)"
    @timeupdate="onPlayerTimeupdate($event)"
    @canplay="onPlayerCanplay($event)"
    @canplaythrough="onPlayerCanplaythrough($event)"
    @statechanged="playerStateChanged($event)"
    
-->