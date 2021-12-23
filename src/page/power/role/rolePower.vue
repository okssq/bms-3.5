<template>
    <div class="role-alert" v-loading="loading">
        <div class="role-al-bg"></div>
        <div class="role-al-main role-al-power">
            <div class="tle">
                <span>角色授权</span>
                <span @click="evt_powerXXX"> <i class="el-icon-close"></i></span>
            </div>
            <div class="role-al-tree">
                <el-tree
                    :data="lists"
                    show-checkbox
                    node-key="id"
                    ref="tree"
                    highlight-current
                    :props="defaultProps"
                ></el-tree>
            </div>
            <div class="role-al-btns">
                <div class="dbtn" @click="evt_powerXXX">取消</div>
                <div class="dbtn dbtn-blue" @click="evt_powerSure">确定</div>
            </div>
        </div>
    </div>
</template>
<script>
    import RoleAlert from './roleAlert.vue';   

    import Server from "service/mm.jsx";
    const _mm = new Server();
    export default {
        props:['propsRef'],
        data() {
            return {
                loading: false,
                lists: [],
                defaultProps: {
                    children: "children",
                    label: "label"
                },
                currentId:0
            };
        },
        created() {
            this.currentId = this.propsRef.data.id;
            this.ajax_treeList({
                roleId:this.propsRef.data.id
            });
        },
        methods: {
            // 获取树形列表
            ajax_treeList(set) {
                let _this = this;
                _mm.request({
                    url: "/menu/role_menu_level.json",
                    data:set
                }).then(
                    res => {
                        console.log("res",res)
                        _this.lists = res.menus;
                        _this.$refs.tree.setCheckedKeys(res.checks);
                    },
                    function(err) {
                        _this.loading = false;
                    }
                );
            },
            

            ajax_update_roleMenu(data){
                let _this = this;
                this.loading = true;
                _mm.request({
                    url: "/role/authorization_role.json",
                    data: data
                }).then(
                    res => {
                        _mm.msgSss('设置成功');
                    },
                    function(err) {
                        _this.loading = false;
                    }
                );
            },
            // 授权弹框
            evt_powerXXX() {
                this.$store.commit("update_zIndexTop", "nav");
                this.propsRef.is = false;
            },
            evt_powerSure() {
                let _this = this;
                let obj = {};
                obj.roleId  = this.currentId;
                let _checks = this.$refs.tree.getCheckedKeys();
                
                var _parentArr = this.$refs.tree.getHalfCheckedKeys();
                if(_parentArr.length > 0){
                    _parentArr.forEach(el=>{
                        _checks.push(el);
                    });
                }
                
                obj.menuIds = JSON.stringify(_checks);
                obj.openIds = JSON.stringify(_parentArr)
                this.ajax_update_roleMenu(obj);
                this.evt_powerXXX();
            },

            
            //对象数组深拷贝
            objDeepCopy(data){
                let dataCopy = data instanceof Array ? [] : {};
                for(let item in data){
                    dataCopy[item] = typeof data[item] === 'object' ? this.objDeepCopy(data[item]) : data[item];
                }
                return dataCopy;
            },
        }
        
    };
</script>
<style scoped>

.role-al-tree{
    flex: 1;
    padding: 0 15px 15px;
    overflow-y: auto;
    min-width: 440px;
    height:240px;
    box-sizing: border-box;
    color: #303133;
}
.role-al-tree .el-tree{
    height: 100%;
}
.role-al-btns{
    display: flex;padding: 15px 20px;justify-content: flex-end;align-items: center;
    border-top: 1px solid #dae0e6;
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
}
.role-al-main .tle > span:first-of-type {
    font-size: 18px;
}
.role-al-main .tle > span:last-of-type {
    font-size: 18px;
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
