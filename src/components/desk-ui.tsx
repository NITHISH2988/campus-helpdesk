import { Link, useNavigate } from "@tanstack/react-router";
import { Circle, CircleDot, CircleMinus, CircleOff, CheckCircle2, LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  PRIORITIES,
  type Priority,
  type Status,
  type Ticket,
  type Visibility,
  canEdit,
  canWithdraw,
  formatWhen,
  labelPriority,
  labelRole,
  labelStatus,
  legalNext,
  useActor,
  useDesk,
} from "@/lib/desk/model";

export function StatusBadge({ status }: { status: Status }) {
  const tone =
    status === "IN_PROGRESS"
      ? "border-brass bg-brass text-navy"
      : status === "RESOLVED"
        ? "border-navy bg-navy text-paper"
        : status === "NEW"
          ? "border-navy bg-surface text-navy"
          : "border-line bg-paper-deep text-muted";
  const Icon = iconFor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-semibold uppercase tracking-widest ${tone}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {labelStatus(status)}
    </span>
  );
}

function iconFor(status: Status) {
  switch (status) {
    case "NEW":
      return Circle;
    case "TRIAGED":
      return CircleDot;
    case "IN_PROGRESS":
      return LoaderCircle;
    case "RESOLVED":
      return CheckCircle2;
    case "CLOSED":
      return CircleOff;
    case "WITHDRAWN":
      return CircleMinus;
  }
}

export function TicketRow({ ticket }: { ticket: Ticket }) {
  const categories = useDesk((state) => state.categories);
  const users = useDesk((state) => state.users);
  const category = categories.find((item) => item.id === ticket.categoryId);
  const assignee = users.find((item) => item.id === ticket.assigneeId);
  return (
    <Link
      to="/desk/requests/$ticketId"
      params={{ ticketId: String(ticket.id) }}
      className="block border border-line bg-surface p-4 transition-colors hover:border-brass"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-sm text-brass">#{ticket.id}</p>
        <StatusBadge status={ticket.status} />
      </div>
      <h3 className="mt-2 font-serif text-xl text-navy">{ticket.title}</h3>
      <p className="mt-2 text-sm text-muted">
        {category?.name ?? "Category"} · {ticket.location}
      </p>
      <p className="mt-2 text-sm text-ink">
        {formatWhen(ticket.createdAt)} · {labelPriority(ticket.priority)} · {assignee ? assignee.displayName : "Unassigned"}
      </p>
    </Link>
  );
}

export function FlashBanner() {
  const flash = useDesk((state) => state.flash);
  const clearFlash = useDesk((state) => state.clearFlash);
  if (!flash) return null;
  return (
    <div className="mb-6 flex items-start justify-between gap-4 border border-navy bg-navy px-4 py-3 text-sm text-paper" role="status">
      <p>{flash}</p>
      <button type="button" className="h-11 shrink-0 text-brass-bright" onClick={() => clearFlash()}>
        Dismiss
      </button>
    </div>
  );
}

export function TracePanel() {
  const trace = useDesk((state) => state.lastTrace);
  if (!trace) return null;
  return (
    <details className="mt-8 border border-line bg-surface">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-navy">Last API exchange</summary>
      <div className="border-t border-line px-4 py-3">
        <p className="font-mono text-sm text-brass-deep">
          {trace.method} /api/v1{trace.path.replace("/api/v1", "")} · {trace.status}
        </p>
        <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-ink">
          {trace.body === null ? "No content" : JSON.stringify(trace.body, null, 2)}
        </pre>
      </div>
    </details>
  );
}

export function Forbidden({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-brass-deep bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brass-deep">403 Forbidden</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">{title}</h1>
      <p className="mt-3 max-w-xl text-ink">{body}</p>
      <Link to="/desk" className="mt-6 inline-flex h-11 items-center bg-navy px-4 text-sm font-semibold text-paper">
        Back to the dashboard
      </Link>
    </div>
  );
}

const fieldClass = "w-full border border-line bg-paper px-3 text-sm text-ink";

