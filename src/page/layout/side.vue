<template>
    <nav :class="fullNav ? 'bigNav' : 'smallNav'" :style="{'z-index':(zIndexTop==='nav'?101:100)}">
        <div class="xz-logo">
            <div :class="fullNav ? 'bWebLogo' : 'sWebLogo'" ></div>
            <div :class="fullNav ? 'bWebName' : 'sWebName'" v-show="fullNav"></div>
            <!-- <div :class="fullNav ? 'bWebLogo' : 'sWebLogo'" v-show="fullNav"></div>
            <div :class="fullNav ? 'bWebName' : 'sWebName'" v-show="fullNav"></div> -->
            <!-- <el-popover
                placement="right-start" 
                width="200" 
                trigger="click" 
                v-model="visible"
            >
				<p class="tip">您确定切换到新系统吗？</p>
				<div style="text-align: right; margin: 0">
					<el-button size="mini" type="text" @click="visible = false">取消</el-button>
					<el-button type="primary" size="mini" @click="change_system">确定</el-button>
				</div>
				<div 
                    class="change-sys" 
                    slot="reference"  
                    :class="fullNav ? 'change-sys-big' : 'change-sys-small'"
                >
					<i class="el-icon-sort" title="点击返回旧版"></i>
				</div>
			</el-popover> -->
        </div>
        <div class="xz-navs" :class="{'over-auto':fullNav}">
            <div
                v-for="(pnav,index) in navs"
                :class="[fullNav ? 'big-parent-item' : 'small-parent-item',{'expand':pnav.expand,'active':pnav.active}]"
                :key="index"
            >
                <div
                    class ="parent-title"
                    :class="fullNav ? 'big-parent-title' : 'small-parent-title'"
                    @click="big_parent_click(pnav,index)"
                    @mouseleave="small_parent_leave"
                >
                    <i
                        class="icon-nav"
                        :class="pnav.label | icon"
                        @mouseenter="small_parent_enter(pnav)"
                    />
                    <span v-show="fullNav">{{pnav.label}}</span>
                    <i  v-show="fullNav" class="el-icon-arrow-down" />
                </div>
                <div
                    :class="fullNav ? 'big-children-cnt' : 'small-children-cnt'"
                    :style="{ 
                        height: fullNav ? (pnav.expand  ? 52*pnav.children.length+'px' : 0 ) : ((40*pnav.children.length+10)+'px')  ,
                        opacity:fullNav ? (pnav.expand  ? 1 : 0 ) : (pnav.show ? 1 :0) 
                    }"
                    v-show="fullNav || (!fullNav&&pnav.show)"
                    @mouseenter="small_cnt_enter()"
                    @mouseleave="small_cnt_leave"
                >
                    <!-- v-show="fullNav || (!fullNav&&pnav.show)"
                    opacity:fullNav ? (pnav.expand  ? 1 : 0 ) : (pnav.show ? 1 :0)-->
                    <template v-for="(cnav,ind) in pnav.children">
                        <div
                            :key="ind"
                            :class="[fullNav ? 'big-children-item' : 'small-children-item',{active:cnav.active}]"
                            @click="evt_router_click(cnav)"
                        >{{cnav.label}}</div>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import Server from "service/mm.jsx";
const _mm = new Server();

