import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, SectionTitle, SiteFrame } from "@/components/site-frame";
import { demoFlow, deploySteps, milestones, outcomes, packageList, team, tests } from "@/lib/proposal";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery · Campus Helpdesk" }] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PageIntro
          kicker="Sections 8 to 11"
          title="How the team will prove it, run it, and hand it in."
          lede="Testing is planned. This proposal does not claim that those tests have already been executed. Evidence is collected after implementation, with versions, commands, the date, and pass or fail counts."
        />

        <section className="mt-12">
          <ol className="grid gap-4 md:grid-cols-5">
            {milestones.map((item) => (
              <li key={item.id} className="border border-line bg-surface p-4">
                <p className="font-serif text-3xl text-brass tabular-nums">0{item.id}</p>
                <h2 className="mt-2 font-serif text-xl text-navy">{item.name}</h2>
                <p className="mt-3 text-sm text-ink">{item.work}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">{item.out}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 border-t border-line pt-12">
          <SectionTitle kicker="Test plan" title="Evidence, not an unrun tick" />
          <div className="mt-6 overflow-x-auto border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-navy text-paper">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Level</th>
                  <th scope="col" className="px-4 py-3 font-medium">Example checks</th>
                  <th scope="col" className="px-4 py-3 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((row, index) => (
                  <tr key={row.level} className={index % 2 ? "bg-paper-deep" : "bg-surface"}>
                    <th scope="row" className="px-4 py-3 text-navy">{row.level}</th>
                    <td className="px-4 py-3 text-ink">{row.check}</td>
                    <td className="px-4 py-3 text-ink">{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 border-t border-line pt-12">
          <SectionTitle kicker="Local run" title="Docker Compose is the minimum reproducible setup" />
          <p className="mt-4 max-w-3xl text-sm text-ink">
            A public URL is optional, and only after an approved host, a secure configuration and a smoke
            test. Planned layout: frontend, backend/helpdesk-api, services/notification-service,
            database/migrations, database/seed, docs/architecture, docker-compose and a README.
          </p>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {deploySteps.map((item, index) => (
              <li key={item.step} className="grid gap-2 py-4 md:grid-cols-[10rem_1fr]">
                <p className="text-sm font-semibold text-navy">
                  <span className="mr-2 font-serif text-brass tabular-nums">0{index + 1}</span>
                  {item.step}
                </p>
                <p className="text-sm text-ink">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid gap-10 border-t border-line pt-12 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="Course outcomes" title="Where the work shows up" />
            <ul className="mt-6 space-y-3">
              {outcomes.map((item) => (
                <li key={item.id} className="border border-line bg-surface p-4">
                  <p className="font-mono text-xs text-brass">{item.id}</p>
                  <p className="mt-2 text-sm text-ink">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle kicker="Demonstration" title="The six moves in the room" />
            <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-ink">
              {demoFlow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <Link to="/desk" className="mt-6 inline-flex h-11 items-center bg-navy px-5 text-sm font-semibold text-paper">
              Rehearse on the desk
            </Link>
          </div>
        </section>

        <section className="mt-14 border-t border-line pt-12">
          <SectionTitle kicker="Package" title="What goes in the submission" />
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {packageList.map((item) => (
              <li key={item} className="border-l-4 border-brass bg-surface px-4 py-3 text-sm text-ink">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 overflow-x-auto border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="border-b border-line bg-paper-deep px-4 py-3 text-left font-serif text-xl text-navy">
                Contribution statement — to be completed with evidence
              </caption>
              <thead className="bg-navy text-paper">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Team member</th>
                  <th scope="col" className="px-4 py-3 font-medium">What to record</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member, index) => (
                  <tr key={member.register} className={index % 2 ? "bg-paper-deep" : "bg-surface"}>
                    <th scope="row" className="px-4 py-3 text-navy">
                      {member.name}
                      <span className="mt-1 block font-mono text-xs font-normal text-muted">{member.register}</span>
                    </th>
                    <td className="px-4 py-3 text-ink">{member.focus} Record the implemented work and the part of the demo each person will explain.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl border border-navy bg-surface px-5 py-4 text-sm text-ink">
            Before submission: confirm faculty approval, replace planned items with implemented evidence, run
            and record the tests, verify the local setup from a clean start, and make sure every member can
            explain the complete system.
          </p>
        </section>
      </div>
    </SiteFrame>
  );
}
