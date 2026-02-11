'use client'

import { useEffect, useState } from 'react'
import { Paper } from '@/types'

const categories = [
  { value: 'all', label: '全部' },
  { value: 'ML', label: '机器学习' },
  { value: 'CV', label: '计算机视觉' },
  { value: 'NLP', label: '自然语言处理' },
  { value: 'RL', label: '强化学习' },
  { value: 'MULTIMODAL', label: '多模态' },
]

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPapers()
  }, [category])

  const fetchPapers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/papers?category=${category}&search=${search}`)
      const data = await res.json()
      if (data.code === 0) {
        setPapers(data.data.papers)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPapers()
  }

  const toggleFavorite = async (paperId: string, isFavorited: boolean) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'paper',
          id: paperId,
          action: isFavorited ? 'remove' : 'add',
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setPapers(papers.map(p => 
          p.id === paperId ? { ...p, isFavorited: !isFavorited } : p
        ))
      } else if (data.code === 1) {
        alert('请先登录')
      }
    } catch {
      alert('操作失败')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">人工智能论文</h1>
        <p className="text-gray-600">每日更新 arXiv 等平台的最新 AI 论文</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索论文标题或摘要..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Papers List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无论文数据
        </div>
      ) : (
        <div className="space-y-6">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {paper.source}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {paper.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {paper.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    作者: {paper.authors.join(', ')}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {paper.abstract}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(paper.publishedAt).toLocaleDateString('zh-CN')}</span>
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        PDF 下载
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(paper.id, paper.isFavorited || false)}
                  className={`p-2 rounded-lg transition-colors ${
                    paper.isFavorited
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={paper.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
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
