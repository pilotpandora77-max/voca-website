'use client';
import { useEffect } from 'react';
import api from '@/lib/api';

const PING_INTERVAL_MS = 45000;

// Идэвхтэй суралцаж буй хуудсанд `active===true` байх үед 45 сек тутам
// сервер лүү бодит цаг хэмжих ping илгээнэ. Зөвхөн tab фокустой үед л
// ажиллана (Page Visibility API) — idle/backgrounded tab хуурамч цаг
// нэмэхгүй.
export default function useStudyPing(active) {
  useEffect(() => {
    if (!active) return;

    let timer = null;
    function ping() {
      if (document.visibilityState === 'visible') api.post('/api/streak/study-ping').catch(() => {});
    }
    function start() { if (!timer) timer = setInterval(ping, PING_INTERVAL_MS); }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }
    function onVisibility() { document.visibilityState === 'visible' ? start() : stop(); }

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);
}
