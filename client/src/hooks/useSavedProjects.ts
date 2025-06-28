import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface SavedProject {
  id: string;
  userId: string;
  projectName: string;
  projectType: string;
  projectData: any;
  lastCalculationResult?: any;
  createdAt: string;
  updatedAt: string;
}

export function useSavedProjects() {
  return useQuery<SavedProject[]>({
    queryKey: ["/api/projects"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      projectName: string;
      projectType: string;
      projectData: any;
      calculationResult?: any;
    }) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      updates: Partial<{
        projectName: string;
        projectData: any;
        lastCalculationResult: any;
      }>;
    }) => {
      return await apiRequest("PUT", `/api/projects/${data.projectId}`, data.updates);
    },
    onSuccess: (_, variables) => {
      // Force invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${variables.projectId}`] });
      // Also remove from cache to force refetch
      queryClient.removeQueries({ queryKey: [`/api/projects/${variables.projectId}`] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      return await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["/api/projects", projectId],
    queryFn: () => apiRequest("GET", `/api/projects/${projectId}`),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}