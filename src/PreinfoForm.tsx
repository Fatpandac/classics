import dayjs from "dayjs";
import { zhCN } from "react-day-picker/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "./components/ui/input";
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { PopoverTrigger } from "./components/ui/popover";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { CalendarIcon, MinusCircleIcon, PlusIcon } from "lucide-react";
import { Calendar, CalendarDayButton } from "./components/ui/calendar";
import type { PreinfoData } from "./App";
import { useDialog } from "./hooks/useDialog";

function PreinfoForm() {
  const form = useFormContext<PreinfoData>();

  const dates = useWatch({
    control: form.control,
    name: "preinfo.classStartTime",
  });
  const events = useWatch({ control: form.control, name: "events" });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "preinfo.classStartTime",
  });

  const showDialog = useDialog();

  return (
    <div className="not-last:mb-4 not-last:border-b-1 not-last:pb-4 border-b-slate-200">
      <Form {...form}>
        <div className="flex flex-col space-y-2">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="preinfo.calendarName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日历名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入课程表名称" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preinfo.maxWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大周数</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="请输入最大周数"
                      onChange={(e) => {
                        const changedValue = parseInt(e.target.value, 10);

                        const eventsMaxWeek = Math.max(...events.map((e) => e.week).flat());
                        if (changedValue < eventsMaxWeek) {
                          showDialog({
                            title: "无法设置",
                            description: `已有课程使用了第 ${eventsMaxWeek} 周，请先删除相关课程后再尝试。`,
                            confirmText: "我知道了",
                          })
                          return;
                        }
                        field.onChange(parseInt(e.target.value, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preinfo.classTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>每节课时</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="请输入每节课时"
                      onChange={(e) => {
                        field.onChange(parseInt(e.target.value, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preinfo.startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>第一周的星期一</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("YYYY-MM-DD")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto mt-2 p-0 border-gray-200 border-1 rounded-md overflow-hidden"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
                        locale={zhCN}
                        components={{
                          DayButton: ({
                            children,
                            modifiers,
                            day,
                            ...props
                          }) => {
                            const isMonDay = day.date.getDay() === 1;
                            return (
                              <CalendarDayButton
                                day={day}
                                modifiers={modifiers}
                                {...props}
                                disabled={!isMonDay}
                              >
                                {children}
                              </CalendarDayButton>
                            );
                          },
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`preinfo.classStartTime.${index}`}
                render={({ field: dynamicField }) => {
                  return (
                    <FormItem className="w-26">
                      <FormLabel>
                        {`第 ${index + 1} 节`}
                        <Button
                          className="p-0 h-2 w-2 text-gray-500 cursor-pointer"
                          variant="link"
                          onClick={() => {
                            if (dates.length === 1) {
                              return;
                            }
                            const eventsMaxClassOrder = Math.max(
                              ...events.map((e) => e.time).flat(),
                            );
                            if (eventsMaxClassOrder >= fields.length) {
                              showDialog({
                                title: "无法删除",
                                description:
                                  `已有课程使用了第 ${eventsMaxClassOrder} 节课，请先删除相关课程后再尝试。`,
                                confirmText: "我知道了",
                              });
                              return;
                            }
                            remove(index);
                          }}
                        >
                          <MinusCircleIcon />
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...dynamicField}
                          type="time"
                          value={dynamicField.value.time}
                          onChange={(e) => {
                            const value = e.target.value;
                            const current = form.getValues(
                              "preinfo.classStartTime",
                            );
                            current[index].time = value;
                            form.setValue("preinfo.classStartTime", current);
                          }}
                          placeholder="请选择上课时间"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              className="border-dashed"
              hidden={fields.length >= 20}
              size="icon"
              onClick={() => {
                const freeClassTime = 10;
                const current = form.getValues("preinfo.classStartTime");
                const classTime = form.getValues("preinfo.classTime");
                const lastClassTime = current[current.length - 1];
                const appendClassTime = {
                  time: dayjs(lastClassTime.time, "HH:mm")
                    .add(classTime + freeClassTime, "minute")
                    .format("HH:mm"),
                };
                if (current.length < 20) {
                  append(appendClassTime);
                }
              }}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default PreinfoForm;
