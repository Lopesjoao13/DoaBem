import { ANONYMOUS_SOURCE_LABEL } from '@/constants/entries.js'

export const describeEntrySource = (entry) =>
    entry.anonymous || !entry.source ? ANONYMOUS_SOURCE_LABEL : entry.source
