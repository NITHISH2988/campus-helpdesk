import { createFileRoute, Link } from "@tanstack/react-router";
import { FlashBanner, Forbidden, StatusBadge, StatusForm, TracePanel } from "@/components/desk-ui";
import { formatWhen, labelPriority, queueOf, useActor, useDesk } from "@/lib/desk/model";

export const Route = createFileRoute("/desk/queue")({
  head: () => ({ meta: [{ title: "Staff queue · Campus Helpdesk" }] }),
  component: StaffQueue,
});

function StaffQueue() {
  const actor = useActor();
  const tickets = useDesk((state) => state.tickets);
  const categories = useDesk((state) => state.categories);
  const users = useDesk((state) => state.users);

  if (actor.role === "REQUESTER") {
    return (
      <Forbidden
        title="The staff queue is closed to requesters."
        body="Assignment, priority and status changes are available in the local staff workspace. Use the role selector above to switch from requester to staff."
      />
    );
  }

  const queue = queueOf(tickets);

  return (
    <div>
      <FlashBanner />
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">Operations</p>
      <h1 className="mt-2 font-serif text-4xl text-navy">Staff queue</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink">
        Unassigned and active work, urgent first. Each move needs a reason. Resolved work can return to in
        progress. Closed and withdrawn requests are not in this queue.
      </p>
      <div className="mt-6 grid gap-4">
        {queue.map((ticket) => {
          const category = categories.find((item) => item.id === ticket.categoryId);
          const requester = users.find((item) => item.id === ticket.requesterId);
          return (
            <article key={ticket.id} className="grid gap-5 border border-line bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-sm text-brass">#{ticket.id}</p>
                  <StatusBadge status={ticket.status} />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">{labelPriority(ticket.priority)}</p>
                </div>
                <h2 className="mt-2 font-serif text-2xl text-navy">
                  <Link to="/desk/requests/$ticketId" params={{ ticketId: String(ticket.id) }} className="underline decoration-brass decoration-2 underline-offset-4">
                    {ticket.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-ink">{ticket.location}</p>
                <p className="mt-2 text-sm text-muted">
                  {category?.name} · {requester?.displayName} · {formatWhen(ticket.createdAt)} ·{" "}
                  {ticket.assigneeId ? "assigned" : "unassigned"}
                </p>
              </div>
              <StatusForm key={`${ticket.id}-${ticket.version}`} ticket={ticket} />
            </article>
          );
        })}
      </div>
      <TracePanel />
    </div>
  );
}
