export default defineAppConfig({
    pages: [
        'pages/PostActivity/index',
        'pages/MapLocation/index',
        'pages/person/index',
        'pages/login/index',
        'pages/notifications/index',
        'pages/discover/index',
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black',
    },
    permission: {
        'scope.userLocation': {
            desc: '你的位置信息将用于活动地址定位的效果展示',
        },
    },
    requiredBackgroundModes: ['location'],
});
