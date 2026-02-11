import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

const ARXIV_API_URL = 'http://export.arxiv.org/api/query'

// arXiv CS.AI 相关分类
const AI_CATEGORIES = [
  'cs.AI',      // 人工智能
  'cs.CL',      // 计算与语言 (NLP)
  'cs.CV',      // 计算机视觉
  'cs.LG',      // 机器学习
  'cs.RO',      // 机器人学
  'cs.IR',      // 信息检索
  'cs.HC',      // 人机交互
  'cs.MA',      // 多智能体系统
  'cs.NE',      // 神经与进化计算
]

interface ArxivPaper {
  id: string
  title: string
  authors: string[]
  abstract: string
  pdfUrl: string
  url: string
  publishedAt: Date
  categories: string[]
}

// 映射 arXiv 分类到我们的分类
function mapCategory(arxivCategories: string[]): string {
  if (arxivCategories.includes('cs.CV') || arxivCategories.includes('cs.GR')) return 'CV'
  if (arxivCategories.includes('cs.CL') || arxivCategories.includes('cs.FL')) return 'NLP'
  if (arxivCategories.includes('cs.RO')) return 'ROBOTICS'
  if (arxivCategories.includes('cs.LG') || arxivCategories.includes('stat.ML')) return 'ML'
  if (arxivCategories.includes('cs.AI')) return 'AI'
  if (arxivCategories.includes('cs.IR')) return 'IR'
  return 'AI' // 默认
}

// 清理标题（去除换行符等）
function cleanTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim()
}

// 获取1个月前的日期
function getOneMonthAgo(): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date
}

// 格式化日期为 arXiv 格式 (YYYYMMDD)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

// 抓取最新论文（支持分页获取大量数据）
export async function fetchLatestPapers(maxResults: number = 50, start: number = 0): Promise<ArxivPaper[]> {
  const categoryQuery = AI_CATEGORIES.join(' OR ')
  const query = `search_query=cat:(${categoryQuery})&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}&start=${start}`
  
  try {
    const response = await axios.get(`${ARXIV_API_URL}?${query}`, {
      timeout: 30000,
      headers: {
        'Accept': 'application/atom+xml',
      }
    })

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })
    
    const result = parser.parse(response.data)
    const entries = result.feed?.entry || []
    
    const papers: ArxivPaper[] = []
    
    for (const entry of Array.isArray(entries) ? entries : [entries]) {
      if (!entry) continue
      
      const id = entry.id?.split('/abs/').pop()?.split('v')[0] || ''
      const pdfUrl = entry.link?.find((l: any) => l['@_title'] === 'pdf')?.['@_href'] || 
                     `https://arxiv.org/pdf/${id}.pdf`
      
      const authors = Array.isArray(entry.author) 
        ? entry.author.map((a: any) => a.name)
        : entry.author ? [entry.author.name] : []
      
      const categories = Array.isArray(entry.category)
        ? entry.category.map((c: any) => c['@_term'])
        : entry.category ? [entry.category['@_term']] : []
      
      papers.push({
        id,
        title: cleanTitle(entry.title || ''),
        authors,
        abstract: entry.summary?.trim() || '',
        pdfUrl,
        url: `https://arxiv.org/abs/${id}`,
        publishedAt: new Date(entry.published || Date.now()),
        categories,
      })
    }
    
    return papers
  } catch (error) {
    console.error('抓取 arXiv 论文失败:', error)
    return []
  }
}

// 抓取过去1个月的论文（分页获取）
export async function fetchPapersFromLastMonth(): Promise<ArxivPaper[]> {
  const oneMonthAgo = getOneMonthAgo()
  const allPapers: ArxivPaper[] = []
  const batchSize = 100  // 每批100条
  let start = 0
  let hasMore = true
  
  console.log(`[Crawler] 开始抓取过去1个月的论文 (从 ${oneMonthAgo.toISOString()} 开始)`)
  
  while (hasMore && start < 2000) {  // 最多抓取2000条防止无限循环
    console.log(`[Crawler] 正在获取第 ${start + 1} - ${start + batchSize} 条论文...`)
    
    const papers = await fetchLatestPapers(batchSize, start)
    
    if (papers.length === 0) {
      hasMore = false
      break
    }
    
    // 检查是否已超过1个月
    const oldestInBatch = papers[papers.length - 1]?.publishedAt
    if (oldestInBatch && new Date(oldestInBatch) < oneMonthAgo) {
      // 只保留1个月内的论文
      const validPapers = papers.filter(p => new Date(p.publishedAt) >= oneMonthAgo)
      allPapers.push(...validPapers)
      console.log(`[Crawler] 已达到1个月时间界限，停止抓取`)
      break
    }
    
    allPapers.push(...papers)
    start += batchSize
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`[Crawler] 共抓取 ${allPapers.length} 篇过去1个月的论文`)
  return allPapers
}

export { mapCategory }
export type { ArxivPaper }
