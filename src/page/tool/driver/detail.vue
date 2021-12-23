<template>
	<div class="operation" v-loading="loading">
		<div class="cnt zoom">
			<Form 
				:props="formdata" 
				@setForm="getForm"  
				@setCancel="cancel" 
				@setCompanyId="rb_setCompanyId"
				ref="Cld_form"
			/>
		</div>
	</div>
</template>

<script>
	import Form from "components/form/form.vue";
	import Server from "service/mm.jsx";
	const _mm = new Server();
	let picker={
		disabledDate(time){
			return false;
		}
	};
	export default {
		data() {
			return {
				title:"新增司机",
				loading:false,
				driverId:'',
				switch: false,
				routData: "",
				formdata: {
					btn: {show: true},
					list: [
						[
							{name: "司机姓名",type: "text",key: "driverName",value: "",required: true,maxlength:10},
							{name: "籍贯",type: "city",key: "nativePlace",value: "",required: true,},
							{name: "性别",type: "select",key: "driverSex",value: "",required: true,
								options: [{name: "男",value: "1"}, {name: "女",value: "2"}]
							},
							{name: "联系电话",type: "text",key: "phone",value: "",required: true,maxlength:11},
							{
								name: "所属公司",
								type: "singleCompany",
								key: "companyId",
								value: "",
								options: [],
								required: true
							},
							// {name: "所属公司",type: "select",key: "companyId",value: "",required: true,options: [],EVT_change:(i,_fdata)=>{
							// 	if(i.value){
							// 		_this.ajax_vle_licence_list(i.value);//ajax获取车辆列表
							// 	}
							// 	if(_fdata)_fdata.list[0][5].value='';
							// }},
							{name: "关联车辆",type: "switchSelect",key: "vehicleId",value: "",switch: true,
							 options:[],dis_sel:false,required:true},
							{name:'司机照片',type: "upload_img",key: "photoLink",value: "",id:"file1",src:"",url:"/driver/imageUpload.json",required:true}
						],
						[
							{name: "身份证号码",type: "text",key: "cardId",value: ""},
							{name: "家庭住址",type: "text",key: "houseAdd",value: ""},
							{name: "出生日期",type: "date",key: "birthday",value: ""},
							{name: "司机IC卡号",type: "text",key: "icNumber",value: ""},
							{name: "驾驶证号",type: "text",key: "drivingLicence",value: ""},
							{name: "准驾车型",type: "select",key: "drivingCarType",value: "",options: []},
							{name: "初次领证日期",type: "date",key: "getDrivingLicenceTime",value: ""},
							{name: "驾照有效期限",type: "daterange",key: "expirationDate",value: "",picker:picker}
						]
					]
				},
				resData: {}
			};
		},
		components: {
			Form: Form
		},
		
		created() {
			let _query = this.$route.query;
			let _type = _query.type;
			if(_type === "view"){
				this.formdata.btn.show = false;
				this.formdata.list.forEach((el,index)=>{
					for(let i=0;i<el.length;i++){
						el[i].disabled = true;
						if(el[i].type==="switchSelect")el[i].dis_sel = true;
					}
				});
			}
			this.fn_init();
			if(_type === "add")return;
			this.driverId = _query.driverId;
			this.ajax_driver_info({driverId:_query.driverId});//ajax-获取公司信息		
		},
		methods: {
			getForm(data) {
				// console.log('dataaaa',data);return;
				// 开关为on ,设置isConcatVehicle值
				data.isConcatVehicle=data.vehicleId_switch&&data.vehicleId?"1":"0";

				//设置驾照开始时间、结束时间
				if (data.expirationDate && data.expirationDate.length === 2) {
					data.effTime = data.expirationDate[0];
					data.expTime = data.expirationDate[1];
					delete data["expirationDate"];
				}
				else{
					data.effTime = "";
					data.expTime = "";
				}	
				
				if(this.driverId){
					data.driverId = this.driverId;
				}
				this.ajax_addOrEdit_user(data);

			},
            //取消按钮
			cancel(){
                this.$router.push({path:"/tool-driver"});
			},	

			//新增司机和编辑司机接口
			ajax_addOrEdit_user(data){
				let _this = this;
				_mm.request({ 
					url:'/driver/insert_update_driver.json', 
					data:data
				}).then((res)=>{
					_mm.msg("操作成功");
					_this.$router.push({path:"/tool-driver"});
				})
			},
			//ajax-获取司机信息
			ajax_driver_info(set){
				console.log('ccccc');
				let _this = this;
				_this.loading = true;
				_mm.request({
					url:'/driver/driver_info.json', 
					data:set
				}).then((res)=>{
					_this.loading = false;
					this.ajax_vle_licence_list(res.companyId,res.vehicleId);
					this.$refs.Cld_form.show_company(_this.formdata.list[0][4].options,res.companyId);
					this.formdata.list[0][0].value   = res.driverName;
					this.formdata.list[0][1].value   = res.nativePlace;//籍贯后续得更改
					this.formdata.list[0][2].value   = res.driverSex;
					this.formdata.list[0][3].value   = res.phone;
					this.formdata.list[0][4].value   = res.companyId;
					
					//关联车辆
					if(res.isConcatVehicle === "1"){
						this.formdata.list[0][5].switch = true;
						this.formdata.list[0][5].required = true;
						this.formdata.list[0][5].dis_sel = this.$route.query.type === "view"?true:false;
					}else{
						this.formdata.list[0][5].switch = false;
						this.formdata.list[0][5].required = false;
						this.formdata.list[0][5].dis_sel = true;
					}
					this.formdata.list[0][6].src_save= res.photoLink;
					this.formdata.list[0][6].src 	 = _mm.hostUrl("driver/")+res.photoLink;
		
					this.formdata.list[1][0].value   = res.cardId;
					this.formdata.list[1][1].value   = res.houseAdd;
					this.formdata.list[1][2].value   = res.birthdayDay===null?"":res.birthdayDay;
					this.formdata.list[1][3].value   = res.icNumber;
					this.formdata.list[1][4].value   = res.drivingLicence;
					this.formdata.list[1][5].value   = res.drivingCarType;
					this.formdata.list[1][6].value   = res.getDrivingLicenceTime===null?"":res.getDrivingLicenceTime;
					let effTime = res.effTime===null?"":res.effTime;
               		let expTime = res.expTime===null?"":res.expTime;
					if(effTime && expTime)_this.DATA_formProps.list[1][7].value=[effTime,expTime];
				})
			},
			
			rb_setCompanyId(data){
				console.log('data11',data);
				this.ajax_vle_licence_list(data);
				this.formdata.list[0][5].value   = '';
			},
			//ajax-获取车辆列表
			ajax_vle_licence_list(id,vleId) {
				let _this = this;
				_mm.request({
					url: "/vehicle/vehicle_licence_list.json",
					data:{companyId:id},
				}).then(res => {
					let arr = [];
					for (let i = 0, len = res.length; i < len; i++) {
						arr.push({
							value: res[i].vehicleId,
							name: res[i].vehicleLicence
						});
					}
					_this.formdata.list[0][5].options = arr;
					if(vleId){
						this.formdata.list[0][5].value   = vleId;
					}
				});
			},


			async fn_init(){
				try {
					let companyList =  this.ajax_company_level();
					let carTypeList =  this.ajax_car_type();
					Promise.all([
						companyList,
						carTypeList
					])
					.then(res => {
						this.fn_company(res[0]);
						this.fn_carTypeList(res[1]);
					})
					.catch(err => {
						this.$message.error('获取初始化数据错误，请尝试刷新页面！');
					});
				} catch (err) {
					this.$message.error("获取初始化数据错误，请尝试刷新页面！");
				}
			},
			//ajax-获取所属公司列表
			ajax_company_level() {
				return new Promise((resolve, reject) => {
					console.log('aaaa');
					_mm.request({
						url:'/company/company_level.json',
					}).then((res)=>{
						resolve(res);
					},function(err){
						reject(err)
					});
				});
			},
			//ajax-获取准驾类型列表
			ajax_car_type() {
				return new Promise((resolve, reject) => {
					console.log('bbbb');
					_mm.request({
						url:'/driver/driving_car_type_list.json',
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
				this.formdata.list[0][4].options = arr;
			},
			fn_carTypeList(res){
				let arr = [];
				for (let i = 0, len = res.length; i < len; i++) {
					arr.push({
						value: res[i].drivingCarType,
						name : res[i].drivingCarName
					});
				}
				this.formdata.list[1][5].options = arr;
			}
		}
	};

</script>

<style scoped>
	.hbody>.cnt {
		border: 1px solid #dae0e6;
	}
</style>
