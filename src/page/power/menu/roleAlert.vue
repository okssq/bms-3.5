<template>
    <div class="operation" v-loading="loading">
        <div class="role-alert">
            <div class="role-al-bg"></div>
            <div class="role-al-main">
                <div class="tle">
                    <span>{{propsRef.alertTitle}}</span>
                    <span @click="evt_alertXXX"> <i class="el-icon-close"></i></span>
                </div>
                <div class="cnt">
                    <template v-for="item in lists" >
                        <div :key="item.key"  v-if="item.type==='txt'&&item.is" class="cnt-item">
                            <label for>{{item.label}}：</label>
                            <div>{{item.val}}</div>
                        </div>
                        <div :key="item.key" v-else-if="item.type==='input'&&item.is" class="cnt-item">
                            <label :class="{'require':item.isRequire}" for>{{item.label}}：</label>
                            <el-input :clearable="true" v-model="item.val" :placeholder="item.placeholder"></el-input>
                        </div>
                        <div :key="item.key" v-else-if="item.type==='select'&&item.is" class="cnt-item">
                            <label :class="{'require':item.isRequire}" for>{{item.label}}：</label>
                            <el-select v-model="item.val" placeholder="请选择" clearable>
                                <el-option
                                    v-for="item in item.options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                        <div :key="item.key" v-else-if="item.type==='radio'&&item.is" class="cnt-item">
                            <label for>{{item.label}}：</label>
                            <div>
                                <el-radio @change="EVT_radio" v-model="item.val" label="1">模块</el-radio>
                                <el-radio @change="EVT_radio" v-model="item.val" label="2">按钮</el-radio>
                            </div>
                        </div>
                    </template>
                    <div class="btns">
                        <div class="dbtn" @click="evt_alertXXX">取消</div>
                        <div class="dbtn dbtn-blue" @click="evt_alertSure">确定</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Server from "service/mm.jsx";
