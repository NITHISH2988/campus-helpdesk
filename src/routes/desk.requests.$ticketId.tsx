import { createFileRoute, Link } from "@tanstack/react-router";
import { CommentForm, FlashBanner, Forbidden, OwnerActions, StatusBadge, StatusForm, TracePanel } from "@/components/desk-ui";
import {
  canRead,
  formatWhen,
  labelPriority,
  labelRole,
  labelStatus,
  useActor,
  useDesk,
} from "@/lib/desk/model";

export const Route = createFileRoute("/desk/requests/$ticketId")({
  head: ({ params }) => ({ meta: [{ title: `Request ${params.ticketId} · Campus Helpdesk` }] }),
  component: TicketDetail,
});

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const id = Number(ticketId);
  const actor = useActor();
  const ticket = useDesk((state) => state.tickets.find((item) => item.id === id));
  const categories = useDesk((state) => state.categories);
  const users = useDesk((state) => state.users);
  const history = useDesk((state) => state.history.filter((item) => item.ticketId === id));
  const comments = useDesk((state) => state.comments.filter((item) => item.ticketId === id));
  const notices = useDesk((state) => state.notices.filter((item) => item.ticketId === id));

  if (!ticket) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brass-deep">404</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">That request is not on the register.</h1>
        <Link to="/desk/requests" className="mt-6 inline-flex h-11 items-center bg-navy px-4 text-sm font-semibold text-paper">
          Back to requests
        </Link>
      </div>
    );
  }

  if (!canRead(ticket, actor)) {
    return (
      <Forbidden
        title="This request belongs to someone else."
        body="Requesters can open only their own records. Switch to helpdesk staff if you are rehearsing the queue."
      />
    );
  }

  const category = categories.find((item) => item.id === ticket.categoryId);
  const requester = users.find((item) => item.id === ticket.requesterId);
  const assignee = users.find((item) => item.id === ticket.assigneeId);
  const visibleComments = comments.filter((item) => item.visibility === "PUBLIC" || actor.role !== "REQUESTER");
  const timeline = history.slice().sort((a, b) => a.changedAt.localeCompare(b.changedAt));

  return (
    <div>
      <FlashBanner />
      <p className="font-mono text-sm text-brass">#{ticket.id}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl text-navy">{ticket.title}</h1>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {category?.name} · {ticket.location} · opened {formatWhen(ticket.createdAt, true)} · version {ticket.version}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-8">
          <section className="border border-line bg-surface p-5">
            <h2 className="font-serif text-2xl text-navy">Issue</h2>
            <p className="mt-3 text-ink">{ticket.description}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Requester</dt>
                <dd className="mt-1 text-navy">{requester?.displayName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Assignee</dt>
                <dd className="mt-1 text-navy">{assignee ? assignee.displayName : "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Priority</dt>
                <dd className="mt-1 text-navy">{labelPriority(ticket.priority)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Updated</dt>
                <dd className="mt-1 text-navy">{formatWhen(ticket.updatedAt, true)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-navy">Activity</h2>
            <ol className="mt-4 border-l border-brass pl-5">
              {timeline.map((entry) => {
                const who = users.find((item) => item.id === entry.changedBy);
                return (
                  <li key={entry.id} className="relative pb-5">
                    <span className="absolute -left-[1.4rem] top-1 size-2.5 bg-brass" aria-hidden="true" />
                    <p className="text-sm font-semibold text-navy">
                      {entry.fromStatus ? `${labelStatus(entry.fromStatus)} → ${labelStatus(entry.toStatus)}` : `Opened as ${labelStatus(entry.toStatus)}`}
                    </p>
                    <p className="mt-1 text-sm text-ink">{entry.reason}</p>
                    <p className="mt-1 text-xs text-muted">
                      {who?.displayName} · {labelRole(who?.role ?? "REQUESTER")} · {formatWhen(entry.changedAt, true)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-navy">Notes</h2>
            {visibleComments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No notes you are allowed to see.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {visibleComments
                  .slice()
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                  .map((comment) => {
                    const author = users.find((item) => item.id === comment.authorId);
                    return (
                      <li key={comment.id} className="border border-line bg-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-brass">
                          {comment.visibility === "INTERNAL" ? "Internal note" : "Public update"}
                        </p>
                        <p className="mt-2 text-sm text-ink">{comment.body}</p>
                        <p className="mt-2 text-xs text-muted">
                          {author?.displayName} · {formatWhen(comment.createdAt, true)}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        </div>

        <aside className="grid h-fit gap-6 border border-line bg-surface p-5">
          <StatusForm key={`${ticket.id}-${ticket.version}-${ticket.status}`} ticket={ticket} />
          <OwnerActions ticket={ticket} />
          {ticket.status !== "WITHDRAWN" ? <CommentForm ticketId={ticket.id} /> : null}
          {actor.role !== "REQUESTER" && notices.length > 0 ? (
            <div>
              <h2 className="font-serif text-xl text-navy">Notices recorded</h2>
              <ul className="mt-2 space-y-2 text-xs text-muted">
                {notices.map((notice) => {
                  const person = users.find((item) => item.id === notice.recipientUserId);
                  return (
                    <li key={notice.id}>
                      {notice.eventType} · {person?.displayName} · {formatWhen(notice.recordedAt, true)}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
      <TracePanel />
    </div>
  );
}
