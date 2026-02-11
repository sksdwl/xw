'use client'

import { useEffect, useState } from 'react'
import { News } from '@/types'

const categories = [
  { value: 'all', label: '全部' },
  { value: 'POLICY', label: '政策法规' },
  { value: 'TECH', label: '技术突破' },
  { value: 'TREND', label: '行业趋势' },
  { value: 'MARKET', label: '市场动态' },
  { value: 'EVENT', label: '行业活动' },
]

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchNews()
  }, [category])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/news?category=${category}&search=${search}`)
      const data = await res.json()
      if (data.code === 0) {
        setNews(data.data.news)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNews()
  }

  const toggleFavorite = async (newsId: string, isFavorited: boolean) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'news',
          id: newsId,
          action: isFavorited ? 'remove' : 'add',
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setNews(news.map(n => 
          n.id === newsId ? { ...n, isFavorited: !isFavorited } : n
        ))
      } else if (data.code === 1) {
        alert('请先登录')
      }
    } catch {
      alert('操作失败')
    }
  }

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">行业新闻</h1>
        <p className="text-gray-600">汇集全球 AI 行业重要新闻资讯</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索新闻标题或内容..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            搜索
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无新闻数据
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {item.coverImage && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                    {item.title}
                  </a>
                </h3>
                {item.summary && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">来源: {item.source}</span>
                  <button
                    onClick={() => toggleFavorite(item.id, item.isFavorited || false)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.isFavorited
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={item.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
