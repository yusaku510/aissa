import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";
import { StepIndicator } from "@/components/ui/step-indicator";
import { insertTravelRequestSchema, type InsertTravelRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import * as z from 'zod';

// サンプルデータ（実際のデータはAPIから取得する）
const EMPLOYEES = [
  { id: "1", name: "山田太郎" },
  { id: "2", name: "鈴木花子" },
  { id: "3", name: "佐藤次郎" },
];

const DEPARTMENTS = [
  { id: "1", name: "営業部" },
  { id: "2", name: "技術部" },
  { id: "3", name: "管理部" },
];

// 基本情報のバリデーションスキーマ
const basicInfoSchema = z.object({
  applicantId: z.string().min(1, "申請者を選択してください"),
  departmentId: z.string().min(1, "部門を選択してください"),
  travelers: z.array(z.string()).min(1, "出張者を選択してください"),
  destination: z.string().min(1, "出張先を入力してください"),
  purpose: z.string().min(1, "目的を入力してください"),
  arrangeType: z.enum(["ssa", "self"], {
    required_error: "手配方法を選択してください",
  }),
});

// 宿泊情報のバリデーションスキーマ
const accommodationSchema = z.object({
  startDate: z.date({
    required_error: "出張開始日を選択してください",
  }),
  endDate: z.date({
    required_error: "出張終了日を選択してください",
  }),
  hasHolidayWork: z.boolean().optional(),
  numberOfNights: z.number().min(0, "宿泊日数を入力してください"),
  prefecture: z.string().min(1, "宿泊先都道府県を選択してください"),
  totalAmount: z.number().min(0, "宿泊金額を入力してください"),
  hasPreStay: z.boolean().default(false),
  hasPostStay: z.boolean().default(false),
  preStayReason: z.string().optional(),
  postStayReason: z.string().optional(),
});

// 都道府県のサンプルデータ
const PREFECTURES = [
  "北海道", "東京都", "大阪府", "福岡県",
  // ... 他の都道府県
];

const steps = ["基本情報", "出張者情報", "出張関連経費", "内容確認"];

function BasicInfoStep({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="applicantId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>申請者名</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="申請者を選択してください" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EMPLOYEES.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="departmentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>費用負担部門名</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="部門を選択してください" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="travelers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>出張者</FormLabel>
            <div className="flex flex-wrap gap-2">
              {EMPLOYEES.map(employee => (
                <label
                  key={employee.id}
                  className="flex items-center space-x-2 border rounded p-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={employee.id}
                    checked={field.value?.includes(employee.id)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(field.value || []), employee.id]
                        : field.value?.filter((id: string) => id !== employee.id);
                      field.onChange(newValue);
                    }}
                  />
                  <span>{employee.name}</span>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destination"
        render={({ field }) => (
          <FormItem>
            <FormLabel>出張先</FormLabel>
            <FormControl>
              <Input placeholder="出張先を入力" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>出張の目的</FormLabel>
            <FormControl>
              <Textarea placeholder="目的を入力" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="arrangeType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>出張手配方法</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ssa" id="ssa" />
                  <label htmlFor="ssa">SSAによる手配</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <label htmlFor="self">自己手配</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function TravelersStep({ form }: { form: any }) {
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);
  const travelers = form.watch("travelers") || [];

  // 選択された出張者の名前を取得
  const getTravelerName = (id: string) => {
    const employee = EMPLOYEES.find(emp => emp.id === id);
    return employee ? employee.name : "";
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">出張者情報の入力</h3>
        <p className="text-sm text-muted-foreground">
          出張者を選択して、それぞれの宿泊・移動情報を入力してください。
        </p>
      </div>

      <Tabs
        value={selectedTraveler || travelers[0]}
        onValueChange={setSelectedTraveler}
        className="w-full"
      >
        <TabsList className="mb-4">
          {travelers.map((travelerId: string) => (
            <TabsTrigger key={travelerId} value={travelerId}>
              {getTravelerName(travelerId)}
            </TabsTrigger>
          ))}
        </TabsList>

        {travelers.map((travelerId: string) => (
          <TabsContent key={travelerId} value={travelerId}>
            <Card>
              <CardHeader>
                <CardTitle>{getTravelerName(travelerId)}の情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 宿泊情報 */}
                <div className="space-y-4">
                  <h4 className="font-medium">宿泊情報</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`accommodations.${travelerId}.startDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>出張開始日</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy年MM月dd日", { locale: ja })
                                  ) : (
                                    <span>日付を選択</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={ja}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`accommodations.${travelerId}.endDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>出張終了日</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy年MM月dd日", { locale: ja })
                                  ) : (
                                    <span>日付を選択</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={ja}
                                disabled={(date) =>
                                  date < form.watch(`accommodations.${travelerId}.startDate`)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`accommodations.${travelerId}.numberOfNights`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>宿泊日数</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="宿泊日数を入力"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`accommodations.${travelerId}.prefecture`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>宿泊先都道府県</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="都道府県を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PREFECTURES.map(prefecture => (
                              <SelectItem key={prefecture} value={prefecture}>
                                {prefecture}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`accommodations.${travelerId}.totalAmount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>宿泊金額合計</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="金額を入力"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`accommodations.${travelerId}.hasPreStay`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>前泊あり</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch(`accommodations.${travelerId}.hasPreStay`) && (
                      <FormField
                        control={form.control}
                        name={`accommodations.${travelerId}.preStayReason`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>前泊の理由</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="前泊が必要な理由を入力"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`accommodations.${travelerId}.hasPostStay`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>後泊あり</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch(`accommodations.${travelerId}.hasPostStay`) && (
                      <FormField
                        control={form.control}
                        name={`accommodations.${travelerId}.postStayReason`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>後泊の理由</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="後泊が必要な理由を入力"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* 移動情報 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">移動情報</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentTransportation = form.watch(`transportation.${travelerId}`) || [];
                        form.setValue(`transportation.${travelerId}`, [
                          ...currentTransportation,
                          { departure: "", destination: "", amount: 0, transportationType: "" }
                        ]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      移動情報を追加
                    </Button>
                  </div>

                  {(form.watch(`transportation.${travelerId}`) || []).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`transportation.${travelerId}.${index}.departure`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>出発地</FormLabel>
                                <FormControl>
                                  <Input placeholder="出発地を入力" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`transportation.${travelerId}.${index}.destination`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>到着地</FormLabel>
                                <FormControl>
                                  <Input placeholder="到着地を入力" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`transportation.${travelerId}.${index}.transportationType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>移動手段</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="移動手段を選択" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="train">電車</SelectItem>
                                  <SelectItem value="airplane">飛行機</SelectItem>
                                  <SelectItem value="bus">バス</SelectItem>
                                  <SelectItem value="taxi">タクシー</SelectItem>
                                  <SelectItem value="other">その他</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`transportation.${travelerId}.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>金額</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="金額を入力"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ExpensesStep() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">出張関連経費</h3>
      <p className="text-muted-foreground">この機能は準備中です。</p>
    </div>
  );
}

function ConfirmationStep() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">内容確認</h3>
      <p className="text-muted-foreground">この機能は準備中です。</p>
    </div>
  );
}

export default function NewRequest() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      applicantId: "",
      departmentId: "",
      travelers: [],
      destination: "",
      purpose: "",
      arrangeType: undefined,
      accommodations: {},
      transportation: {}, // 移動情報の初期値を追加
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/travel-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "申請完了",
        description: "出張申請が正常に送信されました",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "出張申請の送信に失敗しました",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={form} />;
      case 1:
        return <TravelersStep form={form} />;
      case 2:
        return <ExpensesStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        return null;
    }
  };

  const onSubmit = (data: any) => {
    if (currentStep === steps.length - 1) {
      mutation.mutate(data);
    } else {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">出張申請</h1>

        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="max-w-2xl mx-auto mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-6 border rounded-lg">
                {getCurrentStepComponent()}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (currentStep === 0 ? navigate("/") : prevStep())}
                >
                  {currentStep === 0 ? "キャンセル" : "前へ"}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {currentStep === steps.length - 1
                    ? mutation.isPending
                      ? "送信中..."
                      : "申請する"
                    : "次へ"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}