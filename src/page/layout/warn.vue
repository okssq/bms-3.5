<template>
    <div class="alarmAlert">
        <div class="alarmAlert-main">
            <div class="AAScene">
                <div class="AAS-menu zoom">
                    <div class="AAS-m-tle">{{warnSocket.data.vehicleLicence||"--"}}</div>
                    <div class="AAS-m-xxx el-icon-close" @click="EVT_xxx_close({type:'alert',value:'open',is:false})"></div>
                </div>
                <div class="AAS-media">
                    <div class="AAS-me-cnt">
                        <img :src="warnSocket.data.photoUrl" />
                    </div>
                    <div class="AAS-me-Type" >
                        <div>{{warnSocket.data.warningName||"--"}}</div>
                    </div>
                </div>
                <div class="AAS-cnt">
                    <div class="AAS-c-item zoom">
                        <div class="AAS-c-iname">
                            上传时间：
                        </div>
                        <div class="AAS-c-ivalue">
                            {{warnSocket.data.warningTime||"--"}}
                        </div>
                    </div>
                    <div class="AAS-c-item zoom">
                        <div class="AAS-c-iname">
                            上传地点：
                        </div>
                        <div class="AAS-c-ivalue">
                            {{warnSocket.data.warningPlace||"--"}}
                        </div>
                    </div>
                </div>
                <div class="AAS-upload-txt zoom">
                    <div class="AAS-u-tle">
                        <div>语音提醒</div>
                    </div>
                    <div class="AAS-u-cnt">
                        <el-input v-model="dataAlert.uploadTxt" placeholder="请输入内容"></el-input>
                    </div>
                    <div class="AAS-u-btn"><button class="dbtn dbtn-blue" @click="EVT_send_alarmAlert">发送</button></div>
                </div>
            </div>
        </div>
        <div class="alarmAlert-bg"></div>
    </div>
</template>

<script>
    import Server from "service/mm.jsx";
    const _mm = new Server();
    export default{
        computed:{
            warnSocket(){
                return this.$store.state.warnSocket;
            }
        },
        data(){
            return {
                dataAlert:{
                    is:false,
                    vehicleId:"",
                    title:"",
                    imgUrl:"",
                    time:"",
                    address:"",
                    warnName:"",
                    uploadTxt:""
                }
            };
        },
        created(){
            
        },
        methods:{
            //卡片xxx按钮
            EVT_xxx_close(){
                this.warnSocket.is      = false;
                this.warnSocket.isAuto  = true;
            },

            //发送语音事件
            EVT_send_alarmAlert(){
                let _txt = this.dataAlert.uploadTxt;

                if(!_txt){
                    _mm.msg("请输入语音提醒");
                    return;
                }

                /**设置推流数据    4000*/   
                let push_data={
                    groupName : this.warnSocket.data.vehicleId,       //车辆id
                    msgBody   : '5000ABAB'+_txt,                //A4545.MP4
                    timeToLive: '60'                            //离线时常
                };

                this.ajax_down_common_jpush(push_data);
            },

            //ajax-语音推送的接口
            ajax_down_common_jpush(set){
                _mm.request({ 
                    url:'/jpush/down_common_jpush.json', 
                    data:set
                }).then((res)=>{
                    _mm.msg("发送成功");
                });
            }
        },
    }
</script>

<style scoped>
    main{
        position: fixed;z-index: 100;top: 64px;bottom: 30px;right: 0;
        width: calc(100% - 200px);left: 200px;transition: all .3s;overflow-y: auto;
        box-sizing: border-box;background-color:rgb(240,242,245);
        display: flex;flex-direction: column;
        min-width: 1080px;overflow-x: auto;
    }
    .sMain{width: calc(100% - 80px);left: 80px;}
    .cnt{padding: 24px 24px 15px;flex: 1;}
    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }

    .alarmAlert-ctrl{position:fixed;bottom:0px;left:0px;z-index:21011;background:#f7f3e6;width:100%;height:30px;line-height:30px;text-align:right;}
    .alarmAlert-ctrl-span{margin-right:20px;}
</style>
