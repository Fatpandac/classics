import { useForm, useFieldArray, type DeepPartial } from "react-hook-form";
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
import PreinfoForm, { type PreinfoData } from "./PreinfoForm";
import { useState } from "react";
import Preview from "./Preview";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";

const dynamicFieldSchema = z.object({
  id: z.uuid(),
  class: z.string().min(1, "请输入课程名称"),
  teacher: z.string().optional(),
  location: z.string().optional(),
  week: z.array(number().min(1).max(20)).min(1, "请选择上课周次").max(20),
  weekdays: z.number().min(1, "请选择上课星期").max(7, "最多选择星期天"),
  time: z.array(number()).min(1, "请选择上课节次").max(20),
});

const formSchema = z.object({
  dynamicFields: z
    .array(dynamicFieldSchema)
    .min(1, "Add at least one dynamic field"),
});

function App() {
  const [preinfo, setPreinfo] = useState<DeepPartial<PreinfoData>>({});
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dynamicFields: [
        {
          id: crypto.randomUUID(),
          class: "",
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
    name: "dynamicFields",
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <div className="h-screen w-screen p-10">
      <PreinfoForm
        onChange={(valuse) => {
          setPreinfo(valuse);
        }}
      />
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
                    name={`dynamicFields.${index}.class`}
                    render={({ field: dynamicField }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>课程名称</FormLabel>}
                        <FormControl>
                          <Input
                            {...dynamicField}
                            placeholder="请输入课程名称"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dynamicFields.${index}.teacher`}
                    render={({ field: dynamicField }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>教师名称</FormLabel>}
                        <FormControl>
                          <Input
                            {...dynamicField}
                            placeholder="请输入教师名称"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dynamicFields.${index}.location`}
                    render={({ field: dynamicField }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>上课地址</FormLabel>}
                        <FormControl>
                          <Input
                            {...dynamicField}
                            placeholder="请输入上课地址"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dynamicFields.${index}.weekdays`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>星期</FormLabel>}
                        <Select>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="选择星期" />
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage />
                          <SelectContent>
                            {["一", "二", "三", "四", "五", "六", "日"].map(
                              (day, i) => (
                                <SelectItem
                                  key={i}
                                  value={(i + 1).toString()}
                                  onClick={() => field.onChange(i + 1)}
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
                    name={`dynamicFields.${index}.week`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>排课周次</FormLabel>}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`dynamicFields.${index}.time`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel>排课节次</FormLabel>}
                        <FormControl>
                          <MultiSelect
                            maxCount={3}
                            searchable={false}
                            className="w-full! min-h-9! h-9!"
                            options={Array.from(
                              { length: preinfo.classStartTime?.length ?? 20 },
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
                        <FormMessage />
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
                    const field = form.getValues(`dynamicFields.${index}`);
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
                class: "",
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
            <Dialog>
              <DialogTrigger className="cursor-pointer" asChild>
                <Button variant="outline">
                  Preview
                  <EyeIcon className="ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-3/4! max-w-3/4! p-0! aspect-video">
                <Preview />
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
  );
}

export default App;
