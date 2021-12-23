<template>
	<div v-loading="loading" class="operation">
		<div class="dMenu">
			<Menu :data="DATA_menuProps" @serach="EVT_search" />
		</div>
		<div class="tool-btns">
			<el-button type="primary" icon="el-icon-copy-document" @click="evt_export">导出列表</el-button>
		</div>
		<!-- 导出模态框 / 双中心 -->
		<el-dialog :title="dialogTitle" :visible.sync="dialogShow" append-to-body :width="dialogWidth" :close-on-click-modal="false">
			<template v-if="dialogType==='export' && dialogShow">	
				<el-date-picker
					v-model="export_time"
					value-format="yyyy-MM-dd"
					format="yyyy-MM-dd"
					type="daterange"
					unlink-panels
					:picker-options="picker"
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
				></el-date-picker>
			</template>	
			<template v-else-if="dialogType==='center' && dialogShow">
				<Center ref="center" @update="update_center" />
			</template>
			<div slot="footer" class="dialog-footer">
				<el-button @click="alert_cancel">取 消</el-button>
				<el-button type="primary" @click="alert_sure">确 定</el-button>
			</div>
		</el-dialog>
		<div class="dTble">
			<Table :props="DATA_tbProps" @setPage="GET_page" @resetTerminal="EVT_resetTerminal" @cb_center="cb_center" />
		</div>
	</div>
</template>

<script>
import Menu from "components/schMenu/menu.vue";
import Table from "components/list/table.vue";
import Center from "./center.vue";

import Server from "service/mm.jsx";
const _mm = new Server();

