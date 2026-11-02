import { http } from '@/lib/http'

export const uploadImage = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  const { url } = await http.post<{ url: string }>('/uploads', body)
  return url
}
