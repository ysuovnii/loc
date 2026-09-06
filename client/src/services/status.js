export function statusMeta(status) {
  switch (status) {
    case 'active':
      return { label: 'ACTIVE', tone: 'ok' };
    case 'connecting':
      return { label: 'CONNECTING', tone: 'warn' };
    case 'offline':
      return { label: 'OFFLINE', tone: 'err' };
    case 'paused':
      return { label: 'PAUSED', tone: 'off' };
    case 'unavailable':
      return { label: 'LOCATION UNAVAILABLE', tone: 'warn' };
    default:
      return { label: 'OFFLINE', tone: 'err' };
  }
}