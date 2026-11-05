import { Star, ThumbsUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardSection } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { TextAreaField } from '@/components/ui/fields'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatTile } from '@/components/ui/StatTile'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { cn } from '@/lib/cn'
import { formatDate, formatPrice, pluralise } from '@/lib/format'
import {
  useReplyToReview,
  useReviews,
  useSetReviewHidden,
} from '@/services/reviews/reviews.queries'
import type { Review } from '@/types'

type ReplyFilter = 'all' | 'awaiting' | 'replied'

const Stars = ({ rating, className }: { rating: number; className?: string }) => (
  <span role="img" aria-label={`${rating} out of 5 stars`} className={cn('inline-flex', className)}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        aria-hidden
        className={cn('size-4', star <= Math.round(rating) ? 'fill-gold text-gold' : 'text-line')}
      />
    ))}
  </span>
)

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const ReviewRow = ({ review }: { review: Review }) => {
  const reply = useReplyToReview()
  const setHidden = useSetReviewHidden()
  const [replying, setReplying] = useState(false)
  const [text, setText] = useState(review.reply ?? '')

  return (
    <li
      className={cn(
        'flex gap-3 border-b border-line py-4 last:border-b-0',
        review.hidden && 'opacity-60',
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-shea text-sm font-bold">
        {initials(review.displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {review.displayName}{' '}
            <span className="text-xs font-normal text-muted">
              {review.customerOrders === 1
                ? 'New customer'
                : pluralise(review.customerOrders, 'order')}
            </span>
          </p>
          <p className="text-xs text-muted">
            {formatDate(review.createdAt)} · {review.orderNumber} · {formatPrice(review.orderTotal)}
          </p>
        </div>
        <Stars rating={review.rating} className="mt-1" />
        {review.comment && <p className="mt-1 text-sm">{review.comment}</p>}
        {review.likedItems.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
            <ThumbsUp className="size-3.5" /> {review.likedItems.join(', ')}
          </p>
        )}
        {review.hidden && (
          <Badge className="mt-2" tone="neutral">
            Hidden from the website
          </Badge>
        )}

        {review.reply && !replying && (
          <p className="mt-2 rounded-xl bg-shea px-3 py-2 text-sm">
            <strong>Your reply:</strong> {review.reply}
          </p>
        )}
        {replying ? (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              reply.mutate({ id: review.id, reply: text }, { onSuccess: () => setReplying(false) })
            }}
          >
            <TextAreaField
              label="Your reply"
              rows={3}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!text.trim() || reply.isPending}>
                Post reply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReplying(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setReplying(true)}>
              {review.reply ? 'Edit reply' : 'Reply'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={setHidden.isPending}
              onClick={() => setHidden.mutate({ id: review.id, hidden: !review.hidden })}
            >
              {review.hidden ? 'Show on website' : 'Hide from website'}
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}

export const ReviewsPage = () => {
  const { data, isPending, isError, refetch } = useReviews()
  const [stars, setStars] = useState<number | null>(null)
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>('all')

  const reviews = useMemo(
    () =>
      (data?.reviews ?? []).filter(
        (review) =>
          (stars === null || review.rating === stars) &&
          (replyFilter === 'all' ||
            (replyFilter === 'awaiting' ? !review.reply : Boolean(review.reply))),
      ),
    [data, stars, replyFilter],
  )

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const { summary } = data
  const awaiting = data.reviews.filter(({ reply, comment }) => comment && !reply).length
  const largest = Math.max(1, ...summary.breakdown.map(({ count }) => count))

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Customers rate their order from the tracking link after delivery."
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card className="flex items-center gap-6">
          <div>
            <p className="font-display text-6xl font-extrabold leading-none">
              {summary.count ? summary.average.toFixed(1) : '–'}
            </p>
            <Stars rating={summary.average} className="mt-2" />
            <p className="mt-1 text-xs text-muted">{pluralise(summary.count, 'review')} shown</p>
          </div>
          <ul className="flex flex-1 flex-col gap-1">
            {summary.breakdown.map(({ stars: value, count }) => (
              <li key={value} className="flex items-center gap-2 text-xs">
                <span className="w-12">{pluralise(value, 'star')}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-shea">
                  <span
                    className="block h-full rounded-full bg-gold"
                    style={{ width: `${(count / largest) * 100}%` }}
                  />
                </span>
                <span className="w-6 text-right text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Customer reviews" value={String(data.reviews.length)} />
          <StatTile label="Awaiting a reply" value={String(awaiting)} />
        </div>
      </div>

      <CardSection
        title="Customer reviews"
        action={
          <div className="flex flex-wrap gap-2">
            {[null, 5, 4, 3, 2, 1].map((value) => (
              <Chip key={value ?? 'all'} active={stars === value} onClick={() => setStars(value)}>
                {value === null ? 'All stars' : `${value}★`}
              </Chip>
            ))}
            {(['all', 'awaiting', 'replied'] as const).map((value) => (
              <Chip
                key={value}
                active={replyFilter === value}
                onClick={() => setReplyFilter(value)}
              >
                {value === 'all'
                  ? 'Any reply'
                  : value === 'awaiting'
                    ? 'Awaiting reply'
                    : 'Replied'}
              </Chip>
            ))}
          </div>
        }
      >
        {reviews.length === 0 ? (
          <p className="py-6 text-sm text-muted">
            {data.reviews.length === 0
              ? 'No reviews yet. Customers are invited to review when their order is delivered.'
              : 'No reviews match these filters.'}
          </p>
        ) : (
          <ul>
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </ul>
        )}
      </CardSection>
    </>
  )
}
