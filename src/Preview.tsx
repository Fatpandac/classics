import * as React from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { zhCN } from "react-day-picker/locale";
import dayjs from "dayjs";

export type Event = {
  title: string;
  from: string;
  to: string;
};

export default function Preview(props: { events: Array<Event> }) {
  const { events } = props;
  const [date, setDate] = React.useState<Date>(new Date(2025, 9, 1));

  const currentDayEvents = React.useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.from);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }, [date, events]);

  return (
    <div className="h-full w-full flex items-center justify-center my-2 p-6">
      <Card className="h-full w-full border-none shadow-none">
        <CardContent className="px-4 display flex flex-row gap-4 h-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={zhCN}
            className="bg-transparent p-0 h-auto flex-1"
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const currentDayEvents = events.filter((event) => {
                  const eventDate = new Date(event.from);
                  return (
                    eventDate.getFullYear() === day.date.getFullYear() &&
                    eventDate.getMonth() === day.date.getMonth() &&
                    eventDate.getDate() === day.date.getDate()
                  );
                });
                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                    {children}
                    <div className="absolute bottom-2 left-1 right-1 flex justify-center gap-0.5">
                      {!modifiers.outside &&
                        currentDayEvents.length > 0 &&
                        currentDayEvents.map((_, index) => {
                          return (
                            <Badge
                              className="h-1! w-1! p-1 rounded-full tabular-nums bg-blue-300"
                              key={index}
                            ></Badge>
                          );
                        })}
                    </div>
                  </CalendarDayButton>
                );
              },
            }}
            required
          />
          <div className="no-scrollbar w-1/3">
            <div className="flex w-full flex-col gap-2">
              {currentDayEvents.length > 0 &&
                events
                  .filter((event) => {
                    const eventDate = new Date(event.from);
                    return (
                      eventDate.getFullYear() === date.getFullYear() &&
                      eventDate.getMonth() === date.getMonth() &&
                      eventDate.getDate() === date.getDate()
                    );
                  })
                  .map((event, index) => (
                    <div
                      key={index}
                      className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-muted-foreground text-xs">
                        {dayjs(event.from).format("MM月DD日 HH:mm")} - {dayjs(event.to).format("HH:mm")}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
