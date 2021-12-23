import { 
    Message,
    MessageBox
} from 'element-ui';
var timer = [];
class MUtil{
    // ajax请求
    request(param){
        let _this = this;
        let url_porxy = '/sicp';
        let host = window.location.host;
        return new Promise((resolve,reject)=>{
            $.ajax({
                type        :param.type                         ||  'post',
                url         :param.url                          ?   url_porxy + param.url : '',
                dataType    :param.dataType                     ||  'json',
                data        :param.data                         ||  null,
                async       :param.async                        ||  true,
                contentType :param.contentType === '上传图片'    ?   false : (param.contentType ? param.contentType : 'application/x-www-form-urlencoded'),
                processData :param.processData === '上传图片'    ?   false : true,
                success(res){
                    if(res.code === 2000){
                        typeof resolve === 'function' &&  resolve(res.result,res.message);
                    }else if(res.code === 3001){
                        let href = window.location.href;
                        let pathname = href.substring(href.indexOf("#")+1);
                        window.location.href = '/#/login?redirect=' + encodeURIComponent(pathname);
                        window.location.reload();
                    }else{
                        reject(res);
                        Message.error(res.msg);
                    }
                },
                error(err){
                    console.log(err);
                    reject(err)
                }
            })
        })
    }

    hostUrl(type){
        type = type?"/"+type:"";
        let host = window.location.host;
        let protocol = window.location.protocol;
        if(host.indexOf("localhost") > -1 || host.indexOf("192.168") > -1){
            // protocol = "https:";
            // host = "dsm.xiaozhenkj.com";
            protocol = "https:";
            host = "test.xiaozhenkj.cn";
        }

        host = protocol+"//"+host;
        return host+type;
    }

    // ajax请求-上传文件
    request_file(param){
        let _this = this;
        let url_porxy = '/sicp';
        let host = window.location.host;
        // if(host === "47.100.14.9"){
        //     url_porxy = "http://47.100.14.9:8082/sicp";
        // }
        return new Promise((resolve,reject)=>{
            $.ajaxFileUpload({
                fileElementId: param.id,                                            //需要上传的文件域的ID，即<input type = "file">的ID。
                url          : param.url          ?   url_porxy + param.url  : '',  //后台方法的路径
                type         : param.type         || 'post',                        //当要提交自定义参数时，这个参数要设置成post
                dataType     : param.dataType     || 'json',                        //服务器返回的数据类型。可以为xml,script,json,html。如果不填写，jQuery会自动判断。
                secureuri    : false,                                               //是否启用安全提交，默认为false。
                async        : param.async        ||  true,
                success: function(res) {
                    if(res.code === 2000){ 
                        typeof resolve === 'function' &&  resolve(res.result,res.message);
                    }else{
                        reject(res);
                        Message.error(res.msg);
                    }
                },
                error: function(data, status, e) {  //提交失败自动执行的处理函数。
                    console.error("cccccccc",e);
                }
            });
        })
    }

    // 跳转登录
    ToLogin(){
        let href = window.location.href;
        let pathname = href.substring(href.indexOf("#")+1);
        // console.log(pathname)
        window.location.href = '/#/login?redirect=' + encodeURIComponent(pathname);
    }

    // 获取uri参数
    getUrlParam(name){
        let queryString = window.location.search.split('?')[1]||'';
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let result = queryString.match(reg);
        return result?decodeURIComponent(result[2]):null;
    }

    // 提示信息
    msg(msg){
        Message(msg||"提示信息");
    }

    // 提示信息-错误
    msgErr(msg){
        Message.error(msg||"提示信息");
    }

    // 提示信息-成功
    msgSss(msg){
        Message.success(msg||"提示信息");
    }

    // 弹框提示
    msgBox(msg){
        MessageBox(msg||'提示信息');
    }

    // 弹框确认提示
    /*
        _mm.confirmBox({
            info            : "真的要删除吗",
            title           : "title",
            btnOkTxt        : "确定",
            btnCancelTxt    : "取消",
            callBOk         : ()=>{},
            callBCancel     : ()=>{}
        })
    */
    confirmBox(obj){
        let callBackOk = obj.callBOk?obj.callBOk:()=>{};
        let callBackCancel = obj.callBCancel?obj.callBCancel:()=>{};
        MessageBox.confirm(
            obj.info    || '确认信息',
            obj.title   || '操作确认',
            {
                confirmButtonText   :obj.btnOkTxt       || '确定',
                cancelButtonText    :obj.btnCancelTxt   || '取消',
                type                :obj.type           || 'warning'
            }
        ).then(callBackOk).catch(callBackCancel);
    }

    // 设置本地存储
    setStorage(name,data){
        let dataType = typeof data;

        // json对象
        if(dataType === 'object'){
            window.localStorage.setItem(name,JSON.stringify(data));
        }
        // 基础类型
        else if(['number','string','boolean'].indexOf(dataType) >= 0){
            window.localStorage.setItem(name, data);
        }
        // 其他不支持的类型
        else{
            alert('该类型不能用于本地存储');
        }
    }

    // 取出存储内容
    getStorage(name){
        let data = window.localStorage.getItem(name);
        if(data){
            return JSON.parse(data);
        }
        else{
            return '';
        }
    }

    // 删除本地存储
    removeStorage(name){
        window.sessionStorage.removeItem(name);
    }

