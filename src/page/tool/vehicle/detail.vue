<template>
    <div class="operation" v-loading="loading">
        <div class="cnt zoom">
            <Form
                :props="DATA_formProps"
                @setForm="GET_form"
                ref="Cld_form"
                @setCancel="GET_cancel"
            />
        </div>
    </div>
</template>

<script>
import Form from "components/form/form.vue";
import Server from "service/mm.jsx";

const _mm = new Server();
let picker = {
    disabledDate(time) {
        return false;
    }
};
export default {
    data() {
        return {
            loading: true,
            id: "",
            tle: "",
            DATA_formProps: {
                btn: {
                    show: true
                },
                list: [
                    [
                        {
                            name: "车牌号码",
                            type: "text",
                            key: "vehicleLicence",
                            value: "",
                            required: true
                        },
                        {
                            name: "所属公司",
                            type: "singleCompany",
                            key: "companyId",
                            value: "",
                            options: [],
                            required: true
                        },
                        {
                            name: "关联设备",
                            type: "text",
                            key: "terminalId",
                            value: "",
                            disabled: true
                        }
                    ],
                    [
                        {
                            name: "车辆类型",
                            type: "select",
                            key: "vehicleType",
                            value: "",
                            options: []
                        },
                        {
                            name: "行驶证号",
                            type: "text",
                            key: "runCertificate",
                            value: ""
                        },
                        {
                            name: "驾照有限期限",
                            type: "daterange",
                            key: "driverFinite",
                            value: [],
                            picker: picker
                        },
                        {
                            name: "品牌型号",
                            type: "text",
                            key: "brandType",
                            value: ""
                        },
                        {
                            name: "使用性质",
                            type: "select",
                            key: "useType",
                            value: "",
                            options: []
                        },
                        {
                            name: "车辆用途",
                            type: "select",
                            key: "vehiclePurpose",
                            value: "",
                            options: []
                        },
                        {
                            name: "核定载质量",
                            type: "textSuffix",
                            key: "goodsWeight",
                            value: "",
                            suffix: "kg"
                        },
                        {
                            name: "核定载人数",
                            type: "textSuffix",
                            key: "mansWeight",
                            value: "",
                            suffix: "人"
                        }
                    ]
                ],
                once: {
                    vehicleId: ""
                }
            },
            resData: {}
        };
    },
    components: {
        Form: Form
    },
    computed:{
        dataCars(){
            return this.$store.state.dataCars;
        },
    },
    created() {
 
        this.DATA_formProps.type = this.$route.query.type;
        this.tle = this.DATA_formProps.type === "view" ? "查看车辆" : "编辑车辆";
          
        if (this.$route.query.id && this.$route.query.id != "0") {
            this.id = this.$route.query.id;
        } else {
            this.$router.push({ path: "/tool-vehicle" });
            return;
        }

        this.fn_init();

    },
    mounted() {
        if (this.DATA_formProps.type === "view") {
            this.$refs.Cld_form.EVT_parent({ type: "view" });
        }
    },
    methods: {
        //回调-表格
        GET_form(data) {
            // console.log('data',data);return
            let reg999 = /^[0-9]{0,3}(\.\d{0,1})?$/;
            let reg99 = /^[0-9]{0,2}$/;
            if (
                reg999.test(parseFloat(data.goodsWeight)) === false &&
                data.goodsWeight
            ) {
                _mm.msg("核定载质量不能大于999.9并且小数点只能1位");
                return;
            }
            if (
                data.mansWeight &&
                (reg99.test(parseInt(data.mansWeight)) === false ||
                    data.mansWeight.indexOf(".") > 0)
            ) {
                _mm.msg("核定载人数不能大于99且为整数");
                return;
            }
            let propsData = {};
            if (this.DATA_formProps.type === "edit") {
                // console.log("car edit",data)
                propsData.vehicleId = this.DATA_formProps.once.vehicleId;
                propsData.vehicleLicence = data.vehicleLicence;
                propsData.companyId = data.companyId;
                propsData.terminalId = data.terminalId;
                propsData.vehicleType = data.vehicleType;
                propsData.runCertificate = data.runCertificate;
                let _dFinite = data.driverFinite.split(",");
                propsData.runEffTime = _dFinite[0];
                propsData.runExpTime = _dFinite[1];
                propsData.brandType = data.brandType;
                propsData.useType = data.useType;
                propsData.vehiclePurpose = data.vehiclePurpose;
                propsData.goodsWeight = data.goodsWeight
                    ? parseFloat(data.goodsWeight)
                    : "";
                propsData.mansWeight = data.mansWeight
                    ? parseInt(data.mansWeight)
                    : "";
                propsData.id = this.id;
                this.ajax_update_vehicle(propsData);
            }
        },
        //取消按钮
        GET_cancel() {
            let _crumbs = [
                { name: "管理工具", to: "", key: "1" },
                { name: "车辆管理", to: "", key: "2" }
            ];
            this.$emit("setlayout", [{ type: "crumbs", data: _crumbs }]);
            this.$router.push({ path: "/tool-vehicle" });
        },
        //获取单个信息
        ajax_getInfo(data) {
            let _this = this;
            this.loading = true;
            _mm.request({
                url: "/vehicle/vehicle_info.json",
                data: data
            }).then(
                res => {
                    this.DATA_formProps.once.vehicleId = res.vehicleId;
                    _this.DATA_formProps.list[0][0].value = res.vehicleLicence;
                    _this.DATA_formProps.list[0][1].value = res.companyId;
                    _this.$refs.Cld_form.show_company(_this.DATA_formProps.list[0][1].options,res.companyId);
                    _this.DATA_formProps.list[0][2].value = res.terminalId;
                    _this.DATA_formProps.list[1][0].value = res.vehicleType;
                    _this.DATA_formProps.list[1][1].value = res.runCertificate;

                    let _runEffTime =
                        res.runEffTime === null ? "" : res.runEffTime;
                    let _runExpTime =
                        res.runExpTime === null ? "" : res.runExpTime;
                    if (_runEffTime && _runExpTime)
                        _this.DATA_formProps.list[1][2].value = [
                            _runEffTime,
                            _runExpTime
                        ];

                    _this.DATA_formProps.list[1][3].value = res.brandType;
                    _this.DATA_formProps.list[1][4].value = res.useType;
                    _this.DATA_formProps.list[1][5].value = res.vehiclePurpose;
                    _this.DATA_formProps.list[1][6].value = res.goodsWeight;
                    _this.DATA_formProps.list[1][7].value = res.mansWeight;

                    // console.log(_this.DATA_formProps.list)

                    _this.loading = false;
                },
                function(err) {
                    console.log(err);
                    _this.loading = false;
                }
            );
        },
        //更新用户信息
        ajax_update_vehicle(data) {
            let _this = this;
            this.loading = true;
            _mm.request({
                url: "/vehicle/insert_update_vehicle.json",
                data: data
            }).then(
                res => {
                    _this.loading = false;
                    _mm.msg("更新成功");
                    _this.$router.push({ path: "/tool-vehicle" });
                    _this.dataCars.isUpdata = true;
                },
                function(err) {
                    _this.loading = false;
                }
            );
        },


        async fn_init(){
            try {
                let companyList     =  this.ajax_company_level();
                let    vehicleTypeList =  this.ajax_get_vehicle_type();
                let    useTypeList     =  this.ajax_get_useType();
                let     purposeList     =  this.ajax_get_vle_purpose();
                Promise.all([
                    companyList,
                    vehicleTypeList,
                    useTypeList,
                    purposeList
                ])
                .then(res => {
                    this.fn_company(res[0]);
                    this.fn_vehicle_type(res[1]);
                    this.fn_useType(res[2]);
                    this.fn_vle_purpose(res[3]);
                    this.ajax_getInfo({id:this.id});
                })
                .catch(err => {
                    this.$message.error('获取初始化数据错误，请尝试刷新页面！');
                });
            } catch (err) {
                this.$message.error("获取初始化数据错误，请尝试刷新页面！");
            }
        },

        //获取公司列表
        ajax_company_level() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url:'/company/company_level.json',
                }).then((res)=>{
                    resolve(res);
                },function(err){
                    reject(err)
                });
            })
        },
        //获取车辆类型下拉框
        ajax_get_vehicle_type() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url:'/vehicle/vehicle_type_list.json',
                }).then((res)=>{
                    resolve(res);
                },function(err){
                    reject(err)
                });
            })
        },
        //获取使用性质下拉框
        ajax_get_useType() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url:'/vehicle/vehicle_use_type_list.json',
                }).then((res)=>{
                    resolve(res);
                },function(err){
                    reject(err)
                });
            })
        },
        //获取车辆用途下拉框
        ajax_get_vle_purpose() {
            return new Promise((resolve, reject) => {
                _mm.request({
                    url:'/vehicle/vehicle_purpose_list.json',
                }).then((res)=>{
                    resolve(res);
                },function(err){
                    reject(err)
                });
            })
        },
        fn_company(res){
            let arr = res;
            arr.forEach(el => {
                el.name = el.companyName;
                el.value = el.id;
                el.actived = false;
                if ((el.children || []).length) {
                    this.fn_company(el.children);
                }
            });
            this.DATA_formProps.list[0][1].options = arr;
        },
        fn_vehicle_type(res){
            let arr=[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push(
                    {name:res[i].vehicleSecondName,value:res[i].vehicleSecondType}
                )
            }
            this.DATA_formProps.list[1][0].options=arr;
        },
        fn_useType(res){
            let arr=[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push(
                    {name:res[i].useTypeName,value:res[i].useType}
                )
            }
            this.DATA_formProps.list[1][4].options=arr;
        },
        fn_vle_purpose(res){
            let arr=[];
            for(let i=0,len=res.length;i<len;i++){
                arr.push(
                    {name:res[i].purposeName,value:res[i].vehiclePurpose}
                )
            }
            this.DATA_formProps.list[1][5].options=arr;

        },


        
    }
};
</script>

<style scoped>
.hbody > .cnt {
    border: 1px solid #dae0e6;
}
</style>
