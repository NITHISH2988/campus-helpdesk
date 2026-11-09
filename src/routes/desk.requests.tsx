import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState, FlashBanner, TicketRow, TracePanel } from "@/components/desk-ui";
import { STATUSES, filterTickets, labelStatus, scopedTickets, useActor, useDesk } from "@/lib/desk/model";

const PAGE_SIZE = 5;

export const Route = createFileRoute("/desk/requests")({
  head: () => ({ meta: [{ title: "Requests · Campus Helpdesk" }] }),
  component: RequestList,
});

function RequestList() {
  const actor = useActor();
  const tickets = useDesk((state) => state.tickets);
  const categories = useDesk((state) => state.categories);
  const query = useDesk((state) => state.listQuery);
  const setListQuery = useDesk((state) => state.setListQuery);
  const [draft, setDraft] = useState(query.q);

  useEffect(() => {
    setDraft(query.q);
  }, [query.q]);

  const visible = scopedTickets(tickets, actor);
  const filtered = filterTickets(visible, query);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function update(next: Partial<typeof query>) {
    setListQuery({ ...next, page: next.page ?? 1 });
  }

  return (
    <div>
      <FlashBanner />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brass">Register</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">Requests</h1>
        <p className="mt-2 text-sm text-muted">
          {filtered.length} in view
          {actor.role === "REQUESTER" ? " · only yours" : actor.role === "STAFF" ? " · active campus queue" : " · full register"}
        </p>
      </div>

      <form
        className="mt-6 grid gap-3 border border-line bg-surface p-4 md:grid-cols-2 lg:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: draft });
        }}
      >
        <label className="grid gap-1 text-sm font-medium text-navy lg:col-span-2">
          Search
          <input
            className="h-11 border border-line bg-paper px-3 text-sm"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="ID, title or place"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-navy">
          Status
          <select
            className="h-11 border border-line bg-paper px-2 text-sm"
            value={query.status}
            onChange={(event) => update({ status: event.target.value })}
          >
            <option value="">All</option>
            {STATUSES.filter((status) => actor.role !== "STAFF" || status !== "WITHDRAWN").map((status) => (
              <option key={status} value={status}>
                {labelStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-navy">
          Category
          <select
            className="h-11 border border-line bg-paper px-2 text-sm"
            value={query.categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-navy">
          From
          <input
            type="date"
            className="h-11 border border-line bg-paper px-2 text-sm"
            value={query.from}
            onChange={(event) => update({ from: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-navy">
          To
          <input
            type="date"
            className="h-11 border border-line bg-paper px-2 text-sm"
            value={query.to}
            onChange={(event) => update({ to: event.target.value })}
          />
        </label>
        <div className="flex items-end lg:col-span-6">
          <button type="submit" className="h-11 bg-navy px-4 text-sm font-semibold text-paper">
            Apply search
          </button>
          <button
            type="button"
            className="h-11 px-4 text-sm font-semibold text-navy"
            onClick={() => {
              setDraft("");
              update({ status: "", categoryId: "", q: "", from: "", to: "" });
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-3">
        {slice.length === 0 ? (
          <EmptyState title="Nothing matches" body="Widen the filters, or file a new request if the register is still empty for this role." />
        ) : (
          slice.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted tabular-nums">
          Page {page} of {pages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="h-11 border border-line px-4 text-sm font-semibold text-navy disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => update({ page: page - 1 })}
          >
            Previous
          </button>
          <button
            type="button"
            className="h-11 border border-line px-4 text-sm font-semibold text-navy disabled:opacity-40"
            disabled={page >= pages}
            onClick={() => update({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
      <TracePanel />
    </div>
  );
}
