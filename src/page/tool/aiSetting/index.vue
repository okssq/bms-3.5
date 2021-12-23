<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search" />
        </div>
        <div class="dTble">
            <Table :props="DATA_tbProps" @setPage="GET_page" @AIsetting="EVT_setting"/>
        </div>
        <!-- 弹窗 -->
        <div class="AiSettingAlartBox" v-if="DATA_alert.alertIsShow">
            <div class="AiSettingAlart-bg"></div>
            <div class="AiSettingAlart">
                <div class="AiSettingAlart-top">
                    <div class="AiSettingAlart-tle">AI报警设置</div>
                    <div class="AiSettingAlart-xxx el-icon-close" @click="EVT_closeBox"></div>
                </div>
                <div class="AiSettingAlart-cnt">
                    <div class="cnt-item zoom">
                        <div class="cnt-item-name">报警类型:</div>
                        <div class="cnt-item-detail">{{DATA_alert.alarmTypeName}}</div>
                    </div>
                    <div class="cnt-item zoom">
                        <div class="cnt-item-name">报警规则:</div>
                        <div class="cnt-item-detail" >
                            <el-input-number size="mini" v-model="DATA_alert.timeNumVale"  :min="1"  label="录像时长"></el-input-number>
                            &nbsp;秒内,持续{{DATA_alert.alarmTypeName}} 
                            <el-input-number size="mini" v-model="DATA_alert.alartTypeNumValue"  :min="1"  label="录像时长"></el-input-number>
                            &nbsp;次上传
                        </div>
                    </div>
                    <div class="cnt-item zoom">    
                        <div class="cnt-item-name">是否启用:</div>
                        <div class="cnt-item-detail">
                            <el-switch v-model="DATA_alert.isUse" active-color="#13ce66" ></el-switch>
                        </div>
                    </div>
                    <div class="cnt-item zoom" v-show="DATA_alert.isUse">   
                        <div class="cnt-item-name">报警方式:</div>
                        <div class="cnt-item-detail">
                            <div 
                                class="d-ck"
                                v-for="(item , index) in DATA_alert.showStyle"
                                :key = "'showStyle'+index">
                                
                                <input 
                                    type="checkbox" 
                                    true-value="1"
                                    false-value="0" 
                                    :id="'ck'+index"
                                    name="styeCheck"
                                    v-model="item.value">
                                <label :for="'ck'+index">{{item.name}}</label>
                            </div>
                        </div>
                    </div>
                    <div class="cnt-item zoom" v-show="DATA_alert.isUse && DATA_alert.showStyle[1] && DATA_alert.showStyle[1].value==='1'">
                        <div class="cnt-item-name">录像时长:</div>
                        <div class="cnt-item-detail" >
                            <el-input-number size="mini" v-model="DATA_alert.videoTime"  :min="1"  label="录像时长"></el-input-number>
                            &nbsp;秒
                        </div>
                    </div>
                    <div class="cnt-item zoom" v-if="!vehicleId">    
                        <div class="cnt-item-name">同样配置到其他公司:</div>
                        <div class="cnt-item-detail">
                            <el-button @click="companyListShow = !companyListShow"  plain>
                                {{companyListShow?'隐藏公司选项框':"点击选择公司"}}
                            </el-button>
                        </div>
                    </div>
                    <div class="cnt-item company-list" v-show="companyListShow">
                        <el-input
                            v-show="companyList.length"
                            placeholder="输入公司名称进行过滤"
                            v-model="filterText">
                        </el-input>
                        <el-tree
                            :data="companyList"
                            :filter-node-method="filterNode"
                            @check="change_click"
                            show-checkbox
                            node-key="id"
                            ref="tree2"
                            highlight-current
                            :props="{children: 'children',label: 'companyName'}">
                        </el-tree>
                    </div>
                </div>
                <div class="AiSettingAlart-btn">
                    <button class="dbtn" @click="EVT_closeBox">取消</button><button class="dbtn dbtn-blue" @click="EVT_saveBox">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Menu  from 'components/schMenu/menu.vue';
    import Table from 'components/list/table.vue';

    import Server from 'service/mm.jsx';
    const _mm = new Server();

    export default{
        data(){
            return {
                loading :false ,
                vehicleId : '',
                dataSetting:'',
                DATA_alert:{
                    alertIsShow:false,          //弹窗是否显示
                    isUse : true,               //是否启用
                    alarmTypeName:'',           //报警类型名称
                    alarmTypeVlae:'1',          //报警类型ID
                    showStyle : [],             //报警方式
                    timeNumVale:"1",            //及秒内
                    alartTypeNumValue:"1",      //报警次数
                    videoTime :"10",            //录像时长
                    options1:[{name:'1秒',value:"1"},{name:'2秒',value:"2"},{name:'3秒',value:"3"}],
                    options2:[{name:'1秒',value:"1"},{name:'2秒',value:"2"},{name:'3秒',value:"3"}],
                },
                DATA_menuProps:{
                    title:"AI报警设置",
                    items:[
                        {name:"启用状态",type:"select",key:"nowIsInterval",value:"",options:[{name:'启用',value:'1'},{name:'关闭',value:'0'}]},
                        {name:"展示方式",type:"select",key:"describe",value:"",options:[{name:'视频',value:'1'},{name:'图片',value:'0'}]},
                        {name:"报警类型",type:"alarmDriver",key:"warningIds",value:"",txt:"请选择"},
                        {type:"btn",key:"btn",btns:[
                            {name:"搜索",key:"search",model:"search",cls:"dbtn-blue"},
                            {name:"清除",key:"clear",model:"clear"}
                        ]}
                    ]
                },
                DATA_tbProps:{
                    schVal:'100',
                    title:[
                        {name: "序号",type  : "",prop: "k1",width: ""},
                        {name: "启用状态",type: "",prop: "k2",width: ""},
                        {name: "报警类型",type: "",prop: "k3",width: ""},
                        {name: "展示方式",type: "",prop: "k4",width: ""},
                    ],
                    items:[],
                    opeations:[
                        {name:"设置",evt:"AIsetting"},
                    ],
                    page:{
                        size :10,
                        total:0,
                    },
                },
                checks:[],
                postData:[],  
                companyList:[],         //公司列表
                companyListShow:false,  //公司选择框是否显示
                filterText:'',          //公司过滤文字
                checks:[],              //选中公司Id
            }
        },
        components:{
            'Menu'      : Menu,
            'Table'     : Table
        },
        watch: {
            filterText(val) {
                this.$refs.tree2.filter(val);
            }
        },
        created(){
            this.vehicleId = this.$route.query.vehicleId;
            this.ajax_companyList();
        },
        mounted(){
            // this.ajax_vle_licence_list();
            // this.ajax_companys_list();
            // this.ajax_app_user();
            this.EVT_search();
        },
        methods:{
            // AI设置页面获取公司列表
            ajax_companyList(){
                if(!this.vehicleId){
                    _mm.request({ 
                        url:'/company/company_level.json',
                    }).then((res)=>{
                        this.companyList = res;
                    },function(err){
                        this.companyList = [];
                    })
                }
            },
            // 公司列表过滤方法
            filterNode(value, data) {
                if (!value) return true;
                return data.companyName.indexOf(value) !== -1;
            },
            // 公司勾选发生变化时
            change_click(a,b){
                this.checks = b.checkedKeys;
            },


            //搜索按钮
            EVT_search(i){
                let postData = {
                    warningIds: '[]',
                    vehicleId : '',
                    nowIsInterval:'',
                    describe :''
                };
                if(i){
                    postData.warningIds    = JSON.stringify(i.warningIds);
                    postData.nowIsInterval = i.nowIsInterval;
                    postData.describe      = i.describe;
                }
                this.postData = postData;
                this.DATA_tbProps.page.sync = 1;
                // 车辆管理页面
                if(this.$route.query.vehicleId){                
                    this.postData.vehicleId = this.$route.query.vehicleId;
                    this.ajax_search( this.postData ,'admin');   
                }
                // AI设置页面
                else{//普通搜索
                    this.ajax_search( this.postData ,"normal");
                }
            },
            //搜索接口
            ajax_search(set ,type){
                this.loading = true;
                let _this=this;
                let _url = type ==="admin" ? '/ai_warning/warning_setting_info.json' : '/ai_warning/warning_setting_list.json';
                _mm.request({ 
                    url : _url, 
                    data: set
                }).then((res)=>{
                    let arr = [];
                    for(let i=0,len=res.results.length;i<len;i++){
                        let set = res.results[i];
                        let style = '-';
                        let nowPhotograph = set.nowPhotograph ==="1" ? "图像" :'';
                        if(set.nowIsVideo ==="1" && set.nowPhotograph ==="0"){
                            style="视频";
                        }
                        else if(set.nowIsVideo ==="0" && set.nowPhotograph ==="1"){
                            style="图像";
                        }
                        else if(set.nowIsVideo ==="1" && set.nowPhotograph ==="1"){
                            style="图像 / 视频";
                        }
                        let _json  = {
                            k1:i+1,
                            k2:set.nowIsInterval ==="1" ? '启用' : '关闭',
                            k3:set.warningName,
                            k4:style,
                            k5:set
                        };
                        arr.push(_json);
                    }
                    _this.DATA_tbProps.page.total = res.totalCount;
                    _this.DATA_tbProps.page.size  = 10;
                    _this.DATA_tbProps.items = arr;
                    _this.loading=false;
                },function(err){
                    console.log(err);
                    _this.loading=false;
                })
            },

            //设置按钮
            EVT_setting(item){
                // console.log('item.k5----',item.k5);
                this.$store.commit('update_zIndexTop','main');
                this.dataSetting= {...item.k5,...{}};     //保存设置的所有值。。。
                this.DATA_alert.alertIsShow       = true;
                this.DATA_alert.alarmTypeName     = item.k3;                   //报警类型名称
                if(item.k5.warningId==="100008"||item.k5.warningId==="100009"||item.k5.warningId==="100006"){       //报警方式
                   this.DATA_alert.showStyle         = [                          
                        {name: '图像',value: item.k5.nowPhotograph}
                    ];
                }
                else{
                    this.DATA_alert.showStyle         = [                         
                        {name: '图像',value: item.k5.nowPhotograph},
                        {name: '视频',value: item.k5.nowIsVideo}
                    ];
                }
                this.DATA_alert.timeNumVale       = item.k5.nowIntervalUpload;  //上传间隔 几秒内
                this.DATA_alert.alartTypeNumValue = item.k5.nowIdentificationNumber;  //上传次数
                this.DATA_alert.isUse             = item.k5.nowIsInterval==="1" ?true : false;             //是否启用
                this.DATA_alert.videoTime         = item.k5.nowVideoTime;               //录像时长
            },
            //保存按钮
            EVT_saveBox(){
                if(this.checks.length === 0 && !this.vehicleId){
                    this.$message('公司为必选项！');
                    return
                }
                this.dataSetting.nowIntervalUpload       = this.DATA_alert.timeNumVale;             //上传间隔
                this.dataSetting.nowIdentificationNumber = this.DATA_alert.alartTypeNumValue;       //上传次数
                this.dataSetting.nowIsInterval           = this.DATA_alert.isUse ? '1': '0';        //是否启用
                this.dataSetting.nowPhotograph           = this.DATA_alert.showStyle[0].value;      //是否开启图像
                this.dataSetting.nowIsVideo              = this.DATA_alert.showStyle[1]?this.DATA_alert.showStyle[1].value:'0';      //是否开启视频
                this.dataSetting.nowVideoTime            = this.DATA_alert.videoTime;               //录像时长
                let isUse=this.dataSetting.nowIsInterval==='1'?'启用':'关闭' ;
                let nowPhotograph =this.dataSetting.nowPhotograph ==='1'? '图像':'';
                let nowIsVideo =this.dataSetting.nowIsVideo ==='1'? '视频':'';
                let text = '<p>报警类型：'+'<span style="color:red">'+this.DATA_alert.alarmTypeName+'</span>'+'</p>'+
                           '<p>报警规则：'+'<span style="color:red">'+this.dataSetting.nowIntervalUpload+' 秒</span>'+'内,持续'+
                           this.DATA_alert.alarmTypeName+'<span style="color:red"> '+this.dataSetting.nowIdentificationNumber+' 次</span>'+'上传</p>'+
                           '<p>是否启用：'+'<span style="color:red">'+isUse+'</span>'+'</p>'+
                           '<p>报警方式：'+'<span style="color:red">'+nowPhotograph+'****'+'<span>'+nowIsVideo + '</span>'+'</p>'+
                           '<p>录像时长：'+'<span style="color:red">'+this.dataSetting.nowVideoTime +' 秒</span>'+'</p>';
                this.showConfirmMSG(text);    
            },
            //展示要提交的信息
            showConfirmMSG(text){
                this.$confirm(text, '以下是你即将要保存的信息', {
                    distinguishCancelAndClose: true,
                    dangerouslyUseHTMLString:true,
                    confirmButtonText: '保存',
                    cancelButtonText:  '放弃修改'
                }).then(() => {         //点保存的操作
                    if(this.$route.query.vehicleId){                //超管搜索
                        this.dataSetting.vehicleId = this.$route.query.vehicleId;
                        this.ajax_save(this.dataSetting ,"admin"); 
                    }
                    else{                                           //普通搜索
                        this.dataSetting.companyIdStr = JSON.stringify(this.checks);
                        this.ajax_save(this.dataSetting ,"normal");
                    }
                    this.EVT_closeBox();
                }).catch(action => {    //点放弃修改的操作
                    this.$message({
                        type: 'info',
                        message: '你没有更改任何信息!'
                    })
                });
            },
            //保存接口
            ajax_save(set ,type){
                this.loading = true;
                let _this=this;
                let _url = type ==="admin" ? '/ai_warning/update_warning_setting.json' : '/ai_warning/update_batch_warning_setting.json';
                _mm.request({ 
                    url:_url, 
                    data:set
                }).then((res)=>{
                    this.$message('修改成功');
                    _this.ajax_search( _this.postData ,type);
                },function(err){
                    console.log(err);
                    _this.EVT_closeBox();
                    _this.loading=false;
                })
            },
            
            //关闭弹窗
            EVT_closeBox(){
                this.$store.commit('update_zIndexTop','nav');
                if(!this.vehicleId){
                    this.checks = [];
                    this.companyListShow = false;
                }
                this.DATA_alert.alertIsShow = false;
            },
           
            //回调-分页
            GET_page(data){
                this.postData.page=data;
                this.DATA_tbProps.page.sync = data;
                if(this.$route.query.vehicleId){                //超管搜索
                    this.postData.vehicleId = this.$route.query.vehicleId;
                    this.ajax_search( this.postData ,"admin");   
                }
                else{                                           //普通搜索
                    this.ajax_search( this.postData ,"normal");
                }
            },
            
            
        }
        
    }
