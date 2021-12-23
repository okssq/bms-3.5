<template>
    <div id="app">
        <Side ref="nav" :fullNav="fullNav" />
        <Header :fullNav="fullNav" @evt_sideToggle="evt_sideToggle" />
        <main :class="{sMain:!fullNav}" :style="{'z-index':(zIndexTop==='nav'?100:101)}">
            <div class="test-main">
                <!-- <curmb></curmb> -->
                <div class="cnt" :class="{transparent:nowRouter === '/home'}">
                    <router-view></router-view>
                </div>
            </div>
        </main>
        <warn v-if="warnSocket.is" />
        <loadCarData />
    </div>
</template>

<script>
    import Header from '@/page/layout/header.vue';
    import Side from '@/page/layout/side.vue';
    import warn from '@/page/layout/warn.vue';
    import LoadCarData from '@/store/car/load.vue';
    export default{
        computed:{
            //层级关系
            zIndexTop(){
                return this.$store.state.zIndexTop;
            },
            //报警弹窗信息
            warnSocket(){
                return this.$store.state.warnSocket;
            },
            fullNav(){
                return this.$store.state.fullNav;
            },
            nowRouter(){
                return '/'+this.$route.meta.nav;
            },
        },
        data(){
            return {
                dataAlert:{
                    is:false,
                    vehicleId:"",
                    title:"",
                    imgUrl:"",
                    time:"",
                    address:"",
                    warnName:"",
                    uploadTxt:""
                }
            };
        },
        created(){
            
        },
        components:{
            'Header':Header,
            'Side':Side,
            'warn':warn,
            'loadCarData':LoadCarData,
        },
        methods:{
           

            // 切换大小按钮回调
            evt_sideToggle(data){
                // console.log('data',data)
                if(!data){
                    this.$refs.nav.fn_expand();
                }
                else{
                    this.$refs.nav.fn_showClose();
                }
            }
        },
    }
</script>

<style scoped>
    main{
        position: fixed;z-index: 100;top: 49px;bottom: 0px;right: 0;
        width: calc(100% - 220px);left: 220px;
        box-sizing: border-box;background-color:rgb(240,242,245);
        overflow: auto;
        transition: all 0.4s ease-in-out;
        padding: 10px;
    }
    .sMain{width: calc(100% - 50px);left: 50px;}
    .cnt{background-color: #fff;height: 100%;}
    .cnt.transparent{
        background-color: transparent;
    }
   
    .alarmAlert-ctrl{position:fixed;bottom:0px;left:0px;z-index:21011;background:#f7f3e6;width:100%;height:30px;line-height:30px;text-align:right;}
    .alarmAlert-ctrl-span{margin-right:20px;}
    .test-main{
        height: 100%;
        min-width: 900px;
        min-height: 600px;
    }
</style>
