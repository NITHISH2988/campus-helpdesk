import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FlashBanner, StatusBadge, TracePanel } from "@/components/desk-ui";
import {
  formatWhen,
  labelRole,
  labelStatus,
  scopedTickets,
  summaryOf,
  useActor,
  useDesk,
  type Status,
} from "@/lib/desk/model";

export const Route = createFileRoute("/desk/")({
  component: Dashboard,
});

const blankQuery = { categoryId: "", q: "", from: "", to: "", page: 1 };

function shortCategory(name: string): string {
  if (name.startsWith("Civil")) return "Civil";
  if (name.startsWith("IT")) return "IT";
  if (name.startsWith("Classroom")) return "AV";
  return name;
}

function Dashboard() {
  const actor = useActor();
  const tickets = useDesk((state) => state.tickets);
  const categories = useDesk((state) => state.categories);
  const users = useDesk((state) => state.users);
  const notices = useDesk((state) => state.notices);
  const traceSummary = useDesk((state) => state.traceSummary);
  const setListQuery = useDesk((state) => state.setListQuery);
  const visible = scopedTickets(tickets, actor);
  const summary = summaryOf(visible, categories);
  const recent = visible
    .filter((ticket) => ticket.status !== "WITHDRAWN")
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const mine = notices
    .filter((notice) => notice.recipientUserId === actor.id)
    .slice()
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, 4);

  return (
    <div>
      <FlashBanner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brass">{labelRole(actor.role)}</p>
          <h1 className="mt-2 font-serif text-4xl text-navy">Good day, {actor.displayName.split(" ")[0]}.</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink">
            {actor.role === "REQUESTER"
              ? "You see only the requests you filed. Staff actions stay on the other side of the desk."
              : actor.role === "STAFF"
                ? "The queue is every active request. Withdrawn rows stay with the administrator."
                : "You see the whole register, including withdrawn requests, plus categories and access."}
          </p>
        </div>
        <Link to="/desk/new" className="inline-flex h-11 items-center bg-navy px-5 text-sm font-semibold text-paper">
          New request
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summary.byStatus.map((row) => (
          <Link
            key={row.status}
            to="/desk/requests"
            onClick={() => setListQuery({ ...blankQuery, status: row.status })}
            className="border border-line bg-surface p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{row.label}</p>
            <p className="mt-2 font-serif text-4xl text-navy tabular-nums">{row.count}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-navy">By category</h2>
            <button
              type="button"
              className="h-11 text-sm font-semibold text-navy underline decoration-brass underline-offset-4"
              onClick={() => traceSummary()}
            >
              Summary payload
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <caption className="sr-only">Ticket counts by category for the current role</caption>
            <thead>
              <tr className="text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="py-2 font-medium">Category</th>
                <th scope="col" className="py-2 text-right font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {summary.byCategory.map((row) => (
                <tr key={row.categoryId} className="border-t border-line">
                  <th scope="row" className="py-2 font-medium text-navy">{row.category}</th>
                  <td className="py-2 text-right text-ink tabular-nums">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">Counts do not include requester names.</p>
        </section>
        <section className="hidden border border-line bg-surface p-5 md:block">
          <h2 className="font-serif text-2xl text-navy">Workload</h2>
          <CategoryChart rows={summary.byCategory.map((row) => ({ category: shortCategory(row.category), count: row.count }))} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-navy">Recent</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {recent.map((ticket) => {
            const category = categories.find((item) => item.id === ticket.categoryId);
            return (
              <li key={ticket.id}>
                <Link
                  to="/desk/requests/$ticketId"
                  params={{ ticketId: String(ticket.id) }}
                  className="grid gap-2 py-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center"
                >
                  <span className="font-mono text-sm text-brass">#{ticket.id}</span>
                  <span>
                    <span className="block font-medium text-navy">{ticket.title}</span>
                    <span className="text-xs text-muted">
                      {category?.name} · {formatWhen(ticket.updatedAt, true)} · {labelStatus(ticket.status as Status)}
                    </span>
                  </span>
                  <StatusBadge status={ticket.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl text-navy">Delivery intent</h2>
        <p className="mt-2 text-sm text-muted">
          The notification boundary acknowledged these events for {actor.displayName}. Nothing was sent.
        </p>
        {mine.length === 0 ? (
          <p className="mt-4 text-sm text-ink">No intent recorded for this identity yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {mine.map((notice) => (
              <li key={notice.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                <Link to="/desk/requests/$ticketId" params={{ ticketId: String(notice.ticketId) }} className="font-medium text-navy">
                  #{notice.ticketId} · {notice.eventType.replaceAll("_", " ").toLowerCase()}
                </Link>
                <span className="text-muted">{formatWhen(notice.recordedAt, true)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <TracePanel />
    </div>
  );
}

function CategoryChart({ rows }: { rows: { category: string; count: number }[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <p className="mt-6 text-sm text-muted">Preparing the chart.</p>;
  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 8 }}>
          <XAxis dataKey="category" tick={{ fill: "var(--color-muted)", fontSize: 12 }} interval={0} />
          <YAxis allowDecimals={false} width={28} tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "var(--color-paper)" }} />
          <Bar dataKey="count" fill="var(--color-navy)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
