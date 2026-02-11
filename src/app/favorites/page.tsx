'use client'

import { useEffect, useState } from 'react'
import { Paper, Company, News } from '@/types'

const tabs = [
  { value: 'paper', label: '论文' },
  { value: 'company', label: '公司动态' },
  { value: 'news', label: '行业新闻' },
]

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('paper')
  const [papers, setPapers] = useState<Paper[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [activeTab])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/favorites?type=${activeTab}`)
      const data = await res.json()
      if (data.code === 0) {
        if (activeTab === 'paper') setPapers(data.data)
        else if (activeTab === 'company') setCompanies(data.data)
        else if (activeTab === 'news') setNews(data.data)
      } else if (data.code === 1) {
        // 未登录
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (type: string, id: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action: 'remove' }),
      })
      const data = await res.json()
      if (data.code === 0) {
        if (type === 'paper') {
          setPapers(papers.filter(p => p.id !== id))
        } else if (type === 'company') {
          setCompanies(companies.filter(c => c.id !== id))
        } else if (type === 'news') {
          setNews(news.filter(n => n.id !== id))
        }
      }
    } catch {
      alert('操作失败')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的收藏</h1>
        <p className="text-gray-600">管理您收藏的内容</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'paper' && (
            papers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无收藏的论文
              </div>
            ) : (
              papers.map((paper) => (
                <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {paper.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{paper.authors.join(', ')}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{paper.source}</span>
                      <span>·</span>
                      <span>{new Date(paper.publishedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavorite('paper', paper.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )
          )}

          {activeTab === 'company' && (
            companies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无收藏的公司动态
              </div>
            ) : (
              companies.map((company) => (
                <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{company.name}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">{company.category}</span>
                    </div>
                    <h3 className="text-gray-900 mb-1">{company.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(company.publishedAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite('company', company.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )
          )}

          {activeTab === 'news' && (
            news.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无收藏的新闻
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {news.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">{item.category}</span>
                        <h3 className="font-bold text-gray-900 mt-2 mb-2">
                          <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                            {item.title}
                          </a>
                        </h3>
                        <p className="text-xs text-gray-400">{item.source} · {new Date(item.publishedAt).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <button
                        onClick={() => removeFavorite('news', item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
