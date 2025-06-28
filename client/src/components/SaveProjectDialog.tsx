import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSaveProject } from "@/hooks/useSavedProjects";
import { Save, Loader2 } from "lucide-react";

interface SaveProjectDialogProps {
  projectData: any;
  calculationResult?: any;
  projectType?: string;
  children?: React.ReactNode;
}

export default function SaveProjectDialog({ 
  projectData, 
  calculationResult, 
  projectType = "campaign_planner",
  children 
}: SaveProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const { toast } = useToast();
  const saveProject = useSaveProject();

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast({
        title: "請輸入專案名稱",
        description: "請為您的專案命名",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveProject.mutateAsync({
        projectName: projectName.trim(),
        projectType,
        projectData,
        calculationResult,
      });

      toast({
        title: "專案已儲存",
        description: `專案「${projectName}」已成功儲存到您的儀表板`,
      });

      setOpen(false);
      setProjectName("");
    } catch (error) {
      toast({
        title: "儲存失敗",
        description: "無法儲存專案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            儲存專案
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>儲存專案</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">專案名稱</Label>
            <Input
              id="project-name"
              placeholder="例如：Q1 新產品推廣活動"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saveProject.isPending) {
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saveProject.isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveProject.isPending || !projectName.trim()}
          >
            {saveProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            儲存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}