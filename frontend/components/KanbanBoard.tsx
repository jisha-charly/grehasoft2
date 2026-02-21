import React, { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "../types";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: number, updates: Partial<Task>) => void; // ✅ FIXED
  onTasksReorder: (newTasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
}

/* ---------------- SORTABLE CARD ---------------- */

const SortableTaskCard: React.FC<{
  task: Task;
  onClick: () => void;
}> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card mb-3 p-3 border-0 shadow-sm bg-white"
    >
      <div {...attributes} {...listeners} className="mb-2 cursor-grab">
        <span className="text-muted small">#{task.id}</span>
      </div>

      <div onClick={onClick} className="cursor-pointer">
        <h6 className="fw-bold">{task.title}</h6>
        <p className="small text-muted">
          {task.description.substring(0, 60)}
        </p>
      </div>
    </div>
  );
};

/* ---------------- COLUMN ---------------- */

const KanbanColumn: React.FC<{
  status: TaskStatus;
  tasks: Task[];
  title: string;
  onTaskClick: (task: Task) => void;
}> = ({ status, tasks, title, onTaskClick }) => {
  return (
    <div className="flex-grow-1 mx-2 p-3 bg-light rounded">
      <h6 className="fw-bold text-uppercase small">{title}</h6>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </SortableContext>
    </div>
  );
};

/* ---------------- BOARD ---------------- */

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskUpdate,
  onTasksReorder,
  onTaskClick,
}) => {
  const [activeId, setActiveId] = useState<number | null>(null); // ✅ number

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id;

    // If dropped over column
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      if (activeTask.status !== overId) {
        onTaskUpdate(activeTask.id, {
          status: overId as TaskStatus,
        });
      }
      return;
    }

    // If dropped over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      onTaskUpdate(activeTask.id, {
        status: overTask.status,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onTasksReorder(arrayMove(tasks, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const columns = [
    { status: TaskStatus.TODO, title: "To Do" },
    { status: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { status: TaskStatus.BLOCKED, title: "Blocked" },
    { status: TaskStatus.DONE, title: "Completed" },
  ];

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="d-flex gap-3">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={tasks.filter((t) => t.status === col.status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.5" } },
          }),
        }}
      >
        {activeTask ? (
          <div className="card p-3 shadow bg-white">
            <strong>{activeTask.title}</strong>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;