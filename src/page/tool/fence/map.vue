<template>
    <div class="mainMap">
        <div class="dmap" id="map"></div>
        <div class="rail-sidebar">
            <div class="sidebar-menu">选择列表</div>
            <div class="sidebar-schItem">
                <div class="sidebar-schItem-tle">选择地址</div>
                <div class="sidebar-schItem-cnt">
                    <div class="p-select">
                        <el-select v-model="province.value" placeholder="请选择省" @change="EVT_province_change">
                            <el-option
                            v-for="item in province.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="c-select">
                        <el-select v-model="city.value" placeholder="请选择市" @change="EVT_city_change">
                            <el-option
                            v-for="item in city.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="d-select">
                        <el-input v-model="address" placeholder="请输入具体地址" maxlength="50"></el-input>
                    </div>
                </div> 
            </div>
            <div class="sidebar-btnGroup" v-if="is_search">
                <button class="dbtn" @click="EVT_clear">清除</button><button class="dbtn dbtn-blue" @click="EVT_search">搜索</button>
            </div>
        </div>
    </div>
</template>

<script>
    import Server  from 'service/mm.jsx';
    const _mm = new Server();

    let map,
        placeSearch = new AMap.PlaceSearch({city:"全国"});

    export default{
        data(){
            return {
                title:"新建围栏",
                province:{
                    options:[
                        {label:"请选择",vlaue:""}
                    ],
                    value:""
                },
                city:{
                    options:[
                        {label:"请选择",vlaue:""}
                    ],
                    value:""
                },
                region:{
                    btnTxt:"开始绘制",
                    lnglats:[],
                    polygon:"",
                    marker:[]
                },
                address:"",//查询地址
                marker_search:[],//点标记-搜索结果
                marker_point:[],//点标记-列表
                circle:"",//点围栏
                is_search:true,//搜索按钮是否可用
            }
        },
        created(){
            this.ajax_province_list();
        },
        mounted(){
            //初始化地图
            map = new AMap.Map('map', {
                zoom:11,//级别
            });
            
            if(!this.$route.query)return;

            let _crumbs_this = "新建围栏";

            let _query = this.$route.query;

            if(_query.type){
                if(_query.type === "view"){
                    this.title = "查看围栏";
                    this.is_search = false;//搜索按钮是否可用
                    _crumbs_this = "查看围栏";
                }else if(_query.type === "edit"){
                    this.title = "编辑围栏";
                    this.is_search = false;//搜索按钮是否可用
                    _crumbs_this = "编辑围栏";
                }

                let _postData = {
                    fenceId : _query.fenceId
                };
                this.ajax_fence_info(_postData);
            }else{
                let _login = _mm.getStorage('login');

                //获取围栏列表
                this.ajax_fence_list({
                    companyId:_login.companyId,
                    pageSize : 10000
                });
            }
        },
        methods:{
            //ajax-获取省市数据
            ajax_province_list(){
                _mm.request({
                    url:"/driver/province_list.json"
                }).then((res)=>{
                    if(res.length === 0)return;

                    let options = [];
                    res.forEach((el,index)=>{
                        let _city = el.citySelect;
                        let _city_options = [];
                        for(let i=0;i<_city.length;i++){
                            _city_options.push({
                                label:_city[i].cityAbbName,
                                value:_city[i].cityCode
                            });
                        }
                        options.push({
                            label:el.provinceAbbName,
                            value:el.provinceCode,
                            items:_city_options
                        });
                    });
                    this.province.options = options;
                });
            },

            //ajax-围栏添加/更新接口
            ajax_add_fence(set){
                _mm.request({
                    url:"/fence/insert_update_fence.json",
                    data:set
                }).then((res)=>{
                    map.clearInfoWindow();
                    map.clearMap();
                    _mm.msg("操作成功");

                    map.remove(this.marker_search);

                    let _query = this.$route.query;

                    //判断当前状态
                    if(_query){
                        if(_query.type === "view" || _query.type === "edit"){
                            let _postData = {
                                fenceId : _query.fenceId
                            };
                            this.ajax_fence_info(_postData);
                            return;
                        }
                    }

                    let _login = _mm.getStorage('login');

                    //获取围栏列表
                    this.ajax_fence_list({
                        companyId:_login.companyId,
                        pageSize : 10000
                    });
                });
            },

            //ajax-获取围栏信息
            ajax_fence_info(set){
                let _this = this;
                _mm.request({
                    url:"/fence/fence_info.json",
                    data:set
                }).then((res)=>{
                    map.clearMap();
                    map.clearInfoWindow();

                    let _fInfo  = JSON.parse(res.fencePointsInfo);
                    let _lnglat = _fInfo.lnglat;
                    let _radius = _fInfo.radius;
                    let _zoom   = _fInfo.zoom;

                    //fn_新建点标记
                    _this.fn_marker({
                        lnglat:_lnglat,
                        type:"openEdit",
                        info:{
                            title:res.fenceName,
                            address:res.poiName,
                            info:res
                        }
                    });

                    //fn-点围栏
                    _this.fn_circle({
                        lnglat:_lnglat,
                        radius:_radius
                    });

                    //设置中心点
                    map.setCenter(_lnglat);
                    map.setZoom(_zoom);
                });
            },

            //获取围栏列表
            ajax_fence_list(set){
                this.loading = true;
                let _this=this;
                _mm.request({ 
                    url:'/fence/fence_list.json', 
                    data:set
                }).then((res)=>{
                    map.clearMap();
                    map.clearInfoWindow();

                    let _items = res.results;
                    if(_items.length === 0)return;

                    _this.marker_point = [];
                    
                    _items.forEach((el,index)=>{
                        let _fInfo  = JSON.parse(el.fencePointsInfo);
                        if(el.fenceType === "1"){
                            let _lnglat = _fInfo.lnglat;
                            let _radius = _fInfo.radius;

                            _this.marker_point.push({
                                lnglat  :_lnglat,
                                title   :el.fenceName,
                                address :el.poiName,
                                info    :el
                            });

                            //fn-点围栏
                            _this.fn_circle({
                                lnglat:_lnglat,
                                radius:_radius
                            });
                        }else if(el.fenceType === "2"){
                            let _lnglats = [];
                            _fInfo.lnglat.forEach((el_cld,index_cld)=>{
                                _lnglats.push(el_cld);
                                _this.fn_marker({
                                    lnglat:el_cld,
                                    type:"openRemove",
                                    info:{
                                        title:(index_cld+1),
                                        info:el
                                    },
                                });
                            });
                            _this.fn_region({path:_lnglats,isAll:true});
                            _this.region.polygon = "";
                        }
                    });
                    
                    _this.fn_reset_marker(_this.marker_point,"list");
                    
                })
            },

            //ajax-删除
            ajax_remove(set){
                _mm.request({ 
                    url:'/fence/del_batch_fence.json', 
                    data:set
                }).then((res)=>{
                    _mm.msg("删除成功");
                    map.clearInfoWindow();
                    map.clearMap();

                    let _login = _mm.getStorage('login');

                    //获取围栏列表
                    this.ajax_fence_list({
                        companyId:_login.companyId,
                        pageSize : 10000
                    });
                });
            },

            //EVT-选择省
            EVT_province_change(data){
                let _province = this.province.options;
                for(let i=0;i<_province.length;i++){
                    if(_province[i].value == data){
                        this.city.options = _province[i].items;
                        break;
                    }
                }

                map.setCity(data);
                placeSearch = new AMap.PlaceSearch({city:data});
                this.city.value = "";
            },

            //EVT-选择市
            EVT_city_change(data){
                map.setCity(data);
                placeSearch = new AMap.PlaceSearch({city:data});
            },

            //EVT-搜索
            EVT_search(){
                let _this = this;
                if(!this.province.value && !this.city.value){
                    _mm.msg("请选择省份或城市");
                    return;
                }

                if(!this.address){
                    _mm.msg("请输入地址");
                    return;
                }

                map.clearInfoWindow();
                //map.clearMap();
                _this.fn_reset_marker(_this.marker_point,"list");
                
                placeSearch.search(this.address, function (status, result) {
                    if(!result.info){
                        _mm.msg("没有结果");
                        return;
                    }

                    if(!result.poiList || result.poiList.pois.length === 0){
                        _mm.msg("没有结果");
                        return;
                    }

                    let _location = result.poiList.pois[0].location;

                    map.setCenter([_location.lng,_location.lat]);
                    map.setZoom(16);
                    let _arr = [];

                    result.poiList.pois.forEach((el,index)=>{
                        _arr.push({
                            lnglat:[el.location.lng,el.location.lat],
                            title:el.name?el.name:el.address,
                            address:el.address?el.address:el.name
                        });
                    });

                    _this.fn_reset_marker(_arr,"search");
                })
            },

            //EVT-清除
            EVT_clear(){
                this.province.value = "";
                this.city.value     = "";
                this.address        = "";
                this.city.options   = [];
                map.clearMap();
                map.clearInfoWindow();

                let _login = _mm.getStorage('login');

                //获取围栏列表
                this.ajax_fence_list({
                    companyId:_login.companyId,
                    pageSize : 10000
                });
            },

            //fn-重置点标记
            fn_reset_marker(items,type){                
                let _this = this;                
                items.forEach((el,index)=>{
                    if(!fn_set_poing(el,type))return;
                    let _obj = {
                        lnglat  :el.lnglat,
                        title   :el.title,
                        address :el.address,
                        type    :"openRemove",
                        info    :el
                    }
                    if(type === "search"){
                        _obj = {
                            lnglat:el.lnglat,
                            info:{
                                title   :el.title,
                                address :el.address
                            }
                            
                        };
                    }
                    
                    _this.fn_marker(_obj);
                });

                function fn_set_poing(obj,t){
                    let sign = true;
                    if(t === "search"){
                        for(let i=0;i<_this.marker_point.length;i++){
                            if(JSON.stringify(_this.marker_point[i].lnglat) === JSON.stringify(obj.lnglat)){
                                sign = false;
                                break;
                            }
                        }
                    }
                    return sign;
                    
                }
            },

            //fn_新建点标记
            /*
                this.fn_marker({
                    lnglat:[],
                    info:{
                        title:""
                    },
                    offset:""
                });
            */
            fn_marker(config){
                let _this   = this;
                let _lnglat = config.lnglat,
                    _type   = config.type?config.type:"",
                    _title  = config.info.title,
                    _info   = config.info,
                    _offset = config.offset||new AMap.Pixel(15, 25);
                
                let _infomation = _info.info?_info.info:"";

                let m = new AMap.Marker({
                    position: _lnglat,   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                    title   : _title,
                    label   : {
                        content: _title,
                        offset : _offset
                    },
                    //icon    : config.icon?config.icon:_mm.hostUrl()+"/cdn/img/map/blue.png",
                    map     : map
                });

                //html-弹层标题
                let html_tle = `新建围栏`;

                //html-弹层主体
                let html_cnt = `
                    <!--新建围栏-->
                    <div>
                        <div class="railAM-cnt-item">
                            <input type="text" class="railAm-cnt-text" id="railAm_text" placeholder="请输入围栏名"/>
                        </div>
                        <div class="railAM-cnt-item">
                            <input type="text" class="railAm-cnt-text" value="50米" id="railAm_text_sel" maxlength="7" placeholder=""/>
                            <select class="railAm-cnt-select" id="railAm_select">
                                <option value="div">请输入</option>
                                <option value="50" selected = "selected">50米</option>
                                <option value="100">100米</option>
                            </select>
                            <div class="railAm-cnt-selArrow el-icon-caret-bottom"></div>
                        </div>
                    </div>
                `;

                //html-弹层按钮
                let html_btn = `
                    <button class="dbtn" id="btn_cancel">取消</button><button class="dbtn dbtn-blue" id="btn_spot">确定</button>
                `;

                let _query = this.$route.query;

                //判断当前状态
                if(_query && _query.type === "view"){
                    html_tle = `查看围栏`;
                    html_cnt = `
                        <div>
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏名称：</div>
                                <div class="railAM-item-cnt">`+_infomation.fenceName+`</div>
                            </div>
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏地址：</div>
                                <div class="railAM-item-cnt">`+_infomation.poiName+`</div>
                            </div>
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏半径：</div>
                                <div class="railAM-item-cnt">`+JSON.parse(_infomation.fencePointsInfo).radius+`米</div>
                            </div>
                        </div>
                    `;
                    html_btn = ``;
                }else if(_query && _query.type === "edit"){
                    html_tle = `编辑围栏`;
                    html_cnt = `
                        <div>
                            <div class="railAM-cnt-item">
                                <input type="text" class="railAm-cnt-text" disabled id="railAm_text" value="`+_infomation.fenceName+`" placeholder="请输入围栏名"/>
                            </div>
                            <div class="railAM-cnt-item">
                                <input type="text" class="railAm-cnt-text" value="`+JSON.parse(_infomation.fencePointsInfo).radius+`米" id="railAm_text_sel" maxlength="7" placeholder=""/>
                                <select class="railAm-cnt-select" id="railAm_select">
                                    <option value="div">请输入</option>
                                    <option value="50" selected="selected">50米</option>
                                    <option value="100">100米</option>
                                </select>
                                <div class="railAm-cnt-selArrow el-icon-caret-bottom"></div>
                            </div>
                        </div>
                    `;
                    html_btn = `
                        <button class="dbtn" id="btn_cancel">取消</button><button class="dbtn dbtn-blue" id="btn_spot">确定</button>
                    `;
                }

                if(_type === "openRemove"){
                    let html_cld = ``;
                    if(_infomation.fenceType === "1"){
                        html_cld = `
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏半径：</div>
                                <div class="railAM-item-cnt">`+JSON.parse(_infomation.fencePointsInfo).radius+`米</div>
                            </div>
                        `;
                    }else if(_infomation.fenceType === "2"){
                        html_cld = "";
                    }

                    html_tle = `已有围栏`;
                    html_cnt = `
                        <div>
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏名称：</div>
                                <div class="railAM-item-cnt">`+_infomation.fenceName+`</div>
                            </div>
                            <div class="railAM-cnt-item zoom">
                                <div class="railAM-item-name">围栏地址：</div>
                                <div class="railAM-item-cnt">`+_infomation.poiName+`</div>
                            </div>
                            `+html_cld+`
                        </div>
                    `;
                    html_btn = `<button class="dbtn" id="btn_cancel">取消</button><button class="dbtn dbtn-blue" id="btn_remove">删除</button>`;
                }

                let _content = `
                    <div class="rail-alert" d-data=\'`+JSON.stringify(config)+`\'>
                        <div class="rail-alert-menu"> 
                            <div class="railAM-tle">`+html_tle+`</div>
                            <div class="railAM-xxx el-icon-close"></div>
                        </div>
                        <div class="rail-alert-cnt">
                            `+html_cnt+`
                        </div>
                        <div class="rail-alert-btnGroup zoom">
                            `+html_btn+`
                        </div>
                    </div>
                `;

                //判断当前状态
                if(_type === "openEdit"){
                    new AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        content: _content,
                        offset: new AMap.Pixel(10,-50)//定位
                    }).open(map,_lnglat);
                }

                //点击标记
                m.on('click',function(e){
                    // console.log("123",config)
                    map.clearInfoWindow();
                    let _infoWindow = new AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        content: _content,
                        offset: new AMap.Pixel(10,-50)//定位
                    });
                    _infoWindow.open(map,_lnglat);

                    let obj = {
                        lnglat:_lnglat,
                        radius:parseInt($("#railAm_text_sel").val()),
                    };
                    if(!_query.type){
                        if(config.type !== "openRemove"){
                            if(_this.circle)map.remove(_this.circle);
                            _this.fn_circle(obj);
                        }
                        
                    }
                });

                this.fn_div_Evt();
            },

            //弹层的事件
            fn_div_Evt(){

                let _query = this.$route.query;
                let _this = this;

                //EVT-点击确定保存
                $(document).off("click","#btn_spot").on("click","#btn_spot",function(){
                    let _text = $("#railAm_text").val();
                    let _radius = parseInt($("#railAm_text_sel").val());
                    let _zoom = map.getZoom();

                    if(!_text){
                        _mm.msg("请输入围栏名");
                        return;
                    }

                    if(!_radius){
                        _mm.msg("请输入半径");
                        return;
                    }

                    let _d = $(".rail-alert").attr("d-data");
                    let _data = JSON.parse(_d);

                    let _fencePointsInfo = {
                        lnglat:_data.lnglat,
                        radius:_radius,
                        zoom:_zoom
                    };

                    let _postData = {
                        fenceName       :_text,
                        fenceType       :1,
                        fencePointsInfo :JSON.stringify(_fencePointsInfo),
                        poiName         :_data.info.address
                    };

                    
                    if(_query.type === "edit"){
                        _postData.fenceId = _query.fenceId;
                    }

                    _this.ajax_add_fence(_postData);
                });

                //EVT-半径数据输入框内容改变
                $(document).off("keyup","#railAm_text_sel").on("keyup","#railAm_text_sel",function(){
                    let _d = $(".rail-alert").attr("d-data");
                    let _data = JSON.parse(_d);

                    let _radius = parseInt($("#railAm_text_sel").val());

                    if(_this.circle)map.remove(_this.circle);

                    let obj = {
                        lnglat:_data.lnglat,
                        radius:_radius
                    };
                    _this.fn_circle(obj);
                });

                //EVT-半径数据选择框内容改变
                $(document).off("change","#railAm_select").on("change","#railAm_select",function(){
                    let _d = $(".rail-alert").attr("d-data");
                    let _data = JSON.parse(_d);

                    let _val = $(this).val();
                    if(_val === "div"){
                        $("#railAm_text_sel").focus();
                        return;
                    }
                    $("#railAm_text_sel").val(_val+"米");
                    let _radius = parseInt($("#railAm_text_sel").val());

                    if(_this.circle)map.remove(_this.circle);

                    let obj = {
                        lnglat:_data.lnglat,
                        radius:_radius
                    };
                    _this.fn_circle(obj);
                });

                //EVT-点击状态弹层取消
                $(document).off("click",".railAM-xxx,#btn_cancel").on("click",".railAM-xxx,#btn_cancel",function(){
                    let _query = _this.$route.query;

                    map.clearInfoWindow();

                    if(_query.type === "view" || _query.type === "edit")return;

                    let _login = _mm.getStorage('login');
                    if(_this.circle)map.remove(_this.circle);

                    //获取围栏列表
                    // _this.ajax_fence_list({
                    //     companyId:_login.companyId,
                    //     pageSize : 10000
                    // });
                });

                //EVT-点击删除
                $(document).off("click","#btn_remove").on("click","#btn_remove",function(){
                    let _d = $(".rail-alert").attr("d-data");
                    let _data = JSON.parse(_d);
                    let _postData = {
                        ids:JSON.stringify([_data.info.info.fenceId])
                    };
                    _this.ajax_remove(_postData);
                });
            },

            //fn-点围栏
            /*
                    this.fn_circle({
                       lnglat:[],
                       radius:""
                    });
             
             */
            fn_circle(config){
                if(!config || !config.lnglat)return;

                let _this = this,
                    _lnglat = config.lnglat,
                    _radius = config.radius?config.radius:0;
                
                // 构造矢量圆形
                _this.circle = "";
                _this.circle = new AMap.Circle({
                    center: _lnglat, // 圆心位置
                    radius: _radius,  //半径
                    strokeColor: "#F33",  //线颜色
                    strokeOpacity: 1,  //线透明度
                    strokeWeight: 3,  //线粗细度
                    fillColor: "#ee2200",  //填充颜色
                    fillOpacity: 0.2 //填充透明度
                });
                _this.circle.setMap(map);//生成电子围栏
            },

            //fn-绘制区域围栏
            /*
                this.fn_region({
                    path:[],
                    extData:{}
                })
            */
            fn_region(config){
                let _path = config.path?config.path:[],
                    _extData = config.extData?config.extData:"",
                    _isAll   = config.isAll?config.isAll:false;

                if(this.region.polygon && !_isAll)map.remove(this.region.polygon);

                //配置区域围栏
                this.region.polygon = new AMap.Polygon({
                    path: config.path,//format-坐标解析格式
                    fillOpacity:0.1,
                    fillColor:"#F33",
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    strokeColor:"#ee2200",
                    map:map,
                    zIndex:12,
                    extData:config.extData,
                });
                return this.region.polygon;
            },
        }
    }

