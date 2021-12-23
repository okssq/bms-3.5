import VueRouter from "vue-router";

const router = new VueRouter({
  routes: [
    { path: '*', redirect: '/gps-position' },
    { path: '/login', component: () => import("page/login/index.vue") },
    { path: '/no-power', component: () => import("page/err/noPower.vue") },
    { path: '/big-screen', component: () => import("page/bigScreen/index.vue") },
    {
      path: "/", component: () => import("page/layout/index.vue"),
      children: [
        { path: '/', redirect: '/gps-position' },

        //定位轨迹
        {
          path: "/gps-position", component: () => import("page/gps/position/main.vue"),
          meta: {
            crumb: [
              { name: '定位轨迹', path: '' },
              { name: '车辆定位', path: '' }
            ],
            nav: "gps-position",
          }
        },
        {
          path: "gps-trajectory", component: () => import("page/gps/trajectory/main.vue"),
          meta: {
            crumb: [
              { name: '定位轨迹', path: '' },
              { name: '车辆轨迹', path: '' }
            ],
            nav: "gps-trajectory",
          }
        },
        {
          path: "gps-smartMap", component: () => import("page/gps/smartMap/main.vue"),
          meta: {
            crumb: [
              { name: '定位轨迹', path: '' },
              { name: '智能地图', path: '' }
            ],
            nav: "gps-smartMap",
          }
        },
        //报警中心
        {
          path: "alarm-driver", component: () => import("page/alarmCenter/driver.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '司机报警' }
            ],
            nav: "alarm-driver",
          }
        },
        {
          path: "alarm-safeEvent", component: () => import("page/alarmCenter/safeEvent.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '安全事件查询' }
            ],
            nav: "alarm-safeEvent",
          }
        },
        {
          path: "alarm-vehicle", component: () => import("page/alarmCenter/vehicle.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '车辆报警' }
            ],
            nav: "alarm-vehicle",
          }
        },
        {
          path: "abnormal-event", component: () => import("page/alarmCenter/abnormal/event.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '异常事件报表' }
            ],
            nav: "abnormal-event",
          }
        },
        {
          path: "abnormal-timber", component: () => import("page/alarmCenter/abnormal/timber.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '异常配材报表' }
            ],
            nav: "abnormal-timber",
          }
        },
        {
          path: "abnormal-vehicle", component: () => import("page/alarmCenter/abnormal/vehicle.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: '异常离线报表' }
            ],
            nav: "abnormal-vehicle",
          }
        },
        {
          path: "alarm-tcard", component: () => import("page/alarmCenter/tf/index.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: 'TF卡状态报表' }
            ],
            nav: "alarm-tcard",
          }
        },
        {
          path: "alarm-tcard/detail", component: () => import("page/alarmCenter/tf/detail.vue"),
          meta: {
            crumb: [
              { name: '报警中心', path: '' },
              { name: 'TF卡状态报表' ,path:'/alarm-tcard'},
              { name: '详情' }
            ],
            nav: "alarm-tcard",
          }
        },
        // 视频监控
        {
          path: "video-live", component: () => import("page/video/live.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '实时视频' }
            ],
            nav: "video-live",
          }
        },
        {
          path: "video-three", component: () => import("page/video/three.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '三路视频' }
            ],
            nav: "video-three",
          }
        },
        {
          path: "video-playBack", component: () => import("page/video/playBack.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '回放视频' }
            ],
            nav: "video-playBack",
          }
        },
        {
          path: "video-smartPlay", component: () => import("page/video/smartPlay.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '智能轮播' }
            ],
            nav: "video-smartPlay",
          }
        },
        {
          path: "video-beidou", component: () => import("page/video/beidou.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '北斗视频' }
            ],
            nav: "video-beidou",
          }
        },
        {
          path: "video-smartCheck", component: () => import("page/video/smartCheck.vue"),
          meta: {
            crumb: [
              { name: '视频监控', path: '' },
              { name: '智能巡检' }
            ],
            nav: "video-smartCheck",
          }
        },

        // 数据中心
        {
          path: "ranking-high-alarm", component: () => import("page/dataCenter/ranking/alarm.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '高危报警排行榜' }
            ],
            nav: "ranking-high-alarm",
          }
        },
        {
          path: "ranking-high-driver", component: () => import("page/dataCenter/ranking/driver.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '高危司机排行榜' }
            ],
            nav: "ranking-high-driver",
          }
        },
        {
          path: "ranking-high-vehicle", component: () => import("page/dataCenter/ranking/vehicle.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '高危车辆排行榜' }
            ],
            nav: "ranking-high-vehicle",
          }
        },
        {
          path: "statistics-mileage", component: () => import("page/dataCenter/statistics/mileage.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '里程统计' }
            ],
            nav: "statistics-mileage",
          }
        },
        {
          path: "statistics-mileage/detail", component: () => import("page/dataCenter/statistics/mileage-detail.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '里程统计', path: '/statistics-mileage' },
              { name: '详情' }
            ],
            nav: "statistics-mileage",
          }
        },
        {
          path: "statistics-overspeed", component: () => import("page/dataCenter/statistics/overspeed.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '超速统计' }
            ],
            nav: "statistics-overspeed",
          }
        },
        {
          path: "statistics-overspeed/detail", component: () => import("page/dataCenter/statistics/overspeed-detail.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '超速统计', path: '/statistics-overspeed' },
              { name: '详情' }
            ],
            nav: "statistics-overspeed",
          }
        },
        {
          path: "statistics-parking", component: () => import("page/dataCenter/statistics/parking.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '停车统计' }
            ],
            nav: "statistics-parking",
          }
        },
        {
          path: "statistics-parking/detail", component: () => import("page/dataCenter/statistics/parking-detail.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '停车统计', path: '/statistics-parking' },
              { name: '详情' }
            ],
            nav: "statistics-parking",
          }
        },
        {
          path: "/statistics-alarm", component: () => import("page/dataCenter/alarmHours.vue"),
          meta: {
            crumb: [
              { name: '数据中心', path: '' },
              { name: '报警时段分析' }
            ],
            nav: "statistics-alarm",
          }
        },
        
        
        {
          path: "home", component: () => import("page/dataCenter/home.vue"),
          meta: {
            nav: "home",
          }
        },

        // 管理工具
        {
          path: "tool-driver", component: () => import("page/tool/driver/driver.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '司机管理' }
            ],
            nav: "tool-driver",
          },
        },
        {
          path: "tool-driver/detail", component: () => import("page/tool/driver/detail.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '司机管理',path:'/tool-driver' },
              { name: '详情' }
            ],
            nav: "tool-driver",
          }
        },
        {
          path: "tool-fence", component: () => import("page/tool/fence/fence.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '围栏管理' }
            ],
            nav: "tool-fence",
          }
        },
        {
          path: "tool-fence/region", component: () => import("page/tool/fence/region.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '围栏管理',path:'/tool-fence' },
              { name: '区域围栏' }
            ],
            nav: "tool-fence",
          }
        },
        {
          path: "tool-fence/map", component: () => import("page/tool/fence/map.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '围栏管理',path:'/tool-fence' },
              { name: '点围栏' }
            ],
            nav: "tool-fence",
          }
        },
        {
          path: "tool-terminal", component: () => import("page/tool/terminal/terminal.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '终端管理' }
            ],
            nav: "tool-terminal",
          }
        },
        {
          path: "tool-terminal/detail", component: () => import("page/tool/terminal/detail.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '终端管理',path: '/tool-terminal' },
              { name: '详情', path: '' }
            ],
            nav: "tool-terminal",
          }
        },
        {
          path: "tool-vehicle", component: () => import("page/tool/vehicle/vehicle.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '车辆管理' }
            ],
            nav: "tool-vehicle",

          },
          children: [
            {
              path: '/tool-vehicle/ai-setting', component: () => import("page/tool/aiSetting/index.vue"),
              meta: {
                crumb: [
                  { name: '管理工具', path: '' },
                  { name: '车辆管理', path:'/tool-vehicle' },
                  { name: 'AI设置' }
                ],
                nav: "/tool-vehicle/AIsetting",
              },
            }
          ]
        },
        {
          path: "/tool-vehicle/detail", component: () => import("page/tool/vehicle/detail.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: '车辆管理', path:'/tool-vehicle' },
              { name: '详情' }
            ],
            nav: "tool-vehicle",
          }
        },
        {
          path: "/tool-sim", component: () => import("page/tool/sim/main.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: 'SIM卡管理' }
            ],
            nav: "tool-sim",
          },
        },
        {
          path: "/tool-AiSetting",
          component: () => import("page/tool/aiSetting/index.vue"),
          meta: {
            crumb: [
              { name: '管理工具', path: '' },
              { name: 'AI报警设置' }
            ],
            nav: "tool-AiSetting",
          }
        },
        // 权限管理
        {
          path: "power-user", component: () => import("page/power/user/user.vue"),
          meta: {
            crumb: [
              { name: '权限管理', path: '' },
              { name: '用户权限管理' }
            ],
            nav: "power-user",
          }
        },
        {
          path: "power-user/detail", component: () => import("page/power/user/detail.vue"),
          meta: {
            crumb: [
              { name: '权限管理', path: '' },
              { name: '用户权限管理',path:"/power-user" },
              { name: '详情',path:''}
            ],
            nav: "power-user",
          }
        },
        {
          path: "power-company", component: () => import("page/power/company/index.vue"),
          meta: {
            crumb: [
              { name: '权限管理', path: '' },
              { name: '子公司权限管理' }
            ],
            nav: "power-company"
          }
        },
        {
          path: "power-role", component: () => import("page/power/role/index.vue"),
          meta: {
            crumb: [
              { name: '权限管理', path: '' },
              { name: '角色管理' }
            ],
            nav: "power-role",
          }
        },
        {
          path: "power-menu", component: () => import("page/power/menu/index.vue"),
          meta: {
            crumb: [
              { name: '权限管理', path: '' },
              { name: '菜单管理' }
            ],
            nav: "power-menu",
          }
        },
        // 系统中心
        {
          path: "system-notice", component: () => import("page/system/notice/index.vue"),
          meta: {
            crumb: [
              { name: '系统中心', path: '' },
              { name: '公告管理' }
            ],
            nav: "system-notice",
          }
        },
        {
          path: "/login-log", component: () => import("page/system/login-log"),
          meta: {
            crumb: [
              { name: '系统中心', path: '' },
              { name: '登陆日志' }
            ],
            nav: "login-log",
          }
        },
      ]
    }
  ]
});

export default router;
