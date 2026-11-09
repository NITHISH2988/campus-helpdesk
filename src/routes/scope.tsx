import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, SectionTitle, SiteFrame } from "@/components/site-frame";
import { nonFunctional, requirements, views } from "@/lib/proposal";

export const Route = createFileRoute("/scope")({
  head: () => ({ meta: [{ title: "Scope · Campus Helpdesk" }] }),
  component: ScopePage,
});

function ScopePage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PageIntro
          kicker="Section 2 and 3"
          title="What the first release will and will not do."
          lede="The team confirms scope with faculty before implementation. The demo uses synthetic records and does not rely on real student data."
        />

        <section className="mt-12 scroll-mt-28">
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">Functional requirements and acceptance checks</caption>
              <thead className="bg-navy text-paper">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">ID</th>
                  <th scope="col" className="px-4 py-3 font-medium">Requirement</th>
                  <th scope="col" className="px-4 py-3 font-medium">Acceptance check</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((item, index) => (
                  <tr key={item.id} className={index % 2 ? "bg-paper-deep" : "bg-surface"}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs text-brass">{item.id}</th>
                    <td className="px-4 py-3 font-medium text-navy">{item.text}</td>
                    <td className="px-4 py-3 text-ink">{item.check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">
            The desk on this site exercises FR-01 through FR-08 in the browser, including the 400, 403 and 409
            responses described later.
          </p>
        </section>

        <section className="mt-14 grid gap-8 border-t border-line pt-12 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="Non-functional" title="How it should behave" />
            <ul className="mt-6 space-y-3">
              {nonFunctional.map((item) => (
                <li key={item} className="border-l-4 border-brass bg-surface px-4 py-3 text-sm text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle kicker="Out of scope" title="Left for a later agreement" />
            <p className="mt-6 text-sm text-ink">
              Live campus account login, real email or SMS, file uploads, service-level analytics on
              operational data, and a public production deployment. Any cut or change is agreed with faculty.
            </p>
            <p className="mt-4 text-sm text-ink">
              Payment is excluded. So is any public exposure of student records. The notification boundary
              records that a message would be sent. It does not send one.
            </p>
            <Link to="/architecture" className="mt-6 inline-flex h-11 items-center text-sm font-semibold text-navy underline decoration-brass decoration-2 underline-offset-4">
              Continue to architecture
            </Link>
          </div>
        </section>

        <section className="mt-14 border-t border-line pt-12">
          <SectionTitle kicker="Five views" title="Enough screens to carry the work" />
          <p className="mt-4 max-w-3xl text-sm text-ink">
            Five views cover the minimum of four, without inventing a second product. React Router names the
            routes. Shared pieces handle navigation, fields, status, empty states and errors. Form and filter
            state stay local. After a successful action the relevant view reloads from the register.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {views.map((view, index) => (
              <li key={view.name} className="border border-line bg-surface p-5">
                <p className="font-serif text-3xl text-brass tabular-nums">0{index + 1}</p>
                <h3 className="mt-2 font-serif text-2xl text-navy">{view.name}</h3>
                <p className="mt-3 text-sm text-ink">{view.action}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 border border-navy bg-navy p-6 text-paper md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brass-bright">Wireframe summary</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>Dashboard: navigation and role → status cards → recent requests → New request.</li>
            <li>Detail: ticket ID and status → issue and location → chronological activity → permitted controls.</li>
            <li>Staff queue: filter → prioritised rows → assignment and status, with a reason.</li>
          </ul>
        </section>
      </div>
    </SiteFrame>
  );
}