</script>

<style scoped>

    .AiSettingAlart{box-shadow: 0 2px 2px rgba(0,0,0,.2);width: 380px;background:#fff;position: fixed;left: calc(50% - 190px);top: calc(50% - 280px);z-index: 1001; }
    .AiSettingAlart-bg{position: fixed; width: 100%;height: 100%;content: '';display: block;background-color: rgba(0,0,0,.3);left: 0;top: 0;z-index: 1000;}
    .AiSettingAlart-top{position:relative;height: 48px;padding:0 15px;margin-bottom: 5px;}
    .AiSettingAlart-tle{line-height: 48px;box-sizing: border-box;height: 48px; border-bottom:1px solid #dae0e6;color: #3496f8;font-weight: 700;font-size: 14px;font-family: Arial, Helvetica, sans-serif;}
    .AiSettingAlart-xxx{position: absolute;width: 14px;height: 14px;line-height: 14px;text-align:center;right: 15px;top: 17px;cursor: pointer;}
    .AiSettingAlart-cnt{padding: 0 15px 10px 15px;}
    .cnt-item{display: flex;}
    .cnt-item + .cnt-item{
        margin-top: 6px;
    }
    .company-list{
        min-height: 100px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border: 1px solid #d8d8d8;
    }

    .company-list >>> .el-tree{
        width: 100%;
        height: 240px;
        overflow-y: auto;
        margin-top: 10px;
    }
    .AiSettingAlart-cnt .cnt-item-name{min-width: 66px;font-weight: bold;vertical-align:bottom;font-size: 13px;line-height: 32px;margin-right: 5px;}
    .AiSettingAlart-cnt .cnt-item-detail{flex: 1; color: #637180;line-height: 32px;}

    .AiSettingAlart-cnt .cnt-item-detail label{margin-left: 5px;}
    .AiSettingAlart-btn {padding: 15px;padding-top:5px; }
    .AiSettingAlart-btn button{width:calc(50% - 10px);margin-right: 0;}
    .AiSettingAlart-btn button:last-of-type{float: right;}

    /**复选框样式 */
    .cnt-item-detail .d-ck{
        display: flex;
        flex-direction: row; 
        padding-right:10px;
        float: left;
    }
    .d-ck input+label{position:relative;cursor: pointer;}
    .d-ck input+label:before{
        position:absolute;top:9px;left:-20px;display:block;content:'';
        width:14px;height:14px;
        background-image: url("~img/icon/d-nock.png");
        background-position:center;
        background-repeat:no-repeat;
        z-index:48;
        cursor: pointer;
    }
    .d-ck input:checked+label:before{
        background-image: url("~img/icon/d-yesck.png");
    }
    .d-ck input{z-index:50;opacity:0;position:relative;}
    
</style>
