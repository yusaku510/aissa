import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { TravelRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useLocation } from "wouter";

// ステータスの日本語マッピング
const statusLabels: Record<string, string> = {
  pending: "審査中",
  approved: "承認済",
  rejected: "却下",
};

export default function Requests() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  const { data: requests = [], isLoading } = useQuery<TravelRequest[]>({
    queryKey: ["/api/travel-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/travel-requests/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-requests"] });
      toast({
        title: "成功",
        description: "申請ステータスを更新しました",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests.filter((request) =>
    request.departmentCode.toLowerCase().includes(search.toLowerCase()) ||
    request.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">申請データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">出張申請システム</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="申請を検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => navigate("/new-request")} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              新規申請
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部門</TableHead>
                <TableHead>目的</TableHead>
                <TableHead>人数</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.departmentCode}</TableCell>
                  <TableCell>{request.purpose}</TableCell>
                  <TableCell>{request.numberOfTravelers}名</TableCell>
                  <TableCell>¥{request.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(request.status)} text-white`}
                    >
                      {statusLabels[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          詳細を見る
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>出張申請の詳細</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">部門</h4>
                            <p>{request.departmentCode}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">目的</h4>
                            <p>{request.purpose}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">出張者人数</h4>
                            <p>{request.numberOfTravelers}名</p>
                          </div>
                          <div>
                            <h4 className="font-medium">合計金額</h4>
                            <p>¥{request.totalAmount.toLocaleString()}</p>
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: request.id,
                                    status: "approved",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                承認
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: request.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                却下
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}