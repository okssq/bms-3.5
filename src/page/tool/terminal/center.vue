<template>
<div class="center">
    <div class="ct-tle">
        <div class="name">部标终端ID：</div>
        <el-input placeholder="请输入内容" v-model.trim="terminalId808" maxlength="7" />
        <div class="name name1">车牌颜色：</div>
        <el-select v-model="vehicleColor" placeholder="请选择">
            <el-option label="蓝牌" value="1" ></el-option>
            <el-option label="黄牌" value="2" ></el-option>
            <el-option label="黑牌" value="3" ></el-option>
            <el-option label="白牌" value="4" ></el-option>
            <el-option label="其他" value="9" ></el-option>
            <el-option label="未知" value="0" ></el-option>
        </el-select>
    </div>
    <div class="ct-main">
        <div class="ct-main-item">
            <div class="title">第一中心</div>
            <div class="ct-row">
                <div class="ct-main-name">是否连接808</div>
                <el-select v-model="isLink808" placeholder="请选择">
                    <el-option label="是" value="1"></el-option>
                    <el-option label="否" value="0"></el-option>
                </el-select>
            </div>
            <div class="ct-row">
                <div class="ct-main-name">808IP</div>
                <el-input placeholder="请输入内容" v-model="host808"  />
            </div>
            <div class="ct-row">
                <div class="ct-main-name">808端口</div>
                <el-input placeholder="请输入内容" v-model="port808"  />
            </div>
            <div class="ct-row">
                <div class="ct-main-name">SIM卡号</div>
                <el-input placeholder="请输入内容" v-model="phoneNumber"  />
            </div>
        </div>
        <div class="ct-main-item">
            <div class="title">第二中心</div>
            <div class="ct-row">
                <div class="ct-main-name">是否连接808</div>
                <el-select v-model="isLink8082" placeholder="请选择">
                    <el-option label="是" value="1"></el-option>
                    <el-option label="否" value="0"></el-option>
                </el-select>
            </div>
            <div class="ct-row">
                <div class="ct-main-name">808IP</div>
                <el-input placeholder="请输入内容" v-model="host8082"  />
            </div>
            <div class="ct-row">
                <div class="ct-main-name">808端口</div>
                <el-input placeholder="请输入内容" v-model="port8082"  />
            </div>
            <div class="ct-row">
                <div class="ct-main-name">SIM卡号</div>
                <el-input placeholder="请输入内容" v-model="phoneNumber2"  />
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Server from 'service/mm.jsx';
const _mm = new Server();
export default {
    data(){
        return {
            terminalId:'',
            terminalId808:'',
            vehicleColor:'',
            host808: "",
            host8082: "",
            isLink808: "",
            isLink8082: "",
            phoneNumber: "",
            phoneNumber2: "",
            port808: "",
            port8082: "",
        }
    },
    methods:{
        // 获取信息。。。
        ajax_getInfo(data){
            let _this = this ;
            _mm.request({ 
                url:'/terminal/terminal_link.json', 
                data:{terminalId:data.terminalId}
            }).then((res)=>{
                this.fn_center(res);
            },(err) =>{

            })
        },
        fn_center(res){
            let {terminal, terminalLinkInfo = false} = res;
            if(terminalLinkInfo){
                this.host808     = terminalLinkInfo.host808;  
                this.host8082    = terminalLinkInfo.host8082;  
                this.isLink808   = terminalLinkInfo.isLink808;  
                this.isLink8082  = terminalLinkInfo.isLink8082; 
                this.phoneNumber = terminalLinkInfo.phoneNumber; 
                this.phoneNumber2= terminalLinkInfo.phoneNumber2;  
                this.port808     = terminalLinkInfo.port808;
                this.port8082    = terminalLinkInfo.port8082;
                this.terminalId  = terminalLinkInfo.terminalId;
            }else{
                this.host808     = '';  
                this.host8082    = '';  
                this.isLink808   = '0';  
                this.isLink8082  = '0'; 
                this.phoneNumber = ''; 
                this.phoneNumber2= '';  
                this.port808     = '';
                this.port8082    = '';
                this.terminalId  = '';
            }
            this.terminalId808 = terminal.terminalId808;
            this.vehicleColor    = terminal.vehicleColor;
        },
        // 设置信息。。。
        ajax_setInfo(){
            if(!this.terminalId){
                _mm.msg('终端ID不能为空！');
                return
            }else if(this.isLink808 !== '0' && this.isLink808!== '1'){
                _mm.msg('中心1是否连接808选项不能为空!');
                return
            }
            else if(this.isLink8082 !== '0' && this.isLink8082!== '1'){
                _mm.msg('中心2是否连接808选项不能为空!');
                return
            }else{
                let obj = {};
                obj.terminalId808 = this.terminalId808;
                obj.vehicleColor    = this.vehicleColor;
                obj.host808         = this.host808;  
                obj.host8082        = this.host8082;  
                obj.isLink808       = this.isLink808;  
                obj.isLink8082      = this.isLink8082; 
                obj.phoneNumber     = this.phoneNumber; 
                obj.phoneNumber2    = this.phoneNumber2;  
                obj.port808         = this.port808;
                obj.port8082        = this.port8082;
                obj.terminalId      = this.terminalId;
                this.$emit('update',obj);
            }
        }
    }
}
</script>

<style scoped>
.center{
    margin-top: -24px;
}

.ct-tle{
    display: flex;
    flex-direction: row;
    justify-content:flex-start;
    align-items: center;
}
.ct-tle .name{
    padding-right: 6px;
}
.name1{
    margin-left: 20px;
}

.ct-tle >>> .el-input{
    width: 200px;
}



.ct-main{
    margin-top: 30px;
    margin-bottom: -20px;
    display: flex;
    flex-direction: row;
}
.ct-main-item{
    padding: 10px;
    border: 1px solid #DCDFE6;
    flex:1;
    position: relative;
}
.ct-main-item .title{
    position: absolute;
    left: 25px;
    top: -10px;
    width: max-content;
    padding: 0 5px;
    background-color: #fff;
}

.ct-main-item + .ct-main-item{
    margin-left: 10px;
}
.ct-row{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
}
.ct-row >>> .el-input{
    width: 180px;
}
.ct-row >>> .el-input input{
    border-radius: 0;
}
.ct-main-name{
    flex: 1;
    border: 1px solid #dcdfe6;
    border-right: 0;
    line-height: 32px;
    text-align: center;
    box-sizing: border-box;
    height: 32px;
    background-color: rgb(240,242,245);
    font-size: 13px;
}

</style>