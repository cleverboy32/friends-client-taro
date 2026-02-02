export default defineAppConfig({
    pages: ['pages/login/index', 'pages/discover/index', 'pages/person/index'],
    subPackages: [
        {
            root: 'pages/packageA',
            pages: [
                'PostActivity/index',
                'activityDetail/index',
                'MapLocation/index',
                'serviceAgreement/index',
                'privacyPolicy/index',
            ],
        },
        {
            root: 'pages/packageB',
            pages: ['notifications/index', 'message/index'],
        },
    ],
    window: {
        backgroundTextStyle: 'light',
        backgroundColor: '#cadcae',
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
