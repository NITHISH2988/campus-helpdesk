import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { StatusBadge } from "@/components/desk-ui";
import { audiences } from "@/lib/proposal";
import { formatWhen, labelStatus, useDesk } from "@/lib/desk/model";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const tickets = useDesk((state) => state.tickets);
  const categories = useDesk((state) => state.categories);
  const live = tickets.filter((ticket) => ticket.status !== "WITHDRAWN" && ticket.status !== "CLOSED");
  const recent = tickets
    .filter((ticket) => ticket.status !== "WITHDRAWN")
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const figures = [
    { label: "Open on the register", value: live.length },
    { label: "In progress", value: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length },
    { label: "Waiting as new", value: tickets.filter((ticket) => ticket.status === "NEW").length },
    { label: "Active categories", value: categories.filter((item) => item.active).length },
  ];

  return (
    <SiteFrame>
      <div className="mx-auto max-w-6xl px-4">
        <section className="rise grid items-end gap-10 py-12 md:py-16 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brass">
              SRM IST · Tiruchirappalli Campus
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl text-navy md:text-6xl">
              One register for every campus repair.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink">
              Students and staff file a facility or IT request. Helpdesk staff triage, assign and close it.
              A shared record replaces paper, chat threads and spreadsheets.
            </p>
            <div className="mt-6 max-w-xl border-l-4 border-brass bg-surface px-5 py-4">
              <p className="text-sm font-semibold text-navy">Problem</p>
              <p className="mt-2 text-sm text-ink">
                Campus maintenance and IT requests get lost across paper, messages and sheets. This system
                is one validated path from submission to resolution, with role-based access and a status
                history that can be audited.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/desk" className="inline-flex h-11 items-center bg-navy px-5 text-sm font-semibold text-paper">
                Work the live desk
              </Link>
              <Link to="/scope" className="inline-flex h-11 items-center border border-navy px-5 text-sm font-semibold text-navy">
                Read the scope
              </Link>
            </div>
          </div>
          <aside className="border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl text-navy">Campus service overview</h2>
              <p className="text-xs uppercase tracking-widest text-muted">Local workspace</p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {figures.map((item) => (
                <div key={item.label} className="border-t border-line pt-3">
                  <dt className="text-xs uppercase tracking-widest text-muted">{item.label}</dt>
                  <dd className="mt-1 font-serif text-4xl text-navy tabular-nums">{item.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-5 divide-y divide-line border-t border-line">
              {recent.map((ticket) => (
                <li key={ticket.id}>
                  <Link to="/desk/requests/$ticketId" params={{ ticketId: String(ticket.id) }} className="flex items-start justify-between gap-3 py-3">
                    <span>
                      <span className="block font-mono text-xs text-brass">#{ticket.id}</span>
                      <span className="mt-1 block text-sm font-medium text-navy">{ticket.title}</span>
                    </span>
                    <StatusBadge status={ticket.status} />
                  </Link>
                </li>
              ))}
            </ul>
            {recent.length === 0 ? (
              <div className="mt-5 border border-dashed border-line bg-paper px-4 py-5 text-center">
                <p className="font-serif text-xl text-navy">A clear desk is a good place to start.</p>
                <p className="mt-2 text-sm text-muted">There are no requests in this browser yet.</p>
                <Link to="/desk/new" className="mt-4 inline-flex h-10 items-center bg-navy px-4 text-sm font-semibold text-paper">Create the first request</Link>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-muted">Counts follow the desk. Create or advance a request and they move.</p>
          </aside>
        </section>

        <section className="border-t border-line py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brass">Who it is for</p>
            <h2 className="mt-2 font-serif text-3xl text-navy md:text-4xl">Three roles. One workflow.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {audiences.map((item, index) => (
              <article key={item.user} className="flex flex-col border border-line bg-surface p-5">
                <p className="font-serif text-3xl text-brass tabular-nums">0{index + 1}</p>
                <h3 className="mt-3 font-serif text-2xl text-navy">{item.user}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">{item.who}</p>
                <p className="mt-4 text-sm text-ink">{item.need}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brass">Acceptance</p>
              <h2 className="mt-2 font-serif text-3xl text-navy">What “done” means for the first release</h2>
              <p className="mt-4 text-sm text-ink">
                These are targets for the build, not measured results. The first release stops at intake,
                triage, assignment, status, comments, search and summary counts.
              </p>
            </div>
            <ol className="divide-y divide-line border-y border-line">
              {[
                "A requester submits a valid ticket and sees the generated ID.",
                "Authorised staff update it and the status change is recorded.",
                "Search and filters stay inside the caller’s access scope.",
                "The dashboard counts tickets by status and by category.",
              ].map((item, index) => (
                <li key={item} className="grid grid-cols-[auto_1fr] gap-4 py-4">
                  <span className="font-serif text-2xl text-navy tabular-nums">0{index + 1}</span>
                  <span className="self-center text-sm text-ink">{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted">
            Out of the first demo: payment, public access to student data, live campus login, real email or
            SMS, file uploads, and a public production deployment. The status label beside each row — for
            example {labelStatus("IN_PROGRESS").toLowerCase()} — is always written, not implied by colour.
          </p>
        </section>

      </div>
    </SiteFrame>
  );
}
