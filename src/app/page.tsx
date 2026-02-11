import Link from 'next/link'

const sections = [
  {
    title: '人工智能论文',
    description: '每日更新全球顶级 AI 论文，涵盖机器学习、计算机视觉、自然语言处理等领域',
    href: '/papers',
    icon: '📄',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    title: '公司动态',
    description: '追踪全球 AI 公司最新动态，包括融资、产品发布、战略合作等资讯',
    href: '/companies',
    icon: '🏢',
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    title: '行业新闻',
    description: '汇集 AI 行业重要新闻，政策法规、技术突破、市场趋势一网打尽',
    href: '/news',
    icon: '📰',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            全球人工智能资讯聚合平台
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            每日更新 AI 领域最新论文、公司动态和行业新闻，助您快速了解人工智能世界
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/papers"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              浏览论文
            </Link>
            <Link
              href="/companies"
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              查看动态
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">三大栏目</h2>
            <p className="text-gray-600">全面覆盖 AI 领域各类资讯</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`${section.color} border rounded-2xl p-6 hover:shadow-lg transition-shadow`}
              >
                <div className={`${section.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {section.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-gray-900">
                  进入栏目
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">论文收录</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">公司动态</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">2000+</div>
              <div className="text-gray-600">行业新闻</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">每日</div>
              <div className="text-gray-600">内容更新</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            开始探索 AI 世界
          </h2>
          <p className="text-gray-600 mb-8">
            注册登录后可收藏感兴趣的内容，打造您的专属 AI 资讯库
          </p>
        </div>
      </section>
    </div>
  )
}
