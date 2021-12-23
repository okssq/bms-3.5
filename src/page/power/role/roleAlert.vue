<template>
    <div class="role-alert">
        <div class="role-al-bg"></div>
        <div class="role-al-main  role-alert-power">
            <div class="tle">
                <span>编辑角色</span>
                <span @click="evt_cancel"> <i class="el-icon-close"></i></span>
            </div>
            <div class="cnt">
                <div class="cnt-item">
                    <label class="require" for>角色名称：</label>
                    <el-input v-model="editData.roleName" placeholder="请输入内容"></el-input>
                </div>
                <div class="cnt-item">
                    <label for>备注：</label>
                    <el-input
                        type="textarea"
                        :rows="3"
                        placeholder="请输入内容"
                        v-model="editData.remark"
                    ></el-input>
                </div>
                <div class="btns">
                    <div class="dbtn" @click="evt_cancel">取消</div>
                    <div class="dbtn dbtn-blue" @click="evt_sure">确定</div>
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
        watch:{
            propsRef:{
                handler(newName, oldName) {
                    this.editData.remark = newName.data.remark;
                    this.editData.roleName = newName.data.roleName;
                },
                immediate: true,
                deep: true
            }
        },
        data() {
            return {
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
            };
        },
        methods: {

            ajax_upadteOrAdd(data, type) {
                let _this = this;
                _mm.request({
                    url: "/role/insert_or_update.json",
                    data: data
                }).then(
                    res => {
                        
                        this.$emit('refresh');
                    }
                );
            },

            // 编辑，添加弹框
            evt_cancel() {
                this.$store.commit("update_zIndexTop", "nav");
                this.editData.roleName = '';
                this.editData.remark = '';
                this.propsRef.is = false;
            },
            evt_sure() {
                this.ajax_upadteOrAdd({
                    id:this.propsRef.data.id,
                    roleName: this.editData.roleName,
                    remark: this.editData.remark
                });
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
    max-height:300px;
}
.role-al-btns{
    display: flex;padding: 20px;justify-content: flex-end;align-items: center;
    border-top: 1px solid #dae0e6;
}
.role-al-power{
    display: flex;flex-direction: column;
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
    color: #303133;
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
    padding: 15px 25px 0;
}
.role-al-main .tle > span:first-of-type {
    font-size: 18px;
}
.role-al-main .tle > span:last-of-type {
    font-size: 18px;
    cursor: pointer;
}
.role-al-main .cnt {
    padding: 20px 25px 10px;
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
.cnt-item label{
    width: 100px;
}
.cnt-item > div{
    flex: 1;
}
.btns .dbtn:last-of-type{
    margin-right: 0;
}
</style>
