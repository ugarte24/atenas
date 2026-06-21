import { useEffect, useState } from 'react';
import { fetchAulaMeetUrl } from '../lib/mapRewardsApi';

export function useAulaMeetUrl() {
  const [meetUrl, setMeetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      setLoading(true);
      const url = await fetchAulaMeetUrl();
      if (!cancel) {
        setMeetUrl(url);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { meetUrl, loading };
}
