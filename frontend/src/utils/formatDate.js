import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDateShort = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const formatDateLong = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'EEEE, MMMM dd, yyyy');
  } catch {
    return '';
  }
};

export const formatDateAndTime = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy h:mm a');
  } catch {
    return '';
  }
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatMonth = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMMM yyyy');
  } catch {
    return '';
  }
};

export const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
};