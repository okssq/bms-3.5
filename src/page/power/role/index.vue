<template>
    <div class="operation" v-loading="loading">
        <div class="dMenu">
            <Menu :data="DATA_menuProps" @serach="EVT_search"/>
        </div>
        <div class="dTble">
            <div class="schCnt-btn">
                <button class="dbtn dbtn-blue" @click="evt_roleAdd">添加</button>
            </div>
            <Table
                :props="DATA_tbProps"
                @setTable="GET_table"
                @setPage="GET_page"
                @cb_roleEdit="evt_roleEdit"
                @cb_rolePower="evt_rolePower"
                @cb_roleDel="evt_roleDel"
            />
        </div>
        <role-alert :propsRef="roleAlert" v-if="roleAlert.is" ref="edit_role" @refresh="evt_refresh"  @cancel="roleAlert.is = false" />
        <role-power :propsRef="rolePower" v-if="rolePower.is" />
    </div>
</template>
<script>
    import RoleAlert from './roleAlert.vue';
    import RolePower from './rolePower.vue';

    import Menu from "components/schMenu/menu.vue";
    import Table from "components/list/table.vue";
    import Server from "service/mm.jsx";
    const _mm = new Server();
    export default {
        data() {
            return {
                roleAlertShow: false, //编辑，添加弹出框
                rolePowerShow: false, //授权弹出框
                roleAlert:{
                    is:false,
                    data:{}
                },
                rolePower:{
                    is:false,
                    data:{}
                },
                loading: false,
                DATA_menuProps: {
                    title: "角色管理",
                    items: [
                        {
                            name: "角色名称",
                            type: "text",
                            key: "roleName",
                            value: ""
                        },
                        {
                            type: "btn",
                            key: "btn",
                            btns: [
                                {
                                    name: "搜索",
                                    key: "search",
                                    value: "search",
                                    cls: "dbtn-blue"
                                },
                                { name: "清除", key: "clear", value: "clear" }
                            ]
                        }
                    ]
                },
                DATA_tbProps: {
                    title: [
                        { type: "selection", prop: "k0", width: "50" },
                        { name: "角色ID", type: "", prop: "id", width: "" },
                        { name: "角色名称", type: "", prop: "roleName", width: "" },
                        {
                            name: "公司名称",
                            type: "",
                            prop: "companyName",
                            width: ""
                        },
                        {
                            name: "更新时间",
                            type: "",
                            prop: "updateTime",
                            width: ""
                        },
                        { name: "操作人", type: "", prop: "userName", width: "" },
                        { name: "备注", type: "", prop: "remark", width: "" }
                    ],
                    items: [],
                    opeations: [
                        { name: "编辑", evt: "roleEdit" },
                        { name: "授权", evt: "rolePower" },
                        { name: "删除", evt: "roleDel" }
                    ],
                    page: {
                        total: 0
                    }
                },
                checks: [],
                postData: {
                    pageSize: 10,
                    page: 1,
                    roleName: ""
                },
                editData: {
                    roleName: "",
                    remark: ""
                },
                data2: [],
                defaultData: [],
                defaultProps: {
                    children: "children",
                    label: "label"
                },
                currentId:0
            };
        },
        
        components: {
            Menu: Menu,
            Table: Table,
            'roleAlert':RoleAlert,
            'rolePower':RolePower
        },
        created() {
            this.ajax_search()
        },
        methods: {
            EVT_search(i) {
                let postData = {
                    roleName: "",
                    pageSize: 10,
                    page: 1
                };
                if (i) {
                    postData.roleName = i.roleName;
                    postData.pageSize = i.pageSize;
                    postData.page = i.page;
                }
                this.postData = postData;
                this.DATA_tbProps.page.sync = 1;
                this.ajax_search(this.postData);
            },
            ajax_search(data) {
                let _this = this;
                this.loading = true;
                _mm.request({
                    url: "/role/roles.json",
                    data: data ? data : this.postData
                }).then(
                    res => {
                        let arr = [];
                        for (let i = 0, len = res.results.length; i < len; i++) {
                            let set = res.results[i];
                            let _json = {
                                set: { id: set.id, roleName: set.roleName },
                                id: set.id,
                                companyName: set.companyName,
                                roleName: set.roleName,
                                updateTime: set.updateTime,
                                userName: set.userName,
                                remark: set.remark
                            };
                            arr.push(_json);
                        }
                        _this.DATA_tbProps.page.total = res.totalCount;
                        _this.DATA_tbProps.items = arr;
                        _this.loading = false;
                    },
                    function(err) {
                        console.log(err);
                        _this.loading = false;
                    }
                );
            },

            // 添加
            evt_roleAdd() {
                let _this = this;
                this.$prompt("请输入角色名称", "添加角色", {
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    inputPattern: /^[a-zA-Z0-9_\u4E00-\u9FA5]{4,15}$/,
                    inputErrorMessage: "字母，数字，下划线，中文，4-16位，不能空格"
                })
                    .then(({ value }) => {
                        // console.log("111", value);
                        let obj = { roleName: value };
                        let type = "add";
                        _this.ajax_upadteOrAdd(obj, type);
                    })
                    .catch(() => {
                        this.$message({
                            type: "info",
                            message: "取消输入"
                        });
                    });
            },
            ajax_upadteOrAdd(data, type) {
                let _this = this;
                this.loading = true;
                _mm.request({
                    url: "/role/insert_or_update.json",
                    data: data
                }).then(
                    res => {
                        if (type && type === "add") {
                            _this.postData = {
                                pageSize: 10,
                                page: 1,
                                roleName: ""
                            };
                        }
                        _this.ajax_search(_this.postData);
                    },
                    function(err) {
                        console.log(err);
                        _this.loading = false;
                    }
                );
            },

            evt_refresh(){
                this.ajax_search(this.postData);
                this.roleAlert.is = false           
            },
            // tableItem 删除
            evt_roleDel(msg) {
                let _this = this;
                _mm.confirmBox({
                    info: "真的要删除吗？",
                    callBOk: function() {
                        let arr = [msg.id];
                        let data = JSON.stringify(arr);
                        let postdata = { roleIds: data };
                        _this.ajax_delRole(postdata);
                    }
                });
            },
            ajax_delRole(data) {
                let _this = this;
                this.loading = true;
                _mm.request({
                    url: "/role/delete_role.json ",
                    data: data
                }).then(
                    res => {
                        _this.ajax_search();
                    },
                    function(err) {
                        _this.loading = false;
                    }
                );
            },
            // tableItem编辑
            evt_roleEdit(msg) {
                // console.log('msg',msg)
                // console.log('refff',this.$refs.edit_role)
                this.roleAlert.data = msg;
                this.$store.commit("update_zIndexTop", "main");
                this.roleAlert.is = true;
            },

            // tableItem授权按钮
            evt_rolePower(msg) {
                this.$store.commit("update_zIndexTop", "main");
                this.rolePower.is = true;
                this.rolePower.data = msg;
                // console.log("msg",msg)
            },

            //回调-表格
            GET_table(data) {
                this.checks = data;
            },
            //回调-页码
            GET_page(data) {
                this.postData.page = data;
                this.DATA_tbProps.page.sync = data;
                this.ajax_search(this.postData);
            },
        }
        
    };
</script>
<style scoped>

.role-al-tree{
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    min-width: 500px;
}
.role-al-btns{
    display: flex;padding: 20px;justify-content: flex-end;align-items: center;
    border-top: 1px solid #ccc;
}
.role-al-power{
    display: flex;flex-direction: column;
}
.role-alert-power{
    
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
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
}
.role-al-main {
    z-index: 2;
    background-color: #fff;
}

.role-al-main .tle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #ccc;
}
.role-al-main .tle > span:first-of-type {
    font-size: 18px;
}
.role-al-main .tle > span:last-of-type {
    font-size: 16px;
    cursor: pointer;
}
.role-al-main .cnt {
    padding: 20px 40px 10px;
}
.role-al-main .cnt > div {
    display: flex;
    margin-bottom: 20px;
    width: 400px;
}
.role-al-main .cnt > div > div {
    width: 280px;
}
/* .role-al-main .cnt label {
    flex: 1;
    font-size: 16px;
    text-align: right;
    padding-right: 20px;
    box-sizing: border-box;
} */
.role-al-main .btns {
    display: flex;
    justify-content: flex-end;
}
</style>
