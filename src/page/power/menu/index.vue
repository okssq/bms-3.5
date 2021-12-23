<template>
    <div class="operation" v-loading="loading">
        <div class="btns">
            <el-button 
                type="primary" 
                round
                @click="itemAppend(menu.add)"
            >添加菜单</el-button>
            <!-- <div class="dbtn" ></div> -->
        </div>
       
        <div class="menu-tree">
            <div class="tree-title">
                <div class="tree-title-item1">菜单名称</div>
                <div class="tree-title-item2">类型</div>
                <div class="tree-title-item3">资源路径</div>
                <div class="tree-title-item4">操作</div>
            </div>
            <el-tree
                empty-text="暂无菜单数据"
                highlight-current
                :data="data4"
                :props="defaultProps"
                node-key="id"
                :accordion="true"
                @node-click="evt_nodeClick"
                :expand-on-click-node="false"
                :render-content="renderContent"
            ></el-tree>
        </div>

        <role-alert :propsRef="editData" v-if="editData.is" @EVTRef="rback_roleAlert" />
    </div>
</template>
<script>
import RoleAlert from './roleAlert.vue';

import Server from "service/mm.jsx";
const _mm = new Server();
export default {
    components:{
        'roleAlert':RoleAlert,
    },
    data() {
        return {
            loading: false,
            roleAlertShow: false,
            data4: [],
            defaultProps: {
                children: "children",
                label: "label"
            },
            editData: {
                is:false,
                topMenuName: "",
                menuName: "",
                menuType:{
                    is:true,
                    val:"1"
                },
                pid: "",
                id: "",
                url: ""
            },
            menu:{
                add:{
                    type:"top",
                    id: "0",
                    label: ""
                }
            },
            currentData: {
                id: "0",
                label: ""
            }
        };
    },
    created() {
        this.ajax_treeList();
    },
    methods: {
        // 获取树形列表
        ajax_treeList() {
            let _this = this;
            this.loading = true;
            _mm.request({
                url: "/menu/menu_level.json"
            }).then(
                res => {
                    this.data4 = res;
                    // console.log("res",res)
                    _this.loading = false;
                },
                function(err) {
                    _this.loading = false;
                }
            );
        },
        
        // 表格编辑
        itemEdit(node, data) {
            
            let topMenuName = (node.parent.data || []).length > 0 ? "" : node.parent.data.label;
            this.editData.is = true;
            this.editData.alertTitle = "编辑菜单";
            this.editData.topMenuName = topMenuName;
            this.editData.menuName = data.label;
            this.editData.url = data.params.url;
            this.editData.menuType.is = true;
            this.editData.menuType.val = data.params.menuType;
            this.editData.params = data.params;
            this.editData.pid = data.params.pid;
            this.editData.id = data.id;
            this.$store.commit("update_zIndexTop", "main");
            this.roleAlertShow = true;
        },

        // 顶部添加,表格添加
        itemAppend(data) {
            // console.log("top",data)
            let _menuTypeIs = true;
            if(data.type === "top"){
                data.label = "";
                data.id    = "0";
                _menuTypeIs = false;
            }
            this.editData.is = true;
            this.editData.alertTitle = "添加菜单";
            this.editData.topMenuName = data.label;
            this.editData.menuName = "";
            this.editData.url = "";
            this.editData.menuType.val = "1";
            this.editData.menuType.is = _menuTypeIs;
            this.editData.pid = data.id;
            this.editData.id = "";
            this.editData.params = data.params;
            this.$store.commit("update_zIndexTop", "main");
            this.roleAlertShow = true;
        },

        rback_roleAlert(){
            this.ajax_treeList();
        },
    
        // 表格删除
        itemRemove(node, data) {
            // console.log("node", node, "data", data);
            let _this = this;
            _mm.confirmBox({
                info: "确定删除" + data.label + "吗？",
                callBOk: function() {
                    _this.ajax_delMenu({ id: data.id }, node, data);
                }
            });
        },
        
        ajax_delMenu(data, node, nodeData) {
            let _this = this;
            this.loading = true;
            _mm.request({
                url: "/menu/delete_menu.json",
                data: data
            }).then(
                res => {
                    _this.evt_delMenu(node, nodeData);
                    _this.loading = false;
                },
                function(err) {
                    _this.loading = false;
                }
            );
        },
        evt_delMenu(node, data) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        },

        // 渲染操作内容区域
        renderContent(h, { node, data, store }) {
            // console.log("data",data)
            return (
                <div class="list zoom">
                    <div class="list-item">
                        <span>{node.label}</span>
                    </div>
                    <div class="list-item1">
                        <span>{data.params.menuType=="1"?"导航":"功能"}</span>
                    </div>
                    <div class="list-item1">
                        <span>{node.data.params.url||"--"}</span>
                    </div>
                    <div class="list-item1">
                        <el-button
                            size="mini"
                            style="font-size: 12px;"
                            type="text"
                            icon="el-icon-edit-outline"
                            on-click={() => this.itemEdit(node, data)}
                        >
                            编辑
                        </el-button>
                        <el-button
                            size="mini"
                            style="font-size: 12px;"
                            type="text"
                            icon="el-icon-circle-plus-outline"
                            on-click={() => this.itemAppend(data)}
                        >
                            添加
                        </el-button>
                        <el-button
                            size="mini"
                            style="font-size: 12px;"
                            type="text"
                            icon="el-icon-delete"
                            on-click={() => this.itemRemove(node, data)}
                        >
                            删除
                        </el-button>
                    </div>
                </div>
            );
        },
        // Tree Item点击选中
        evt_nodeClick(nodeData) {
            this.currentData.id    = nodeData.id;
            this.currentData.label = nodeData.label;
        },
    }
};
</script>
<style scope>
    .list-item1>button + button{
        position: relative;padding-left: 10px;
    }
    .list-item1>button + button::before{
        position: absolute;
        content: '';
        width: 1px;
        height: 12px;
        background-color: #ccc;
        left: 0px;
        top: 6px;
    }

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


    .list{flex:1;width:500px;display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;}
    .list-item{flex:1;}
    .list-item1{width:260px;height:40px; display: flex; align-items: center; justify-content: flex-start;}
    .list-item2{width:252px;height:40px; display: flex; align-items: center; justify-content: flex-start;}
</style>
