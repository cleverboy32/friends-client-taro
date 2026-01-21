import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import useUserStore from '@/store/user';
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  const { getUserInfo } = useUserStore();
  
  useLaunch(async () => {
    await getUserInfo();
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}
  


export default App
