import * as React from "react";
import { formatDateRange } from "little-date";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "lucide-react";

const events = [
  {
    title: "Team Sync Meeting",
    from: "2025-10-01T09:00:00",
    to: "2025-10-01T10:00:00",
  },
  {
    title: "Design Review",
    from: "2025-10-01T11:30:00",
    to: "2025-10-01T12:30:00",
  },
  {
    title: "Client Presentation",
    from: "2025-10-01T14:00:00",
    to: "2025-10-01T15:00:00",
  },
];

export default function Preview() {
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
  }, [date]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <Card className="w-4/5 py-4">
        <CardContent className="px-4 display flex flex-row gap-4 h-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
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
                        currentDayEvents.map((event) => {
                          return (
                            <Badge
                              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
                              key={event.title}
                            >
                              1
                            </Badge>
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
              {currentDayEvents.length > 0 && events.map((event) => (
                <div
                  key={event.title}
                  className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatDateRange(new Date(event.from), new Date(event.to))}
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