</script>

<style scoped>
   
    #map{
        width:100%;height: 100%;
    }
    /**整个BOX */
    .rail-sidebar {
        position: absolute;
        bottom: 15px;
        top: 15px;
        right: 15px;
        width: 250px;
        padding: 15px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    /**菜单 */
    .sidebar-menu {
        height: 40px;
        padding: 0 20px;
        background-color: #eff7ff;
        font-weight: bolder;
        line-height: 40px;
        font-size: 13px;
    }

    /**单个搜索标题*/
    .sidebar-schItem .sidebar-schItem-tle{
        font-size: 12px;
        color: #637180;
        text-indent: 13px;
        height: 40px;
        line-height: 40px;
        position: relative;
    }
    .sidebar-schItem .sidebar-schItem-tle:before {
        content: "";
        display: block;
        width: 6px;
        height: 6px;
        position: absolute;
        left: 0;
        top: 17px;
        background: #3496f8;
    }

    /**select搜索框 */
    .sidebar-schItem-cnt{display:flex;flex-wrap:wrap;justify-content:space-between;}
    .sidebar-schItem-cnt .p-select,
    .sidebar-schItem-cnt .c-select{width:105px;}
    .sidebar-schItem-cnt .d-select{width:100%;margin-top:10px;}
    .sidebar-schItem-cnt .d-select>div.el-select{width:100%;}
    /* 按钮组 */
    .sidebar-btnGroup{position:absolute;bottom:15px;width:220px;}
    .sidebar-btnGroup>button{width: calc(50% - 5px);margin-right:0;}
    .sidebar-btnGroup>button.dbtn-blue{margin-left:10px;}



    
</style>
