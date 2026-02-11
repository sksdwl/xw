'use client'

import { useEffect, useState } from 'react'
import { Company } from '@/types'

const categories = [
  { value: 'all', label: '全部' },
  { value: 'FUNDING', label: '融资' },
  { value: 'PRODUCT', label: '产品发布' },
  { value: 'PARTNERSHIP', label: '战略合作' },
  { value: 'HIRING', label: '人才招聘' },
  { value: 'ACQUISITION', label: '收购并购' },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [category])

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/companies?category=${category}&search=${search}`)
      const data = await res.json()
      if (data.code === 0) {
        setCompanies(data.data.companies)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCompanies()
  }

  const toggleFavorite = async (companyId: string, isFavorited: boolean) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'company',
          id: companyId,
          action: isFavorited ? 'remove' : 'add',
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setCompanies(companies.map(c => 
          c.id === companyId ? { ...c, isFavorited: !isFavorited } : c
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">公司动态</h1>
        <p className="text-gray-600">追踪 OpenAI、Google、Meta 等 AI 公司最新动态</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司名称或动态..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
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
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Companies List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无公司动态数据
        </div>
      ) : (
        <div className="space-y-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                        {company.name[0]}
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{company.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          {getCategoryLabel(company.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {company.title}
                  </h3>
                  {company.summary && (
                    <p className="text-gray-600 text-sm mb-3">{company.summary}</p>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {company.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(company.publishedAt).toLocaleDateString('zh-CN')}</span>
                    {company.url && (
                      <a
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        查看详情
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(company.id, company.isFavorited || false)}
                  className={`p-2 rounded-lg transition-colors ${
                    company.isFavorited
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={company.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