export default {
    data() {
        return {
            visible:false,
            cnav_isShow: false,
            navs: [],
            timer_nav: 0
        };
    },
    computed: {
        nowRouter() {
            return "/" + this.$route.meta.nav;
        },
        zIndexTop() {
            return this.$store.state.zIndexTop;
        },

        fullNav() {
            return this.$store.state.fullNav;
        }
    },
    created() {
        this.ajax_load();
    },
    watch:{
        nowRouter(){
            // console.log('执行了路由改变');
            // 大导航时点击
            if (this.fullNav) {
                this.navs.forEach(el => {
                    el.show = false;
                    el.active = false;
                    el.children.forEach(_el => {
                        if (_el.to === this.nowRouter) {
                            _el.active = true;
                            el.active = true;
                        } else {
                            _el.active = false;
                        }
                    });
                });
                // // 需要缩进
                // if (item.navStyle === "indent") {
                //     this.$store.commit("update_fullNav", false);
                // }
            }
            // 小导航时点击
            else {
                this.navs.forEach(el => {
                    el.show = false;
                    el.expand = false;
                    el.active = false;
                    el.children.forEach(_el => {
                        if (_el.to === this.nowRouter) {
                            _el.active = true;
                            el.expand = true;
                            el.active = true;
                        } else {
                            _el.active = false;
                        }
                    });
                });
            }
        }
    },
    filters: {
        icon: function(value) {
            switch (value) {
                case "定位轨迹":
                    return "el-icon-location-outline";
                    break;
                case "报警中心":
                    return "el-icon-bell";
                    break;
                case "视频监控":
                    return "el-icon-video-camera";
                    break;
                case "数据中心":
                    return "el-icon-data-analysis";
                    break;
                case "管理工具":
                    return "el-icon-set-up";
                    break;
                case "权限管理":
                    return "el-icon-lock";
                    break;
                case "系统中心":
                    return "el-icon-setting";
                    break;
                default:
                    return "el-icon-more-outline";
            }
        }
    },
    methods: {
        change_system(){
            location.href = "http://web.idas168.com/#/smart-map";
        },
        // 请求导航栏列表
        ajax_load() {
            let _this = this;
            _mm.request({
                url: "/menu/user_menu_level.json",
                async: true
            }).then(res => {
                this.fn_init_router(res);
            });
        },
        // 渲染当前导航
        fn_init_router(res) {
            res.forEach(el => {
                el.expand = false;
                el.active = false;
                el.show = false;
                if (el.children.length > 0) {
                    el.children.forEach(_el => {
                        if (_el.to === this.nowRouter) {
                            _el.active = true;
                            el.expand = true;
                            el.active = true;
                        } else {
                            _el.active = false;
                        }
                        if (_el.navStyle === "indent") {
                            this.$store.commit("update_fullNav", false);
                        }
                    });
                }
            });
            this.navs = res;
        },

        //一级导航鼠标点击
        big_parent_click(item, index) {
            if (item.expand) {
                item.expand = !item.expand;
                return;
            }
            if (this.fullNav) {
                this.navs.forEach((_el, _index) => {
                    if (index === _index) {
                        _el.expand = true;
                    } else {
                        _el.expand = false;
                    }
                });
            }
        },
        //二级导航鼠标点击
        evt_router_click(item) {
            // console.log("item", item);
            // console.log("执行了二级导航点击-this.fullNav", this.fullNav);
            if (item.to === this.nowRouter) {
                return;
            }
            this.$router.push({ path: item.to });
            if (this.fullNav) {
                // 需要缩进
                if (item.navStyle === "indent") {
                    this.$store.commit("update_fullNav", false);
                }
            }
        },

        //一级导航移入
        small_parent_enter(item) {
            if (!this.fullNav) {
                if (this.timer_nav) {
                    window.clearTimeout(this.timer_nav);
                }
                this.navs.forEach(el => {
                    el.show = false;
                });
                item.show = true;
                // console.log("itemmmm", item);
            }
        },
        //一级导航移除
        small_parent_leave() {
            let _this = this;
            window.clearTimeout(this.timer_nav);
            this.timer_nav = setTimeout(() => {
                if (!_this.fullNav) {
                    _this.navs.forEach(el => {
                        el.show = false;
                    });
                }
            }, 400);
        },

        small_cnt_enter() {
            window.clearTimeout(this.timer_nav);
        },

        small_cnt_leave() {
            this.small_parent_leave();
        },

        //小切大需要设置expand
        fn_expand() {
            if (this.timer_nav) {
                window.clearTimeout(this.timer_nav);
            }
            this.navs.forEach(el => {
                el.show = false;
                el.expand = false;
                if (el.active) {
                    el.expand = true;
                }
            });
        },
        //大切小需要隐藏show
        fn_showClose() {
            if (this.timer_nav) {
                window.clearTimeout(this.timer_nav);
            }
            this.navs.forEach(el => {
                el.show = false;
            });
        }
    }
};
</script>

