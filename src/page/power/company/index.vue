<template>
    <div class="operation">
        <div class="company-list">
            <el-input class="filter-text" placeholder="输入公司查询" v-model="filterText" clearable></el-input>
            <div class="company-tree">
                <el-tree
                    :data="companyList"
                    node-key="id"
                    :props="{label:'companyName'}"
                    ref="companyList"
                    :filter-node-method="companyList_filter"
                    :expand-on-click-node="false"
                >
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span>{{ node.label }}</span>
                        <span>
                            <el-button type="text" size="mini" @click="() => view(data)">查看</el-button>
                            <el-button type="text" size="mini" @click="() => edit(data)">编辑</el-button>
                            <el-button type="text" size="mini" @click="() => del(data)">删除</el-button>
                        </span>
                    </span>
                </el-tree>
            </div>
            <button
                v-if="isEdit"
                class="dbtn company-btn list-bottom-btn"
                @click="add_inList"
            >+新增子公司</button>
        </div>
        <div class="company-edit">
            <Form
                v-if="isEdit"
                :props="DATA_formProps"
                @setForm="GET_form"
                @setCancel="GET_cancel"
                ref="Cld_form"
            />
            <div v-if="!isEdit" class="company-edit-box">
                <button class="dbtn company-btn" @click="add_inBox">+新增子公司</button>
            </div>
        </div>
    </div>
</template>

