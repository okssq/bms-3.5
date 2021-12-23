<template>
    <div class="tree-item" :class="{active:item_data.actived}">
        <div class="tree-item-main" :style="{paddingLeft:index*16+'px'}" :class="{expanded:expanded}">
            <div class="tree-expanded" @click="expanded = !expanded">
                <span
                    v-if="(item_data.children||[]).length"
                    class="el-tree-node__expand-icon el-icon-caret-right"
                    :class="{expanded:expanded}"
                ></span>
            </div>
            <div class="tree-label" @click="evt_itemLabel(item_data)">{{item_data.name}}</div>
        </div>
        <singleActiveTreeItem
            v-show="expanded && item_data.children && item_data.children.length"
            v-for="item in item_data.children"
            :key="item.value"
            :index="index+1"
            :item_data="item"
            @evt_setId="out_evt_itemLabel"
        />
    </div>
</template>

<script>
export default {
    name: "singleActiveTreeItem",
    props: {
        item_data: {
            type: Object,
            default: () => {
                return {
                    name: "",
                    value: "",
                    childen: [],
                    actived: true
                };
            }
        },
        index:{
            type:Number,
        }
    },
    data() {
        return {
            expanded: false
        };
    },
    methods: {
        evt_itemLabel(data) {
            this.$emit("evt_setId", data);
        },
        out_evt_itemLabel(data) {
            this.$emit("evt_setId", data);
        }
    }
};
</script>

<style  scoped>
.tree-item.active > .tree-item-main{
    background-color: rgb(240,247,255);
}
    
        
.tree-item   .tree-item-main{
    display: flex;
    flex-direction: row;
    height: 26px;
    align-items: center;
    cursor: pointer; 
    background-color:#fff;
}

.tree-item   .tree-item-main:hover{
    background-color: rgb(245, 247, 250);
}
            
.tree-expanded{
    width :12px;
    height :100%;
    margin :0 6px;
    font-size :14px;
    line-height :24px;
}
    
.tree-label
{
    flex:1;
    line-height:26px;
}

.tree-item-main.expanded{
    /* position: sticky;
    top: 0; */
}
</style>
