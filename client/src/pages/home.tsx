import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">出張申請システム</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <PlusCircle className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">新規申請</h2>
                <p className="text-muted-foreground mb-4">
                  新しい出張申請を作成します
                </p>
                <Link href="/new-request">
                  <Button className="w-full">申請を作成</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <ClipboardList className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">申請一覧</h2>
                <p className="text-muted-foreground mb-4">
                  出張申請の一覧を確認します
                </p>
                <Link href="/requests">
                  <Button className="w-full" variant="outline">一覧を表示</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}