<script>
import Form from "components/form/form.vue";
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
    data() {
        return {
            updataId: "",
            userId: "",
            DATA_formProps: {
                width: "100%",
                btn: {
                    show: true
                },
                list: [
                    
                ]
            },
            isEdit: false,
            filterText: "",
            companyList: [],
            add_formList: [
                [
                    {
                        name: "所属公司",
                        type: "singleCompany",
                        key: "pid",
                        value: "",
                        required: true,
                        options: []
                    },
                    {
                        name: "子公司名称",
                        type: "text",
                        key: "company",
                        value: "",
                        required: true
                    },
                    {
                        name: "用户名",
                        type: "text",
                        key: "userName",
                        value: "",
                        required: true
                    },
                    {
                        name: "真实姓名",
                        type: "text",
                        key: "realName",
                        value: "",
                        required: true
                    },
                    {
                        name: "密码",
                        type: "password",
                        key: "pwd",
                        value: "",
                        required: true
                    },
                    {
                        name: "请重复密码",
                        type: "password",
                        key: "pwdRepeat",
                        value: "",
                        required: true
                    }
                ],
                [
                    {
                        name: "联系电话",
                        type: "text",
                        key: "mobile",
                        value: ""
                    },
                    { name: "邮箱", type: "text", key: "email", value: "" },
                    {
                        name: "通讯地址",
                        type: "text",
                        key: "address",
                        value: ""
                    }
                ]
            ]
        };
    },
    components: {
        Form: Form
    },
    created() {
        this.ajax_company_level();
    },
    watch: {
        filterText(val) {
            this.$refs.companyList.filter(val);
        }
    },
    methods: {
        // 检索公司
        companyList_filter(value, data) {
            if (!value) return true;
            return data.companyName.indexOf(value) !== -1;
        },
        //获取公司列表
        ajax_company_level() {
            this.companyList = [];
            this.filterText  = '';
            _mm.request({
                url: "/company/company_level.json"
            }).then(
                res => {
                    this.fn_companyTree_list(res);
                    this.add_formList[0][0]['options'] = this.companyList;
                },
                function(err) {
                    console.log("err", err);
                }
            );
        },
        fn_companyTree_list(res) {
            let arr = res;
            arr.forEach(el => {
                el.name = el.companyName;
                el.value = el.id;
                el.actived = false;
                if ((el.children || []).length) {
                    this.fn_companyTree_list(el.children);
                }
            });
            this.companyList = arr;
        },

        //view
        view(data) {
            this.isEdit = true;
            this.DATA_formProps.btn.show = false;
            this.ajax_company_info(data.id, "view");
        },
        //edit
        edit(data) {
            this.isEdit = true;
            this.DATA_formProps.btn.show = true;
            this.ajax_company_info(data.id);
        },
        //del
        del(data) {
            let _this = this;
            _mm.confirmBox({
                info: "真的要删除吗",
                callBOk: function() {
                    _this.ajax_delete_company(data.id);
                }
            });
        },

        //获取表单数据
        GET_form: function(data) {
            if (data.pwd !== data.pwdRepeat) {
                _mm.msgErr("两次密码不相同");
                return;
            }
            let postData = {
                companyName: data.company,
                userName: data.userName,
                realName: data.realName,
                telephone: data.mobile,
                email: data.email,
                address: data.address,
                userPassword: data.pwd.indexOf("*") === -1 ? data.pwd : "",
                confirmUserPassword:
                    data.pwdRepeat.indexOf("*") === -1 ? data.pwdRepeat : "",
                type: "0" //请求类型0是公司1是用户
            };
            //更新
            if (this.updataId) {
                postData.companyId = this.updataId;
                postData.userId = this.userId;
            }
            //添加
            else {
                postData.pid = data.pid;
            }
            this.ajax_add_update_company(postData); //ajax-添加/更新
        },
        //取消
        GET_cancel: function(data) {
            this.isEdit = false;
        },

        //ajax-添加/更新
        ajax_add_update_company(set) {
            let _this = this;
            _mm.request({
                url: "/company/add_update_company.json",
                data: set
            }).then(function(res) {
                _mm.msgSss("操作成功");
                _this.ajax_company_level(); //ajax-获取公司列表
                _this.fn_clear(); //清空
                _this.isEdit = false;
            });
        },

        //ajax-删除
        ajax_delete_company(id) {
            let _this = this;
            _mm.request({
                url: "/company/delete_company.json",
                data: {
                    companyId: id
                }
            }).then(function(res) {
                _mm.msgSss("删除成功");
                _this.fn_clear();
                _this.ajax_company_level();
            });
        },
        //ajax-获取单条公司信息
        ajax_company_info(id, type) {
            let _this = this;
            _mm.request({
                url: "/company/company_info.json",
                data: {
                    companyId: id
                }
            }).then(function(res) {
                let _user = res.user[0];
                let _company = res.company;
                let _list = [
                    [
                        {
                            name: "子公司名称",
                            type: "text",
                            key: "company",
                            value: _company.companyName,
                            required: true
                        },
                        {
                            name: "角色",
                            type: "text",
                            key: "roleId",
                            value: _user.roleName,
                            disabled: true
                        },
                        {
                            name: "用户名",
                            type: "text",
                            key: "userName",
                            value: _user.userName,
                            required: true
                        },
                        {
                            name: "真实姓名",
                            type: "text",
                            key: "realName",
                            value: _user.realName,
                            required: true
                        },
                        {
                            name: "密码",
                            type: "password",
                            key: "pwd",
                            value: "******",
                            required: true
                        },
                        {
                            name: "请重复密码",
                            type: "password",
                            key: "pwdRepeat",
                            value: "******",
                            required: true
                        }
                    ],
                    [
                        {
                            name: "联系电话",
                            type: "text",
                            key: "mobile",
                            value: _user.telephone
                        },
                        {
                            name: "邮箱",
                            type: "text",
                            key: "email",
                            value: _user.email
                        },
                        {
                            name: "通讯地址",
                            type: "text",
                            key: "address",
                            value: _user.address
                        }
                    ]
                ];
                _this.updataId = _company.id;
                _this.userId = _user.userId;
                _this.DATA_formProps.list = _list;
                if (type === "view")
                    _this.$refs.Cld_form.EVT_parent({ type: "view" });
            });
        },

        //evt-添加-列表模块
        add_inList: function() {
            this.DATA_formProps.btn.show = true;
            this.DATA_formProps.list = this.add_formList;
            this.fn_clear();
        },
        //evt-添加-单独模块
        add_inBox: function() {
            this.isEdit = true;
            this.DATA_formProps.btn.show = true;
            this.DATA_formProps.list = this.add_formList;
            this.fn_clear();
        },
        //清空
        fn_clear() {
            this.updataId = "";
            let _this = this;
            this.DATA_formProps.list.forEach(function(el, index) {
                for (let i = 0; i < el.length; i++) {
                    el[i].value = "";
                }
            });
        }
    }
};
</script>

<style scoped>
.operation {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    height: 100%;
}
.company-list {
    min-width: 350px;
    font-size: 13px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #dae0e6;
    padding: 15px;
    box-sizing: border-box;
}
.company-tree {
    flex: 1;
    overflow: auto;
}
.filter-text {
    margin-bottom: 6px;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    padding-right: 8px;
}

.company-edit {
    flex: 1;
    border: 1px solid #dae0e6;
    overflow-y: auto;
    box-sizing: border-box;
    height: 100%;
    margin-left: 20px;
    position: relative;
}
.company-btn {
    width: 100%;
    margin-top: 10px;
}
.company-edit-box {
    width: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -150px;
    margin-top: -15px;
}
</style>
