<template>
  <div class="cars" v-loading="loading">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText" @focus="activeName = 'all'" @input="evt_inputChange"></el-input>
    <div class="cars-tabs">
      <div class="cars-tabs-tle">
        <div class="tle-cnt">
          <div @click="evt_tabChange('all')" class="card-item" :class="{active:activeName==='all'}">
            全部({{all_count}})
            <div class="tab-border" :style="{left:activeName==='all'? 0:(activeName==='online'?'100%':'200%')}"></div>
          </div>
          <div @click="evt_tabChange('online')" class="card-item" :class="{active:activeName==='online'}">
            在线({{all_count - outline_count}})
          </div>
          <div @click="evt_tabChange('outline')" class="card-item" :class="{active:activeName==='outline'}">
            离线({{outline_count}})
          </div>
        </div>
        <i class="el-icon-refresh" title="点击更新车辆实时状态" @click="evt_refresh"></i>
      </div>
      <div class="cars-tabs-cnt">
        <el-tree
          class="filter-tree"
          :data="list"
          node-key="id" 
          :default-expanded-keys="[list[0]?list[0].id:'']"
          :filter-node-method="filterNode"
          ref="all_vehicle"
          @node-click="node_click"
        ></el-tree>
      </div>
    </div>
  </div>
</template>

<script>
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  // watch: {
  //   filterText(val) {
  //     if (this.activeName !== "all") {
  //       this.activeName = "all";
  //     }
      
  //   }
  // },
  data() {
    return {
      filterText: "",
      activeName: "all",
    };
  },
  computed:{
    //  在线列表
    all_count() {
      if(this.list.length){
        return this.list[0].data.count;
      }
      {
        return 0;
      }
    },
    outline_count(){
      let count = 0;
      function getOutline_count(data) {
        for(let i=0,len=data.length;i<len;i++){
          if(data[i].type === '2'){
            if(data[i].data.state === '0'){
              count++
            }
          }else if(data[i].type === '1' && (data[i].children || []).length){
            getOutline_count(data[i].children)
          }
        }
      }
      getOutline_count(this.list)
      return count;
    }
  },
  methods: {
    
    // tab点击切换事件
    evt_tabChange(type){
      if(this.activeName === type){
        return
      }
      this.activeName = type;
      this.$refs.all_vehicle.filter(type);
      this.fn_expand();
    },
    // 输入值发生改变时
    evt_inputChange(value){
      
      if (this.activeName !== "all") {
        this.activeName = "all";
      }
      this.$refs.all_vehicle.filter(value);
    },
    fn_expand(){
      let _nodesMap = this.$refs.all_vehicle.store.nodesMap;
      let id = this.list[0].id
      for(var key in _nodesMap) {
          if(_nodesMap[key].id === id){
              // console.log(_nodesMap[key])
              _nodesMap[key].expanded = true;
              continue;
          }
          _nodesMap[key].expanded = false;
      }
    },
    //   过滤方法
    filterNode(value, data) {
      if (!value || value === 'all') {return true;}
      else if(value === 'online'){
        return data.data.state === '2' ||  data.data.state === '1'
      }else if(value === 'outline'){
        return data.data.state === '0';
      }else{
        return data.label.indexOf(value) !== -1;
      }
    },
    
    //	 刷新事件
    evt_refresh() {
      this.$emit("refresh");
    },
    // 	 节点点击
    node_click(a) {
      if (a.type !== "2") {
        return;
      }
      this.$emit("node_click", {
        vehicleId: a.id,
        vehicleLicence: a.label,
        state: a.data.state
      });
    },
    //	 清除选中
    fn_clear() {
      this.$refs.all_vehicle.setCheckedKeys([]);
      this.$refs.online_vehicle.setCheckedKeys([]);
      this.$refs.outline_vehicle.setCheckedKeys([]);
    },
     // 格式化数据
    evt_formatData(data) {
      let online_list = [],
        outline_list = [],
        all_length = 0,
        online_length = 0,
        outline_length = 0;
      function format_vehicleData(data, onlineList = [], outineList = []) {
        data.forEach(el => {
          if (el.type === "1" && (el.children || []).length) {
            onlineList.push(el);
            format_vehicleData(el.children);
          } else {
          }
        });
      }
      this.all_length = this.data[0]["data"]["count"];
    },
    
  }
};
</script>

<style scoped>
.cars {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.cars-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cars-tabs-cnt {
  flex: 1;
  overflow-y: auto;
}
.cars-tabs-tle {
  display: flex;
  flex-direction: row;
  position: relative;
  margin-bottom: 5px;
}
.cars-tabs-tle:after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #e4e7ed;
  z-index: 1;
}

.el-icon-refresh {
  width: 30px;
  height: 40px;
  line-height: 42px;
  text-align: center;
  cursor: pointer;
}
.tle-cnt {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.card-item {
  flex: 1;
  line-height: 40px;
  cursor: pointer;
  position: relative;
  text-align: center;
}
.tab-border {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
  z-index: 2;
  transition: left 0.3s;
}
.card-item.active {
  color: #409eff;
}
</style>
