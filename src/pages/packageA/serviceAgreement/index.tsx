import { View, Text, ScrollView } from '@tarojs/components'
import Layout from '@/components/Layout'

const ServiceAgreementPage = () => {
  return (
    <Layout>
      <ScrollView scrollY className="h-full bg-gray-100">
        <View className="bg-white p-6 rounded-lg shadow-md">
          <View className="text-center mb-6">
            <Text className="text-2xl font-bold">搭子小程序服务协议</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-4">更新日期：2026年1月30日</Text>
          <Text className="text-sm text-gray-500 mb-6">生效日期：2026年1月30日</Text>

          <Text className="text-lg font-semibold mb-3">引言</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            欢迎您使用“搭子”小程序（以下简称“本平台”）。本平台致力于为用户提供一个寻找共同兴趣和活动伙伴的社交平台。为明确您（以下简称“用户”）与本平台之间的权利与义务，请您在注册和使用前，务必仔细阅读并充分理解本《服务协议》（以下简称“本协议”）的各条款内容。当您按照注册页面提示填写信息、阅读并同意本协议且完成全部注册程序后，即表示您已充分阅读、理解并接受本协议的全部内容，并与本平台达成一致，成为本平台“用户”。
          </View>

          <Text className="text-lg font-semibold mb-3">一、服务描述</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            1. 本平台为用户提供发布、浏览“搭子”信息、在线匹配、即时通讯等功能，旨在促进用户之间基于共同兴趣的线下或线上活动。
            2. 本平台保留因业务发展需要，对服务的部分或全部功能进行变更、升级、修改或终止的权利，并将以公告等形式通知用户。
          </View>

          <Text className="text-lg font-semibold mb-3">二、用户行为规范</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            1. 用户在注册时应提供真实、准确、完整、合法的个人资料，并及时更新。
            2. 用户应对其账户下的所有活动和言论负完全责任。
            3. 用户不得在本平台发布任何违法、违规、淫秽色情、暴力、歧视、骚扰或侵犯他人合法权益（包括但不限于名誉权、肖像权、知识产权、隐私权）的内容。
            4. 用户不得利用本平台从事任何形式的商业广告活动或非法交易。
            5. 若用户违反上述规定，本平台有权独立判断并采取暂停或关闭用户账号、删除相关信息等措施，且无需承担任何责任。
          </View>
          
          <Text className="text-lg font-semibold mb-3">三、知识产权</Text>
           <View className="text-base text-gray-700 leading-relaxed mb-4">
            本平台提供的所有内容，包括但不限于文字、图标、图像、代码等，其知识产权均归本平台所有。未经本平台书面许可，任何人不得擅自使用、复制、修改、传播。
           </View>

          <Text className="text-lg font-semibold mb-3">四、隐私保护</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            保护用户个人信息是本平台的一项基本原则。本平台将按照法律法规以及《隐私政策》的规定收集、使用、储存和分享您的个人信息。本协议提及的隐私保护指引，是《隐私政策》的摘要和补充，如与《隐私政策》正文存在不一致，以《隐私政策》为准。
          </View>

          <Text className="text-lg font-semibold mb-3">五、免责声明</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            1. 用户通过本平台认识或接触到的其他用户，其所进行的任何线下或线上活动，均由用户自行承担风险，本平台不对此类活动产生的任何纠纷或损害承担责任。
            2. 本平台不保证服务一定能满足用户的要求，也不保证服务不会中断，对服务的及时性、安全性、准确性也都不作保证。
            3. 对于因不可抗力或本平台不能控制的原因造成的服务中断或其它缺陷，本平台不承担任何责任。
          </View>

          <Text className="text-lg font-semibold mb-3">六、协议的变更与终止</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            本平台有权根据需要不时地制订、修改本协议及/或各类规则，并以平台公示的方式进行公告，不再单独通知予您。变更后的协议和规则一经在平台公布后，立即自动生效。如您不同意相关变更，应当立即停止使用本平台服务。您继续使用本平台服务的，即表示您接受经修订的协议和规则。
          </View>
          
          <Text className="text-lg font-semibold mb-3">七、法律适用与争议解决</Text>
           <View className="text-base text-gray-700 leading-relaxed mb-4">
            本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，任何一方均可向本平台运营方所在地有管辖权的人民法院提起诉讼。
           </View>

          <Text className="text-lg font-semibold mb-3">八、联系我们</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            如果您对本协议有任何疑问，请通过 [您的联系邮箱或联系方式] 与我们联系。
          </View>
        </View>
      </ScrollView>
    </Layout>
  )
}

export default ServiceAgreementPage
