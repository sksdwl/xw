import { NextRequest, NextResponse } from 'next/server'
import { startScheduler, stopScheduler, runNow, runInitialSync, getSchedulerStatus } from '@/lib/crawler'

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
  
  // 获取最近更新的数据（按时间倒序）
  const [latestPapers, latestNews, latestCompanies] = await Promise.all([
    prisma.paper.findMany({ 
      orderBy: { publishedAt: 'desc' }, 
      take: 5, 
      select: { title: true, publishedAt: true }
    }),
    prisma.news.findMany({ 
      orderBy: { publishedAt: 'desc' }, 
      take: 5, 
      select: { title: true, publishedAt: true }
    }),
    prisma.company.findMany({ 
      orderBy: { publishedAt: 'desc' }, 
      take: 5, 
      select: { title: true, publishedAt: true }
    }),
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
        const startResult = startScheduler()
        return NextResponse.json({ code: 0, message: startResult.message })
        
      case 'stop':
        const stopResult = stopScheduler()
        return NextResponse.json({ code: 0, message: stopResult.message })
        
      case 'run':
        // 普通同步 - 只抓取最新数据
        const result = await runNow()
        return NextResponse.json({
          code: 0,
          message: '同步完成',
          data: result,
        })
        
      case 'initial':
        // 首次同步 - 抓取过去1个月的数据
        const initialResult = await runInitialSync()
        return NextResponse.json({
          code: 0,
          message: initialResult.success ? '首次同步完成' : initialResult.message,
          data: initialResult.data || initialResult,
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
