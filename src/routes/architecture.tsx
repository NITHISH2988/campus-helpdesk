import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, SectionTitle, SiteFrame } from "@/components/site-frame";
import { endpoints, entities, layers, rules, security, sqlCount, sqlJoin, techChoices } from "@/lib/proposal";

export const Route = createFileRoute("/architecture")({
  head: () => ({ meta: [{ title: "Architecture · Campus Helpdesk" }] }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PageIntro
          kicker="Sections 4 to 7"
          title="Three layers, one database, and a notification door."
          lede="Controllers take HTTP. Services enforce the workflow and the access checks. JPA stores the rows. React speaks JSON. The UI never calls the notification service directly."
        />

        <section className="mt-12">
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {layers.map((layer) => (
              <article key={layer.name} className="bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brass">{layer.tech}</p>
                <h2 className="mt-2 font-serif text-2xl text-navy">{layer.name}</h2>
                <p className="mt-3 text-sm text-ink">{layer.duty}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 scroll-mt-28 border-t border-line pt-12" id="stack">
          <SectionTitle kicker="Technology" title="What each layer is responsible for" />
          <div className="mt-6 overflow-x-auto border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-navy text-paper">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Layer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Proposed technology</th>
                  <th scope="col" className="px-4 py-3 font-medium">Responsibility</th>
                </tr>
              </thead>
              <tbody>
                {techChoices.map((row, index) => (
                  <tr key={row.layer} className={index % 2 ? "bg-paper-deep" : "bg-surface"}>
                    <th scope="row" className="px-4 py-3 text-navy">{row.layer}</th>
                    <td className="px-4 py-3 text-ink">{row.tech}</td>
                    <td className="px-4 py-3 text-ink">{row.duty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 max-w-3xl border-l-4 border-brass bg-surface px-5 py-4 text-sm text-ink">
            The notification service is a small, separate REST component. The main application posts a ticket
            ID, an event type and a recipient user ID. The component validates the event and records a delivery
            intent. Its local profile is a no-op adapter, so no personal message is sent.
          </div>
        </section>

        <section className="mt-14 scroll-mt-28 border-t border-line pt-12" id="schema">
          <SectionTitle kicker="Schema" title="Tickets stay separate from people and categories" />
          <p className="mt-4 max-w-3xl text-sm text-ink">
            Generated primary keys. Foreign keys keep the links. Database constraints sit beside application
            validation. One user requests many tickets. One staff user can be assigned many. One category groups
            many tickets. One ticket has many comments and many history rows.
          </p>
          <div className="mt-6 grid gap-4">
            {entities.map((entity) => (
              <article key={entity.name} className="grid gap-2 border border-line bg-surface p-4 md:grid-cols-[12rem_1fr]">
                <h3 className="font-mono text-sm text-navy">{entity.name}</h3>
                <p className="text-sm text-ink">{entity.fields}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <pre className="overflow-x-auto border border-line bg-navy p-4 font-mono text-xs leading-relaxed text-paper">{sqlJoin}</pre>
            <pre className="overflow-x-auto border border-line bg-navy p-4 font-mono text-xs leading-relaxed text-paper">{sqlCount}</pre>
          </div>
          <p className="mt-3 text-xs text-muted">
            Parameters are bound. Values are never concatenated into SQL. Withdrawal of a New ticket is a
            controlled status, and the history remains.
          </p>
        </section>

        <section className="mt-14 scroll-mt-28 border-t border-line pt-12" id="api">
          <SectionTitle kicker="API · base /api/v1" title="The contract the desk speaks" />
          <div className="mt-6 overflow-x-auto border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-navy text-paper">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Method</th>
                  <th scope="col" className="px-4 py-3 font-medium">Path</th>
                  <th scope="col" className="px-4 py-3 font-medium">Purpose and access</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((row, index) => (
                  <tr key={row.path} className={index % 2 ? "bg-paper-deep" : "bg-surface"}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs text-brass">{row.method}</th>
                    <td className="px-4 py-3 font-mono text-xs text-navy">{row.path}</td>
                    <td className="px-4 py-3 text-ink">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Sample
              title="Create · 201"
              body={`POST /api/v1/tickets
{ "categoryId": 2,
  "title": "Projector not powering on",
  "description": "Room display is unavailable before class.",
  "location": "Block B, Room 204" }

{ "ticketId": 1042,
  "status": "NEW",
  "createdAt": "2026-11-09T10:30:00Z" }`}
            />
            <Sample
              title="Validation · 400"
              body={`{ "code": "VALIDATION_ERROR",
  "message": "Please correct the highlighted fields.",
  "fieldErrors": {
    "title": "Title is required"
  } }`}
            />
            <Sample
              title="Status · patch"
              body={`PATCH /api/v1/tickets/1042/status
{ "status": "IN_PROGRESS",
  "assigneeId": 17,
  "reason": "Assigned to facilities team" }

Illegal moves return 409.`}
            />
          </div>
        </section>

        <section className="mt-14 scroll-mt-28 border-t border-line pt-12" id="rules">
          <SectionTitle kicker="Rules" title="Enforced on the action, not only on the screen" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rules.map((item) => (
              <article key={item.rule} className="border border-line bg-surface p-5">
                <h3 className="font-serif text-2xl text-navy">{item.rule}</h3>
                <p className="mt-3 text-sm text-ink">{item.text}</p>
              </article>
            ))}
          </div>
          <ol className="mt-8 max-w-3xl list-decimal space-y-2 pl-5 text-sm text-ink">
            {security.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="mt-6 font-mono text-sm text-navy">
            NEW → TRIAGED → IN_PROGRESS → RESOLVED → CLOSED
            <span className="mt-1 block text-muted">RESOLVED may return to IN_PROGRESS, with a reason.</span>
          </p>
        </section>
      </div>
    </SiteFrame>
  );
}

function Sample({ title, body }: { title: string; body: string }) {
  return (
    <article className="border border-line bg-surface">
      <h3 className="border-b border-line px-4 py-3 font-serif text-xl text-navy">{title}</h3>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink">{body}</pre>
    </article>
  );
}
