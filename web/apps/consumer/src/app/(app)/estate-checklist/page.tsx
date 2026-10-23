"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { estateChecklist as checklistApi, type EstateChecklistDto, type EstateTaskDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

const CATEGORIES = ["HomeAffairs", "Banking", "Insurance", "Legal", "Medical", "Property", "Social", "Utilities", "Other"];

const CATEGORY_LABELS: Record<string, string> = {
  HomeAffairs: "Home Affairs",
  Banking: "Banking",
  Insurance: "Insurance",
  Legal: "Legal",
  Medical: "Medical",
  Property: "Property",
  Social: "Social Media & Accounts",
  Utilities: "Utilities",
  Other: "Other",
};

export default function EstateChecklistPage() {
  const [checklist, setChecklist] = useState<EstateChecklistDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Activate form
  const [deceasedFullName, setDeceasedFullName] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");

  // Add task form
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCategory, setTaskCategory] = useState("Other");
  const [addingTask, setAddingTask] = useState(false);
  const [addTaskError, setAddTaskError] = useState("");

  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    checklistApi.get(token)
      .then((data) => {
        setChecklist(data);
        setNotFound(false);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setActivating(true);
    setActivateError("");
    try {
      const created = await checklistApi.create(token, { deceasedFullName, dateOfDeath });
      setChecklist(created);
      setNotFound(false);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : "Failed to create checklist");
    } finally {
      setActivating(false);
    }
  }

  async function toggleTask(task: EstateTaskDto) {
    const token = getToken();
    if (!token) return;
    setTogglingId(task.id);
    try {
      const updated = await checklistApi.completeTask(token, task.id, !task.isCompleted);
      setChecklist((prev) =>
        prev ? { ...prev, tasks: prev.tasks.map((t) => t.id === task.id ? { ...t, isCompleted: updated.isCompleted } : t) } : prev
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setAddingTask(true);
    setAddTaskError("");
    try {
      const newTask = await checklistApi.addTask(token, {
        title: taskTitle,
        description: taskDescription,
        category: taskCategory,
      });
      setChecklist((prev) => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : prev);
      setShowAddTask(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskCategory("Other");
    } catch (err) {
      setAddTaskError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setAddingTask(false);
    }
  }

  const totalTasks = checklist?.tasks.length ?? 0;
  const completedTasks = checklist?.tasks.filter((t) => t.isCompleted).length ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-full">
      <AppHeader title="Estate Checklist" />

      <div className="px-6 py-6 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
          </div>
        )}

        {/* Activate checklist */}
        {!loading && notFound && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-dusk-ink px-4 py-5 space-y-2">
              <Text color="light" variant="heading_sub" >Estate checklist</Text>
              <Text color="light" variant="body_small" faded >
                When someone passes, there are many administrative tasks to manage. Activate this checklist to get a personalised step-by-step guide through the process.
              </Text>
            </div>

            <form onSubmit={handleActivate} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text >Activate checklist</Text>

              <div className="space-y-1">

                <Input
                  label="Name of the deceased"
                  type="text"
                  value={deceasedFullName}
                  onChange={(e) => setDeceasedFullName(e.target.value)}
                  placeholder="Full name as on ID"
                  required
                  className="w-full "
                />
              </div>

              <div className="space-y-1">

                <Input
                  label="date of death"
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  required
                  className="w-full "
                />
              </div>

              {activateError && <Text variant="body_small" className="text-ember">{activateError}</Text>}

              <Button
                type="submit"
                disabled={activating}
                className="w-full"
              >
                {activating ? "Creating checklist…" : "Create my checklist"}
              </Button>
            </form>
          </div>
        )}

        {/* Checklist exists */}
        {!loading && checklist && (
          <>
            {/* Progress header */}
            <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-3">
              <div>
                <Text variant="body_small_sec" superFaded color="light" >Estate of</Text>
                <Text variant="heading_small" color="light" className="mt-0.5">{checklist.deceasedFullName}</Text>
                <Text variant="body_small" superFaded color="light" className="mt-0.5">
                  {new Date(checklist.dateOfDeath).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                </Text>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Text variant="body_small" superFaded color="light" >{completedTasks} of {totalTasks} tasks complete</Text>
                  <Text variant="body_small_sec" superFaded color="light" >{progressPct}%</Text>
                </div>
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Empty tasks state */}
            {checklist.tasks.length === 0 && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6 text-center">
                <Text >No tasks yet. Add a custom task below to get started.</Text>
              </div>
            )}

            {/* Tasks grouped by category */}
            {CATEGORIES.map((cat) => {
              const catTasks = checklist.tasks.filter((t) => t.category === cat);
              if (catTasks.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <Text variant="body_small"  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </Text>
                  <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                    {catTasks.map((task, i) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task)}
                        disabled={togglingId === task.id}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition hover:bg-dusk-ink/4 disabled:opacity-60 ${i < catTasks.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted ? "bg-sage border-sage" : "border-dusk-ink/25"
                          }`}>
                          {task.isCompleted && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text variant="body" className={` ${task.isCompleted ? "text-dusk-ink/40 line-through" : "text-dusk-ink"}`}>
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text variant="body_small" className="mt-0.5 leading-relaxed">{task.description}</Text>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Other/custom tasks not in standard categories */}
            {(() => {
              const customTasks = checklist.tasks.filter((t) => !CATEGORIES.includes(t.category));
              if (customTasks.length === 0) return null;
              return (
                <div className="space-y-2">
                  <Text variant="body_small" faded className="uppercase tracking-wider px-1">Custom tasks</Text>
                  <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                    {customTasks.map((task, i) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task)}
                        disabled={togglingId === task.id}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition hover:bg-dusk-ink/4 disabled:opacity-60 ${i < customTasks.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted ? "bg-sage border-sage" : "border-dusk-ink/25"
                          }`}>
                          {task.isCompleted && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text variant="body" className={`font-sans text-sm font-medium ${task.isCompleted ? "text-dusk-ink/40 line-through" : "text-dusk-ink"}`}>
                            {task.title}
                          </Text>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Add custom task */}
            {!showAddTask && (
              <Button
                variant="sec"
                onClick={() => setShowAddTask(true)}
                className="w-full "
              >
                + Add custom task
              </Button>
            )}

            {showAddTask && (
              <form onSubmit={handleAddTask} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Text >Add custom task</Text>
                  <button type="button" onClick={() => setShowAddTask(false)} className="text-dusk-ink/40 hover:text-dusk-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">

                  <Input
                    label="Task title"
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Notify pension fund"
                    required
                    className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Description (optional)</label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Additional details…"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
                  </select>
                </div>

                {addTaskError && <Text variant="body_small" className="text-ember">{addTaskError}</Text >}

                <div className="flex gap-2">
                  <Button variant="sec" type="button" onClick={() => setShowAddTask(false)}
                    className="flex-1 ">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addingTask}
                    className="flex-1">
                    {addingTask ? "Adding…" : "Add task"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
