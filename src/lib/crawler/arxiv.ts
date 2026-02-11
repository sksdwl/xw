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

// 抓取最新论文
export async function fetchLatestPapers(maxResults: number = 50): Promise<ArxivPaper[]> {
  const categoryQuery = AI_CATEGORIES.join(' OR ')
  const query = `search_query=cat:(${categoryQuery})&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`
  
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

export { mapCategory }
export type { ArxivPaper }
