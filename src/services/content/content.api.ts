import { http } from '@/lib/http'
import type { CateringEnquiry, EnquiryStatus, SiteContent } from '@/types'

export const contentApi = {
  getContent: () => http.get<SiteContent>('/content'),
  saveContent: (input: SiteContent) => http.put<SiteContent>('/content', input),
  listEnquiries: () => http.get<CateringEnquiry[]>('/content/enquiries'),
  setEnquiryStatus: ({ id, status }: { id: string; status: EnquiryStatus }) =>
    http.patch<CateringEnquiry>(`/content/enquiries/${id}`, { status }),
}