export function RequestForm({
  mode,
  ticket,
}: {
  mode: "create" | "edit";
  ticket?: Ticket;
}) {
  const navigate = useNavigate();
  const categories = useDesk((state) => state.categories);
  const createTicket = useDesk((state) => state.createTicket);
  const updateTicket = useDesk((state) => state.updateTicket);
  const [categoryId, setCategoryId] = useState(ticket ? String(ticket.categoryId) : "");
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [location, setLocation] = useState(ticket?.location ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const input = {
      categoryId: Number(categoryId),
      title,
      description,
      location,
    };
    const result =
      mode === "create" || !ticket
        ? createTicket(input)
        : updateTicket(ticket.id, input, ticket.version);
    if (!result.ok) {
      setBanner(result.message);
      setErrors(result.fieldErrors ?? {});
      return;
    }
    if (result.id) {
      void navigate({ to: "/desk/requests/$ticketId", params: { ticketId: String(result.id) } });
    }
  }

  const active = categories.filter((item) => item.active || item.id === ticket?.categoryId);

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {banner ? (
        <p className="border border-brass-deep bg-surface px-4 py-3 text-sm text-brass-deep" role="alert">
          {banner}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-navy">
        Category
        <select
          className={`${fieldClass} h-11`}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          required
        >
          <option value="">Select a category</option>
          {active.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.active ? "" : " (inactive)"}
            </option>
          ))}
        </select>
        <FieldError message={errors.categoryId} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Location
        <input
          className={`${fieldClass} h-11`}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength={120}
          placeholder="Block B, Room 204"
          required
        />
        <FieldError message={errors.location} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Title
        <input
          className={`${fieldClass} h-11`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          required
        />
        <span className="text-xs font-normal text-muted tabular-nums">{title.trim().length} / 100 · at least 5</span>
        <FieldError message={errors.title} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Description
        <textarea
          className={`${fieldClass} min-h-32 py-3`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          required
        />
        <span className="text-xs font-normal text-muted tabular-nums">{description.trim().length} / 2000 · at least 10</span>
        <FieldError message={errors.description} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="h-11 bg-navy px-5 text-sm font-semibold text-paper">
          {mode === "create" ? "Submit request" : "Save changes"}
        </button>
        <Link to="/desk/requests" className="inline-flex h-11 items-center border border-navy px-5 text-sm font-semibold text-navy">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-sm font-normal text-brass-deep">{message}</span>;
}

export function StatusForm({ ticket }: { ticket: Ticket }) {
  const actor = useActor();
  const users = useDesk((state) => state.users);
  const patchStatus = useDesk((state) => state.patchStatus);
  const options = [ticket.status, ...legalNext(ticket.status).filter((status) => status !== ticket.status)];
  const [status, setStatus] = useState<Status>(ticket.status);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId ? String(ticket.assigneeId) : "");
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  if (actor.role === "REQUESTER") return null;
  if (ticket.status === "CLOSED" || ticket.status === "WITHDRAWN") {
    return (
      <p className="text-sm text-muted">
        This request is {labelStatus(ticket.status).toLowerCase()}. The register keeps the history and does not reopen a closed record from here.
      </p>
    );
  }

  const staff = users.filter((user) => user.active && user.role !== "REQUESTER");

  function apply(version: number) {
    const result = patchStatus(ticket.id, {
      status,
      assigneeId: assigneeId ? Number(assigneeId) : null,
      priority,
      reason,
      version,
    });
    if (!result.ok) {
      setError(result.message);
      setFields(result.fieldErrors ?? {});
      return;
    }
    setError(null);
    setFields({});
    setReason("");
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        apply(ticket.version);
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Staff action</p>
      {error ? (
        <p className="border border-brass-deep px-3 py-2 text-sm text-brass-deep" role="alert">
          {error}
        </p>
      ) : null}
      <label className="grid gap-1 text-sm font-medium text-navy">
        Status
        <select className={`${fieldClass} h-11`} value={status} onChange={(event) => setStatus(event.target.value as Status)}>
          {options.map((item) => (
            <option key={item} value={item}>
              {labelStatus(item)}
              {item === ticket.status ? " (keep)" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-navy">
        Priority
        <select className={`${fieldClass} h-11`} value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {labelPriority(item)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-navy">
        Assignee
        <select className={`${fieldClass} h-11`} value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
          <option value="">Unassigned</option>
          {staff.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName} · {labelRole(user.role)}
            </option>
          ))}
        </select>
        <FieldError message={fields.assigneeId} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-navy">
        Reason
        <textarea className={`${fieldClass} min-h-24 py-2`} value={reason} onChange={(event) => setReason(event.target.value)} />
        <FieldError message={fields.reason} />
      </label>
      <button type="submit" className="h-11 bg-navy px-4 text-sm font-semibold text-paper">
        Record update
      </button>
      <details className="text-sm text-muted">
        <summary className="cursor-pointer text-navy">Demonstrate a stale edit (409)</summary>
        <p className="mt-2">Sends this same update with version 0. The service should refuse it.</p>
        <button
          type="button"
          className="mt-2 h-11 border border-navy px-3 text-sm font-semibold text-navy"
          onClick={() => apply(0)}
        >
          Send outdated version
        </button>
      </details>
    </form>
  );
}

export function CommentForm({ ticketId }: { ticketId: number }) {
  const actor = useActor();
  const addComment = useDesk((state) => state.addComment);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const result = addComment(ticketId, body, visibility);
        if (!result.ok) {
          setError(result.fieldErrors?.body ?? result.message);
          return;
        }
        setBody("");
        setError(null);
      }}
    >
      <label className="grid gap-1 text-sm font-medium text-navy">
        {actor.role === "REQUESTER" ? "Public update" : "Note"}
        <textarea className={`${fieldClass} min-h-24 py-2`} value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      {actor.role === "REQUESTER" ? (
        <p className="text-xs text-muted">Requesters can post only a public update. Staff will see it on the ticket.</p>
      ) : (
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="sr-only">Visibility</legend>
          <label className="inline-flex h-11 items-center gap-2">
            <input type="radio" name={`vis-${ticketId}`} checked={visibility === "PUBLIC"} onChange={() => setVisibility("PUBLIC")} />
            Public update
          </label>
          <label className="inline-flex h-11 items-center gap-2">
            <input type="radio" name={`vis-${ticketId}`} checked={visibility === "INTERNAL"} onChange={() => setVisibility("INTERNAL")} />
            Internal note
          </label>
        </fieldset>
      )}
      {error ? <p className="text-sm text-brass-deep">{error}</p> : null}
      <button type="submit" className="h-11 border border-navy px-4 text-sm font-semibold text-navy">
        Add note
      </button>
    </form>
  );
}

