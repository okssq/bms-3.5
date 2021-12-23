<template>
    <div class="operation" v-loading="loading">
        <div v-if="loginType === 'admin' " class="cnt zoom">
            <Form :props="DATA_formProps_admin" @setForm="GET_form_admin" ref="Cld_form"   @setCancel="GET_cancel" />
        </div>
        <div v-else class="cnt zoom">
            <Form :props="DATA_formProps_normal"  ref="Cld_form"   @setCancel="GET_cancel" />
        </div>
    </div>
</template>

<script>

import Form   from 'components/form/form.vue';
import Server from 'service/mm.jsx';


const _mm = new Server();
let picker={
    disabledDate(time){
        return false;
    }
};
export default{
    data() {
        return {
            loading : false ,
            terminalId :'',
            vid :'',
            tle:'',
            loginType:'',
            DATA_formProps_admin: {
                btn:{
                    show:true
                },
                list:[
                    [
                        {name:"终端ID",type:"text",key:"terminalId",value:"",disabled:true,required:true},
                        {name:"车牌号码",type:"text",key:"vehicleLicence",value:"",opthions:[],disabled:true,required:true},
                        {name:"模型编号",type:"text",key:"modelCode",value:"",required:true},
                        {name:"当前模型编号",type:"text",key:"curModelCode",value:"",disabled:true,required:true},
                        {name:"创建时间",type:"text",key:"createTime",value:"",disabled:true,required:true},
                        {name:"当前状态变更时间",type:"text",key:"updateTime",value:"",disabled:true,required:true},
                        {name:"模型下载地址",type:"text",key:"modelUrl",value:"",maxlength:80,required:true},
                        {name:"app版本号",type:"text",key:"autoUpdateApk",value:"",required:true},
                        {name:"app更新地址",type:"text",key:"autoUpdateApkUrl",value:"",maxlength:800,required:true},
                        {name:"型号",type:"text",key:"rom",value:"",disabled:true,required:true},
                        {name:"版本号",type:"text",key:"version",value:"",disabled:true,required:true},
                        {name:"运行模式",type:"select",key:"isTest",value:"",options:[{name:'正式模式',value:'0'},{name:'测试模式',value:'1'}],required:true},
                        {name:"图片压缩比",type:"select",key:"comperssionPercentage",value:"",required:true,
                            options:[
                                {name:'30',value:'30'},
                                {name:'50',value:'50'},
                                {name:'70',value:'70'},
                                {name:'80',value:'80'},
                                {name:'100',value:'100'},
                            ]
                        },
                        {name:"是否开启ADAS报警",type:"select",key:"isOpenAdas",value:"",required:true,
                            options:[
                                {name:'开启',value:'1'},
                                {name:'关闭',value:'0'}
                            ]
                        }
                    ],
                    [  
                        {name:"终端名称",type:"text",key:"terminalName",value:"",required:true},
                        {name:"终端类型",type:"select",key:"terminalType",value:"",options:[{name:'自主终端',value:'1'},{name:'808终端',value:'2'}],required:true},
                        {name:"视频分辨率",type:"text",key:"videoResolution",value:"",required:true},
                        {name:"码率",type:"text",key:"bitRate",value:"",required:true},
                        {name:"帧率",type:"text",key:"frameRate",value:"",required:true},
                        {name:"是否打开声音",type:"select",key:"openVoice",value:"",options:[{name:'是',value:'1'},{name:'否',value:'0'}],required:true},
                        {name:"是否观看实时视频",type:"select",key:"watchRealVideo",value:"",options:[{name:'观看',value:'1'},{name:'不观看',value:'0'}],required:true},
                        {name:"tensorflow的检测机率",type:"text",key:"tensorflowDetectionRate",value:"",required:true},
                        {name:"断网重启时长(单位/S)",type:"text",key:"outNetStart",value:"",required:true},
                        {name:"人脸识别所需速度(单位/m/s)",type:"text",key:"defaultSpeedFace",value:"",required:true},
                        {name:"对路识别所需车速",type:"text",key:"defaultSpeedRoad",value:"",required:true},
                        {name:"报警判定是否需要脸部位置",type:"select",key:"isFacelocation",value:"",options:[{name:'上传',value:'1'},{name:'不上传',value:'0'}],required:true},
                        {name:"脸部识别倍距",type:"text",key:"facelocationSpacing",value:"",required:true},
                        {name:"是否打开对路报警声音",type:"select",key:"isOpenAlarm",value:"",options:[{name:'开启',value:'1'},{name:'关闭',value:'0'}],required:true},
                        {name:"是否打开人脸报警声音",type:"select",key:"isOpenFaceAlarm",value:"",options:[{name:'开启',value:'1'},{name:'关闭',value:'0'}],required:true},
                        {name:"线性加速度x轴",type:"text",key:"linearAccelerationX",value:"",required:true},
                        {name:"线性加速度y轴",type:"text",key:"linearAccelerationY",value:"",required:true},
                        {name:"线性加速度z轴",type:"text",key:"linearAccelerationZ",value:"",required:true},
                        {name:"摄像头数量",type:"select",key:"cameraNums",value:"",options:[{name:'1摄',value:'1'},{name:'2摄',value:'2'},{name:'3摄',value:'3'}],required:true},
                        {name:"录像时长(单位/分钟)",type:"text",key:"defaultVideoDuration",value:"",required:true},
                        {name:"是否开启前摄像头",type:"select",key:"isBeforeCamera",value:"",options:[{name:'开启',value:'1'},{name:'关闭',value:'0'}],required:true},
                        {name:"是否开启后摄像头",type:"select",key:"isAfterCamera",value:"",options:[{name:'开启',value:'1'},{name:'关闭',value:'0'}],required:true},
                        {name:"超速判定的阀值(单位/公里)",type:"text",key:"overSpeed",value:"",required:true},
                    ]
                ]
            },
            DATA_formProps_normal: {
                btn:{
                    show:false
                },
                list:[
                    [
                        {name:"终端ID",type:"text",key:"terminalId",value:"",disabled:true},
                        {name:"车牌号码",type:"text",key:"vehicleLicence",value:"",opthions:[],disabled:true},
                        {name:"模型编号",type:"text",key:"modelCode",value:"",disabled:true},
                        {name:"当前模型编号",type:"text",key:"curModelCode",value:"",disabled:true},
                        {name:"创建时间",type:"text",key:"createTime",value:"",disabled:true},
                        {name:"当前状态变更时间",type:"text",key:"updateTime",value:"",disabled:true},
                        {name:"是否为测试环境",type:"select",key:"isTest",value:"",disabled:true,options:[{name:'正常环境',value:'1'},{name:'测试环境',value:'0'}]},
                    ],
                    [  
                        {name:"终端名称",type:"text",key:"terminalName",value:""},
                        {name:"终端类型",type:"select",key:"terminalType",value:"",options:[{name:'自主终端',value:'1'},{name:'808终端',value:'2'}]},
                        {name:"视频分辨率",type:"text",key:"videoResolution",value:""},
                        {name:"码率",type:"text",key:"bitRate",value:""},
                        {name:"帧率",type:"text",key:"frameRate",value:""},
                        {name:"app版本号",type:"text",key:"autoUpdateApk",value:"",disabled:true},
                        {name:"型号",type:"text",key:"rom",value:"",disabled:true},
                        {name:"版本号",type:"text",key:"version",value:"",disabled:true},
                    ]
                ]
            },
        };
    },
    components:{
        'Form':Form
    },

    created(){
        if(this.$route.query.terminalId && this.$route.query.terminalId !="0"){
            this.terminalId =this.$route.query.terminalId;
            this.vid        =this.$route.query.vid ;
        }
        else{
            this.$router.push({path:'/tool-terminal'}); return
        }
        this.EVT_checkAdmin();
        
        if(this.loginType === 'admin'){
            this.DATA_formProps_admin.type = this.$route.query.type;
        }
        else{
            this.DATA_formProps_normal.type = this.$route.query.type;
        }

    },
    mounted(){
       
        if(this.loginType === 'admin'){
            if(this.DATA_formProps_admin.type === "view"){
                this.$refs.Cld_form.EVT_parent({type:"view"});
            }
            this.ajax_getInfo_admin({terminalId:this.terminalId,vid:this.vid});
        }
        else{
            if(this.DATA_formProps_normal.type === "view"){
                this.$refs.Cld_form.EVT_parent({type:"view"});
            }
            this.ajax_getInfo_normal({terminalId:this.terminalId,vid:this.vid});
        }
        
    },
    methods:{

        //检测是否是超管用户 ** 是否显示删除按钮
        EVT_checkAdmin(){
            let loginData =_mm.getStorage('login');
            if(loginData.roleId==='1'){
                 this.loginType ='admin';
            }
            else{this.loginType ='normal';}
        },
        //admin获取单个信息
        ajax_getInfo_admin(data){
            let _this = this ;
            this.loading = true;
            _mm.request({ 
                url:'/terminal/terminal_info.json', 
                data:data
            }).then((res)=>{
                let _list = _this.DATA_formProps_admin.list;
                _list[0][0].value  = res.terminalId;
                _list[0][1].value  = res.vehicleLicence;
                _list[0][2].value  = res.modelCode ? res.modelCode : ' ';
                _list[0][3].value  = res.curModelCode ? res.curModelCode :' ';
                _list[0][4].value  = res.createTime ? res.createTime : ' ';
                _list[0][5].value  = res.updateTime ? res.updateTime : ' ';
                _list[0][6].value  = res.modelUrl ? res.modelUrl : ' ';
                _list[0][7].value  = res.autoUpdateApk ? res.autoUpdateApk :' ';
                _list[0][8].value  = res.autoUpdateApkUrl ? res.autoUpdateApkUrl :' ';
                _list[0][9].value = res.rom ? res.rom : ' ';
                _list[0][10].value = res.version ? res.version : ' ';
                _list[0][11].value  = res.isTest ? res.isTest : ' ';
                _list[0][12].value  = res.comperssionPercentage ? res.comperssionPercentage : ' ';
                _list[0][13].value  = res.isOpenAdas ? res.isOpenAdas : ' ';

                
                _list[1][0].value  = res.terminalName ? res.terminalName : ' ';
                _list[1][1].value  = res.terminalType ? res.terminalType : '0';
                _list[1][2].value  = res.videoResolution ? res.videoResolution : ' ';
                _list[1][3].value  = res.bitRate ? res.bitRate : ' ';
                _list[1][4].value  = res.frameRate ? res.frameRate : ' ';
                _list[1][5].value  = res.openVoice ? res.openVoice : '0';
                _list[1][6].value  = res.watchRealVideo ? res.watchRealVideo : '0';
                _list[1][7].value  = res.tensorflowDetectionRate  ? res.tensorflowDetectionRate : '0';
                _list[1][8].value  = res.outNetStart ? res.outNetStart : ' ';
                _list[1][9].value  = res.defaultSpeedFace ? res.defaultSpeedFace : '0';
                _list[1][10].value = res.defaultSpeedRoad ? res.defaultSpeedRoad : '0';
                _list[1][11].value = res.isFacelocation ? res.isFacelocation : '0';
                _list[1][12].value = res.facelocationSpacing ? res.facelocationSpacing : ' ' ;
                _list[1][13].value = res.isOpenAlarm ? res.isOpenAlarm : '0';
                _list[1][14].value = res.isOpenFaceAlarm ? res.isOpenFaceAlarm : '0';
                _list[1][15].value = res.linearAccelerationX ? res.linearAccelerationX : '0';
                _list[1][16].value = res.linearAccelerationY ? res.linearAccelerationY : '0';
                _list[1][17].value = res.linearAccelerationZ ? res.linearAccelerationZ : '0';
                _list[1][18].value = res.cameraNums ? res.cameraNums : ' ';
                _list[1][19].value = res.defaultVideoDuration ? res.defaultVideoDuration : '0';
                _list[1][20].value = res.isBeforeCamera ? res.isBeforeCamera : '0' ;
                _list[1][21].value = res.isAfterCamera ? res.isAfterCamera : '0';
                _list[1][22].value = res.overSpeed ? res.overSpeed : ' ';

                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //other获取单个信息
        ajax_getInfo_normal(data){
            let _this = this ;
            this.loading = true;
            _mm.request({ 
                url:'/terminal/terminal_info.json', 
                data:data
            }).then((res)=>{
                let _list = _this.DATA_formProps_normal.list;
                _list[0][0].value  = res.terminalId;
                _list[0][1].value  = res.vehicleLicence;
                _list[0][2].value  = res.modelCode ? res.modelCode : ' ';
                _list[0][3].value  = res.curModelCode ? res.curModelCode :' ';
                _list[0][4].value  = res.createTime ? res.createTime : ' ';
                _list[0][5].value  = res.updateTime ? res.updateTime : ' ';
                _list[0][6].value  = res.isTest ? res.isTest : ' ';

                _list[1][0].value  = res.terminalName ? res.terminalName : ' ';
                _list[1][1].value  = res.terminalType ? res.terminalType : '0';
                _list[1][2].value  = res.videoResolution ? res.videoResolution : ' ';
                _list[1][3].value  = res.bitRate ? res.bitRate : ' ';
                _list[1][4].value  = res.frameRate ? res.frameRate : ' ';
                _list[1][5].value  = res.autoUpdateApk ? res.autoUpdateApk :' ';
                _list[1][6].value = res.rom ? res.rom : ' ';
                _list[1][7].value = res.version ? res.version : ' ';

                _this.loading=false;
            },function(err){
                console.log(err);
                _this.loading=false;
            })
        },
        //取消按钮
        GET_cancel(){
            let _crumbs = [
            {name:"管理工具",to:"",key:"1"},
            {name:"终端管理",to:"",key:"2"},
            ];
            this.$emit("setlayout",[
                {type:"crumbs",data:_crumbs},
            ]);
            this.$router.push({path:'/tool-terminal'});
        },
        //回调-表格
        GET_form_admin(data){
            let propsData ={};
            if(this.DATA_formProps_admin.type === "edit"){   
                propsData.terminalId            = data.terminalId;
                propsData.terminalName            = data.terminalName;
                propsData.terminalType            = data.terminalType;
                propsData.videoResolution         = data.videoResolution;
                propsData.bitRate                 = data.bitRate;
                propsData.frameRate               = data.frameRate;
                propsData.openVoice               = data.openVoice;
                propsData.watchRealVideo          = data.watchRealVideo;
                propsData.tensorflowDetectionRate = data.tensorflowDetectionRate;
                propsData.outNetStart             = data.outNetStart;
                propsData.defaultSpeedFace        = data.defaultSpeedFace;
                propsData.defaultSpeedRoad        = data.defaultSpeedRoad;
                propsData.isFacelocation          = data.isFacelocation;
                propsData.facelocationSpacing     = data.facelocationSpacing;
                propsData.isOpenAlarm             = data.isOpenAlarm;
                propsData.isOpenFaceAlarm         = data.isOpenFaceAlarm;
                propsData.linearAccelerationX     = data.linearAccelerationX;
                propsData.linearAccelerationY     = data.linearAccelerationY;
                propsData.linearAccelerationZ     = data.linearAccelerationZ;
                propsData.cameraNums              = data.cameraNums;
                propsData.defaultVideoDuration    = data.defaultVideoDuration;
                propsData.isBeforeCamera          = data.isBeforeCamera;
                propsData.isAfterCamera           = data.isAfterCamera;
                propsData.overSpeed               = data.overSpeed;
                
                propsData.modelCode               = data.modelCode;
                propsData.modelUrl                = data.modelUrl;
                propsData.autoUpdateApk           = data.autoUpdateApk;
                propsData.autoUpdateApkUrl        = data.autoUpdateApkUrl;
                propsData.comperssionPercentage   = data.comperssionPercentage;
                propsData.isTest                  = data.isTest;
                propsData.isOpenAdas              = data.isOpenAdas;
                this.ajax_update_vehicle(propsData);
                // console.log('postData',propsData)
            }
        },
        //更新终端信息
        ajax_update_vehicle( data ){
            let _this = this;
            this.loading = true ;
            _mm.request({ 
                url:'/terminal/update_terminal.json', 
                data:data
            }).then((res)=>{
                _this.loading=false;
                _mm.msg('更新成功');
                _this.$router.push({path:'/tool-terminal'});
            },function(err){
                _this.loading=false;
            })
        },
    }
    
}
</script>

<style scoped>
    .hbody>.cnt{border:1px solid #DAE0E6;}
</style>
