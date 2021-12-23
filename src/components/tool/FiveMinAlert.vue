<template>
    <div class="role-alert" v-if="show">
        <div class="role-al-bg"></div>
        <div class="role-al-main role-al-power">
            <div class="tle">
                <span>系统通知</span>
                <span @click="evt_powerXXX">X</span>
            </div>
            <div class="cnt">
                系统检测到您观看视频时间过长，<br>请确认是否继续观看视频?
            </div>
            <div class="role-al-btns">
                <el-button type="danger" @click="evt_powerXXX">继续观看</el-button>
                <el-button @click="evt_powerSure" type="primary">
                    关闭视频
                    <span v-if="btnNum">（{{btnNum}}）</span>
                </el-button>
            </div>
        </div>
    </div>
</template>
<script>
import Server from "service/mm.jsx";
const _mm = new Server();
export default {
    computed: {
        show() {
            return this.$store.state.fiveMinAlert.show;
        }
    },
    data() {
        return {
            btnNum: 0,
            btnInterval: ""
        };
    },
    watch: {
        show(value) {
            if (value) {
                let _this = this;
                this.btnNum = 10;
                this.btnInterval = setInterval(function() {
                    _this.btnNum--;
                    if (!_this.btnNum) {
                        clearInterval(_this.btnInterval);
                        _this.btnInterval = "";
                        _this.evt_powerSure();
                    }
                }, 1000);
                // console.log("当前value是true");
            } else {
                clearInterval(this.btnInterval);
                this.btnInterval = "";
                this.btnNum = 0;
                
                // console.log("当前value是false");
            }
        }
    },
    created() {},
    methods: {
        evt_powerXXX() {
            this.$store.commit("update_zIndexTop", "nav");
            this.$store.commit("update_Toggle_fiveMin", false);
            this.$store.dispatch("set_FiveMin_start");
        },
        evt_powerSure() {
            this.$store.commit("update_zIndexTop", "nav");
            this.$store.commit("update_Toggle_fiveMin", false);
            this.$emit("evt_close_move");
        }
    }
};
</script>
<style scoped>
.role-al-tree {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    min-width: 500px;
}
.role-al-btns {
    display: flex;
    padding: 20px;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid #ccc;
}
.role-al-power {
    display: flex;
    flex-direction: column;
}
.role-alert-power {
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
    width: 320px;
}

.role-al-main .tle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #ccc;
}
.role-al-main .tle > span:first-of-type {
    font-size: 18px;
}
.role-al-main .tle > span:last-of-type {
    font-size: 18px;
    cursor: pointer;
}

.role-al-main .cnt{
    padding: 15px 20px;
    line-height: 1.75;font-size: 15px;
}
.role-al-main .btns {
    display: flex;
    justify-content: flex-end;
}

</style>
