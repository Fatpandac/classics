import type { FormEvent } from "@/App";
import type { PreinfoData } from "@/PreinfoForm";
import dayjs from "dayjs";
import type { DeepPartial } from "react-hook-form";

export function generateEvent(events: Array<FormEvent>, preinfo: DeepPartial<PreinfoData>) {
  const {
    startDate,
    classStartTime,
    classTime,
  } = preinfo;

  if (!startDate || !classStartTime || !classTime) return [];

  return events.map((event) => {
    const {
      classname,
      week,
      time
    } = event;
    if (!week || !time) return [];
    
    return week.map((w) => {
      const weekDate = dayjs(startDate).add(w - 1, 'week');
      const timeDate = time.map((t) => classStartTime[t - 1]?.time).filter(Boolean);

      return timeDate.map((t) => ({
        title: classname,
        from: `${weekDate.format('YYYY-MM-DD')}T${t}`,
        to: `${weekDate.format('YYYY-MM-DD')}T${dayjs(t, 'HH:mm').add(classTime, 'minute').format('HH:mm')}`,
      }))
    })
  }).flat(2)
}
