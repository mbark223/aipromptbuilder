import { usePromptStore } from '@/store/promptStore';
import type { Prompt, Format } from '@/types';

export function usePrompts() {
  const {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptById,
    getPromptsByProject,
    currentFormat,
    setCurrentFormat,
  } = usePromptStore();

  const createPrompt = (
    promptData: Partial<Prompt>,
    projectId?: string
  ): Prompt => {
    const newPrompt: Prompt = {
      id: generateId(),
      projectId: projectId || 'default',
      title: promptData.title || 'Untitled Prompt',
      content: promptData.content || {
        subject: '',
        style: '',
        composition: '',
        lighting: '',
        motion: '',
        technical: '',
      },
      format: promptData.format || currentFormat || getDefaultFormat(),
      consistency: promptData.consistency || {
        lockedParams: [],
        colorPalette: [],
      },
      metadata: {
        created: new Date(),
        modified: new Date(),
        author: 'current-user', // TODO: Implement user system
        version: 1,
        tags: promptData.metadata?.tags || [],
      },
    };

    addPrompt(newPrompt);
    return newPrompt;
  };

  const duplicatePrompt = (promptId: string): Prompt | null => {
    const original = getPromptById(promptId);
    if (!original) return null;

    const duplicated = createPrompt({
      ...original,
      title: `${original.title} (Copy)`,
      metadata: {
        ...original.metadata,
        created: new Date(),
        modified: new Date(),
        version: 1,
      },
    }, original.projectId);

    return duplicated;
  };

  const batchCreatePrompts = (
    basePrompt: Partial<Prompt>,
    formats: Format[],
    projectId?: string
  ): Prompt[] => {
    return formats.map((format) =>
      createPrompt({
        ...basePrompt,
        format,
        title: `${basePrompt.title} - ${format.name}`,
      }, projectId)
    );
  };

  return {
    prompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getPromptById,
    getPromptsByProject,
    duplicatePrompt,
    batchCreatePrompts,
    currentFormat,
    setCurrentFormat,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultFormat(): Format {
  return {
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    name: 'Horizontal',
    custom: false,
  };
}