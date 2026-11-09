import { createFileRoute, Link } from "@tanstack/react-router";
import { Forbidden, RequestForm, TracePanel } from "@/components/desk-ui";
import { canEdit, canRead, useActor, useDesk } from "@/lib/desk/model";

export const Route = createFileRoute("/desk/edit/$ticketId")({
  head: () => ({ meta: [{ title: "Edit request · Campus Helpdesk" }] }),
  component: EditRequest,
});

function EditRequest() {
  const { ticketId } = Route.useParams();
  const id = Number(ticketId);
  const actor = useActor();
  const ticket = useDesk((state) => state.tickets.find((item) => item.id === id));

  if (!ticket) {
    return (
      <div>
        <h1 className="font-serif text-4xl text-navy">Request not found.</h1>
        <Link to="/desk/requests" className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-navy">
          Back to requests
        </Link>
      </div>
    );
  }
  if (!canRead(ticket, actor)) {
    return <Forbidden title="You cannot edit this request." body="It is outside your access scope." />;
  }
  if (!canEdit(ticket, actor)) {
    return (
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brass-deep">Not editable</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">Only a new request can be edited.</h1>
        <p className="mt-3 text-sm text-ink">
          #{ticket.id} is already {ticket.status.toLowerCase().replaceAll("_", " ")}. The service refuses the change rather than hiding the form alone.
        </p>
        <Link
          to="/desk/requests/$ticketId"
          params={{ ticketId: String(ticket.id) }}
          className="mt-6 inline-flex h-11 items-center bg-navy px-4 text-sm font-semibold text-paper"
        >
          View the request
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">Editing #{ticket.id}</p>
      <h1 className="mt-2 font-serif text-4xl text-navy">Correct the request</h1>
      <p className="mt-3 text-sm text-muted">Version {ticket.version}. A newer save by someone else will be rejected.</p>
      <div className="mt-6 border border-line bg-surface p-5">
        <RequestForm key={ticket.version} mode="edit" ticket={ticket} />
      </div>
      <TracePanel />
    </div>
  );
}
