import type { FormEvent } from "@/App";
import type { PreinfoData } from "@/PreinfoForm";
import dayjs, { Dayjs } from "dayjs";
import type { DeepPartial } from "react-hook-form";

export function generateEvent(
  events: Array<FormEvent>,
  preinfo: DeepPartial<PreinfoData>,
) {
  const { startDate, classStartTime, classTime } = preinfo;

  if (!startDate || !classStartTime || !classTime) return [];

  return events
    .map((event) => {
      const { classname, week, time } = event;
      if (!week || !time) return [];

      return week.map((w) => {
        const weekDate = dayjs(startDate).add(w - 1, "week");
        const timeDate = time
          .map((t) => classStartTime[t - 1]?.time)
          .filter(Boolean);

        return timeDate.map((t) => ({
          title: classname,
          from: `${weekDate.format("YYYY-MM-DD")}T${t}`,
          to: `${weekDate.format("YYYY-MM-DD")}T${dayjs(t, "HH:mm")
            .add(classTime, "minute")
            .format("HH:mm")}`,
        }));
      });
    })
    .flat(2);
}

export function generateIcs(
  events: Array<FormEvent>,
  preinfo: DeepPartial<PreinfoData>,
) {
  const { maxWeek, startDate, classStartTime, classTime } = preinfo;

  if (!startDate || !classStartTime || !classTime || !maxWeek) return "";

  // 构建每周日期表
  const weeks = [];
  let currentDay = dayjs(startDate);

  for (let i = 1; i < maxWeek + 1; i++) {
    const singleWeek = [];
    for (let d = 0; d < 7; d++) {
      singleWeek.push(currentDay);
      currentDay = currentDay.add(1, "day");
    }
    weeks.push(singleWeek);
  }

  const iCalHeader =
    "BEGIN:VCALENDAR\n" +
    "METHOD:PUBLISH\n" +
    "VERSION:2.0\n" +
    "X-WR-CALNAME:课表\n" +
    "PRODID:-//Apple Inc.//Mac OS X 10.15.6//EN\n" +
    "X-WR-TIMEZONE:Asia/Shanghai\n" +
    "CALSCALE:GREGORIAN\n" +
    "BEGIN:VTIMEZONE\n" +
    "TZID:Asia/Shanghai\n" +
    "END:VTIMEZONE\n";

  let allvEvent = "";

  for (const event of events) {
    const { classname, teacher, location, week, weekdays, time } = event;
    const Title = `${classname}@${location}`;

    for (const timeWeek of week) {
      const classDate = weeks[timeWeek - 1][weekdays];

      const startTime = dayjs(classStartTime[time[0] - 1]?.time, "HH:mm");
      const endTime = dayjs(classStartTime[time[time.length - 1] - 1]?.time, "HH:mm");

      // 使用 dayjs 构造开始与结束时间
      const classStartDate = classDate
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(0);
      const classEndDate = classDate
        .hour(endTime.hour())
        .minute(endTime.minute() + classTime)
        .second(0);

      const Description = ` 任课教师: ${teacher}`;

      const formatDate = (d: Dayjs) => d.format("YYYYMMDDTHHmmss");

      let vEvent = "\nBEGIN:VEVENT";
      vEvent += `\nDTEND;TZID=Asia/Shanghai:${formatDate(classEndDate)}`;
      vEvent += `\nSUMMARY:${Title}`;
      vEvent += `\nDTSTART;TZID=Asia/Shanghai:${formatDate(classStartDate)}`;
      vEvent += `\nDESCRIPTION:${Description}`;
      vEvent += "\nEND:VEVENT";

      allvEvent += vEvent;
    }
  }

  allvEvent += "\nEND:VCALENDAR";
  return iCalHeader + allvEvent;
}
