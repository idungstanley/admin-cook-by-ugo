import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CardSection } from '@/components/ui/Card'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/fields'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { formatDate } from '@/lib/format'
import {
  useContent,
  useEnquiries,
  useSaveContent,
  useSetEnquiryStatus,
} from '@/services/content/content.queries'
import { useDishes } from '@/services/menu/menu.queries'
import type { EnquiryStatus, SiteContent } from '@/types'

const FAVOURITE_COUNT = 4

const contentSchema = z.object({
  announcement: z.string().trim(),
  heroHeadline: z.string().trim().min(3, 'Enter a headline'),
  heroText: z.string().trim().min(3, 'Enter some text'),
  storyText: z.string().trim().min(3, 'Enter your story'),
  phone: z.string().trim().min(6, 'Enter a phone number'),
  email: z.email('Enter a valid email'),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, 'Use digits only, with the country code'),
  areaLabel: z.string().trim().min(2, 'Enter an area'),
  favouriteDishIds: z
    .array(z.string())
    .length(FAVOURITE_COUNT, `Choose exactly ${FAVOURITE_COUNT} dishes`),
})

const ENQUIRY_META: Record<EnquiryStatus, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'jollof' },
  replied: { label: 'Replied', tone: 'gold' },
  closed: { label: 'Closed', tone: 'neutral' },
}

const ContentForm = ({ content }: { content: SiteContent }) => {
  const save = useSaveContent()
  const { data: dishes } = useDishes()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteContent>({ resolver: zodResolver(contentSchema), defaultValues: content })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => save.mutate(values))}
      className="flex flex-col gap-4"
    >
      <CardSection title="Homepage">
        <div className="flex flex-col gap-3">
          <TextField
            label="Announcement"
            hint="Shown at the top of the site. Leave empty to hide it."
            {...register('announcement')}
          />
          <TextField
            label="Headline"
            error={errors.heroHeadline?.message}
            {...register('heroHeadline')}
          />
          <TextAreaField
            label="Intro text"
            error={errors.heroText?.message}
            {...register('heroText')}
          />
          <TextAreaField
            label="Our story"
            rows={4}
            error={errors.storyText?.message}
            {...register('storyText')}
          />
        </div>
      </CardSection>

      <CardSection
        title="Tonight's favourites"
        description={`Choose ${FAVOURITE_COUNT} dishes for the homepage.`}
      >
        <div className="grid gap-x-3 sm:grid-cols-2">
          {dishes?.map(({ id, name }) => (
            <CheckboxField key={id} label={name} value={id} {...register('favouriteDishIds')} />
          ))}
        </div>
        {errors.favouriteDishIds && (
          <p role="alert" className="mt-1 text-xs font-semibold text-jollof-dark">
            {errors.favouriteDishIds.message}
          </p>
        )}
      </CardSection>

      <CardSection title="Contact details">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Phone" error={errors.phone?.message} {...register('phone')} />
          <TextField
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="WhatsApp number"
            error={errors.whatsappNumber?.message}
            {...register('whatsappNumber')}
          />
          <TextField
            label="Area shown on site"
            error={errors.areaLabel?.message}
            {...register('areaLabel')}
          />
        </div>
      </CardSection>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={save.isPending}>
          Save content
        </Button>
      </div>
    </form>
  )
}

const EnquiryList = () => {
  const { data: enquiries } = useEnquiries()
  const setStatus = useSetEnquiryStatus()

  return (
    <CardSection title="Catering enquiries" description="Sent from the website.">
      <ul className="flex flex-col gap-4">
        {enquiries?.map(
          ({ id, name, email, phone, eventDate, guests, message, status, createdAt }) => (
            <li key={id} className="border-b border-line pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{name}</p>
                <Badge tone={ENQUIRY_META[status].tone}>{ENQUIRY_META[status].label}</Badge>
              </div>
              <p className="text-xs text-muted">
                {guests} guests · {formatDate(new Date(eventDate).getTime())} · received{' '}
                {formatDate(createdAt)}
              </p>
              <p className="my-1.5 text-sm">{message}</p>
              <p className="text-xs text-muted">
                {email} · {phone}
              </p>
              <SelectField
                label="Status"
                className="mt-1 h-10"
                value={status}
                onChange={(event) =>
                  setStatus.mutate({ id, status: event.target.value as EnquiryStatus })
                }
              >
                {Object.entries(ENQUIRY_META).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </li>
          ),
        )}
      </ul>
    </CardSection>
  )
}

export const ContentPage = () => {
  const { data: content, isPending, isError, refetch } = useContent()

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader title="Content" description="Update website text and read catering enquiries." />
      <div className="grid items-start gap-4 xl:grid-cols-[1.5fr_1fr]">
        <ContentForm content={content} />
        <EnquiryList />
      </div>
    </>
  )
}
