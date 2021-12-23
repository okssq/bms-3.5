<template>
    <el-dialog
        title="提示"
        :visible.sync="show"
        width="340px"
        :fullscreen="false"
        :modal-append-to-body="false"
        :append-to-body="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
    >
        <div class="tip" @click="evt_sure">
            <img :src="flash_src" alt="">
            <div class="openFlash_text">点击开启flash</div>
        </div>
        <!-- <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="evt_sure">确 定</el-button>
        </span> -->
    </el-dialog>
</template>

<script>
export default {
    data(){
        return {
            show:true,
            flash_src:require('img/icon/flash.png')
        }
    },
    created(){
        if (this.evt_checkFlash()) {
            this.show = false;
        }
    },
    methods:{
        // 开启flash功能
        evt_sure(){
            location.href = "//www.adobe.com/go/getflashplayer";
        },
        //判断是否开启FLASH
        evt_checkFlash() {
            let hasFlash = 0; //是否安装了flash
            if (document.all) {
                let swf = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                if (swf) {
                    hasFlash = 1;
                }
            } else {
                if (navigator.plugins && navigator.plugins.length > 0) {
                    let swf = navigator.plugins["Shockwave Flash"];
                    if (swf) {
                        hasFlash = 1;
                    }
                }
            }
            return hasFlash;
        },
    }
}
</script>

<style scoped>
    .tip{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color:#000;
    }
    .tip img{
        width:50px;
    }
    .openFlash_text{
        margin: 10px 0 30px;
        color:#606266;
        font-size: 14px;
    }
    .openFlash_text:hover{
        color:#409EFF
    }
</style>
