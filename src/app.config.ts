export default defineAppConfig({
    pages: [
        'pages/person/index',
        'pages/discover/index',
        'pages/login/index',
        'pages/notifications/index',
    ],
    subPackages: [
        {
            root: 'pages/packageA',
            pages: [
                'PostActivity/index',
                'activityDetail/index',
                'MapLocation/index',
            ],
        },
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
    requiredPrivateInfos: ['getLocation', 'chooseLocation'],
    requiredBackgroundModes: ['location'],
});
