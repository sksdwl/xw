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
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ])

    let favoritedIds: Set<string> = new Set()
    if (payload) {
      const favorites = await prisma.userFavoriteCompany.findMany({
        where: { userId: payload.userId },
        select: { companyId: true },
      })
      favoritedIds = new Set(favorites.map(f => f.companyId))
    }

    return NextResponse.json({
      code: 0,
      data: {
        companies: companies.map(c => ({
          ...c,
          tags: JSON.parse(c.tags),
          isFavorited: favoritedIds.has(c.id),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取公司动态错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
