<template>
    <div class="card-container">
        <div class="card-item" v-loading="notice_loading">
            <div class="card-header">新增公告</div>
            <div class="card-body">
                <el-form  label-width="120px" :model="notice_data">
                    <el-form-item label="公告内容：">
                        <el-input
                            type="textarea"
                            placeholder="请输入内容"
                            v-model="notice_data.content"
                            maxlength="256"
                            :rows="9"
                            show-word-limit
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="展示期间:">
                        <el-col :span="24">
                            <el-date-picker
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :unlink-panels="true"
                                :default-time="['00:00:00', '23:59:59']"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                v-model="notice_data.time"
                                type="datetimerange"
                            />
                        </el-col>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="insert_notice">确定</el-button>
                        <el-button 
                            @click="notice_data={...notice_data,...{content:'',time:[]}}"
                        >重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
    import Server from "service/mm.jsx";
    const _mm = new Server();
    export default {
        data(){
            return {
                notice_loading:false,
                notice_data:{
                    content:'',
                    time:[]
                }
            }
        },
        methods:{
            insert_notice(){
                if(!this.notice_data.content){
                    _mm.msgErr('公告内容不能为空！');
                    return;
                }
                if(!this.notice_data.time || !(this.notice_data.time||[]).length){
                    _mm.msgErr('请选择时间！');
                    return;
                }
                let _this = this;
                this.notice_loading = true;
                _mm.request({
                    url: "/notice/insert_notice.json",
                    data:{
                        content:_this.notice_data.content,
                        startTime:_this.notice_data.time[0],
                        endTime : _this.notice_data.time[1]
                    },
                }).then(
                    res => {
                        _mm.msgSss('新增公告成功!');
                        _this.notice_data = {
                            ..._this.notice_data,
                            ...{content:'',time:[]}
                        }
                        _this.notice_loading = false;
                    },
                    function(err) {
                        _this.notice_loading = false;
                    }
                );
            }
        }
    }
</script>

<style scoped>
    .card-container{
        padding: 10px 10px 0;
    }
    .card-item{
        background-color: #fff;
        border-radius: 2px;
        transition: all .3s;
    }
    .card-header{
        margin-bottom: -1px;
        padding: 16px 24px;
        color: rgba(0,0,0,.85);
        font-weight: 500;
        font-size: 16px;
        background: transparent;
        border-bottom: 1px solid #e8e8e8;
        border-radius: 2px 2px 0 0;
    }
    .card-body{
        padding: 24px;
        width: 600px;
    }
</style>
