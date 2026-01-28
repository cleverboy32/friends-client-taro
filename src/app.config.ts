export default defineAppConfig({
    pages: ['pages/discover/index', 'pages/login/index', 'pages/person/index'],
    subPackages: [
        {
            root: 'pages/packageA',
            pages: [
                'PostActivity/index',
                'activityDetail/index',
                'MapLocation/index',
            ],
        },
        {
            root: 'pages/packageB',
            pages: ['notifications/index', 'message/index'],
        },
    ],
    window: {
        backgroundTextStyle: 'light',
        backgroundColor: '#b5caa0',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black',
    },
    permission: {
        'scope.userLocation': {
            desc: '你的位置信息将用于活动地址定位的效果展示',
        },
    },
    requiredPrivateInfos: ['getLocation', 'chooseLocation'],
    requiredBackgroundModes: ['location'],
});
