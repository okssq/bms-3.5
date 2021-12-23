<template>
	<div class="operation" v-loading="loading">
		<div class="dMenu">
			<Menu :data="DATA_menuProps" @serach="EVT_search"  />
		</div>
		<div class="dTble">
			<Table :props="DATA_tbProps" @setPage="GET_page"  />
		</div>
	</div>
</template>

<script>
import Menu from "components/schMenu/menu.vue";
import Table from "components/list/table.vue";
import Server from "service/mm.jsx";
const _mm = new Server();

let picker = {
        disabledDate(time){
            return (time.getTime() > new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1) || time.getTime() < new Date((new Date()).getTime()-86400000*60));
        }
    };
export default {
	components: {
		Table: Table,
		Menu: Menu
	},
	data() {
		return {
			loading: false,
			tle: "",
			DATA_menuProps: {
				items: [
					{
						name: "上传时间",
						type: "datetimerange",
						key: "time",
						value: [],
						picker:picker
					},
					{
						type: "btn",
						key: "btn",
						btns: [
							{
								name: "搜索",
								key: "search",
								model: "search",
								cls: "dbtn-blue"
							},
							{ name: "清除", key: "clear", model: "clear" }
						]
					}
				]
			},
			DATA_tbProps: {
				title: [
					{
						name: "车牌号码",
						type: "text",
						prop: "vehicleLicense",
						value: "",
						disabled: true
					},
					{
						name: "监听时间",
						type: "text",
						prop: "locationTime",
						value: "",
						disabled: true
					},
					{
						name: "插入状态",
						type: "text",
						prop: "tfStatus",
						value: "",
						disabled: true
					},
					{
						name: "存储总量(GB)",
						type: "text",
						prop: "countData",
						value: ""
					},
					{
						name: "已使用量(GB)",
						type: "text",
						prop: "useData",
						value: ""
					},
					{
						name: "剩余使用量(GB)",
						type: "text",
						prop: "surplusData",
						value: ""
					},
					{
						name: "存储状态",
						type: "text",
						prop: "warnStatus",
						value: ""
					},
					{
						name: "备注",
						type: "text",
						prop: "remark",
						value: ""
					}
				],
				items: [],
				page: {
					size: 10,
					total: 0
				}
			},
			postData: {
				page: "1",
				vehicleId: "",
				startTime: "",
				endTime: "",
			},
		};
	},
	created() {
		if (!this.$route.query.vehicleId) {
			this.$router.push({
				path: "/alarm-tcard"
			});
			return;
		}
		let _name;
		if (this.$route.query.type === "view") {
			_name = "查看";
			this.postData.vehicleId = this.$route.query.vehicleId;
		}
		this.EVT_search();
	},
	methods: {
		//搜索按钮
		EVT_search(i) {
			if (i) {
                this.postData.startTime = i.time.start;
				this.postData.endTime = i.time.end;;
			} 
			this.postData.page = "1";
			this.DATA_tbProps.page.sync = 1;
			this.ajax_getInfo(this.postData);
		},
		//other获取单个信息
		ajax_getInfo(data) {
			let _this = this;
			this.loading = true;
			_mm
				.request({
					url: "/tf/tf_status_detail.json",
					data: data
				})
				.then(
					res => {
						if (res.results.length === 0) {
							_this.DATA_tbProps.items = [];
							_this.DATA_tbProps.page.total = 0;
							_this.loading = false;
							return;
						}
						_this.fn_TBList(res); //渲染表格
						_this.loading = false;
					},
					function(err) {
						console.log(err);
						_this.loading = false;
					}
				);
		},
		//渲染表格所需数据
		fn_TBList(res) {
			let _this = this;
			let arr = [];
			// res.results.forEach((el, index) => {
			// 	arr.push({
			// 		k1: el.vehicleLicence,
			// 		k2: el.stopTimes,
			// 		k3: el.startTime,
			// 		k4: el.endTime,
			// 		k5: el.poiName,
			// 		k6: el.online === "1" ? "怠速停车" : "熄火停车"
			// 	});
			// });
			_this.DATA_tbProps.page.total = res.totalCount;
			_this.DATA_tbProps.items = res.results;
		},
		//分页点击
		GET_page(i) {
			this.postData.page = i;
			this.DATA_tbProps.page.sync = i;
			this.ajax_getInfo(this.postData);
		},
	}
};
</script>

<style scoped>
.hbody > .cnt {
	border: 1px solid #dae0e6;
}
.dTble {
	position: relative;
}
.schCnt-expall {
	position: absolute;
	right: 0;
	top: 0;
}
</style>
