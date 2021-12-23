import Vue from 'vue';
import Vuex from 'vuex';

// 饿了么
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from "element-ui";
Vue.use(ElementUI, { size: "small" });
// vue路由
import VueRouter from 'vue-router';
import router from './server/router.js';

import createStore from './store/store'

Vue.use(VueRouter);
Vue.use(Vuex);
const store = createStore();

import './server/socket.js';

import 'v-charts/lib/style.css'
import VeHistogram from 'v-charts/lib/histogram.common.js' //柱状图
import VePie from 'v-charts/lib/pie.common.js'        //柱状图
import VeBar from 'v-charts/lib/bar.common.js'        //圆饼图
import VeLine from 'v-charts/lib/line.common.js'        //折线图

Vue.component(VeHistogram.name, VeHistogram);
Vue.component(VePie.name, VePie);
Vue.component(VeBar.name, VeBar);
Vue.component(VeLine.name, VeLine);


import Server from 'service/mm.jsx';
const _mm = new Server();
router.beforeEach((to,from,next) => {
    if(to.fullPath.indexOf("login") === -1){
        _mm.request({
            url:'/admin/login_status.json'
        }).then(function(res){
            next();
        });
    }else{
        next();
    }
});

// 全局样式
import '@/assets/css/common.css';

new Vue({
    el: '#app',
    router,
    store,
    render: h => h("router-view"),
});
