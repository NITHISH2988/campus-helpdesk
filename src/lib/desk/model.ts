import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "REQUESTER" | "STAFF" | "ADMIN";
export type Status = "NEW" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WITHDRAWN";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type Visibility = "PUBLIC" | "INTERNAL";

export interface User {
  id: number;
  displayName: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface Ticket {
  id: number;
  requesterId: number;
  assigneeId: number | null;
  categoryId: number;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Comment {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  visibility: Visibility;
  createdAt: string;
}

export interface HistoryEntry {
  id: number;
  ticketId: number;
  changedBy: number;
  fromStatus: Status | null;
  toStatus: Status;
  reason: string;
  changedAt: string;
}

export interface Notice {
  id: number;
  ticketId: number;
  eventType: string;
  recipientUserId: number;
  recordedAt: string;
}

export interface Trace {
  method: string;
  path: string;
  status: number;
  body: unknown;
}

export interface TicketInput {
  categoryId: number;
  title: string;
  description: string;
  location: string;
}

export interface StatusPatch {
  status: Status;
  assigneeId: number | null;
  priority: Priority;
  reason: string;
  version: number;
}

export type OpResult =
  | { ok: true; message: string; id?: number }
  | {
      ok: false;
      code: "VALIDATION_ERROR" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT";
      message: string;
      fieldErrors?: Record<string, string>;
    };

interface Ids {
  ticket: number;
  comment: number;
  history: number;
  notice: number;
  category: number;
}

interface DeskData {
  users: User[];
  categories: Category[];
  tickets: Ticket[];
  comments: Comment[];
  history: HistoryEntry[];
  notices: Notice[];
  actorId: number;
  ids: Ids;
  listQuery: ListQuery & { page: number };
}

interface DeskState extends DeskData {
  flash: string | null;
  lastTrace: Trace | null;
  setActor: (id: number) => void;
  clearFlash: () => void;
  reset: () => void;
  createTicket: (input: TicketInput) => OpResult;
  updateTicket: (id: number, input: TicketInput, version: number) => OpResult;
  withdrawTicket: (id: number, version: number) => OpResult;
  patchStatus: (id: number, patch: StatusPatch) => OpResult;
  addComment: (id: number, body: string, visibility: Visibility) => OpResult;
  addCategory: (name: string, description: string) => OpResult;
  toggleCategory: (id: number) => OpResult;
  setUserRole: (id: number, role: Role) => OpResult;
  toggleUser: (id: number) => OpResult;
  traceSummary: () => void;
  setListQuery: (query: Partial<ListQuery & { page: number }>) => void;
}

export const STATUSES: Status[] = ["NEW", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "WITHDRAWN"];
export const PRIORITIES: Priority[] = ["URGENT", "HIGH", "NORMAL", "LOW"];

const NEXT: Record<Status, Status[]> = {
  NEW: ["TRIAGED"],
  TRIAGED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  WITHDRAWN: [],
};

export function labelStatus(status: Status): string {
  switch (status) {
    case "NEW":
      return "New";
    case "TRIAGED":
      return "Triaged";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    case "WITHDRAWN":
      return "Withdrawn";
  }
}

export function labelPriority(priority: Priority): string {
  switch (priority) {
    case "LOW":
      return "Low";
    case "NORMAL":
      return "Normal";
    case "HIGH":
      return "High";
    case "URGENT":
      return "Urgent";
  }
}

export function labelRole(role: Role): string {
  switch (role) {
    case "REQUESTER":
      return "Requester";
    case "STAFF":
      return "Helpdesk staff";
    case "ADMIN":
      return "Administrator";
  }
}

export function legalNext(status: Status): Status[] {
  return NEXT[status];
}

export function formatWhen(iso: string, withTime = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

function nowIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+05:30`;
}

export function validateTicket(input: TicketInput, categories: Category[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const location = input.location.trim();
  if (!title) errors.title = "Title is required";
  else if (title.length < 5 || title.length > 100) errors.title = "Title must be 5–100 characters";
  if (!description) errors.description = "Description is required";
  else if (description.length < 10 || description.length > 2000) {
    errors.description = "Description must be 10–2000 characters";
  }
  if (!location) errors.location = "Location is required";
  else if (location.length > 120) errors.location = "Location must be 120 characters or fewer";
  const category = categories.find((item) => item.id === input.categoryId);
  if (!category || !category.active) errors.categoryId = "Choose an active category";
  return errors;
}

export function canRead(ticket: Ticket, actor: User): boolean {
  if (actor.role === "STAFF" || actor.role === "ADMIN") return true;
  return ticket.requesterId === actor.id;
}

export function canEdit(ticket: Ticket, actor: User): boolean {
  if (ticket.status !== "NEW") return false;
  if (actor.role === "STAFF" || actor.role === "ADMIN") return true;
  return ticket.requesterId === actor.id;
}

export function canWithdraw(ticket: Ticket, actor: User): boolean {
  return actor.role === "REQUESTER" && ticket.requesterId === actor.id && ticket.status === "NEW";
}

const PRIORITY_RANK: Record<Priority, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

export function queueOf(tickets: Ticket[]): Ticket[] {
  return tickets
    .filter((ticket) => ticket.status === "NEW" || ticket.status === "TRIAGED" || ticket.status === "IN_PROGRESS")
    .slice()
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.createdAt.localeCompare(a.createdAt),
    );
}

export interface ListQuery {
  status: string;
  categoryId: string;
  q: string;
  from: string;
  to: string;
}

export function filterTickets(tickets: Ticket[], query: ListQuery): Ticket[] {
  const q = query.q.trim().toLowerCase();
  return tickets
    .filter((ticket) => {
      if (query.status && ticket.status !== query.status) return false;
      if (query.categoryId && String(ticket.categoryId) !== query.categoryId) return false;
      const day = ticket.createdAt.slice(0, 10);
      if (query.from && day < query.from) return false;
      if (query.to && day > query.to) return false;
      if (!q) return true;
      const hay = `${ticket.id} ${ticket.title} ${ticket.location} ${ticket.description}`.toLowerCase();
      return hay.includes(q);
    })
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function scopedTickets(tickets: Ticket[], actor: User): Ticket[] {
  if (actor.role === "ADMIN") return tickets;
  if (actor.role === "STAFF") return tickets.filter((ticket) => ticket.status !== "WITHDRAWN");
  return tickets.filter((ticket) => ticket.requesterId === actor.id);
}

export function summaryOf(tickets: Ticket[], categories: Category[]) {
  const byStatus = STATUSES.filter((status) => status !== "WITHDRAWN").map((status) => ({
    status,
    label: labelStatus(status),
    count: tickets.filter((ticket) => ticket.status === status).length,
  }));
  const byCategory = categories.map((category) => ({
    categoryId: category.id,
    category: category.name,
    count: tickets.filter((ticket) => ticket.categoryId === category.id && ticket.status !== "WITHDRAWN").length,
  }));
  return { byStatus, byCategory };
}

function fail(
  code: "VALIDATION_ERROR" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT",
  message: string,
  fieldErrors?: Record<string, string>,
): OpResult {
  return { ok: false, code, message, fieldErrors };
}

function seed(): DeskData {
  const users: User[] = [
    { id: 1, displayName: "Workspace requester", email: "requester@local.invalid", role: "REQUESTER", active: true },
    { id: 2, displayName: "Workspace staff", email: "staff@local.invalid", role: "STAFF", active: true },
    { id: 3, displayName: "Workspace administrator", email: "admin@local.invalid", role: "ADMIN", active: true },
  ];
  const categories: Category[] = [
    { id: 1, name: "Electrical", description: "Power, lighting, fans and UPS.", active: true },
    { id: 2, name: "Classroom AV", description: "Projectors, displays and classroom audio.", active: true },
    { id: 3, name: "Plumbing", description: "Water supply, leaks and fittings.", active: true },
    { id: 4, name: "IT & Network", description: "Campus network, labs and printers.", active: true },
    { id: 5, name: "Civil & Furniture", description: "Furniture, doors and civil repairs.", active: true },
    { id: 6, name: "Housekeeping", description: "Cleaning and campus upkeep.", active: true },
  ];

  const tickets: Ticket[] = [];

  const history: HistoryEntry[] = [
    h(1, 1042, 1, null, "NEW", "Request submitted.", "2026-11-09T10:30:00+05:30"),
    h(2, 1043, 2, null, "NEW", "Request submitted.", "2026-11-04T09:10:00+05:30"),
    h(3, 1043, 4, "NEW", "TRIAGED", "Classified as electrical and queued for the evening round.", "2026-11-04T16:40:00+05:30"),
    h(4, 1044, 3, null, "NEW", "Request submitted.", "2026-11-05T11:05:00+05:30"),
    h(5, 1044, 5, "NEW", "TRIAGED", "Network desk will inspect the access points.", "2026-11-05T14:10:00+05:30"),
    h(6, 1044, 5, "TRIAGED", "IN_PROGRESS", "On site in the reading room.", "2026-11-06T15:20:00+05:30"),
    h(7, 1045, 1, null, "NEW", "Request submitted.", "2026-11-03T08:20:00+05:30"),
    h(8, 1045, 4, "NEW", "TRIAGED", "Leak confirmed. Isolation requested.", "2026-11-03T09:00:00+05:30"),
    h(9, 1045, 4, "TRIAGED", "IN_PROGRESS", "Water isolated at the studio stopcock.", "2026-11-03T11:30:00+05:30"),
    h(10, 1045, 4, "IN_PROGRESS", "RESOLVED", "Washer replaced and the basin tested dry.", "2026-11-07T13:10:00+05:30"),
    h(11, 1046, 2, null, "NEW", "Request submitted.", "2026-11-02T14:00:00+05:30"),
    h(12, 1046, 4, "NEW", "TRIAGED", "Furniture repair, low urgency.", "2026-11-03T10:00:00+05:30"),
    h(13, 1046, 4, "TRIAGED", "IN_PROGRESS", "Chairs removed to the workshop.", "2026-11-06T09:30:00+05:30"),
    h(14, 1046, 4, "IN_PROGRESS", "RESOLVED", "Frames tightened and armrest refitted.", "2026-11-07T16:00:00+05:30"),
    h(15, 1046, 6, "RESOLVED", "CLOSED", "Requester confirmed the row is stable.", "2026-11-08T11:00:00+05:30"),
    h(16, 1047, 3, null, "NEW", "Request submitted.", "2026-11-07T10:15:00+05:30"),
    h(17, 1047, 5, "NEW", "TRIAGED", "Printer fault assigned to the IT desk.", "2026-11-07T12:00:00+05:30"),
    h(18, 1047, 5, "TRIAGED", "IN_PROGRESS", "Pickup rollers ordered from stores.", "2026-11-08T09:40:00+05:30"),
    h(19, 1048, 2, null, "NEW", "Request submitted.", "2026-11-09T08:05:00+05:30"),
    h(20, 1049, 1, null, "NEW", "Request submitted.", "2026-11-08T17:25:00+05:30"),
    h(21, 1049, 4, "NEW", "TRIAGED", "Facilities will attend with a replacement battery.", "2026-11-09T09:00:00+05:30"),
    h(22, 1050, 3, null, "NEW", "Request submitted.", "2026-11-05T11:20:00+05:30"),
    h(23, 1050, 3, "NEW", "WITHDRAWN", "Raised in error. Already covered by 1044.", "2026-11-05T11:28:00+05:30"),
  ];

  const comments: Comment[] = [
    {
      id: 1,
      ticketId: 1044,
      authorId: 5,
      body: "Access point AP-12 is retrying heavily. Keeping this note internal until we swap the unit.",
      visibility: "INTERNAL",
      createdAt: "2026-11-06T15:35:00+05:30",
    },
    {
      id: 2,
      ticketId: 1045,
      authorId: 4,
      body: "Basin isolated yesterday and a new washer fitted this morning. Please tell us if it weeps again.",
      visibility: "PUBLIC",
      createdAt: "2026-11-07T13:12:00+05:30",
    },
    {
      id: 3,
      ticketId: 1047,
      authorId: 3,
      body: "We moved the practical print run to Lab 2 so the session could finish.",
      visibility: "PUBLIC",
      createdAt: "2026-11-07T12:40:00+05:30",
    },
  ];

  const notices: Notice[] = [
    n(1, 1043, "STATUS_TRIAGED", 2, "2026-11-04T16:40:00+05:30"),
    n(2, 1044, "STATUS_IN_PROGRESS", 3, "2026-11-06T15:20:00+05:30"),
    n(3, 1045, "STATUS_RESOLVED", 1, "2026-11-07T13:10:00+05:30"),
    n(4, 1046, "STATUS_CLOSED", 2, "2026-11-08T11:00:00+05:30"),
    n(5, 1049, "STATUS_TRIAGED", 1, "2026-11-09T09:00:00+05:30"),
  ];

  return {
    users,
    categories,
    tickets,
    comments,
    history,
    notices,
    actorId: 1,
    ids: { ticket: 1, comment: 1, history: 1, notice: 1, category: 7 },
    listQuery: { status: "", categoryId: "", q: "", from: "", to: "", page: 1 },
  };
}

function ticket(
  id: number,
  requesterId: number,
  assigneeId: number | null,
  categoryId: number,
  title: string,
  description: string,
  location: string,
  priority: Priority,
  status: Status,
  createdAt: string,
  updatedAt: string,
  version: number,
): Ticket {
  return { id, requesterId, assigneeId, categoryId, title, description, location, priority, status, createdAt, updatedAt, version };
}

function h(
  id: number,
  ticketId: number,
  changedBy: number,
  fromStatus: Status | null,
  toStatus: Status,
  reason: string,
  changedAt: string,
): HistoryEntry {
  return { id, ticketId, changedBy, fromStatus, toStatus, reason, changedAt };
}

function n(id: number, ticketId: number, eventType: string, recipientUserId: number, recordedAt: string): Notice {
  return { id, ticketId, eventType, recipientUserId, recordedAt };
}

function traceFor(method: string, path: string, status: number, body: unknown): Trace {
  return { method, path, status, body };
}

function recipients(ticketRow: Ticket): number[] {
  const ids = [ticketRow.requesterId];
  if (ticketRow.assigneeId && ticketRow.assigneeId !== ticketRow.requesterId) ids.push(ticketRow.assigneeId);
  return ids;
}

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      ...seed(),
      flash: null,
      lastTrace: null,
      setActor: (id) => {
        const user = get().users.find((item) => item.id === id && item.active);
        if (!user) return;
        set({ actorId: id, flash: null });
      },
      clearFlash: () => set({ flash: null }),
      reset: () => set({ ...seed(), flash: "Workspace cleared.", lastTrace: null }),
      createTicket: (input) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        if (!actor || !actor.active) {
          const result = fail("FORBIDDEN", "The selected workspace role is not active.");
          set({ lastTrace: traceFor("POST", "/api/v1/tickets", 403, result) });
          return result;
        }
        const fieldErrors = validateTicket(input, state.categories);
        if (Object.keys(fieldErrors).length > 0) {
          const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", fieldErrors);
          set({ lastTrace: traceFor("POST", "/api/v1/tickets", 400, result) });
          return result;
        }
        const createdAt = nowIso();
        const id = state.ids.ticket;
        const created: Ticket = {
          id,
          requesterId: actor.id,
          assigneeId: null,
          categoryId: input.categoryId,
          title: input.title.trim(),
          description: input.description.trim(),
          location: input.location.trim(),
          priority: "NORMAL",
          status: "NEW",
          createdAt,
          updatedAt: createdAt,
          version: 1,
        };
        const historyId = state.ids.history;
        const noticeId = state.ids.notice;
        set({
          tickets: [created, ...state.tickets],
          history: [
            ...state.history,
            {
              id: historyId,
              ticketId: id,
              changedBy: actor.id,
              fromStatus: null,
              toStatus: "NEW",
              reason: "Request submitted.",
              changedAt: createdAt,
            },
          ],
          notices: [
            ...state.notices,
            { id: noticeId, ticketId: id, eventType: "REQUEST_RECEIVED", recipientUserId: actor.id, recordedAt: createdAt },
          ],
          ids: { ...state.ids, ticket: id + 1, history: historyId + 1, notice: noticeId + 1 },
          flash: `Request ${id} opened.`,
          lastTrace: traceFor("POST", "/api/v1/tickets", 201, { ticketId: id, status: "NEW", createdAt }),
        });
        return { ok: true, message: `Request ${id} opened.`, id };
      },
      updateTicket: (id, input, version) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        const current = state.tickets.find((item) => item.id === id);
        if (!actor || !current) {
          const result = fail("NOT_FOUND", "That request is not on the register.");
          set({ lastTrace: traceFor("PUT", `/api/v1/tickets/${id}`, 404, result) });
          return result;
        }
        if (!canEdit(current, actor)) {
          const code = current.status !== "NEW" ? "CONFLICT" : "FORBIDDEN";
          const message = current.status !== "NEW" ? "Only a new request can be edited." : "You can edit only your own new requests.";
          const result = fail(code, message);
          set({ lastTrace: traceFor("PUT", `/api/v1/tickets/${id}`, code === "CONFLICT" ? 409 : 403, result) });
          return result;
        }
        if (current.version !== version) {
          const result = fail("CONFLICT", "This request changed while you were editing. Review it and try again.");
          set({ lastTrace: traceFor("PUT", `/api/v1/tickets/${id}`, 409, result) });
          return result;
        }
        const fieldErrors = validateTicket(input, state.categories);
        if (Object.keys(fieldErrors).length > 0) {
          const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", fieldErrors);
          set({ lastTrace: traceFor("PUT", `/api/v1/tickets/${id}`, 400, result) });
          return result;
        }
        const updatedAt = nowIso();
        set({
          tickets: state.tickets.map((item) =>
            item.id === id
              ? {
                  ...item,
                  categoryId: input.categoryId,
                  title: input.title.trim(),
                  description: input.description.trim(),
                  location: input.location.trim(),
                  updatedAt,
                  version: item.version + 1,
                }
              : item,
          ),
          flash: `Request ${id} updated.`,
          lastTrace: traceFor("PUT", `/api/v1/tickets/${id}`, 200, { ticketId: id, status: current.status, updatedAt }),
        });
        return { ok: true, message: `Request ${id} updated.`, id };
      },
      withdrawTicket: (id, version) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        const current = state.tickets.find((item) => item.id === id);
        if (!actor || !current) {
          const result = fail("NOT_FOUND", "That request is not on the register.");
          set({ lastTrace: traceFor("DELETE", `/api/v1/tickets/${id}`, 404, result) });
          return result;
        }
        if (!(actor.role === "REQUESTER" && current.requesterId === actor.id)) {
          const result = fail("FORBIDDEN", "Only the requester can withdraw a new request.");
          set({ lastTrace: traceFor("DELETE", `/api/v1/tickets/${id}`, 403, result) });
          return result;
        }
        if (current.status !== "NEW") {
          const result = fail("CONFLICT", "Only a new request can be withdrawn.");
          set({ lastTrace: traceFor("DELETE", `/api/v1/tickets/${id}`, 409, result) });
          return result;
        }
        if (current.version !== version) {
          const result = fail("CONFLICT", "This request changed while you were editing. Review it and try again.");
          set({ lastTrace: traceFor("DELETE", `/api/v1/tickets/${id}`, 409, result) });
          return result;
        }
        const changedAt = nowIso();
        const historyId = state.ids.history;
        set({
          tickets: state.tickets.map((item) =>
            item.id === id ? { ...item, status: "WITHDRAWN", updatedAt: changedAt, version: item.version + 1 } : item,
          ),
          history: [
            ...state.history,
            {
              id: historyId,
              ticketId: id,
              changedBy: actor.id,
              fromStatus: "NEW",
              toStatus: "WITHDRAWN",
              reason: "Withdrawn by the requester.",
              changedAt,
            },
          ],
          ids: { ...state.ids, history: historyId + 1 },
          flash: `Request ${id} withdrawn. The history stays on the register.`,
          lastTrace: traceFor("DELETE", `/api/v1/tickets/${id}`, 204, null),
        });
        return { ok: true, message: "Withdrawn.", id };
      },
      patchStatus: (id, patch) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        const current = state.tickets.find((item) => item.id === id);
        const path = `/api/v1/tickets/${id}/status`;
        if (!actor || !current) {
          const result = fail("NOT_FOUND", "That request is not on the register.");
          set({ lastTrace: traceFor("PATCH", path, 404, result) });
          return result;
        }
        if (actor.role === "REQUESTER") {
          const result = fail("FORBIDDEN", "Only helpdesk staff can change status, priority or assignment.");
          set({ lastTrace: traceFor("PATCH", path, 403, result) });
          return result;
        }
        const reason = patch.reason.trim();
        if (reason.length < 5 || reason.length > 240) {
          const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", {
            reason: "Give a reason of 5–240 characters.",
          });
          set({ lastTrace: traceFor("PATCH", path, 400, result) });
          return result;
        }
        if (current.version !== patch.version) {
          const result = fail("CONFLICT", "This request changed while you were editing. Review it and try again.");
          set({ lastTrace: traceFor("PATCH", path, 409, result) });
          return result;
        }
        if (current.status === "CLOSED" || current.status === "WITHDRAWN") {
          const result = fail("CONFLICT", `${labelStatus(current.status)} requests cannot be moved.`);
          set({ lastTrace: traceFor("PATCH", path, 409, result) });
          return result;
        }
        if (patch.status !== current.status && !NEXT[current.status].includes(patch.status)) {
          const result = fail("CONFLICT", `${labelStatus(current.status)} cannot move to ${labelStatus(patch.status)}.`);
          set({ lastTrace: traceFor("PATCH", path, 409, result) });
          return result;
        }
        if (patch.assigneeId !== null) {
          const assignee = state.users.find((user) => user.id === patch.assigneeId);
          if (!assignee || !assignee.active || assignee.role === "REQUESTER") {
            const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", {
              assigneeId: "Assignee must be active helpdesk staff.",
            });
            set({ lastTrace: traceFor("PATCH", path, 400, result) });
            return result;
          }
        }
        const same =
          patch.status === current.status && patch.assigneeId === current.assigneeId && patch.priority === current.priority;
        if (same) {
          const result = fail("VALIDATION_ERROR", "Nothing to update.", { reason: "Change the status, assignee or priority." });
          set({ lastTrace: traceFor("PATCH", path, 400, result) });
          return result;
        }
        const changedAt = nowIso();
        const nextTicket: Ticket = {
          ...current,
          status: patch.status,
          assigneeId: patch.assigneeId,
          priority: patch.priority,
          updatedAt: changedAt,
          version: current.version + 1,
        };
        let historyId = state.ids.history;
        let noticeId = state.ids.notice;
        const history = [...state.history];
        const notices = [...state.notices];
        if (patch.status !== current.status) {
          history.push({
            id: historyId,
            ticketId: id,
            changedBy: actor.id,
            fromStatus: current.status,
            toStatus: patch.status,
            reason,
            changedAt,
          });
          historyId += 1;
          for (const recipientUserId of recipients(nextTicket)) {
            notices.push({
              id: noticeId,
              ticketId: id,
              eventType: `STATUS_${patch.status}`,
              recipientUserId,
              recordedAt: changedAt,
            });
            noticeId += 1;
          }
        } else if (patch.assigneeId !== current.assigneeId && patch.assigneeId) {
          notices.push({
            id: noticeId,
            ticketId: id,
            eventType: "ASSIGNED",
            recipientUserId: patch.assigneeId,
            recordedAt: changedAt,
          });
          noticeId += 1;
        }
        const message =
          patch.status !== current.status
            ? `Request ${id} is now ${labelStatus(patch.status)}.`
            : `Request ${id} assignment updated.`;
        set({
          tickets: state.tickets.map((item) => (item.id === id ? nextTicket : item)),
          history,
          notices,
          ids: { ...state.ids, history: historyId, notice: noticeId },
          flash: message,
          lastTrace: traceFor("PATCH", path, 200, {
            ticketId: id,
            status: nextTicket.status,
            assigneeId: nextTicket.assigneeId,
            priority: nextTicket.priority,
            version: nextTicket.version,
          }),
        });
        return { ok: true, message, id };
      },
      addComment: (id, body, visibility) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        const current = state.tickets.find((item) => item.id === id);
        const path = `/api/v1/tickets/${id}/comments`;
        if (!actor || !current) {
          const result = fail("NOT_FOUND", "That request is not on the register.");
          set({ lastTrace: traceFor("POST", path, 404, result) });
          return result;
        }
        if (!canRead(current, actor)) {
          const result = fail("FORBIDDEN", "You cannot comment on this request.");
          set({ lastTrace: traceFor("POST", path, 403, result) });
          return result;
        }
        if (current.status === "WITHDRAWN") {
          const result = fail("CONFLICT", "A withdrawn request does not take new notes.");
          set({ lastTrace: traceFor("POST", path, 409, result) });
          return result;
        }
        const text = body.trim();
        if (text.length < 2 || text.length > 1000) {
          const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", {
            body: "Write between 2 and 1000 characters.",
          });
          set({ lastTrace: traceFor("POST", path, 400, result) });
          return result;
        }
        const actual: Visibility = actor.role === "REQUESTER" ? "PUBLIC" : visibility;
        const createdAt = nowIso();
        const commentId = state.ids.comment;
        set({
          comments: [
            ...state.comments,
            { id: commentId, ticketId: id, authorId: actor.id, body: text, visibility: actual, createdAt },
          ],
          tickets: state.tickets.map((item) =>
            item.id === id ? { ...item, updatedAt: createdAt, version: item.version + 1 } : item,
          ),
          ids: { ...state.ids, comment: commentId + 1 },
          flash: actual === "INTERNAL" ? "Internal note added." : "Update posted.",
          lastTrace: traceFor("POST", path, 201, { commentId, visibility: actual, createdAt }),
        });
        return { ok: true, message: "Noted.", id: commentId };
      },
      addCategory: (name, description) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        if (!actor || actor.role !== "ADMIN") {
          const result = fail("FORBIDDEN", "Only an administrator can maintain categories.");
          set({ lastTrace: traceFor("POST", "/api/v1/categories", 403, result) });
          return result;
        }
        const trimmed = name.trim();
        const about = description.trim();
        const fieldErrors: Record<string, string> = {};
        if (trimmed.length < 3 || trimmed.length > 40) fieldErrors.name = "Name must be 3–40 characters.";
        if (about.length > 160) fieldErrors.description = "Description must be 160 characters or fewer.";
        if (state.categories.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
          fieldErrors.name = "That category already exists.";
        }
        if (Object.keys(fieldErrors).length > 0) {
          const result = fail("VALIDATION_ERROR", "Please correct the highlighted fields.", fieldErrors);
          set({ lastTrace: traceFor("POST", "/api/v1/categories", 400, result) });
          return result;
        }
        const id = state.ids.category;
        set({
          categories: [...state.categories, { id, name: trimmed, description: about, active: true }],
          ids: { ...state.ids, category: id + 1 },
          flash: `Category “${trimmed}” added.`,
          lastTrace: traceFor("POST", "/api/v1/categories", 201, { categoryId: id, name: trimmed }),
        });
        return { ok: true, message: "Category added.", id };
      },
      toggleCategory: (id) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        if (!actor || actor.role !== "ADMIN") return fail("FORBIDDEN", "Only an administrator can maintain categories.");
        set({
          categories: state.categories.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
          flash: "Category updated.",
        });
        return { ok: true, message: "Updated." };
      },
      setUserRole: (id, role) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        if (!actor || actor.role !== "ADMIN") return fail("FORBIDDEN", "Only an administrator can change access.");
        const admins = state.users.filter((user) => user.role === "ADMIN" && user.active);
        const target = state.users.find((user) => user.id === id);
        if (!target) return fail("NOT_FOUND", "That person is not on the register.");
        if (target.role === "ADMIN" && role !== "ADMIN" && admins.length < 2) {
          return fail("CONFLICT", "Keep at least one active administrator.");
        }
        set({
          users: state.users.map((user) => (user.id === id ? { ...user, role } : user)),
          flash: `${target.displayName} is now ${labelRole(role).toLowerCase()}.`,
        });
        return { ok: true, message: "Access updated." };
      },
      toggleUser: (id) => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId);
        if (!actor || actor.role !== "ADMIN") return fail("FORBIDDEN", "Only an administrator can change access.");
        if (id === actor.id) return fail("CONFLICT", "You cannot deactivate the identity you are using.");
        const target = state.users.find((user) => user.id === id);
        if (!target) return fail("NOT_FOUND", "That person is not on the register.");
        if (target.role === "ADMIN" && target.active) {
          const admins = state.users.filter((user) => user.role === "ADMIN" && user.active);
          if (admins.length < 2) return fail("CONFLICT", "Keep at least one active administrator.");
        }
        set({
          users: state.users.map((user) => (user.id === id ? { ...user, active: !user.active } : user)),
          flash: target.active ? `${target.displayName} deactivated.` : `${target.displayName} restored.`,
        });
        return { ok: true, message: "Updated." };
      },
      setListQuery: (query) =>
        set((state) => ({
          listQuery: {
            ...state.listQuery,
            ...query,
          },
        })),
      traceSummary: () => {
        const state = get();
        const actor = state.users.find((user) => user.id === state.actorId) ?? state.users[0];
        const body = summaryOf(scopedTickets(state.tickets, actor), state.categories);
        set({
          lastTrace: traceFor("GET", "/api/v1/dashboard/summary", 200, {
            scope: actor.role,
            byStatus: body.byStatus.map((row) => ({ status: row.status, count: row.count })),
            byCategory: body.byCategory.map((row) => ({ category: row.category, count: row.count })),
          }),
        });
      },
    }),
    {
      name: "srm-campus-desk-v1",
      skipHydration: true,
      partialize: (state) => ({
        users: state.users,
        categories: state.categories,
        tickets: state.tickets,
        comments: state.comments,
        history: state.history,
        notices: state.notices,
        actorId: state.actorId,
        ids: state.ids,
      }),
    },
  ),
);

export function useActor(): User {
  return useDesk((state) => state.users.find((user) => user.id === state.actorId) ?? state.users[0]);
}