const _mm = new Server();
export default {
    props:['propsRef'],
    data() {
        return {
            loading: false,
            lists:[
                {label:"上级菜单",is:true,key:"topMenuName",type:"txt",val:""},
                {label:"菜单名称",is:true,key:"menuName",type:"input",val:"",isRequire:true,placeholder:"请输入菜单名称"},
                {label:"资源路径",is:true,key:"url",type:"input",val:"",isRequire:false,placeholder:"请输入资源路径"},
                {label:"图标",is:true,key:"iconClass",type:"select",val:"position",isRequire:false,
                    options:[
                        {label:"定位轨迹",value:"position"},
                        {label:"报警中心",value:"alarm"},
                        {label:"视频监控",value:"video"},
                        {label:"数据中心",value:"data"},
                        {label:"管理工具",value:"tool"},
                        {label:"权限管理",value:"power"},
                        {label:"系统中心",value:"system"},
                    ]
                },
                {label:"导航样式",is:true,key:"navStyle",type:"select",val:"default",isRequire:false,
                    options:[
                        {label:"默认",value:"default"},
                        {label:"缩进",value:"indent"},
                    ]
                },
                {label:"资源类型",is:true,key:"menuType",type:"radio",val:"1",isRequire:false},
            ]
        };
    },
    created() {
        let _this = this;
        _this.lists.forEach(el=>{
            if(el.key === "topMenuName"){
                if(!_this.propsRef.topMenuName)el.is = false;
                el.val = _this.propsRef.topMenuName;
            }

            if(el.key === "menuName"){
                el.val = _this.propsRef.menuName;
            }

            if(el.key === "url"){
                el.val = _this.propsRef.url;
            }

            if(el.key === "iconClass"){
                el.val = _this.propsRef.params ? _this.propsRef.params.iconClass : '';
            }

            if(el.key === "navStyle"){
                el.val = _this.propsRef.params ? _this.propsRef.params.navStyle : '';
            }

            if(el.key === "menuType"){
                el.val = _this.propsRef.menuType.val;
                el.is = _this.propsRef.menuType.is;
            }
        });

        if(_this.propsRef.menuType.val == "2"){
            _this.lists.forEach(el=>{
                if(el.key === "url"){
                    el.is = false;
                    return;
                }

                if(el.key === "iconClass"){
                    el.is = false;
                    return;
                }

                if(el.key === "navStyle"){
                    el.is = false;
                    return;
                }
            });
        }
    },

    methods: {

        ajax_appendMenu(data) {
            let _this = this;
            this.loading = true;
            _mm.request({
                url: "/menu/insert_update_menu.json",
                data: data
            }).then(
                res => {
                    _this.evt_alertXXX();
                    _this.$emit('EVTRef');
                },
                function(err) {
                    _this.loading = false;
                }
            );
        },

        // 弹框操作
        evt_alertXXX() {
            this.propsRef.topMenuName       = "";
            this.propsRef.menuName          = "";
            this.propsRef.url               = "";
            this.propsRef.menuType.val      = "";
            this.propsRef.pid               = "";
            this.propsRef.id                = "";
            this.propsRef.is                = false;
            this.$store.commit("update_zIndexTop", "nav");
        },

        EVT_radio(i){
            if(i == 1){
                this.lists.forEach(el=>{
                    if(el.key === "url"){
                        el.is = true;
                        return;
                    }

                    if(el.key === "iconClass"){
                        el.is = true;
                        return;
                    }

                    if(el.key === "navStyle"){
                        el.is = true;
                        return;
                    }
                });
                return;
            }

            if(i == 2){
                this.lists.forEach(el=>{
                    if(el.key === "url"){
                        el.is = false;
                        return;
                    }

                    if(el.key === "iconClass"){
                        el.is = false;
                        return;
                    }

                    if(el.key === "navStyle"){
                        el.is = false;
                        return;
                    }
                });
                return;
            }
        },

        evt_alertSure() {
            let _propsRef = this.propsRef;
            let _obj = {
                id       : _propsRef.id,
                pid      : _propsRef.pid,
                menuType : _propsRef.menuType.val
            };

            let _lists = this.lists;
            for(let i=0;i<_lists.length;i++){
                if(_lists[i].isRequire && !_lists[i].val){
                    _mm.msgErr("请完善"+_lists[i].label);
                    return;
                }
                _obj[_lists[i].key] = _lists[i].val;
            }
            // console.log("_obj",_obj)
            // console.log("propsRef",this.propsRef)
            this.ajax_appendMenu(_obj);
        },
    }
};
</script>
<style scoped>

    .tree-title{
        display: flex;align-items: center;justify-content: space-between;font-weight: bold;padding: 20px 0 10px 10px;
    }
    .tree-title-item1{flex: 1;}
    .tree-title-item2{width: 260px;}
    .tree-title-item3{width: 260px;}
    .tree-title-item4{width: 274px;}
    

    .btns {
        display: flex;
    }
    .btns .dbtn {
        cursor: pointer;
    }

    .role-alert {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 4000;
    }
    .role-al-bg {
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 1;
    }
    .role-al-main {
        z-index: 2;
        border-radius: 2px;
        background-color: #fff;
        color: #303133;
    }

    .role-al-main .tle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px 25px;
        color: #303133;
    }
    .role-al-main .tle > span:first-of-type {
        font-size: 18px;
    }
    .role-al-main .tle > span:last-of-type {
        font-size: 18px;
        cursor: pointer;
    }
    .role-al-main .cnt {
        padding: 0 25px 10px;
    }
    .role-al-main .cnt > div {
        display: flex;
        margin-bottom: 20px;
        width: 400px;
    }
    .role-al-main .cnt > div > div {
        width: 280px;
    }
    .cnt-item label{
        width: 100px;
    }
    .cnt-item > div{
        flex: 1;
    }
    .btns .dbtn:last-of-type{
        margin-right: 0;
    }
    .role-al-main .cnt label.require::after {
        position: absolute;
        content: "*";
        color: red;
        right: -294px;
        top: 0;
    }
    .role-al-main .btns {
        display: flex;
        justify-content: flex-end;
    }

    .list{flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;}
    .list-item{flex:1;}
    .list-item1{width:260px;height:40px; display: flex; align-items: center; justify-content: flex-start;}
    .list-item2{width:252px;height:40px; display: flex; align-items: center; justify-content: flex-start;}
</style>
