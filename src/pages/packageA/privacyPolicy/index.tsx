import { View, Text, ScrollView } from '@tarojs/components'
import Layout from '@/components/Layout'

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <ScrollView scrollY className="h-full  bg-gray-100">
        <View className="bg-white p-6 rounded-lg shadow-md">
          <View className="text-center mb-6">
            <Text className="text-2xl font-bold">搭子小程序隐私政策</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-4">更新日期：2026年1月30日</Text>
          <Text className="text-sm text-gray-500 mb-6">生效日期：2026年1月30日</Text>

          <Text className="text-lg font-semibold mb-3">引言</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            “搭子”小程序（以下简称“本平台”）深知个人信息对您的重要性，并会尽力保护您的个人信息安全。本隐私政策旨在说明本平台如何收集、使用、存储和保护您的个人信息，以及您如何管理您的个人信息。请您在使用本平台服务前仔细阅读并理解本隐私政策，以便您了解我们处理您个人信息的做法。
          </View>

          <Text className="text-lg font-semibold mb-3">一、我们如何收集和使用您的个人信息</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            为向您提供服务，本平台会根据您所使用的具体服务，收集您的以下个人信息：
            <Text className="block mt-2">1. <Text className="font-medium">注册信息：</Text> 当您注册本平台账号时，我们可能需要您提供手机号码、昵称、头像等信息。</Text>
            <Text className="block mt-2">2. <Text className="font-medium">身份验证信息：</Text> 为满足相关法律法规要求，在您使用某些功能时，可能需要您提供真实身份信息（如姓名、身份证号）。</Text>
            <Text className="block mt-2">3. <Text className="font-medium">位置信息：</Text> 当您使用基于地理位置的服务时（如发布活动、查找附近搭子），我们可能会收集您的地理位置信息。您有权拒绝提供，但这可能导致您无法使用相关服务。</Text>
            <Text className="block mt-2">4. <Text className="font-medium">活动信息：</Text> 您在本平台发布、参与或浏览的活动信息，包括活动类型、时间、地点、描述等。</Text>
            <Text className="block mt-2">5. <Text className="font-medium">通讯信息：</Text> 您在使用本平台即时通讯功能时，我们会记录您的聊天内容。</Text>
            <Text className="block mt-2">6. <Text className="font-medium">设备信息：</Text> 我们可能会收集您使用本平台时的设备信息，包括设备型号、操作系统版本、唯一设备标识符、IP地址等。</Text>
            <Text className="block mt-2">7. <Text className="font-medium">日志信息：</Text> 当您使用我们的服务时，我们会自动收集您对我们服务的详细使用情况，作为网络日志保存。包括您的IP地址、浏览器的类型和版本、访问日期和时间、浏览记录等。</Text>
          </View>

          <Text className="text-lg font-semibold mb-3">二、我们如何使用Cookie和同类技术</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            本平台可能会使用Cookie和同类技术来提升您的用户体验，例如记住您的偏好设置、分析服务使用情况等。
          </View>

          <Text className="text-lg font-semibold mb-3">三、我们如何存储您的个人信息</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            我们会在中华人民共和国境内运营中收集和产生的个人信息存储在中华人民共和国境内。我们承诺，除非法律法规另有规定，我们仅在为实现本隐私政策目的所必需的最短时间内保存您的个人信息。
          </View>

          <Text className="text-lg font-semibold mb-3">四、我们如何共享、转让、公开披露您的个人信息</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            1. <Text className="font-medium">共享：</Text> 我们不会向第三方共享您的个人信息，除非获得您的明确同意，或根据法律法规的要求进行共享。
            2. <Text className="font-medium">转让：</Text> 在涉及合并、分立、解散、被宣告破产等原因需要转让个人信息时，我们会向您告知有关情况，并要求新的个人信息处理者继续受本隐私政策的约束。
            3. <Text className="font-medium">公开披露：</Text> 我们仅会在法律法规要求或取得您明确同意的情况下，公开披露您的个人信息。
          </View>

          <Text className="text-lg font-semibold mb-3">五、您如何管理您的个人信息</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            您有权访问、修改、更正、删除您的个人信息，也有权撤回已同意的授权。您可以通过本平台提供的功能或联系客服进行操作。
          </View>

          <Text className="text-lg font-semibold mb-3">六、本隐私政策如何更新</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            本隐私政策可能会不时更新，我们会通过本平台发布更新版本。您有义务定期查看本隐私政策，以了解任何修订。若您在本隐私政策更新后继续使用我们的服务，即表示您同意接受更新后的隐私政策。
          </View>

          <Text className="text-lg font-semibold mb-3">七、联系我们</Text>
          <View className="text-base text-gray-700 leading-relaxed mb-4">
            如果您对本隐私政策有任何疑问、意见或建议，请通过 [1430544537@qq.com] 与我们联系。
          </View>
        </View>
      </ScrollView>
    </Layout>
  )
}

export default PrivacyPolicyPage
