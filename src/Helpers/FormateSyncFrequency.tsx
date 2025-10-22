export function FormatSyncFrequency(syncFrequency:number) {
    if (syncFrequency < 60) {
      return `${syncFrequency} minute${syncFrequency > 1 ? 's' : ''}`;
    } else if (syncFrequency < 1440) {
      const hours = Math.round(syncFrequency / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.round(syncFrequency / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }
  