import {
  useForm,
  useFieldArray,
  useWatch,
  FormProvider,
} from "react-hook-form";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { number, z } from "zod";
import {
  CopyIcon,
  EyeIcon,
  FileDownIcon,
  MinusCircleIcon,
  PlusIcon,
} from "lucide-react";
import { MultiSelect } from "./components/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { lazy, useEffect, useLayoutEffect, useState } from "react";
import type { Event } from "./Preview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { generateEvent, generateIcs } from "./utils/ics";
import dayjs from "dayjs";
import { base64UrlToJson, jsonToBase64Url } from "./utils/base64";

dayjs.extend(customParseFormat);

const Preview = lazy(() => import("./Preview"));
const PreinfoForm = lazy(() => import("./PreinfoForm"));

const preinfoSchema = z.object({
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
  startDate: z.number(),
});
const eventSchema = z.object({
  id: z.uuid(),
  classname: z.string().min(1, "请输入课程名称"),
  teacher: z.string().optional(),
  location: z.string().optional(),
  week: z.array(number().min(1).max(20)).max(20).nonempty("请选择上课周次"),
  weekdays: z.number().max(7, "最多选择星期天").min(1, "请选择上课星期"),
  time: z.array(number()).min(1, "请选择上课节次").max(20),
});
const formSchema = z.object({
  preinfo: preinfoSchema,
  events: z.array(eventSchema).min(1, "Add at least one dynamic field"),
});

export type PreinfoData = z.infer<typeof formSchema>;
export type FormEvent = z.infer<typeof eventSchema>;

function App() {
  const [openPreview, setOpenPreview] = useState(false);
  const [preveiwEvents, setPreviewEvents] = useState<Array<Event>>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preinfo: {
        calendarName: "课程表",
        maxWeek: 20,
        classStartTime: [{ time: "08:00" }],
        classTime: 45,
        startDate: dayjs().startOf("week").add(1, "day").toDate().getTime(),
      },
      events: [
        {
          id: crypto.randomUUID(),
          classname: "",
          teacher: "",
          location: "",
          week: [],
          weekdays: 0,
          time: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events",
  });

  const [initialized, setInitialized] = useState(false);
  const preinfo = useWatch({ control: form.control, name: "preinfo" });
  const events = useWatch({ control: form.control, name: "events" });

  useLayoutEffect(() => {
    const data = new URLSearchParams(window.location.search).get("data");
    if (data) {
      try {
        const parsed: PreinfoData = base64UrlToJson(data);
        form.reset(parsed);
      } catch (e) {
        console.error("Failed to parse data from URL", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }
    const timer = setTimeout(() => {
      const base64 = jsonToBase64Url({ preinfo, events });
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?data=${base64}`,
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [preinfo, events, initialized]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const ics = generateIcs(data.events, preinfo);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timetable.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <FormProvider {...form}>
      <div className="h-screen w-screen p-10">
        <PreinfoForm />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end space-x-2 not-last:pb-3"
              >
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`events.${index}.classname`}
                      render={({ field: dynamicField }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                课程名称
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <FormControl>
                            <Input
                              {...dynamicField}
                              placeholder="请输入课程名称"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.teacher`}
                      render={({ field: dynamicField }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                教师名称
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <FormControl>
                            <Input
                              {...dynamicField}
                              placeholder="请输入教师名称"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.location`}
                      render={({ field: dynamicField }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                上课地址
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <FormControl>
                            <Input
                              {...dynamicField}
                              placeholder="请输入上课地址"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.weekdays`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                星期
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="选择星期" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["一", "二", "三", "四", "五", "六", "日"].map(
                                (day, i) => (
                                  <SelectItem
                                    key={i}
                                    value={(i + 1).toString()}
                                  >
                                    周{day}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`events.${index}.week`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                排课周次
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <FormControl>
                            <MultiSelect
                              maxCount={3}
                              searchable={false}
                              className="w-full! min-h-9! h-9!"
                              options={Array.from(
                                { length: preinfo.maxWeek ?? 20 },
                                (_, i) => ({
                                  label: `第 ${i + 1} 周`,
                                  value: `${i + 1}`,
                                }),
                              )}
                              onValueChange={(values) => {
                                field.onChange(values.map(Number));
                              }}
                              defaultValue={field.value.map(String)}
                              placeholder="选择周次"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-end">
                            {index === 0 && (
                              <FormLabel className="inline-block text-md">
                                排课节次
                              </FormLabel>
                            )}
                            <FormMessage className="inline-block text-xs ml-2 mb-0.5" />
                          </div>
                          <FormControl>
                            <MultiSelect
                              maxCount={3}
                              searchable={false}
                              className="w-full! min-h-9! h-9!"
                              options={Array.from(
                                { length: preinfo.classStartTime?.length ?? 0 },
                                (_, i) => ({
                                  label: `第 ${i + 1} 节`,
                                  value: `${i + 1}`,
                                }),
                              )}
                              onValueChange={(values) => {
                                field.onChange(values.map(Number));
                              }}
                              defaultValue={field.value.map(String)}
                              placeholder="选择节次"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      const field = form.getValues(`events.${index}`);
                      append({ ...field, id: crypto.randomUUID() });
                    }}
                  >
                    <CopyIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      if (fields.length > 1) remove(index);
                    }}
                  >
                    <MinusCircleIcon />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer w-full border-dashed"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  classname: "",
                  teacher: "",
                  location: "",
                  week: [],
                  weekdays: 0,
                  time: [],
                })
              }
            >
              <PlusIcon className="text-gray-400" />
            </Button>
            <div className="w-full flex justify-end gap-2">
              <Dialog
                open={openPreview}
                onOpenChange={(open) => {
                  if (!open) {
                    setOpenPreview(false);
                  }
                }}
              >
                <DialogTrigger className="cursor-pointer" asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      form.trigger().then((isValid) => {
                        if (isValid) {
                          const data = generateEvent(events, preinfo);
                          setPreviewEvents(data);
                          setOpenPreview(true);
                        }
                      });
                    }}
                  >
                    Preview
                    <EyeIcon className="ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-3/4! max-w-3/4! p-0! aspect-video">
                  <VisuallyHidden>
                    <DialogTitle />
                    <DialogDescription>预览课程表</DialogDescription>
                  </VisuallyHidden>
                  <Preview events={preveiwEvents} />
                </DialogContent>
              </Dialog>
              <Button className="cursor-pointer" type="submit">
                Export
                <FileDownIcon className="ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </FormProvider>
  );
}

export default App;
