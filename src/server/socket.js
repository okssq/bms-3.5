/**
    webSockdet
    var ws = new webSocket({
        lockReconnect 			:false(默认值),										    //避免重复连接
        wsUrl					:'ws://47.100.245.242:20046/gps/real_time'(默认值), 	//服务器地址
        sendData 				:{name:"name"},										    //发送数据
        fn_callback 			:function(msg){}									    //回调			
    });

**/
(function(w){
    var ws_obj = function (config){
        var _this = this;
        var _config = {
            lockReconnect 			:false, 									    //避免重复连接
            wsUrl 					:'ws://dsm.xiaozhenkj.com',		//服务器地址
            sendData 				:'webSocket_test',								//发送数据
            fn_callback 			:function(msg){								    //回调	
                console.log(msg)
            }
        };

        if(!config && typeof config !== "object")config = _config;

        for(var k in _config){
            if(!config.hasOwnProperty(k)){
                config[k] = _config[k];
            }
        }
        //console.log("ws",config)
        _this.ws;//websocket实例
        _this.lockReconnect 	= config.lockReconnect;		                //避免重复连接
        _this.wsUrl		 		= config.wsUrl;				                //服务器地址
        _this.sendData 			= JSON.stringify(config.sendData);			//发送数据
        _this.fn_callback 		= config.fn_callback;		                //回调函数
        
        function createWebSocket(url) {
            try {
                _this.ws = new WebSocket(url);
                initEventHandle();
            } catch (e) {
                reconnect(url);
            }     
        }

        function initEventHandle() {
            _this.ws.onclose = function (e) {
                //reconnect(_this.wsUrl);
                // console.log('WebSocket发生错误关闭: ' + e.code)
                //console.log(e)
            };
            _this.ws.onerror = function (e) {
                reconnect(_this.wsUrl);
                // console.log('WebSocket发生错误: ' + e.code)
                //console.log(e)
            };
            _this.ws.onopen = function () {
                //心跳检测重置
                heartCheck.reset().start();
            };
            _this.ws.onmessage = function (event) {
                //如果获取到消息，心跳检测重置
                //拿到任何消息都说明当前连接是正常的
                //console.log("收到socket消息",event);
                _this.fn_callback(event);
                heartCheck.reset().start();
            }
        }

        function reconnect(url) {
            if(_this.lockReconnect) return;
            _this.lockReconnect = true;
            //没连接上会一直重连，设置延迟避免请求过多
            setTimeout(function () {
                createWebSocket(url);
                _this.lockReconnect = false;
            }, 2000);
        }

        //心跳检测
        var heartCheck = {
            timeout: 10000,//60秒
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: function(){
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function(){
                var self = this;
                this.timeoutObj = setTimeout(function(){
                    //这里发送一个心跳，后端收到后，返回一个心跳消息，
                    //onmessage拿到返回的心跳就说明连接正常
                    _this.send(_this.sendData);
                    self.serverTimeoutObj = setTimeout(function(){//如果超过一定时间还没重置，说明后端主动断开了
                        //_this.ws.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                    }, self.timeout)
                }, this.timeout)
            }
        }

        createWebSocket(_this.wsUrl);
    }

    ws_obj.prototype = {
        send:function(msg){
            this.ws.send(msg)
        },
        close:function(){
            this.ws.close();
        }
    }

    w.webSocket = ws_obj;
})(window);