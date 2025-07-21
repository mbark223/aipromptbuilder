import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prompt, Project, Template, Format } from '@/types';

interface PromptStore {
  // Prompts
  prompts: Prompt[];
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  getPromptById: (id: string) => Prompt | undefined;
  getPromptsByProject: (projectId: string) => Prompt[];

  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Templates
  templates: Template[];
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => Template | undefined;
  getTemplatesByCategory: (category: string) => Template[];

  // Current state
  currentFormat: Format | null;
  setCurrentFormat: (format: Format | null) => void;
  currentProjectId: string | null;
  setCurrentProjectId: (projectId: string | null) => void;
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // Prompts
      prompts: [],
      addPrompt: (prompt) =>
        set((state) => ({ prompts: [...state.prompts, prompt] })),
      updatePrompt: (id, updatedPrompt) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updatedPrompt } : p
          ),
        })),
      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        })),
      getPromptById: (id) => get().prompts.find((p) => p.id === id),
      getPromptsByProject: (projectId) =>
        get().prompts.filter((p) => p.projectId === projectId),

      // Projects
      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updatedProject) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updatedProject } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          prompts: state.prompts.filter((prompt) => prompt.projectId !== id),
        })),
      getProjectById: (id) => get().projects.find((p) => p.id === id),

      // Templates
      templates: [],
      addTemplate: (template) =>
        set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, updatedTemplate) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updatedTemplate } : t
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      getTemplateById: (id) => get().templates.find((t) => t.id === id),
      getTemplatesByCategory: (category) =>
        get().templates.filter((t) => t.category === category),

      // Current state
      currentFormat: null,
      setCurrentFormat: (format) => set({ currentFormat: format }),
      currentProjectId: null,
      setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),
    }),
    {
      name: 'prompt-store',
    }
  )
);