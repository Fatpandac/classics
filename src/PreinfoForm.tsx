import z from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { zhCN } from "react-day-picker/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { PopoverTrigger } from "./components/ui/popover";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { CalendarIcon, MinusCircleIcon, PlusIcon } from "lucide-react";
import { Calendar, CalendarDayButton } from "./components/ui/calendar";
import { useEffect } from "react";

dayjs.extend(customParseFormat);

const formSchema = z.object({
  calendarName: z.string().optional(),
  maxWeek: z.number().min(1, "请输入最大周数").max(20, "最大周数不能超过20"),
  classStartTime: z
    .array(
      z.object({
        time: z.string().min(1, "不能添加空的课时"),
      }),
    )
    .max(20, "最多添加 20 节课时")
    .nonempty("请至少添加一节课时"),
  classTime: z.number().min(1, "请输入每节课时间"),
  startDate: z.date(),
});

export type PreinfoData = z.infer<typeof formSchema>;

function PreinfoForm(props: { onChange: (data: PreinfoData) => void }) {
  const form = useForm<PreinfoData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calendarName: "课程表",
      maxWeek: 20,
      classStartTime: [{ time: "08:00" }],
      classTime: 45,
      startDate: dayjs().startOf("week").add(1, "day").toDate(),
    },
  });

  const dates = useWatch({ control: form.control, name: "classStartTime" });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "classStartTime",
  });

  const allFormValues = useWatch({
    control: form.control,
  });

  useEffect(() => {
    form.trigger().then((res) => {
      if (res) {
        props.onChange(allFormValues as PreinfoData);
      }
    });
  }, [allFormValues, props, form]);

  return (
    <div className="not-last:mb-4 not-last:border-b-1 not-last:pb-4 border-b-slate-200">
      <Form {...form}>
        <form className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="w-full grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="calendarName"
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
                name="maxWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大周数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="请输入最大周数"
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
                name="classTime"
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
                name="startDate"
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
                              field.value.toLocaleDateString()
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
                          selected={field.value}
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
                  name={`classStartTime.${index}`}
                  render={({ field: dynamicField }) => {
                    return (
                      <FormItem className="w-24">
                        <FormLabel>
                          {`第 ${index + 1} 节`}
                          <Button
                            className="p-0 h-2 w-2 text-gray-500 cursor-pointer"
                            variant="link"
                            onClick={() => {
                              if (dates.length === 1) {
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
                              const current = form.getValues("classStartTime");
                              current[index].time = value;
                              form.setValue("classStartTime", current);
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
                  const current = form.getValues("classStartTime");
                  const classTime = form.getValues("classTime");
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
        </form>
      </Form>
    </div>
  );
}

export default PreinfoForm;
