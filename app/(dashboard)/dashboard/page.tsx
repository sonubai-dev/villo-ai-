"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Sparkles, 
  Play, 
  MoreVertical, 
  Clock, 
  Copy, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  ArrowRight,
  UserSquare2,
  Image as ImageIcon,
  Presentation,
  SplitSquareVertical,
  FileText,
  Zap,
  Flame
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useProjects } from "@/services/projects";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDuration, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    projects, 
    isLoading,
    duplicateProject, 
    deleteProject, 
    updateProject 
  } = useProjects();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const handleOpenRename = (id: string, currentTitle: string) => {
    setSelectedProjectId(id);
    setRenameTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleSaveRename = async () => {
    if (selectedProjectId && renameTitle.trim()) {
      await updateProject(selectedProjectId, { title: renameTitle.trim() });
      setRenameDialogOpen(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateProject(id);
    if (duplicated) {
      router.push(`/projects/${duplicated.id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-semibold text-sky-300 border border-sky-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Avatar Video Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name?.split(" ")[0] || "Creator"}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create high-converting AI avatar videos with neural voice lip-sync, motion graphics, and VFX in minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create">
              <Button variant="glow" size="lg" className="font-semibold gap-2 shadow-lg shadow-sky-500/20">
                <Plus className="h-5 w-5" />
                <span>Create Avatar Video</span>
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="secondary" size="lg" className="gap-2">
                <span>Browse Templates</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Creation Mode Quick Launch Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Avatar Creation Studio Hub</span>
          </h2>
          <Link href="/create" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <span>Start New Video</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/create"
            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-sky-500/40 bg-gradient-to-b from-sky-950/30 to-slate-900/80 hover:bg-slate-900 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-md shadow-sky-500/20">
                <UserSquare2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-sky-300">
                  AI Avatar Video Studio
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  8-step guided creation: Avatar, script, voice, motion, visuals, and VFX.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-sky-400 flex items-center justify-between">
              <span>Start Studio Flow</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/avatars"
            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-purple-300">
                  AI Avatar Library
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Browse photorealistic presenters across Business, Creator, Real Estate, and more.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-purple-400 flex items-center justify-between">
              <span>Explore Avatars</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/voices"
            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-amber-300">
                  Voice &amp; Cloning
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Default neural accents plus custom ElevenLabs cloned voices.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Listen &amp; Clone</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/templates"
            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block group-hover:text-emerald-300">
                  Avatar Templates
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Pre-configured video scenes for social hooks, tutorials, and product pitches.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Browse Templates</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Projects</h2>
            <p className="text-xs text-slate-400">Continue editing your video creations</p>
          </div>

          <Link href="/projects" className="text-xs font-semibold text-sky-400 hover:text-sky-300">
            View All ({projects.length})
          </Link>
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 animate-pulse">
                <div className="aspect-video w-full rounded-xl bg-slate-800/60" />
                <div className="h-4 w-2/3 rounded bg-slate-800/60" />
                <div className="h-3 w-1/3 rounded bg-slate-800/40" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No video projects yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Choose one of the 5 creation modes above to generate your first AI presenter video.
            </p>
            <Link href="/create">
              <Button variant="glow" size="sm">Create First Video</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl"
              >
                {/* Thumbnail Header */}
                <div
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-950"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badges on top of thumbnail */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge variant="secondary" className="bg-black/70 backdrop-blur-md border-none text-[10px] uppercase font-bold">
                      {project.aspectRatio}
                    </Badge>
                    <Badge
                      variant={project.status === "completed" ? "success" : "secondary"}
                      className="bg-black/70 backdrop-blur-md border-none text-[10px] capitalize"
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-mono text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{formatDuration(project.duration)}</span>
                  </div>
                </div>

                {/* Card Content & Action row */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="text-sm font-bold text-white hover:text-sky-300 transition-colors cursor-pointer line-clamp-1"
                      >
                        {project.title}
                      </h3>

                      <DropdownMenu
                        trigger={
                          <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      >
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                          <Play className="h-3.5 w-3.5" />
                          <span>Open in Editor</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenRename(project.id, project.title)}>
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(project.id)}>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {project.scenes.length} {project.scenes.length === 1 ? "scene" : "scenes"} · Created {formatDate(project.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Mode: {project.type}
                    </span>
                    <Button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs px-2.5"
                    >
                      Edit Video
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Enter a new name for your video creation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3">
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            placeholder="e.g. Luxury Penthouse Walkthrough"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setRenameDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="glow" onClick={handleSaveRename}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
