export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  url: string
  pdfUrl: string | null
  publishedAt: string
  source: string
  category: string
  tags: string[]
  isFavorited?: boolean
}

export interface Company {
  id: string
  name: string
  logo: string | null
  title: string
  content: string
  summary: string | null
  url: string | null
  publishedAt: string
  category: string
  tags: string[]
  isFavorited?: boolean
}

export interface News {
  id: string
  title: string
  content: string
  summary: string | null
  coverImage: string | null
  url: string | null
  source: string
  publishedAt: string
  category: string
  tags: string[]
  isFavorited?: boolean
}
