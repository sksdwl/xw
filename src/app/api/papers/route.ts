import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// 获取论文列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 获取当前用户（如果已登录）
    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.paper.count({ where }),
    ])

    // 如果用户已登录，检查收藏状态
    let favoritedIds: Set<string> = new Set()
    if (payload) {
      const favorites = await prisma.userFavoritePaper.findMany({
        where: { userId: payload.userId },
        select: { paperId: true },
      })
      favoritedIds = new Set(favorites.map(f => f.paperId))
    }

    return NextResponse.json({
      code: 0,
      data: {
        papers: papers.map(p => ({
          ...p,
          authors: JSON.parse(p.authors),
          tags: JSON.parse(p.tags),
          isFavorited: favoritedIds.has(p.id),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取论文列表错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
