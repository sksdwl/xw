import { NextRequest, NextResponse } from 'next/server'
import { startScheduler, stopScheduler, runNow, getSchedulerStatus } from '@/lib/crawler'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production'

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const token = req.cookies.get('admin_token')?.value
  
  return authHeader === `Bearer ${ADMIN_SECRET}` || token === ADMIN_SECRET
}

// 获取爬虫状态
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { code: 1, message: '未授权' },
      { status: 401 }
    )
  }

  const status = getSchedulerStatus()
  
  // 获取数据库统计
  const { prisma } = await import('@/lib/prisma')
  const [paperCount, newsCount, companyCount] = await Promise.all([
    prisma.paper.count(),
    prisma.news.count(),
    prisma.company.count(),
  ])
  
  // 获取最近更新的数据
  const [latestPapers, latestNews, latestCompanies] = await Promise.all([
    prisma.paper.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, createdAt: true } }),
    prisma.news.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, createdAt: true } }),
    prisma.company.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, createdAt: true } }),
  ])

  return NextResponse.json({
    code: 0,
    data: {
      status,
      stats: {
        papers: paperCount,
        news: newsCount,
        companies: companyCount,
      },
      latest: {
        papers: latestPapers,
        news: latestNews,
        companies: latestCompanies,
      },
    },
  })
}

// 控制爬虫
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { code: 1, message: '未授权' },
      { status: 401 }
    )
  }

  try {
    const { action } = await req.json()
    
    switch (action) {
      case 'start':
        startScheduler()
        return NextResponse.json({ code: 0, message: '定时任务已启动' })
        
      case 'stop':
        stopScheduler()
        return NextResponse.json({ code: 0, message: '定时任务已停止' })
        
      case 'run':
        const result = await runNow()
        return NextResponse.json({
          code: 0,
          message: '手动同步完成',
          data: result,
        })
        
      default:
        return NextResponse.json(
          { code: 1, message: '未知操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('爬虫控制失败:', error)
    return NextResponse.json(
      { code: 1, message: '操作失败', error: String(error) },
      { status: 500 }
    )
  }
}
