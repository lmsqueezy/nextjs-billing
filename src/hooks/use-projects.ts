/**
 * React Query hooks for project management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectClient } from "@/lib/project-client";
import {
  Project,
  ProjectWithDetails,
  CreateSegmentData,
  UpdateSegmentData,
} from "@/types/project";

// Query keys
export const projectQueryKeys = {
  all: ["projects"] as const,
  lists: () => [...projectQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...projectQueryKeys.lists(), { filters }] as const,
  details: () => [...projectQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...projectQueryKeys.details(), id] as const,
};

/**
 * Hook to get all projects for the current user
 */
export function useProjects() {
  return useQuery({
    queryKey: projectQueryKeys.lists(),
    queryFn: () => ProjectClient.getUserProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to get a specific project by ID
 */
export function useProject(projectId: string | null) {
  return useQuery<ProjectWithDetails | null, Error>({
    queryKey: projectQueryKeys.detail(projectId || ""),
    queryFn: () => (projectId ? ProjectClient.getProject(projectId) : null),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idea, title }: { idea: string; title?: string }) =>
      ProjectClient.createProject(idea, title),
    onSuccess: (newProject) => {
      // Update the projects list cache
      queryClient.setQueryData<Project[]>(projectQueryKeys.lists(), (old) => {
        if (!old) return [newProject];
        return [newProject, ...old];
      });

      // Set the new project in detail cache
      queryClient.setQueryData(
        projectQueryKeys.detail(newProject.id),
        newProject,
      );

      // Set as current project
      ProjectClient.setCurrentProject(newProject.id);
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<Project>;
    }) => ProjectClient.updateProject(projectId, data),
    onSuccess: (_, { projectId, data }) => {
      // Update the project in detail cache
      queryClient.setQueryData<ProjectWithDetails | null>(
        projectQueryKeys.detail(projectId),
        (old) => {
          if (!old) return null;
          return {
            ...old,
            ...data,
            updatedAt: new Date().toISOString(),
            segments: old.segments || [],
            files: old.files || [],
          };
        },
      );

      // Update the project in the projects list
      queryClient.setQueryData<Project[]>(projectQueryKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((project) =>
          project.id === projectId
            ? { ...project, ...data, updatedAt: new Date().toISOString() }
            : project,
        );
      });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => ProjectClient.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // Remove from projects list
      queryClient.setQueryData<Project[]>(projectQueryKeys.lists(), (old) => {
        if (!old) return old;
        return old.filter((project) => project.id !== projectId);
      });

      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: projectQueryKeys.detail(projectId),
      });

      // Clear current project if it was the deleted one
      if (ProjectClient.getCurrentProjectId() === projectId) {
        ProjectClient.setCurrentProject("");
      }
    },
  });
}

/**
 * Hook to update project segments
 */
export function useUpdateSegments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      segments,
    }: {
      projectId: string;
      segments: Array<{
        text: string;
        imagePrompt: string;
        duration?: number;
        order: number;
      }>;
    }) => ProjectClient.updateSegments(projectId, segments),
    onSuccess: (_, { projectId }) => {
      // Invalidate the project to refetch with updated segments
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(projectId),
      });
    },
  });
}

/**
 * Hook to create a segment
 */
export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateSegmentData;
    }) => ProjectClient.createSegment(projectId, data),
    onSuccess: (newSegment, { projectId }) => {
      // Update the project cache to include the new segment
      queryClient.setQueryData<ProjectWithDetails | null>(
        projectQueryKeys.detail(projectId),
        (old) => {
          if (!old) return null;
          const segments = [
            ...(old.segments || []),
            { ...newSegment, files: [] },
          ];
          return { ...old, segments };
        },
      );
    },
  });
}

/**
 * Hook to update a segment
 */
export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      segmentId,
      data,
    }: {
      projectId: string;
      segmentId: string;
      data: UpdateSegmentData;
    }) => ProjectClient.updateSegment(projectId, segmentId, data),
    onSuccess: (updatedSegment, { projectId, segmentId }) => {
      // Update the project cache with a completely new object to ensure React re-renders
      queryClient.setQueryData<ProjectWithDetails | null>(
        projectQueryKeys.detail(projectId),
        (old) => {
          if (!old) return null;
          
          // Create a new segments array with updated segment
          const segments = old.segments?.map((segment) =>
            segment.id === segmentId
              ? {
                  ...segment,
                  ...updatedSegment,
                  // Ensure updatedAt is always updated to trigger re-renders
                  updatedAt:
                    updatedSegment.updatedAt || new Date().toISOString(),
                  // Force a new object reference to trigger React re-renders
                  id: segment.id,
                }
              : segment,
          ) || [];
          
          // Return a completely new project object with new timestamp
          return {
            ...old,
            segments,
            // Update the project's updatedAt to ensure all dependencies are triggered
            updatedAt: new Date().toISOString(),
            // Force a new object reference to guarantee React re-renders
            id: old.id,
          };
        },
      );
    },
  });
}

/**
 * Hook to get the current project
 */
export function useCurrentProject() {
  const currentProjectId = ProjectClient.getCurrentProjectId();
  return useProject(currentProjectId);
}

/**
 * Hook to refresh all project data
 */
export function useRefreshProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    },
  });
}
