/** @type {import('tailwindcss').Config} */
module.exports = {
    // 这里给出了一份 taro 通用示例，具体要根据你自己项目的目录结构进行配置
    // 比如你使用 vue3 项目，你就需要把 vue 这个格式也包括进来
    // 不在 content glob 表达式中包括的文件，在里面编写 tailwindcss class，是不会生成对应的 css 工具类的
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    // 其他配置项 ...
    corePlugins: {
      // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发多端，你应该使用 process.env.TARO_ENV 环境变量来控制它
      preflight: false,
      container: false,
    },
    theme: {
      extend: {
        colors: {
          // 自定义主题色：抹茶绿系列
          theme: '#b5caa0',
          'theme-light': '#e6eede', // --color-bg-theme
          'theme-dark': '#6a8463', // --color-dark-theme
          'theme-muted': '#e0e7d4', // --color-light-bg-theme

          // 主色：柠檬黄系列
          primary: '#ffd166', // --color-primary
          secondary: '#fff4d6', // --color-secondary
          'primary-dark': '#f9c835', // --color-dark-primary (rgb(249, 200, 53))
          'primary-light': 'rgba(253, 245, 206, 0.2)', // --color-light-primary

          // 兼容旧命名（项目里有时写成 dark-primary / light-primary）
          'dark-primary': '#f9c835',
          'light-primary': 'rgba(253, 245, 206, 0.2)',
        },
      },
    },
    
    plugins: [],
  }