    //图片弹框
    imgAlert(config){
        // console.log('config',config)
        if(!config.imgSrc&&!config.videoSrc){
            Message('此条记录没有视频或者图片！');
            return;
        }
        
        let html='';
        //仅图片
        if(config.imgSrc&&!config.videoSrc){
            html = `
                <div class="imgalert">
                    <div class="cnt">
                        <div class="imgcnt">
                            <div class="imgcnt-img"><img src="`+config.imgSrc+`" alt=""></div>
                            <div class="imgxxx"><i class="el-icon-error"></i></div>
                        </div>
                    </div>
                </div>
            `;
            $("body").append(html);
        }
        //仅视频
        else if(!config.imgSrc&&config.videoSrc){
            html = `
                <div class="imgalert">
                    <div class="cnt">
                        <div class="videocnt">
                            <div class="videocnt-video"><video id="video_alarm" src="`+config.videoSrc+`" type="video/mp4" controls="controls"></video></div>
                            <div class="videoxxx"><i class="el-icon-error"></i></div>
                        </div>
                    </div>
                </div>
            `;
            $("body").append(html);
        }
        //图片和视频
        else{
            html = `
                <div class="imgalert">
                    <div class="cnt">
                        <div class="imgcnt">
                            <div class="imgcnt-img"><img src="`+config.imgSrc+`" alt=""></div>
                            <div class="imgxxx"><i class="el-icon-error"></i></div>
                        </div>
                        <div class="videocnt">
                            <div class="videocnt-video"><video id="video_alarm" src="`+config.videoSrc+`" type="video/mp4" controls="controls"></video></div>
                            <div class="videoxxx"><i class="el-icon-error"></i></div>
                        </div>
                        <div class="btngroup">
                            <button id="alarm_photo" class="dbtn active">照片</button><button id="alarm_video" class="dbtn">视频</button>
                        </div>
                    </div>
                </div>
            `;
            $("body").append(html);
            $('.videocnt').hide();
            //点击了照片按钮
            $(document).off('click','#alarm_photo').on('click','#alarm_photo',function(){
                $('#video_alarm').trigger('pause');
                $('.videocnt').hide();$('.imgcnt').show();
                $(this).removeClass('active').addClass('active');
                $('#alarm_video').removeClass('active');
            })
            //点击了视频按钮
            $(document).off('click','#alarm_video').on('click','#alarm_video',function(){
                $('.videocnt').show();$('.imgcnt').hide();
                $(this).removeClass('active').addClass('active');
                $('#alarm_photo').removeClass('active');
            })
        }
        

        

        // 关闭按钮事件
        $(document).off("click",".imgxxx").on("click",".imgxxx",function(){
            $(".imgalert").remove();
        });
        $(document).off("click",".videoxxx").on("click",".videoxxx",function(){
            $(".imgalert").remove();
        });

    }

    //格式化数组
    format_arr(items){
        items.forEach(function(el,index){
            for(var k in el){
                if(!el[k])el[k]="--";
            }
        });
        return items;
    }

    //数组对象深拷贝
    objDeepCopy(source){
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
            sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
        }
        return sourceCopy;
    }

    //日期时间插件
    /*
        _mm.getDate({
            type:"today",
            num:1
        })
    */
    getDate(config){
        let _config = {
            type:"",
            num:0,
            value:""
        };

        let _date = new Date();
        let _result = _date;

        if(!config && typeof config !== "object"){
			config = _config;
		}

		for(var k in _config){
			if(!config.hasOwnProperty(k)){
				config[k] = _config[k];
			}
        }

        let _type = config.type;
        if(_type === "today"){
            let yyyy = _date.getFullYear();
            let MM = _date.getMonth();
            let day = _date.getDate();
            if(MM < 10) MM="0"+MM;
            _result = new Date(yyyy, MM , day);
        }
        else if(_type === "todayLast"){
            _result = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
        }
        else if(_type === "easyToday"){
            return GetDateStr(0);
        }
        else if(_type ==="yesterday"){
            return GetDateStr(-1);
        }
        else if(_type ==="yesterdayFirst_seven"){
            _result = new Date(new Date(new Date().toLocaleDateString()).getTime()-24*7*60*60*1000);
        }
        else if(_type ==="yesterdayFirst_all"){
            _result = new Date(new Date(new Date().toLocaleDateString()).getTime()-24*60*60*1000);
        }
        else if(_type ==="yesterdayLast_all"){
            _result = new Date(new Date(new Date().toLocaleDateString()).getTime()-1);
        }

        let _num = config.num;
        if(_num !== 0){
            let t = _date.getTime();
            t = t + _num*1000*60*60*24;
            _result = new Date(t);
        }

        let _value = config.value;
        if(_value){
            let t = _value.getTime();
            t = t + _num*1000*60*60*24;
            _result = new Date(t);
        }

        function format(t){
            
            let yyyy = t.getFullYear();
            let MM = ( (t.getMonth()+1>=0 && t.getMonth()+1< 10) ? ('0'+(t.getMonth()+1)) : (t.getMonth()+1) );
            let day =( (t.getDate()>=0 && t.getDate()< 10) ? '0'+t.getDate() : t.getDate() );
            let hh = ( (t.getHours()>=0 && t.getHours()< 10) ? '0'+t.getHours() : t.getHours() );
            let mm = ( (t.getMinutes()>=0 && t.getMinutes()< 10) ? '0'+t.getMinutes() : t.getMinutes() );
            let ss = ( (t.getSeconds()>=0 && t.getSeconds()< 10) ? '0'+t.getSeconds() : t.getSeconds() );
            return yyyy + "-" + MM + "-" +day + " " + hh + ":" + mm + ":" + ss;
        }
        //根据今天获取近几天
        function GetDateStr(AddDayCount) {
            var dd = new Date();
            dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
            var y = dd.getFullYear();
            var m = dd.getMonth()+1;//获取当前月份的日期
            var d = dd.getDate();
            return y+"-"+m+"-"+d;
        } 

        return format(_result);
    }

    setTimer(){
        return timer
    }

    clearTiemr(){
        // console.log(timer)
    }  
     
}

export default MUtil;
