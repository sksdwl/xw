import Parser from 'rss-parser'
import axios from 'axios'

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
})

// AI 新闻 RSS 源
const NEWS_SOURCES = [
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    source: '机器之心',
    type: 'news' as const,
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    source: '量子位',
    type: 'news' as const,
  },
]

// AI 公司相关的 TechCrunch 和 The Verge 等
const TECH_SOURCES = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch',
    type: 'news' as const,
  },
]

interface NewsItem {
  title: string
  content: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  category: string
  tags: string[]
}

interface CompanyUpdate {
  name: string
  title: string
  content: string
  summary: string
  url: string
  publishedAt: Date
  category: string
  tags: string[]
}

// 关键词识别分类
function categorizeByKeywords(title: string, content: string): { category: string; tags: string[] } {
  const text = (title + ' ' + content).toLowerCase()
  const tags: string[] = []
  
  // 分类关键词
  const keywords: Record<string, string[]> = {
    'FUNDING': ['融资', '投资', 'funding', 'raised', 'million', 'billion', 'investment', 'series', '估值', 'valuation'],
    'PRODUCT': ['发布', '新品', 'launch', 'release', 'product', 'model', 'gpt', 'chatgpt', 'claude', 'gemini', '模型'],
    'PARTNERSHIP': ['合作', 'partnership', 'collaborate', 'partner', 'team', '联盟'],
    'HIRING': ['招聘', 'hiring', 'join', 'hire', '职位', '人才', '加入'],
    'ACQUISITION': ['收购', 'acquisition', 'acquire', '并购', 'buy'],
    'TECH': ['技术', '突破', 'algorithm', 'architecture', 'method', 'paper', 'research'],
    'POLICY': ['政策', '法规', 'regulation', 'law', 'policy', 'ai act', '合规'],
    'TREND': ['趋势', 'market', 'industry', 'analysis', '报告', '预测'],
  }
  
  for (const [cat, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        tags.push(word)
        if (tags.length >= 3) break
      }
    }
  }
  
  // 确定主要分类
  if (text.includes('融资') || text.includes('funding') || text.includes('raised')) {
    return { category: 'FUNDING', tags }
  } else if (text.includes('发布') || text.includes('launch') || text.includes('product') || text.includes('model')) {
    return { category: 'PRODUCT', tags }
  } else if (text.includes('招聘') || text.includes('hiring')) {
    return { category: 'HIRING', tags }
  } else if (text.includes('收购') || text.includes('acquisition')) {
    return { category: 'ACQUISITION', tags }
  } else if (text.includes('合作') || text.includes('partnership')) {
    return { category: 'PARTNERSHIP', tags }
  } else if (text.includes('政策') || text.includes('regulation') || text.includes('法规')) {
    return { category: 'POLICY', tags }
  }
  
  return { category: 'TECH', tags }
}

// 识别公司名称
function extractCompanyName(title: string, content: string): string | null {
  const companies = [
    'OpenAI', 'Anthropic', 'Google', 'DeepMind', 'Microsoft', 'Meta', 'Facebook',
    'Amazon', 'Apple', 'Nvidia', 'Tesla', 'xAI', 'Mistral', 'Cohere', 'AI21 Labs',
    '百度', '阿里', '腾讯', '字节跳动', '智谱', '月之暗面', 'MiniMax', '零一万物',
    '科大讯飞', '华为', '商汤', '旷视', '依图', '百川智能', '面壁智能', '阶跃星辰',
    'Stability AI', 'Midjourney', 'Runway', 'Character.AI', 'Perplexity',
  ]
  
  const text = title + ' ' + content
  for (const company of companies) {
    if (text.includes(company)) {
      return company
    }
  }
  
  return null
}

// 获取1个月前的日期
function getOneMonthAgo(): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date
}

// 从 RSS 抓取新闻（支持获取过去1个月）
export async function fetchNewsFromRSS(daysBack: number = 30): Promise<NewsItem[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)
  
  const allNews: NewsItem[] = []
  
  for (const source of [...NEWS_SOURCES, ...TECH_SOURCES]) {
    try {
      console.log(`[Crawler] 正在抓取新闻源: ${source.name}...`)
      const feed = await rssParser.parseURL(source.url)
      
      for (const item of feed.items) {
        if (!item.title || !item.link) continue
        
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
        
        // 只取指定天数内的新闻
        if (publishedAt < cutoffDate) continue
        
        const { category, tags } = categorizeByKeywords(item.title, item.contentSnippet || '')
        
        allNews.push({
          title: item.title,
          content: item.contentSnippet || item.title,
          summary: item.contentSnippet?.slice(0, 200) || item.title,
          url: item.link,
          source: source.source,
          publishedAt,
          category,
          tags,
        })
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`抓取 ${source.name} 失败:`, error)
    }
  }
  
  // 按时间排序（最新的在前）
  return allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

// 从 RSS 抓取公司动态（支持获取过去1个月）
export async function fetchCompanyUpdates(daysBack: number = 30): Promise<CompanyUpdate[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)
  
  const updates: CompanyUpdate[] = []
  
  for (const source of TECH_SOURCES) {
    try {
      console.log(`[Crawler] 正在抓取公司动态源: ${source.name}...`)
      const feed = await rssParser.parseURL(source.url)
      
      for (const item of feed.items) {
        if (!item.title || !item.link) continue
        
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
        
        // 只取指定天数内的动态
        if (publishedAt < cutoffDate) continue
        
        const companyName = extractCompanyName(item.title, item.contentSnippet || '')
        if (!companyName) continue // 只保留能识别出公司的
        
        const { category, tags } = categorizeByKeywords(item.title, item.contentSnippet || '')
        
        // 只保留产品发布、融资等公司相关类别
        if (!['PRODUCT', 'FUNDING', 'ACQUISITION', 'PARTNERSHIP', 'HIRING'].includes(category)) {
          continue
        }
        
        updates.push({
          name: companyName,
          title: item.title,
          content: item.contentSnippet || item.title,
          summary: item.contentSnippet?.slice(0, 200) || item.title,
          url: item.link,
          publishedAt,
          category,
          tags: [...tags, companyName],
        })
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`抓取公司动态失败:`, error)
    }
  }
  
  return updates.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

export type { NewsItem, CompanyUpdate }
