'use client'

import { useEffect, useState } from 'react'

interface Stats {
  papers: number
  news: number
  companies: number
}

interface LatestItem {
  title: string
  publishedAt: string
}

interface CrawlerStatus {
  isRunning: boolean
  isTaskRunning: boolean
  schedule: string
  description: string
  lastRunTime?: string
  lastResult?: any
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [status, setStatus] = useState<CrawlerStatus | null>(null)
  const [latest, setLatest] = useState<{ papers: LatestItem[]; news: LatestItem[]; companies: LatestItem[] } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/crawler', {
        headers: { 'Authorization': `Bearer ${password}` }
      })
      const data = await res.json()
      if (data.code === 0) {
        setStats(data.data.stats)
        setStatus(data.data.status)
        setLatest(data.data.latest)
      }
    } catch (error) {
      console.error('获取状态失败:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus()
      // 每30秒刷新一次状态
      const interval = setInterval(fetchStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    document.cookie = `admin_token=${password}; path=/`
    setIsAuthenticated(true)
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      setMessage(data.message)
      if (data.code === 0) {
        fetchStatus()
      }
    } catch (error) {
      setMessage('操作失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">管理后台</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">管理密钥</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="输入 ADMIN_SECRET"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              进入后台
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">数据抓取管理</h1>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        {/* 状态卡片 */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">论文总数</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.papers || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">新闻总数</div>
            <div className="text-3xl font-bold text-purple-600">{stats?.news || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">公司动态</div>
            <div className="text-3xl font-bold text-green-600">{stats?.companies || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">定时任务</div>
            <div className={`text-lg font-bold ${status?.isRunning ? 'text-green-600' : 'text-gray-400'}`}>
              {status?.isRunning ? '运行中' : '已停止'}
            </div>
            {status?.lastRunTime && (
              <div className="text-xs text-gray-400 mt-1">
                上次: {new Date(status.lastRunTime).toLocaleTimeString('zh-CN')}
              </div>
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">爬虫控制</h2>
          
          {/* 首次同步按钮（抓取过去1个月） */}
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">首次同步</h3>
            <p className="text-sm text-amber-700 mb-3">
              抓取过去1个月的全部数据（论文、新闻、公司动态），此操作可能需要几分钟
            </p>
            <button
              onClick={() => handleAction('initial')}
              disabled={isLoading}
              className="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '同步中...' : '首次同步（过去1个月）'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction('run')}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '执行中...' : '立即同步（最新）'}
            </button>
            <button
              onClick={() => handleAction('start')}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              启动定时任务
            </button>
            <button
              onClick={() => handleAction('stop')}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              停止定时任务
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            {status?.description} ({status?.schedule})
          </p>
        </div>

        {/* 最新数据 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">最新论文（按发布时间）</h3>
            <div className="space-y-3">
              {latest?.papers.map((item, i) => (
                <div key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="text-gray-900 line-clamp-2">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(item.publishedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">最新新闻</h3>
            <div className="space-y-3">
              {latest?.news.map((item, i) => (
                <div key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="text-gray-900 line-clamp-2">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(item.publishedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">最新公司动态</h3>
            <div className="space-y-3">
              {latest?.companies.map((item, i) => (
                <div key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="text-gray-900 line-clamp-2">{item.title}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(item.publishedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
