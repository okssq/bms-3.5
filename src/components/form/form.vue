<template>
    <div class="dform" :style="{width:props.width}" v-if="props.list.length">
        <div class="zoom">
            <div class="dform-block" v-for="(formItem,index) in props.list" :key="index">
                <div class="dform-item zoom" v-for="item in formItem" :key="item.name">
                    <div class="dform-item-tle"><span v-if="item.required">*</span>{{item.name}}：</div>
                    <div class="dform-item-cnt">
                        <!-- 输入框 -->
                        <el-input 
                            class="dform-item-box" 
                            v-if="item.type==='text' || item.type==='password'" 
                            :type="item.type"
                            v-model="item.value" 
                            placeholder="请输入" 
                            :disabled="item.disabled"
                            :maxlength="item.maxlength||20"
                            ></el-input>
                        
                        
                        <!-- 下拉框 @change="EVT_change(item)"-->
                        <el-select 
                            class="dform-item-box" 
                            v-model="item.value"
                            placeholder="请选择" 
                            :disabled="item.disabled"
                            @change="item.EVT_change?item.EVT_change(item,props):function(){}"
                            v-if="item.type ==='select'">
                            <el-option 
                                v-for="(child,index) in item.options" 
                                :key="child.value+index" 
                                :label="child.name" 
                                :value="child.value"></el-option>
                        </el-select>
                        
                        <!-- 日期选择 date -->
                        <el-date-picker
                            class="dform-item-box"
                            v-if="item.type === 'date'" 
                            v-model="item.value" 
                            type="date"
                            :picker-options="{disabledDate(time){return time.getTime() > Date.now();}}"
                            :disabled="item.disabled"
                            :value-format="'yyyy-MM-dd'">
                        </el-date-picker>

                        <!-- 日期选择 datarange -->
                        <el-date-picker
                            :unlink-panels="true"
                            class="dform-item-box"
                            v-if="item.type === 'daterange'" 
                            v-model="item.value" 
                            type="daterange"
                            :disabled="item.disabled"
                            :picker-options="item.picker ? item.picker :{disabledDate(time){return time.getTime() > Date.now();}}"
                            :value-format="'yyyy-MM-dd'" 
                            range-separator="至" 
                            start-placeholder="开始日期" 
                            end-placeholder="结束日期">
                        </el-date-picker>
                        
                        <!-- 带后缀的输入框 -->
                        <el-input placeholder="请输入" :disabled="item.disabled" v-model="item.value" v-if="item.type === 'textSuffix'" 
                        @blur="input_suffix_setSize(item)" >
                            <template slot="append">{{item.suffix}}</template>
                        </el-input>

                        <!-- 带switch的下拉框 -->
                        <div class="dform-item-box zoom" v-if="item.type === 'switchSelect'">
                            <div class="dform-box-left">
                                <el-switch
                                    v-model="item.switch"
                                    active-color="#409eff"
                                    inactive-color=""
                                    :disabled="item.disabled"
                                    @change="EVT_switchSelect(item)">
                                    </el-switch>
                            </div>
                            <div class="dform-box-right">
                                <el-select 
                                    class="dform-item-box" 
                                    v-model="item.value"
                                    :disabled="item.dis_sel"
                                    placeholder="请选择">
                                    <el-option 
                                        v-for="child in item.options" 
                                        :key="child.value" 
                                        :label="child.name" 
                                        :value="child.value"></el-option>
                                </el-select>
                            </div>
                        </div>
                        <!-- single-active-company-tree -->
                        <template v-if="item.type === 'singleCompany'">
                            <SingleCompanyTree
                                ref="CLD_singleCompany"
                                :list="item.options"
                                :disabled="item.disabled"
                                @evt_setId="evt_setId($event,item)"
                                @set_inputInt="set_inputInt($event,item)"
                            />
                        </template>

                        <!-- 文件上传 -->
                        <!-- <div class="dform-item-box dform-item-file" v-if="item.type==='upload_img'" :class="{active:item.src}"  key="111">
                            <input  key="11111" name="file" :id="item.id" :disabled="item.disabled" @change="EVT_fileChange(item)" type="file">
                            <img  id="uploadImg"  :src="item.src">
                        </div> -->

                        <div class="dform-item-box dform-item-file" v-if="item.type==='upload_img1'" :class="{active:item.src}"  key="222">
                            <input key="222222"  name="file" :id="item.id" :disabled="item.disabled" @change="EVT_fileChange(item)" type="file">
                            <img  id="uploadImg"  :src="item.src">
                        </div>

                        <div class="dform-item-box dform-item-file" v-if="item.type==='upload_img'" :class="{active:item.src}">
                            <input name="file" :id="item.id" :disabled="item.disabled" @change="EVT_upload_img(item)" type="file">
                            <img  id="uploadImg3"  :src="item.src">
                        </div>

                        <div class="form-upImg" v-if="item.type==='uploadImg'">
                            <input key="1" type="file" name="file" id="uploadImg" @change="EVT_fileChange($event,item)"> 
                            <img :src="'http://gnss.123yb.cn/driver/'+item.value" v-if="item.value && item.value!=''" alt="">
                        </div>
                        
                        <!-- 籍贯 -->
                        <el-popover
                            class="dcityBox"
                            v-if="item.type === 'city'"
                            v-model="city.show"
                            :disabled="item.disabled"
                            placement="bottom"
                            width="342"
                            trigger="click">
                            <div class="dcity">
                                <div class="dcity-tle">
                                    <span v-for="tle in city.titles" :key="tle" @click="EVT_cityTle(tle)">{{tle}}</span>
                                </div>
                                <div class="dcity-cnt zoom">
                                    <div v-if="city.first.show" @click="EVT_first(first)" :class="first.cls" v-for="(first,index) in city.first.options" :key="index">
                                        {{first.name}}
                                    </div>
                                    <div v-if="city.second.show" @click="EVT_second(second,item)" :class="second.cls" v-for="(second,index) in city.second.options" :key="index">
                                        {{second.name}}
                                    </div>
                                </div>
                            </div>
                            <el-button :class="{'is-disabled':item.disabled}" class="dform-reference" slot="reference">{{city.result.txt}}</el-button>
                        </el-popover>

                        <!-- 错误提示消息 -->
                        <div class="dform-err"></div>

                        
                    </div>
                </div>
            </div>
        </div>
        <!-- 保存按钮 -->
        <div class="dform-btn" >
            <button class="dbtn dbtn-blue" @click="EVT_save" v-if="props.btn.show">保存</button>
            <button class="dbtn" @click="EVT_cancel">返回</button>
        </div>
    </div>