export default {
	data() {
		return {
			dialogShow: false,
			dialogType:"",
			dialogTitle:"",
			dialogWidth:"",
			export_time: [],
			picker: {
				disabledDate(time) {
					return time.getTime() > new Date().getTime();
				}
			},
			loading: false,
			DATA_menuProps: {
				title: "终端管理",
				items: [
					{
						name: "终端ID",
						type: "text",
						key: "terminalId",
						value: "",
						maxlength: "20"
					},
					{
						name: "车牌号码",
						type: "license_search",
						key: "vehicleLicence",
						value: ""
					},
					{
						name: "创建日期",
						type: "date",
						key: "createTime",
						value: ""
					},
					{ name: "版本号", type: "text", key: "version", value: "" },
					{ name: "型号", type: "text", key: "rom", value: "" },
					{
						type: "btn",
						key: "btn",
						btns: [
							{ name: "搜索", key: "search" },
							{ name: "清除", key: "clear" }
						]
					}
				]
			},
			DATA_tbProps: {
				title: [
					{ name: "终端ID", type: "", prop: "k1", width: "140" },
					{ name: "终端名称", type: "", prop: "k2", width: "" },
					{
						name: "当前状态更改时间",
						type: "",
						prop: "k3",
						width: ""
					},
					{ name: "版本号", type: "", prop: "k4", width: "" },
					{ name: "型号", type: "", prop: "k5", width: "" },
					{ name: "创建时间", type: "", prop: "k6", width: "" },
					{ name: "车牌号码", type: "", prop: "k7", width: "" }
				],
				items: [],
				opeations: [
					{
						name: "查看",
						evt: "seeEdit",
						path: "/tool-terminal/detail"
					}
				],
				page: {
					total: 0
				}
			},
			postData: [],
			centerConfig:{
				
			}
		};
	},
	components: {
		Menu: Menu,
		Table: Table,
		Center
	},
	created(){
		let loginData = _mm.getStorage("login");
		let loginIds = [	//交运集合
			"11",'12','13','14','15','16',
			'17','18','19','20','21','22','23',
			'24','25','26','27','28','29','47',
			'50','55','96','114','154','155',
			'166','169','281','284'
		];
		if (loginData.roleId === "1") {
			this.DATA_tbProps.opeations.push(
				{ name: "编辑", evt: "edit", path: "tool-terminal/detail" },
				{ name: "下发推送", evt: "resetTerminal" },
				{ name: "多中心", evt: "center", }
			);
		} else if (loginData.companyId === "246" || loginIds.includes(loginData.companyId)) {
			this.DATA_tbProps.opeations.push({
				name: "多中心",
				evt: "center",
			});
		}
		this.EVT_search();
	},
	methods: {
		//搜索按钮事件
		EVT_search(data) {
			let postData = {
				terminalId: "",
				vehicleLicence: "",
				createTime: "",
				version: "",
				rom: "",
				page: "1"
			};
			if (data) {
				postData.terminalId = data.terminalId;
				postData.vehicleLicence = data.vehicleLicence;
				postData.createTime = data.createTime;
				postData.version = data.version;
				postData.rom = data.rom;
			}
			this.postData = postData;
			this.DATA_tbProps.page.sync = 1;
			this.ajax_search(postData);
		},

		//搜索接口
		ajax_search(set) {
			this.loading = true;
			let _this = this;
			_mm.request({
				url: "/terminal/terminal_list.json",
				data: set
			}).then(
				res => {
					let arr = [];
					if (!res.results) {
						_this.DATA_tbProps.items = [];
						_this.DATA_tbProps.page.total = 0;
						_this.loading = false;
						return;
					}
					for (let i = 0, len = res.results.length; i < len; i++) {
						let set = res.results[i];
						let _json = {
							set: { terminalId: set.terminalId, vid: set.vid },
							k1: set.terminalId,
							k2: set.terminalName,
							k3: set.updateTime,
							k4: set.version,
							k5: set.rom,
							k6: set.createTime,
							k7: set.vehicleLicence
						};
						arr.push(_json);
					}
					_this.DATA_tbProps.page.total = res.totalCount;
					_this.DATA_tbProps.items = arr;
					_this.loading = false;
				},
				function(err) {
					console.log(err);
					_this.DATA_tbProps.items = [];
					_this.DATA_tbProps.page.total = 0;
					_this.loading = false;
				}
			);
		},

		//下发推送
		EVT_resetTerminal(set) {
			// console.log("Set",set)
			this.loading = true;
			let _this = this;
			_mm.request({
				url: "/terminal/reboot_terminal.json",
				data: set
			}).then(
				res => {
					this.ajax_search(_this.postData);
				},
				function(err) {
					console.log(err);
					_this.loading = false;
				}
			);
		},

		//回调-分页
		GET_page(data) {
			this.postData.page = data;
			this.DATA_tbProps.page.sync = data;
			this.ajax_search(this.postData);
		},

		//导出功能按钮
		evt_export() {
			this.export_time = [];
			this.dialogShow = true;
			this.dialogType = "export";
			this.dialogTitle = "导出终端列表"
			this.dialogWidth = '400px';
		},

		
		//弹窗确定导出按钮
		alert_sure() {
			if(this.dialogType === 'export'){
				if (this.export_time.length === 0) {
					_mm.msgErr("请选择时间导出！");
					return
				} else {
					let data = {
						startTime: this.export_time[0],
						endTime: this.export_time[1]
					};
					this.export_time = [];
					window.open(
						"/sicp/terminal/down_terminal_excel.json" +
							"?" +
							$.param(data)
					);
				}
				this.dialogShow = false;
			}
			else if(this.dialogType === 'center'){
				this.$refs.center.ajax_setInfo();
			}
		},
		//弹窗取消功能
		alert_cancel() {
			if(this.dialogType === 'export'){
				this.export_time = [];
				
			}
			else if(this.dialogType === 'center'){
				
			}
			this.dialogShow = false;
		},

		// 多中心按钮
		cb_center(obj){
			this.dialogType = "center";
			this.dialogShow = true;
			this.dialogTitle = "多中心设置";
			this.dialogWidth = '660px';
			this.$nextTick(() =>{
				this.$refs.center.ajax_getInfo(obj.set);
			})
		},
		update_center(data){
			let _this = this;
            _mm.request({ 
                url:'/terminal/update_terminal_link.json', 
                data:data
            }).then((res)=>{
				_mm.msg('更新成功');
				this.dialogShow = false;
            },function(err){
                
            })
		}
	}
};
</script>

<style scoped>
.tool-btns {
	padding: 0 10px;
}
</style>
