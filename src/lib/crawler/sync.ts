import { prisma } from '../prisma'
import { fetchLatestPapers, mapCategory } from './arxiv'
import { fetchNewsFromRSS, fetchCompanyUpdates } from './news'

// 同步论文
export async function syncPapers(): Promise<{ added: number; total: number }> {
  console.log('[Crawler] 开始同步论文...')
  
  const papers = await fetchLatestPapers(50)
  let added = 0
  
  for (const paper of papers) {
    // 检查是否已存在（通过 URL 去重）
    const existing = await prisma.paper.findUnique({
      where: { url: paper.url }
    })
    
    if (existing) continue
    
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
  }
  
  const total = await prisma.paper.count()
  console.log(`[Crawler] 论文同步完成: 新增 ${added} 条, 总计 ${total} 条`)
  
  return { added, total }
}

// 同步新闻
export async function syncNews(): Promise<{ added: number; total: number }> {
  console.log('[Crawler] 开始同步新闻...')
  
  const newsItems = await fetchNewsFromRSS()
  let added = 0
  
  for (const item of newsItems) {
    // 通过 URL 去重
    const existing = await prisma.news.findUnique({
      where: { url: item.url }
    })
    
    if (existing) continue
    
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
  }
  
  const total = await prisma.news.count()
  console.log(`[Crawler] 新闻同步完成: 新增 ${added} 条, 总计 ${total} 条`)
  
  return { added, total }
}

// 同步公司动态
export async function syncCompanies(): Promise<{ added: number; total: number }> {
  console.log('[Crawler] 开始同步公司动态...')
  
  const updates = await fetchCompanyUpdates()
  let added = 0
  
  for (const update of updates) {
    // 通过 URL 去重
    const existing = await prisma.company.findUnique({
      where: { url: update.url }
    })
    
    if (existing) continue
    
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
  }
  
  const total = await prisma.company.count()
  console.log(`[Crawler] 公司动态同步完成: 新增 ${added} 条, 总计 ${total} 条`)
  
  return { added, total }
}

// 执行完整同步
export async function syncAll(): Promise<{
  papers: { added: number; total: number }
  news: { added: number; total: number }
  companies: { added: number; total: number }
}> {
  console.log('[Crawler] ===== 开始全量同步 =====', new Date().toISOString())
  
  const [papers, news, companies] = await Promise.all([
    syncPapers(),
    syncNews(),
    syncCompanies(),
  ])
  
  console.log('[Crawler] ===== 全量同步完成 =====', new Date().toISOString())
  
  return { papers, news, companies }
}
