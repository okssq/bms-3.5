import Vuex from 'vuex';


export default () => {
    return new Vuex.Store({
        state:{
            zIndexTop:'nav',//层级关系
            //websocket - 报警
            warnSocket:{
                is:false,
                isAuto:false,
                isRed:false,
                isAudio:false,
                data:""
            },
            //头部
            fullNav:true,
            //所有车辆数据
            dataCars:{
                count:{
                    all:0,
                    online:0,
                    outline:0
                },
                items:[],//无限级
                lists:[],//一级列表
                lists_is:false,//一级列表是否准备好
                gps:[],
                list_one:[],//公用车辆列表（只有一级）
                isUpdata:false,//车辆数据是否更新
            },
            //所有公司数据
            dataCompany:{
                items:[],//无限级
                list_one:[],//一级列表
            },
            //车辆定位当前选中的车辆
            gpsChecked:{vehicleId:""},
            fiveMinAlert:{
                start: false,
                show : false,
            },
            isFlash:false
        },
        mutations:{
            update_fullNav(state,data){
                state.fullNav = data;
            },
            // 传main ，vue组件内弹窗全部显示，层级较高
            // 传nav，取反
            update_zIndexTop(state,data){
                state.zIndexTop=data;
            },
            // 传false阻止启动定时器并且隐藏弹窗
            // 传true阻止启动定时器并且显示弹窗
            update_Toggle_fiveMin(state,data){
                clearTimeout(state.fiveMinAlert.start);
                state.fiveMinAlert.start = 0;
                if(data){state.zIndexTop = 'main'}
                else{state.zIndexTop = 'nav'}
                state.fiveMinAlert.show = data;
            },
            update_warnSocket(state,data){
                state.warnSocket = {...state.warnSocket,...data};
            },

            // 更新车辆定位当前选中车辆的信息
            updata_gpsChecked(state,data){
                state.gpsChecked = {...state.gpsChecked,...data}
            },
            // 更新是否开启flash
            update_isFlash(state,data){
                state.isFlash = data;
            },
            update_websocket(state,data){
                console.log('触发了,',data);
                state.warnSocket = {...state.warnSocket,...data}
                console.log('现在,',state.warnSocket);

            }
        },
        actions:{
            // 定时器开始
            set_FiveMin_start(context){
                // console.log('context',context);
                context.state.fiveMinAlert.start = setTimeout(() => {
                    context.commit('update_Toggle_fiveMin',true);
                }, 300000);
            },
        }
    });
}
