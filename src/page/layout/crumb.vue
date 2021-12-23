<template>
    <div class="xz-crumb" v-if="lists.length">
        <div 
            v-for="(item,index) in  lists"
            :key ="index"
            class="xz-curbm-item"
            :class="{click:item.path}"
            @click="router_push(item)"
        >   {{item.name}}
            <template v-if="index === lists.length - 1">
            </template>
            <template v-else><i class="el-breadcrumb__separator el-icon-arrow-right"></i></template>
        </div>
    </div>
</template>
<script>
    export default {
        computed:{
            lists(){
                return this.$route.meta.crumb || [];
            },
        },
        methods:{
            router_push(item){
                if(item.path){
                    this.$router.push({path:item.path});
                }
            }
        }
    }
</script>
<style scoped>
    
    .xz-crumb{
        display: flex;
        flex-direction: row;
        align-items: center;
        /* min-width: 270px; */
    }
    .xz-curbm-item{
        color: #303133;
        font-weight: bold;
        position: relative;
    }
    .xz-crumb > .xz-curbm-item:last-of-type{
        font-weight: normal;
        color: #606266;
    }
    .xz-curbm-item.click:hover{
        color: #409EFF;
        cursor: pointer;
    }
</style>


