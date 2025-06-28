import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSavedProjects, useDeleteProject, type SavedProject } from "@/hooks/useSavedProjects";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MoreVertical, Trash2, FolderOpen, Calculator, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import EditProjectDialog from "@/components/EditProjectDialog";

export default function SavedProjectsListSimple() {
  const { data: projects, isLoading } = useSavedProjects();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<SavedProject | null>(null);


  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject.mutateAsync(projectToDelete.id);
      toast({
        title: "專案已刪除",
        description: `專案「${projectToDelete.projectName}」已成功刪除`,
      });
      setProjectToDelete(null);
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: "無法刪除專案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "campaign_planner":
        return "活動預算規劃";
      case "budget_calculator":
        return "廣告預算計算";
      default:
        return type;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "campaign_planner":
        return <Calendar className="h-4 w-4" />;
      case "budget_calculator":
        return <Calculator className="h-4 w-4" />;
      default:
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>已儲存的專案</CardTitle>
          <CardDescription>管理您儲存的預算計算和活動規劃專案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>已儲存的專案</CardTitle>
          <CardDescription>管理您儲存的預算計算和活動規劃專案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">尚無儲存的專案</h3>
            <p className="text-gray-500 mb-4">
              當您完成預算計算或活動規劃後，可以選擇儲存專案以便日後查看和編輯
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>已儲存的專案</CardTitle>
          <CardDescription>管理您儲存的預算計算和活動規劃專案</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {projects.filter(project => project && project.projectName).map((project: SavedProject) => (
              <Card key={project.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getProjectTypeIcon(project.projectType || 'default')}
                        <h3 className="font-semibold text-gray-900">{project.projectName || '未命名專案'}</h3>
                        <Badge variant="secondary">
                          {getProjectTypeLabel(project.projectType || 'default')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>
                          建立時間：{project.createdAt ? format(new Date(project.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhTW }) : '未知'}
                        </div>
                        <div>
                          最後更新：{project.updatedAt ? format(new Date(project.updatedAt), "yyyy年MM月dd日 HH:mm", { locale: zhTW }) : '未知'}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            alert(`專案詳情：\n名稱：${project.projectName}\n類型：${getProjectTypeLabel(project.projectType)}\n建立時間：${format(new Date(project.createdAt), "yyyy年MM月dd日", { locale: zhTW })}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          檢視詳情
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setProjectToEdit(project)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          編輯專案
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setProjectToDelete(project)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          刪除專案
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={projectToEdit!}
        open={!!projectToEdit}
        onOpenChange={(open) => {
          if (!open) setProjectToEdit(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除專案</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除專案「{projectToDelete?.projectName}」嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}