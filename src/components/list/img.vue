<template>
    <div class="img-component">
        <div class="img-container">
            <div class="img-item" v-for="(item,index) in props.list" :key="index">
                <div class="img-item-photo" @click="ent_showImg(item)">
                    <div class="img-content">
                         <img :src="item.src" alt="报警图片">
                    </div>
                </div>
                <div class="img-item-cnt">
                    <div class="img-item-text" v-for="child in item.txts" :key="child.name">
                        <div class="ii-text-name">{{child.name}}：</div>
                        <div class="ii-text-value">{{child.value}}</div>
                    </div>
                </div>
                <div class="img-item-opreation" v-if="props.options">
                    <div class="ii-opreation-name">{{item.evtTxt}}</div>
                    <div class="ii-opreation-value">
                        <span
                            v-for="(_item,_index) in props.options"
                            :key="_index"
                            @click="_item.evt==='remove' ? imgDelOne(item) : ''"
                        >{{_item.name}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="schCnt-pagination">
            <el-pagination
                :page-size="props.page.size||10"
                layout="prev,pager,next"
                :current-page.sync="props.page.sync||1"
                :total="props.page.total"
                @current-change="evt_pageChange"
                v-if="props.page.total?true:false"
            ></el-pagination>
        </div>
        <div class="empty-img" v-show="props.list.length===0">暂无数据</div>
    </div>
</template>

<script>
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
    props: ["props"],
    data() {
        return {};
    },
    methods: {
        ent_showImg: function(a) {
            if(a.src){
                _mm.imgAlert({ imgSrc: a.src });
            }
        },
        evt_pageChange(i) {
            this.$emit("setPageimg", i);
        },
        imgDelOne(i) {
            let _this = this;
            // console.log('imgDelone',i);
            _mm.confirmBox({
                info: "真的要删除吗？",
                callBOk: function() {
                    _this.$emit("imgDelOne", i);
                }
            });
        }
    },
    beforeDestroy(){
        window.removeEventListener('onresize', () => this.fn_videoMath())
    }
};
</script>

<style scoped>
.img-component {
    position: relative;
}
.img-component .empty-img {
    position: absolute;
    height: 40px;
    line-height: 40px;
    width: 100%;
    left: 0;
    top: calc(50% - 20px);
    text-align: center;
    color: #909399;
}

</style>