export function OwnerActions({ ticket }: { ticket: Ticket }) {
  const actor = useActor();
  const withdrawTicket = useDesk((state) => state.withdrawTicket);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!canEdit(ticket, actor) && !canWithdraw(ticket, actor)) return null;
  return (
    <div className="grid gap-3 border-t border-line pt-4">
      {canEdit(ticket, actor) ? (
        <Link
          to="/desk/edit/$ticketId"
          params={{ ticketId: String(ticket.id) }}
          className="inline-flex h-11 items-center justify-center border border-navy text-sm font-semibold text-navy"
        >
          Edit while new
        </Link>
      ) : null}
      {canWithdraw(ticket, actor) ? (
        confirm ? (
          <div className="grid gap-2">
            <p className="text-sm text-ink">Withdraw #{ticket.id}? The history stays. The request leaves the active queue.</p>
            {error ? <p className="text-sm text-brass-deep">{error}</p> : null}
            <button
              type="button"
              className="h-11 bg-brass-deep text-sm font-semibold text-paper"
              onClick={() => {
                const result = withdrawTicket(ticket.id, ticket.version);
                if (!result.ok) setError(result.message);
              }}
            >
              Confirm withdrawal
            </button>
            <button type="button" className="h-11 text-sm text-navy" onClick={() => setConfirm(false)}>
              Keep the request
            </button>
          </div>
        ) : (
          <button type="button" className="h-11 text-left text-sm font-semibold text-brass-deep" onClick={() => setConfirm(true)}>
            Withdraw request
          </button>
        )
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line bg-surface px-4 py-10 text-center">
      <h2 className="font-serif text-2xl text-navy">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
