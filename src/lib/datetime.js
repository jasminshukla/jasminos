// Human-friendly date formatting helpers.
export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelative(ts) {
  if (!ts) return '';
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  let phrase;
  if (mins < 60) phrase = `${mins}m`;
  else if (hours < 24) phrase = `${hours}h`;
  else phrase = `${days}d`;
  return diff >= 0 ? `in ${phrase}` : `${phrase} ago`;
}

// Quick-pick presets for scheduling a reminder.
export function presetDates() {
  const now = new Date();
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);
  const inThree = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  return [
    { label: 'In 1 hour', value: inHour.getTime() },
    { label: 'In 3 hours', value: inThree.getTime() },
    { label: 'Tomorrow 9am', value: tomorrow.getTime() },
    { label: 'Next week', value: nextWeek.getTime() },
  ];
}
