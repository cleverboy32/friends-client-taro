import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack';
import path from 'node:path';

import devConfig from './dev';
import prodConfig from './prod';

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
    const baseConfig: UserConfigExport<'webpack5'> = {
        projectName: 'friends-client',
        date: '2025-11-24',
        designWidth: 750,
        deviceRatio: {
            640: 2.34 / 2,
            750: 1,
            375: 2,
            828: 1.81 / 2,
        },
        sourceRoot: 'src',
        outputRoot: 'dist',
        plugins: ['@tarojs/plugin-generator'],
        defineConstants: {},
        framework: 'react',
        compiler: {
            type: 'webpack5',
        },
        url: {
            enable: false,
            config: {
                limit: 1, // 设定转换尺寸上限
            },
        },
        copy: {
            patterns: [
                // 🚀 添加此规则：直接从 src/static 复制到 dist/static
                {
                    from: 'src/static/',
                    to: 'dist/static/',
                },
                // 如果您还有其他需要复制的大文件，也按此格式添加
            ],
            options: {},
        },
        mini: {
            enableSourceMap: true, // 开启 source map
            webpackChain(chain, webpack) {
                chain.merge({
                    plugin: {
                        install: {
                            plugin: UnifiedWebpackPluginV5,
                            args: [
                                {
                                    appType: 'taro',
                                    rem2rpx: true,
                                    cssEntries: [
                                        require('path').resolve(__dirname, '../src/app.scss'),
                                    ],
                                },
                            ],
                        },
                    },
                });
            },
            postcss: {
                url: {
                    enable: true,
                    config: {
                        limit: 0, // 字体不转 base64
                    },
                },
            },
        },
        h5: {
            publicPath: '/',
            staticDirectory: 'static',

            esnextModules: ['taro-ui'],

            miniCssExtractPluginOption: {
                ignoreOrder: true,
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[name].[chunkhash].css',
            },
            postcss: {
                autoprefixer: {
                    enable: true,
                    config: {},
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]',
                    },
                },
            },
        },
        rn: {
            appName: 'taroDemo',
            postcss: {
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                },
            },
        },
        alias: {
            '@': path.resolve(__dirname, '../src'),
            '@/components': path.resolve(__dirname, '../src/components'),
            '@/pages': path.resolve(__dirname, '../src/pages'),
            '@/assets': path.resolve(__dirname, '../src/assets'),
            '@/types': path.resolve(__dirname, '../src/types'),
            '@/enum': path.resolve(__dirname, '../src/enum'),
            '@/store': path.resolve(__dirname, '../src/store'),
            '@/api': path.resolve(__dirname, '../src/api'),
            '@/utils': path.resolve(__dirname, '../src/utils'),
        },
    };

    if (process.env.NODE_ENV === 'development') {
        // 本地开发构建配置（不混淆压缩）
        return merge({}, baseConfig, devConfig);
    }
    // 生产构建配置（默认开启压缩混淆等）
    return merge({}, baseConfig, prodConfig);
});
