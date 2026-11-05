import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { offersApi } from './offers.api'

const invalidate = [queryKeys.offers]

export const useOffers = () =>
  useQuery({ queryKey: queryKeys.offers, queryFn: offersApi.listOffers })
export const useSaveOffer = () =>
  useAppMutation({ mutationFn: offersApi.saveOffer, invalidate, success: 'Offer saved' })
export const useSetOfferActive = () =>
  useAppMutation({
    mutationFn: offersApi.setActive,
    invalidate,
    success: (offer) => (offer.active ? 'Offer switched on' : 'Offer paused'),
  })
export const useDeleteOffer = () =>
  useAppMutation({ mutationFn: offersApi.deleteOffer, invalidate, success: 'Offer deleted' })
