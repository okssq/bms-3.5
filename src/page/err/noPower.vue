<template>
    <div>
        <div class="noPower zoom">
            <div class="noPower-img"><img src="~assets/img/err/noPower.png" alt=""></div>
            <div class="noPower-box">
                <div class="noPower-box-title">您没有权限访问请与管理员联系！</div>
                <div class="noPower-box-txt"><router-link tag="a" to="/login">切换用户</router-link></div>
            </div>
        </div>
        
    </div>
    
</template>

<script>
import Server from 'service/mm.jsx';
const _mm = new Server();

export default{
    data(){
        return {
            
        }
    },
    mounted(){
        

        
    },
    methods:{
        
    }
}
</script>

<style scoped>
    .noPower{position:absolute;top:30%;left:50%;width:500px;height:200px;margin:-100px 0 0 -250px;}
    .noPower-img{width:100px;height:100px;float:left;}
    .noPower-img img{width:100%;}
    .noPower-box{width:300px;height:200px;float:left;margin:20px 0 0 20px;}
    .noPower-box-title{font-size:16px;margin-bottom:10px;}
    a{color:blue;}
    
</style>
