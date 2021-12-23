<template>
  <div class="img-component">
    <div class="img-container">
      <div class="img-item" v-for="item in props.list" :key="item.id">
        <!-- :style="{height:item.imgSrc ? '' :'240px'}" -->
        <div class="img-item-photo" @click="ent_showImg(item)" >
          <div class="img-content">
            <img v-if="item.imgSrc" :src="item.imgSrc" alt="">
            <img class="img-play-icon" v-else src="~img/icon/play.png" alt="">
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
              :key="_item.evt+_index"
              @click="_item.evt==='remove' ? videoDelOne(item) : ''"
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
    <div class="empty-video" v-show="props.list.length===0">暂无数据</div>
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
  mounted() {},
  methods: {
    ent_showImg: function(a) {
      _mm.imgAlert({ videoSrc: a.videoSrc });
    },
    evt_pageChange(i) {
      this.$emit("setPagevideo", i);
    },
    videoDelOne(i) {
      let _this = this;
      // console.log('videoDelone',i);
      _mm.confirmBox({
        info: "真的要删除吗？",
        callBOk: function() {
          _this.$emit("videoDelOne", i);
        }
      });
    }
  }
};
</script>

<style scoped>
.video-component {
  position: relative;
}
.video-component .empty-video {
  position: absolute;
  height: 40px;
  line-height: 40px;
  width: 100%;
  left: 0;
  top: calc(50% - 20px);
  text-align: center;
  color: #909399;
}
.icd-item-img {
  background-image: none;
  background-color: #333;
}
.empty-video{
  height: 80px;
  line-height: 80px;
  text-align: center;
  color: #909399;
}
.img-play-icon{
  width: 30%;
  height: auto;
  margin: auto;
}
.img-content{
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
