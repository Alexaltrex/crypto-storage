import { format } from 'date-fns'

export const getDate = (
    timestamp: number // sec
): string => format(new Date(timestamp * 1000), 'HH:mm dd.MM.yyyy');
