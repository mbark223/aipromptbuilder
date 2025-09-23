'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePromptStore } from '@/store/promptStore';
import { Project } from '@/types';

export default function ProjectsPage() {
  const { projects, addProject, deleteProject, prompts } = usePromptStore();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: generateId(),
      name: newProjectName,
      description: newProjectDescription,
      created: new Date(),
      modified: new Date(),
      prompts: [],
      tags: [],
    };

    addProject(newProject);
    setNewProjectName('');
    setNewProjectDescription('');
    setDialogOpen(false);
  };

  const getProjectPromptCount = (projectId: string) => {
    return prompts.filter((p) => p.projectId === projectId).length;
  };

  return (
    <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Organize your prompts into projects for better management
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                Create your first project
              </Button>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </Button>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {getProjectPromptCount(project.id)} prompts
                  </span>
                  <span className="text-muted-foreground">
                    Created {new Date(project.created).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View Project
                </Button>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}