<style scoped>
.xz-logo{
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #101117;
}
/* nav公共样式 */
nav {
    position: fixed;
    left: 0;
    top: 0;
    background-color: #1d1e23;
    width: 220px;
    height: 100%;
    display: flex;
    flex-direction: column;
    z-index: 101;
    
}
.bigNav{
    transition: all .4s ease-in-out;
}
.smallNav {
    width: 50px;
    transition: all .2s ease-in-out;
}
.xz-logo {
    width: 100%;
    height: 50px;
    color: #fff;
    border-bottom: 1px solid #101117;
}
.xz-navs {
    flex: 1;
    color: hsla(0, 0%, 100%, 0.7);
    font-size: 14px;
}
.xz-navs.over-auto {
    overflow: auto;
}
.xz-navs::-webkit-scrollbar {
    width: 0;
}

.big-parent-item {
    position: relative;
    cursor: pointer;
    z-index: 1;
    overflow: hidden;
}
.big-parent-title {
    height: 52px;
    padding: 14px 18px 14px 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: color 0.3s;
}

.big-parent-item.active .big-parent-title {
    color: #fff;
    font-weight: bold;
}
.big-parent-title:hover {
    color: #fff;
}

.big-parent-title > .icon-nav {
    font-size: 16px;
    margin-left: 6px;
    margin-right: 12px;
    width: 14px;
    height: 24px;
    line-height: 24px;
    font-weight: 500;
}
.big-parent-title > span {
    width: 126px;
    overflow: hidden;
    white-space: nowrap;
    height: 100%;
    line-height: 24px;
}
.big-parent-item .el-icon-arrow-down {
    width: 12px;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s;
}
.big-parent-item.expand .el-icon-arrow-down {
    transform: rotate(-180deg);
}
.big-children-item {
    height: 52px;
    padding: 14px 24px 14px 43px;
    transition: color 0.3s;
    overflow: hidden;
    white-space: nowrap;
}
.big-children-item.active {
    background-color: rgba(63, 64, 69, 0.75);
}
.big-children-item.active,
.big-children-item:hover {
    color: #fff;
}
.big-children-cnt {
    transition: all 0.3s ease-in-out;
    overflow: hidden;
}

.small-parent-item {
    width: 100%;
    position: relative;
}
.small-parent-title {
    position: relative;
}
.small-parent-item.active .small-parent-title::after {
    position: absolute;
    content: "";
    border: 5px solid transparent;
    border-right-color: #fff;
    right: 0;
    top: 20px;
}
.small-parent-title > i:first-of-type {
    font-size: 20px;
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    cursor: pointer;
}
.small-parent-item.active .small-parent-title > i,
.small-parent-title:hover > i {
    color: #fff;
}

.small-parent-title span {
    display: none;
}
.small-children-cnt {
    position: absolute;
    left: 56px;
    top: 0px;
    background-color: #1d1e23;
    width: max-content;
    border-radius: 4px;
    padding: 5px 0;
}

.small-children-item {
    width: 160px;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    cursor: pointer;
    transition: color 0.3s;
}
.small-children-item:hover {
    color: #fff;
}
.small-children-item.active {
    /* font-weight: bold; */
    color: #409eff;
}


.change-sys{
    text-align: center;
    outline: none;
    border: none;
    line-height: 50px;
    height: 50px;
}
.change-sys-small{
    width: 50px;
}
.change-sys-small .el-icon-sort{
    transform: rotate(90deg);
    font-size: 16px;
    color: #fff;
    cursor: pointer;
}
.tip{
    color: #000000;
	font-weight: bold;
}
.change-sys-big{
    width: 40px; 
}
.change-sys-big .el-icon-sort{
    transform: rotate(90deg);
    font-size: 14px;
    color: #fff;
    cursor: pointer;
}				
</style>