</template>

<script>
import Server from 'service/mm.jsx';
import SingleCompanyTree from 'components/schMenu/singleCompanyTree.vue'
const _mm = new Server();

export default{
    props:['props'],
    data(){
        return {
            imageUrl:'',//图片地址
            imgs: [],
            imgData: {
                accept: 'image/gif, image/jpeg, image/png, image/jpg',
            },

            //籍贯
            city : {
                show:false,
                titles:['省/直辖市'],
                //第一层
                first:{
                    show:true,
                    options:[]
                },
                //第二层
                second:{
                    show:false,
                    options:[]
                },
                //结果
                result:{
                    province:{name:"",code:""},
                    city:{name:"",code:""},
                    txt:"请选择"
                }
            },
        }
    },
    components:{
        SingleCompanyTree
    },
    created(){
        this.ajax_get_nativePlace();
        this.props.list.forEach((el,index)=>{
           for(let i=0;i<el.length;i++){
               if(el[i].type === "select" && el[i].EVT_change){
                   el[i].EVT_change(el[i]);
               }
           }
        });
    },
    methods:{

        EVT_upload_img(item){
            let reader =new FileReader();
            let img1=document.getElementById(item.id).files[0];
            let type=img1.type;//文件的类型，判断是否是图片
            let size=img1.size;//文件的大小，判断图片的大小
            if(this.imgData.accept.indexOf(type) == -1){
                _mm.msgErr('请选择我们支持的图片格式！');
                return false;
            }
            if(size>3145728){
                _mm.msgErr('请选择3M以内的图片！');
                return false;
            }
            var uri = ''
            let form = new FormData(); 
            form.append('file',img1,img1.name);
            _mm.request({
                contentType:"上传图片",
                processData:"上传图片",
                url:item.url,
                data:form
            }).then((res)=>{
                item.src_save = res;
                item.src = _mm.hostUrl("driver/")+res;
            });
        },

        //父组件调用子组件方法 表单为所有disable
        EVT_parent(config){
            // console.log(config)
            if(config.type === "view"){
                
				this.props.list.forEach((el,index)=>{
					for(let i=0;i<el.length;i++){
                        el[i].disabled = true;
                    }
                });
                this.props.btn.show = false;
                // console.log('执行完毕',this.props.list);
            }
        },
        // 点击保存事件
        EVT_save() {
            let _this = this;
            let _resData = {};
            let _formData = _this.props.list;
            for(let f=0;f<_formData.length;f++){
                let _items = _formData[f];
                let _sign = true;
                for(let i=0;i<_items.length;i++){
                    if(
                        _items[i].type === "text"           || 
                        _items[i].type === "password"       || 
                        _items[i].type === "select"         ||
                        _items[i].type === "daterange"      ||
                        _items[i].type === "textSuffix"     || 
                        _items[i].type === "city"           ||
                        _items[i].type === "date"
                    ){
                        if(!$.trim(_items[i].value) && _items[i].required){
                            _mm.msg(_items[i].name+"不能为空");
                            _sign = false;
                            break;
                        }else{
                            _resData[_items[i].key] = $.trim(_items[i].value);
                        }
                    }else if(_items[i].type === "upload_img"){
                        if(!_items[i].src_save && _items[i].required){
                            _mm.msg(_items[i].name+"不能为空");
                            _sign = false;
                            break;
                        }else{
                            _resData[_items[i].key] = _items[i].src_save;
                        }
                    }else if(_items[i].type === "switchSelect"){
                        if(_items[i].switch && !_items[i].value && _items[i].required){
                            _mm.msg(_items[i].name+"不能为空");
                            _sign = false;
                            break;
                        }else{
                            _resData[_items[i].key] = _items[i].value;
                            _resData[_items[i].key+"_switch"] = _items[i].switch;
                        }
                    }
                    else if(_items[i].type === "singleCompany"){
                        if(!_items[i].value && _items[i].required){
                            _mm.msg(_items[i].name+"不能为空");
                            _sign = false;
                            break;
                        }else{
                            _resData[_items[i].key] = _items[i].value;
                        }
                    }
                    
                }
                if(!_sign)return;
            }    
            this.$emit('setForm',_resData);
        },
        //evt-取消
        EVT_cancel(){
            this.$emit('setCancel',"cancel");
        },
        //下拉框change事件
        EVT_change(item){
            if(item.change){
                this.$emit('setChange',item);
            }
            
        },
        //带switch的下拉框
        EVT_switchSelect(item){
            item.required = !item.required;
            item.dis_sel = !item.dis_sel;
            
        },

        //控制
        input_suffix_setSize(item){
            this.$emit('setSize',item);
        },

        //上传图片
        EVT_fileChange(item){
            _mm.request_file({
                id:item.id,
                url:item.url,
            }).then((res)=>{
                // console.log('ressss',res)
                item.src_save = res;
                item.src = _mm.hostUrl("driver/")+res;
                if(item.type==='upload_img'){
                    item.type = 'upload_img1'
                }
                else{
                    item.type = 'upload_img'
                }
            });
        },

        //获取省份接口并渲染
        ajax_get_nativePlace(){
            let _this = this;
            _mm.request({ 
                url:'/driver/province_list.json', 
                async:false
            }).then((res)=>{
                let _cityResult = ["",""];
                let _txt = _this.props.list[0][1].value + "";
                let _code = _txt.split("-");
                let arr=[];
                for( let i=0,len=res.length;i<len;i++){
                    arr[i]={
                            name:res[i].provinceAbbName,
                            type:'市',
                            code:res[i].provinceCode,
                            clss:'',
                            cc  :[],
                        };
                    for(let j=0,clen=res[i].citySelect.length;j<clen;j++){
                        arr[i].cc[j]={  
                                        name:res[i].citySelect[j].cityAbbName,
                                        cls:'',
                                        code:res[i].citySelect[j].cityCode,
                                     }
                        if(res[i].citySelect[j].cityCode === _code[1]){
                            _cityResult[1] = res[i].citySelect[j].cityAbbName;
                        }
                    }
                    if(res[i].provinceCode === _code[0]){
                        _cityResult[0] = res[i].provinceAbbName;
                    }
                }

                if(_cityResult[0])this.city.result.txt = _cityResult[0] + " " + _cityResult[1];
                
                this.city.first.options=arr;

            })
        },
        //籍贯模块
        EVT_first(item){
            let _first = this.city.first;
            let _second = this.city.second;

            _first.show = false;
            _second.show = true;
            _second.options = item.cc;
            this.city.titles = ['省/直辖市',item.type];
            this.city.result.province = {
                name:item.name,
                code:item.code
            };
        },
        EVT_second(item,list){
            let _options = this.city.second.options;
            _options.forEach(function(el,index){
                el.cls = "";
            });
            item.cls = "active";

            this.city.result.city = {
                name:item.name,
                code:item.code
            };
            this.city.result.txt = this.city.result.province.name + " " + this.city.result.city.name;
            list.value = this.city.result.province.code+"-"+this.city.result.city.code;
            this.city.show = false;
        },
        EVT_cityTle(item){
            if(item !== "省/直辖市")return;
            let _first = this.city.first;
            let _second = this.city.second;
            this.city.titles = ['省/直辖市'];
            _first.show = true;
            _second.show = false;
            _second.options = [];
        },
        // 公司单选模块
        evt_setId(data,item){
            // console.log('执行了evt_setId',data,item);
            item.value = data.id;
            this.$emit('setCompanyId',data.id);
        },
        set_inputInt(data,item){
            item.value = data.id;
            // console.log('执行了set_inputInt',data,item);
        },
        //传入id显示公司名字
        show_company(data,id){
            this.$refs.CLD_singleCompany[0].fn_set_inputInt(data,id);
        }

        
    }
    
}
</script>

<style scoped>
    .dform-reference{width:100%;text-align:left;}
    .el-date-editor.el-input, .el-date-editor.el-input__inner{width:100%;}
    .el-popover.el-popper.el-popover{padding: 0;}
    .dcity-tle{position: relative;height: 36px;line-height: 36px;border-bottom: 1px solid #dae0e6;}
    .dcity-tle>span{display: inline-block;width: 90px;text-align: center;color: #3496f8;height: 36px;font-weight: bold;cursor: pointer;}
    .dcity-tle>span:last-of-type{border-bottom: 1px solid #3496f8;}
    .dcity-cnt{padding: 5px 0px;}
    .dcity-cnt>div{font-size: 12px; width:60px;height: 30px;float: left;line-height: 30px;text-align: center;cursor: pointer;}
    .dcity-cnt>div.active{background-color: rgb(239, 247, 255)}
    .el-date-editor.el-input, .el-date-editor.el-input__inner{width:100%;}
</style>
