import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

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
        { content: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
      ]
    }

    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.news.count({ where }),
    ])

    let favoritedIds: Set<string> = new Set()
    if (payload) {
      const favorites = await prisma.userFavoriteNews.findMany({
        where: { userId: payload.userId },
        select: { newsId: true },
      })
      favoritedIds = new Set(favorites.map(f => f.newsId))
    }

    return NextResponse.json({
      code: 0,
      data: {
        news: news.map(n => ({
          ...n,
          tags: JSON.parse(n.tags),
          isFavorited: favoritedIds.has(n.id),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取新闻错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
