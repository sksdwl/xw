import { prisma } from '../prisma'
import { fetchPapersFromLastMonth, fetchLatestPapers, mapCategory } from './arxiv'
import { fetchNewsFromRSS, fetchCompanyUpdates } from './news'

// 同步论文（默认抓取过去1个月）
export async function syncPapers(fetchAll: boolean = false): Promise<{ added: number; total: number }> {
  console.log('[Crawler] 开始同步论文...')
  
  let papers: any[] = []
  
  if (fetchAll) {
    // 抓取过去1个月的全部论文
    papers = await fetchPapersFromLastMonth()
  } else {
    // 只抓取最新的50条
    papers = await fetchLatestPapers(50)
  }
  
  let added = 0
  let skipped = 0
  
  for (const paper of papers) {
    try {
      // 检查是否已存在（通过 URL 去重）
      const existing = await prisma.paper.findUnique({
        where: { url: paper.url }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      await prisma.paper.create({
        data: {
          title: paper.title,
          authors: JSON.stringify(paper.authors),
          abstract: paper.abstract,
          url: paper.url,
          pdfUrl: paper.pdfUrl,
          publishedAt: paper.publishedAt,
          source: 'arXiv',
          category: mapCategory(paper.categories),
          tags: JSON.stringify(paper.categories),
        }
      })
      
      added++
    } catch (error) {
      console.error(`[Crawler] 保存论文失败: ${paper.title}`, error)
    }
  }
  
  const total = await prisma.paper.count()
  console.log(`[Crawler] 论文同步完成: 新增 ${added} 条, 跳过 ${skipped} 条(已存在), 总计 ${total} 条`)
  
  return { added, total }
}

// 同步新闻（默认抓取过去1个月）
export async function syncNews(daysBack: number = 30): Promise<{ added: number; total: number }> {
  console.log(`[Crawler] 开始同步新闻 (过去${daysBack}天)...`)
  
  const newsItems = await fetchNewsFromRSS(daysBack)
  let added = 0
  let skipped = 0
  
  for (const item of newsItems) {
    try {
      // 检查是否已存在（通过 URL 去重）
      const existing = await prisma.news.findUnique({
        where: { url: item.url }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      await prisma.news.create({
        data: {
          title: item.title,
          content: item.content,
          summary: item.summary,
          url: item.url,
          source: item.source,
          publishedAt: item.publishedAt,
          category: item.category,
          tags: JSON.stringify(item.tags),
        }
      })
      
      added++
    } catch (error) {
      console.error(`[Crawler] 保存新闻失败: ${item.title}`, error)
    }
  }
  
  const total = await prisma.news.count()
  console.log(`[Crawler] 新闻同步完成: 新增 ${added} 条, 跳过 ${skipped} 条(已存在), 总计 ${total} 条`)
  
  return { added, total }
}

// 同步公司动态（默认抓取过去1个月）
export async function syncCompanies(daysBack: number = 30): Promise<{ added: number; total: number }> {
  console.log(`[Crawler] 开始同步公司动态 (过去${daysBack}天)...`)
  
  const updates = await fetchCompanyUpdates(daysBack)
  let added = 0
  let skipped = 0
  
  for (const update of updates) {
    try {
      // 检查是否已存在（通过 URL 去重）
      const existing = await prisma.company.findUnique({
        where: { url: update.url }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      await prisma.company.create({
        data: {
          name: update.name,
          title: update.title,
          content: update.content,
          summary: update.summary,
          url: update.url,
          publishedAt: update.publishedAt,
          category: update.category,
          tags: JSON.stringify(update.tags),
        }
      })
      
      added++
    } catch (error) {
      console.error(`[Crawler] 保存公司动态失败: ${update.title}`, error)
    }
  }
  
  const total = await prisma.company.count()
  console.log(`[Crawler] 公司动态同步完成: 新增 ${added} 条, 跳过 ${skipped} 条(已存在), 总计 ${total} 条`)
  
  return { added, total }
}

// 执行完整同步
export async function syncAll(options?: { 
  fetchAllPapers?: boolean
  newsDays?: number
  companyDays?: number
}): Promise<{
  papers: { added: number; total: number }
  news: { added: number; total: number }
  companies: { added: number; total: number }
}> {
  console.log('[Crawler] ===== 开始全量同步 =====', new Date().toISOString())
  
  const [papers, news, companies] = await Promise.all([
    syncPapers(options?.fetchAllPapers),
    syncNews(options?.newsDays),
    syncCompanies(options?.companyDays),
  ])
  
  console.log('[Crawler] ===== 全量同步完成 =====', new Date().toISOString())
  
  return { papers, news, companies }
}

// 首次运行抓取（抓取过去1个月的所有数据）
export async function initialSync(): Promise<{
  papers: { added: number; total: number }
  news: { added: number; total: number }
  companies: { added: number; total: number }
}> {
  console.log('[Crawler] ===== 开始首次同步（抓取过去1个月数据）=====')
  return syncAll({
    fetchAllPapers: true,  // 抓取所有过去1个月的论文
    newsDays: 30,          // 抓取30天的新闻
    companyDays: 30,       // 抓取30天的公司动态
  })
}
