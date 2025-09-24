'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePromptStore } from '@/store/promptStore';
import Link from 'next/link';

export default function PromptsPage() {
  const { prompts, projects, deletePrompt } = usePromptStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(prompt.content).some(value => 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesProject = filterProject === 'all' || prompt.projectId === filterProject;
    const matchesFormat = filterFormat === 'all' || prompt.format.aspectRatio === filterFormat;
    
    return matchesSearch && matchesProject && matchesFormat;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Default';
  };

  const uniqueFormats = Array.from(new Set(prompts.map(p => p.format.aspectRatio)));

  return (
    <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Prompts</h1>
            <p className="text-muted-foreground">
              View and manage all your AI video generation prompts
            </p>
          </div>
          <Link href="/">
            <Button>New Prompt</Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterFormat} onValueChange={setFilterFormat}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {uniqueFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {prompts.length === 0 ? 'No prompts created yet' : 'No prompts match your filters'}
              </p>
              <Link href="/">
                <Button>Create your first prompt</Button>
              </Link>
            </Card>
          ) : (
            filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{prompt.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.content.subject}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {prompt.format.name}
                    </Badge>
                    <Badge variant="outline">
                      {getProjectName(prompt.projectId)}
                    </Badge>
                    {prompt.consistency.seedId && (
                      <Badge variant="outline" className="text-xs">
                        Seed: {prompt.consistency.seedId}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Modified {new Date(prompt.metadata.modified).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePrompt(prompt.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}