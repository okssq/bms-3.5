<template>
    <div class="schCnt">
        <div class="schCnt-list">
            <div class="schCnt-tble">
                <div class="table-des" v-if="props.des">
                    <span class="table-des-icon" ><i class="el-icon-question"></i>表单说明：</span><div class="table-des-text">{{props.des}}</div>
                </div>
                <el-table
                    :height="props.height"
                    stripe
                    header-row-class-name="tb-header"
                    :data="props.items"
                    v-loading="props.loading||false"
                    @selection-change="ent_check"
                    style="width: 100%"
                    :fit="true"
                    ref="table"
                >
                    <template v-for="tble in props.title">
                        <template v-if="tble.click">
                            <el-table-column
                                :key="tble.prop"
                                :prop="tble.prop"
                                :type="tble.type"
                                :label="tble.name"
                                :min-width="tble.width"
                                :fixed="tble.fixed"
                                
                            >
                                <template slot-scope="scope">
                                    <span
                                        :style="{cursor : 'pointer',color:'#3496f8','font-weight':'bolder'}"
                                        @click="aa(scope.row)"
                                    >{{scope.row[tble.prop]}}</span>
                                </template>
                            </el-table-column>
                        </template>
                        <template v-else>
                            <el-table-column
                                :key="tble.prop"
                                :prop="tble.prop"
                                :type="tble.type"
                                :label="tble.name"
                                :min-width="tble.width"
                                :fixed="tble.fixed"
                                :class="{center:tble.center}"
                            >
                            </el-table-column>
                        </template>
                    </template>
                    <el-table-column :width="200" label="操作" v-if="props.opeations">
                        <template slot-scope="scope">
                            <span
                                class="hover th-item-btn"
                                v-for="item in props.opeations"
                                :key="item.name"
                                @click="
                                        if(item.evt === 'showImg'){
                                            evt_img(scope.row,item);
                                        }else if(item.evt === 'edit'){
                                            evt_edit(scope.row,item);
                                        }else if(item.evt === 'remove'){
                                            evt_remove(scope.row,item);
                                        }else if(item.evt === 'seeEdit'){
                                            evt_seeEdit(scope.row,item);
                                        }
                                        else if(item.evt === 'custom'){
                                            item.fn();
                                        }
                                        else if(item.evt ==='AIsetting'){
                                            evt_AIsetting(scope.row,item)
                                        }
                                        else if(item.evt ==='unbind'){
                                            evt_unbind(scope.row)
                                        }
                                        else if(item.evt ==='resetTerminal'){
                                            evt_resetTerminal(scope.row)
                                        }
                                        else if(item.evt === 'selCars'){
                                            item.fn(scope.row);
                                        }
                                        else {
                                            evt_tbItem(scope.row,item)
                                        }
                                    "
                            >{{item.name}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="schCnt-pagination">
                
                <div class="schCnt-result" v-show="props.page.total">
                    <i class="el-icon-warning"></i>
                    共搜索到
                    <span> {{props.page.total}} </span>
                    条数据
                </div>
               
                <el-pagination
                    class="table_pagetion"
                    background
                    :page-size="props.page.size||10"
                    layout="prev,pager,next"
                    :current-page.sync="props.page.sync||1"
                    :total="props.page.total"
                    @current-change="evt_pageChange"
                    v-if="props.page.total?true:false"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
    props: ["props","bottom_totalShow"],
    data() {
        return {
            checks: []
        };
    },
    methods: {
        //选中
        ent_check(items) {
            // console.log('执行了我要看的这个items',items);
            let arr = [];
            items.forEach(function(el, index) {
                arr.push(el.set);
            });
            this.checks = arr;
            // if(items.length === 0)return;
            this.$emit("setTable", arr);
        },
        //显示图片
        evt_img(item, op) {
            _mm.imgAlert({
                imgSrc: item.set.imgsrc,
                videoSrc: item.set.videosrc
            });
        },
        //查看
        evt_seeEdit(item, op) {
            // console.log('item',item);
            let _query = item.set;
            _query.type = "view";
            // console.log('{path:op.path,query:_query}',{path:op.path,query:_query})
            this.$router.push({ path: op.path, query: _query });
        },
        //编辑
        evt_edit(item, op) {
            let _query = item.set;
            _query.type = "edit";
            this.$router.push({ path: op.path, query: _query });
        },
        //删除
        evt_remove(item, op) {
            let _this = this;
            if (
                this.$route.path === "/mng-user/user" &&
                item.set &&
                item.set.roleId &&
                item.set.roleId === "2"
            ) {
                _mm.msgErr("管理员角色不可删除");
                return;
            } else if (
                this.$route.path === "/mng-user/user" &&
                item.set &&
                item.set.roleId &&
                item.set.roleId === "1"
            ) {
                _mm.msgErr("超管角色不可删除");
                return;
            }
            _mm.confirmBox({
                info: "真的要删除吗？",
                callBOk: function() {
                    _this.$emit("delOne", item.set);
                }
            });
        },
        //设置
        evt_AIsetting(item, op) {
            this.$emit("AIsetting", item);
        },
        //解绑
        evt_unbind(item) {
            let _this = this;
            // console.log('item',item);
            this.$confirm(
                "你确定要对" +
                    '<span style="color:red">' +
                    item.k2 +
                    "</span>" +
                    "车辆解除绑定吗?",
                "操作确认",
                {
                    distinguishCancelAndClose: true,
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: "确定解绑",
                    cancelButtonText: "取消"
                }
            )
                .then(() => {
                    //点保存的操作
                    _this.$emit("unbind", item.k1);
                })
                .catch(action => {
                    //点放弃修改的操作
                    this.$message({
                        type: "info",
                        message:
                            action === "cancel"
                                ? "你没有解绑此车辆！"
                                : "你没有解绑此车辆！"
                    });
                });
        },
        //设备重启
        evt_resetTerminal(item) {
            let _this = this;
            // console.log('item',item);
            this.$confirm(
                "你确定要对车辆" +
                    '<span style="color:red">' +
                    "(" +
                    item.k1 +
                    ")" +
                    "</span>" +
                    "终端ID" +
                    '<span style="color:red">' +
                    "(" +
                    item.k1 +
                    ")" +
                    "</span>" +
                    "下发推送吗?",
                "操作确认",
                {
                    distinguishCancelAndClose: true,
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: "确定下发推送",
                    cancelButtonText: "取消"
                }
            )
                .then(() => {
                    //点保存的操作
                    _this.$emit("resetTerminal", item.set);
                })
                .catch(action => {
                    //点放弃修改的操作
                    this.$message({
                        type: "info",
                        message:
                            action === "cancel"
                                ? "你没有下发推送此终端！"
                                : "你没有下发推送此终端！"
                    });
                });
        },

        // 其他事件
        evt_tbItem(msg, item) {
            // console.log('msg',msg,'item',item);
            this.$emit("cb_" + item.evt, msg);
        },

        //分页改变
        evt_pageChange(i) {
            this.checks = [];
            this.$emit("setPage", i);
        },
        aa(data) {
            console.log("aaaa", data);
        }
    }
};
</script>

<style scoped>
.tbCheckTotal {
    padding: 0 15px;
    height: 30px;
    background-color: rgb(239, 247, 255);
    color: #95aabf;
    line-height: 30px;
    font-size: 13px;
    margin-top: 20px;
}
.tbCheckTotal > i.el-icon-info {
    color: rgba(52, 150, 248, 08);
    padding-right: 10px;
}
.tbCheckTotal > span {
    color: rgba(52, 150, 248, 08);
    font-size: 13px;
}
.schCnt-pagination{
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
}
.table_pagetion{
    flex: 1;
}
</style>
