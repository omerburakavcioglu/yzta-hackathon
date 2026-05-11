import clsx from 'clsx'
import t from '@/lib/translations'

const statusColors: Record<string, string> = {
  preparing:        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  packed:           'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  shipped:          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  delayed:          'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cancelled:        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  waiting:          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  in_transit:       'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  out_for_delivery: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

// Status key → translation key mapping
const statusLabelKey: Record<string, keyof typeof t.en> = {
  preparing:        'statusPreparing',
  packed:           'statusPacked',
  shipped:          'statusShipped',
  delivered:        'statusDelivered',
  delayed:          'statusDelayed',
  cancelled:        'statusCancelled',
  waiting:          'statusWaiting',
  in_transit:       'statusInTransit',
  out_for_delivery: 'statusOutForDelivery',
}

interface Props {
  status: string
  lang?: 'en' | 'tr'
}

export default function StatusBadge({ status, lang = 'en' }: Props) {
  const key = statusLabelKey[status]
  const label = key ? t[lang][key] : status.replace(/_/g, ' ')
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300')}>
      {label}
    </span>
  )
}
