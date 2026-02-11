import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// 获取用户收藏列表
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json(
        { code: 1, message: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'paper' // paper | company | news

    let data: any[] = []

    if (type === 'paper') {
      const favorites = await prisma.userFavoritePaper.findMany({
        where: { userId: payload.userId },
        include: { paper: true },
        orderBy: { createdAt: 'desc' },
      })
      data = favorites.map(f => ({
        ...f.paper,
        authors: JSON.parse(f.paper.authors),
        tags: JSON.parse(f.paper.tags),
        isFavorited: true,
      }))
    } else if (type === 'company') {
      const favorites = await prisma.userFavoriteCompany.findMany({
        where: { userId: payload.userId },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      })
      data = favorites.map(f => ({
        ...f.company,
        tags: JSON.parse(f.company.tags),
        isFavorited: true,
      }))
    } else if (type === 'news') {
      const favorites = await prisma.userFavoriteNews.findMany({
        where: { userId: payload.userId },
        include: { news: true },
        orderBy: { createdAt: 'desc' },
      })
      data = favorites.map(f => ({
        ...f.news,
        tags: JSON.parse(f.news.tags),
        isFavorited: true,
      }))
    }

    return NextResponse.json({
      code: 0,
      data,
    })
  } catch (error) {
    console.error('获取收藏错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加/取消收藏
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json(
        { code: 1, message: '请先登录' },
        { status: 401 }
      )
    }

    const { type, id, action } = await req.json() // action: 'add' | 'remove'

    if (!type || !id || !action) {
      return NextResponse.json(
        { code: 1, message: '参数错误' },
        { status: 400 }
      )
    }

    if (action === 'add') {
      if (type === 'paper') {
        await prisma.userFavoritePaper.create({
          data: { userId: payload.userId, paperId: id },
          ignoreDuplicates: true,
        } as any)
      } else if (type === 'company') {
        await prisma.userFavoriteCompany.create({
          data: { userId: payload.userId, companyId: id },
          ignoreDuplicates: true,
        } as any)
      } else if (type === 'news') {
        await prisma.userFavoriteNews.create({
          data: { userId: payload.userId, newsId: id },
          ignoreDuplicates: true,
        } as any)
      }
    } else if (action === 'remove') {
      if (type === 'paper') {
        await prisma.userFavoritePaper.delete({
          where: {
            userId_paperId: { userId: payload.userId, paperId: id },
          },
        })
      } else if (type === 'company') {
        await prisma.userFavoriteCompany.delete({
          where: {
            userId_companyId: { userId: payload.userId, companyId: id },
          },
        })
      } else if (type === 'news') {
        await prisma.userFavoriteNews.delete({
          where: {
            userId_newsId: { userId: payload.userId, newsId: id },
          },
        })
      }
    }

    return NextResponse.json({
      code: 0,
      message: action === 'add' ? '收藏成功' : '已取消收藏',
    })
  } catch (error) {
    console.error('操作收藏错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
