import type { FormEvent, PreinfoData } from "@/App";
import dayjs, { Dayjs } from "dayjs";

export function generateEvent(
  events: Array<FormEvent>,
  preinfo: PreinfoData["preinfo"],
) {
  const { startDate, classStartTime, classTime } = preinfo;

  return events
    .map((event) => {
      const { classname, week, time } = event;

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
  preinfo: PreinfoData["preinfo"],
) {
  const { maxWeek, startDate, classStartTime, classTime, calendarName } =
    preinfo;

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
    `X-WR-CALNAME:${calendarName}\n` +
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
      for (const t of time) {
        const classDate = weeks[timeWeek - 1][weekdays];

        const startTime = dayjs(classStartTime[t]?.time, "HH:mm");

        const classStartDate = classDate
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(0);
        const classEndDate = classDate
          .hour(startTime.hour())
          .minute(startTime.minute() + classTime)
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
  }

  allvEvent += "\nEND:VCALENDAR";
  return iCalHeader + allvEvent;
}
