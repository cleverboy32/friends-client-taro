import type { UserConfigExport } from '@tarojs/cli';

export default {
    weapp: {
        module: {
            postcss: {
                autoprefixer: {
                    enable: true,
                },
                // 小程序端样式引用本地资源内联配置
                url: {
                    enable: true,
                    config: {
                        limit: 10240, // 文件大小限制
                    },
                },
            },
        },
    },
    mini: {},
    h5: {},
} as UserConfigExport<'webpack5'>;
