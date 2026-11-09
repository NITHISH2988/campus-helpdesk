import { createFileRoute } from "@tanstack/react-router";
import { FlashBanner, RequestForm, TracePanel } from "@/components/desk-ui";

export const Route = createFileRoute("/desk/new")({
  head: () => ({ meta: [{ title: "New request · Campus Helpdesk" }] }),
  component: NewRequest,
});

function NewRequest() {
  return (
    <div className="mx-auto max-w-2xl">
      <FlashBanner />
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">FR-01</p>
      <h1 className="mt-2 font-serif text-4xl text-navy">New request</h1>
      <p className="mt-3 text-sm text-ink">
        Category, location, title and description are required. If the register rejects the form, what you
        typed stays on the page. Priority starts at normal until staff triage it.
      </p>
      <div className="mt-6 border border-line bg-surface p-5">
        <RequestForm mode="create" />
      </div>
      <TracePanel />
    </div>
  );
}
