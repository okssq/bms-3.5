<template>
    <div class="single-company-tree">
        <el-popover 
            popper-class="popover-single-company-tree"
            placement="bottom-start" 
            width="300" 
            trigger="click" 
            v-model="show"
            :disabled="disabled"
            @show="evt_showRender"
        >
            <template v-if="list.length">
                <el-input
                    clearable
                    class="company-search-input"
                    v-model.trim="searchText"
                    placeholder="请输入查询公司名称"
                />
                <div class="company-list">
                    <ITEM 
                        v-for="(item,index) in list" 
                        :key="item.value" 
                        :index = "index"
                        :item_data="item" 
                        @evt_setId="evt_setId"
                    />
                </div>
                <div class="search-list" v-if="show && searchListShow">
                    <div 
                        class="search-list-item"
                        v-for="item in result_list"
                        :key ="item.value"
                        @click="search_item_handle(item)"
                    >
                        {{item.name}}
                    </div>
                    <div class="search-tri"></div>
                    <div v-if="result_list.length === 0 " class="empty-data">无匹配数据</div>
                </div>
            </template>
            <template v-else>
                <div class="empty-data">暂无数据</div>
            </template>
            
            <el-button  
                icon="el-icon-office-building"
                class="popover-btn single-company-tree-input" 
                slot="reference" 
                plain
                size="small"
                :disabled="disabled"
            >
                
                <div class="aa">
                    <span v-if="label">{{label}}</span>
                    <span v-else class="input-placeholder">请选择公司</span>
                    <span v-if="label && show" @click.stop="evt_clearInput"><i class="el-icon-circle-close"></i></span>
                </div>
            </el-button>
        </el-popover>
    </div>
</template>

<script>
import ITEM from "./singleCompanyTreeItem.vue";
export default {
    props: {
        list: {
            type: Array,
            default: () => {
                return [];
            }
        },
        disabled:{
            type:Boolean,
            default: false
        }
    },
    watch: {
        id(val) {
            console.log('valu',val)
        }
    },
    computed: {
        id: function() {
            let id = null;
            function getId(item) {
                if (item.actived) {
                    id = item.value;
                    return id;
                }
                if (item.children.length) {
                    for (let i = 0; i < item.children.length; i++) {
                        getId(item.children[i]);
                    }
                }
            }
            for (let i = 0; i < this.list.length; i++) {
                getId(this.list[i]);
            }
            return id;
        },
        company_list(){
            let arr = [];
            function getCompany(item) {
                arr.push({name:item.companyName,value:item.id,id:item.id});
                if (item.children.length) {
                    for (let i = 0; i < item.children.length; i++) {
                        getCompany(item.children[i]);
                    }
                }
            }
            for (let i = 0; i < this.list.length; i++) {
                getCompany(this.list[i]);
            }
            return arr;
        },
        result_list(){
            let arr = [];
            this.company_list.forEach(el => {
                if(el.name !== '' && el.name.includes(this.searchText)){
                    arr.push(el)
                }
            })
            return arr;
        }
    },
    components: {
        ITEM
    },
    watch:{
        searchText(value){
            if(value === ''){
                this.searchListShow = false;
            }
            else{
                this.searchListShow = true;

            }
        }
    },
    data() {
        return {
            show: false,
            searchListShow:false,
            label: "",
            searchText:""
        };
    },
    created() {
        this.fn_set_inputInt(this.list,this.id);
    },
    methods: {
        // 点击了公司
        evt_setId(item) {
            this.label = item.name;
            this.show = false;
            if (!item) {
                return "";
            }
            this.fn_actived(this.list, item);
            this.$emit('evt_setId',item)
        },
        fn_actived(data, item) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].value === item.value) {
                    data[i].actived = true;
                } else {
                    data[i].actived = false;
                }
                if (data[i].children.length) {
                    this.fn_actived(data[i].children,item);
                }
            }
        },
        fn_set_inputInt(data,id){
            for (let i = 0; i < data.length; i++) {
                if (data[i].value === id) {
                    data[i].actived = true;
                    this.label = data[i].name;
                    this.$emit('set_inputInt',data[i]);

                    return true
                } else {
                    data[i].actived = false;
                }
                if (data[i].children.length) {
                    this.fn_set_inputInt(data[i].children,id);
                }
            }
        },
        // 点击xxx事件
        evt_clearInput(){
            this.fn_clear(this.list);
            this.searchText = '';
            this.label = '';
            this.$emit('evt_setId',{id:''});
        },
        // 清除选中
        fn_clear(data){
            for (let i = 0; i < data.length; i++) {
                data[i].actived = false;
                if (data[i].children.length) {
                    this.fn_clear(data[i].children);
                }
            }
        },
        // 搜索结果单条选中
        search_item_handle(item){
            this.searchText = '';
            this.evt_setId(item)
        },
        // popover显示时事件
        evt_showRender(){
            this.searchText = '';
        },
    }
};
</script>

<style scoped>
.single-company-tree{
    width: 100%;
}
.single-company-tree .el-button{
    width: 100%;
    text-align: left;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}


.single-company-tree .popover-single-company-tree{
    height: 240px;
    overflow-y: auto;
}
        
.xz-placeHolder{
    color:rgb(192,196,204);
}
        
.empty-data{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ccc;
}
.company-search-input{
    margin-bottom: 8px;
}
</style>

