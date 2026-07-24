'use client';
import { useState, useEffect, useRef } from 'react';

// user.trialGranted && user.planExpires байгаа үед шинэ хэрэглэгчийн 7 хоногийн
// Premium туршилтын үлдсэн хугацааг тооцоод буцаана. 30 сек тутам шинэчилнэ,
// хугацаа дуусмагц onExpire-г нэг л удаа дуудна (жишээ нь /pricing рүү чиглүүлэхэд).
export default function useTrialCountdown(user, onExpire) {
  const [msLeft, setMsLeft] = useState(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!user?.trialGranted || !user?.planExpires) { setMsLeft(null); return; }
    let fired = false;
    function tick() {
      const left = new Date(user.planExpires).getTime() - Date.now();
      setMsLeft(left);
      if (left <= 0 && !fired) { fired = true; onExpireRef.current?.(); }
    }
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [user?.trialGranted, user?.planExpires]);

  if (msLeft == null || msLeft <= 0) return { active: false, label: '' };
  const totalMin = Math.floor(msLeft / 60000);
  const days  = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins  = totalMin % 60;
  const label = days > 0 ? `${days} өдөр ${hours} цаг үлдлээ`
    : hours > 0 ? `${hours} цаг ${mins} минут үлдлээ`
    : `${mins} минут үлдлээ`;
  return { active: true, label };
}
