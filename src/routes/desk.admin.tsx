import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { FlashBanner, Forbidden, TracePanel } from "@/components/desk-ui";
import { labelRole, useActor, useDesk, type Role } from "@/lib/desk/model";

export const Route = createFileRoute("/desk/admin")({
  head: () => ({ meta: [{ title: "Administration · Campus Helpdesk" }] }),
  component: AdminPage,
});

function AdminPage() {
  const actor = useActor();
  const categories = useDesk((state) => state.categories);
  const users = useDesk((state) => state.users);
  const addCategory = useDesk((state) => state.addCategory);
  const toggleCategory = useDesk((state) => state.toggleCategory);
  const setUserRole = useDesk((state) => state.setUserRole);
  const toggleUser = useDesk((state) => state.toggleUser);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  if (actor.role !== "ADMIN") {
    return (
      <Forbidden
        title="Administration is limited to the campus administrator."
        body="Categories and staff access are not a helpdesk-staff action. Switch to Leela Krishnan to rehearse this view."
      />
    );
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    const result = addCategory(name, description);
    if (!result.ok) {
      setError(result.fieldErrors?.name ?? result.fieldErrors?.description ?? result.message);
      return;
    }
    setName("");
    setDescription("");
    setError(null);
  }

  return (
    <div>
      <FlashBanner />
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">Administrator</p>
      <h1 className="mt-2 font-serif text-4xl text-navy">Categories and access</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink">
        Synthetic identities only. Deactivating someone hides them from the role switcher. Existing tickets
        keep their history.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-surface p-5">
          <h2 className="font-serif text-2xl text-navy">Categories</h2>
          <ul className="mt-4 divide-y divide-line">
            {categories.map((category) => (
              <li key={category.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">
                    {category.name}
                    {category.active ? "" : " · inactive"}
                  </p>
                  <p className="text-sm text-muted">{category.description}</p>
                </div>
                <button
                  type="button"
                  className="h-11 shrink-0 px-2 text-sm font-semibold text-navy"
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.active ? "Retire" : "Restore"}
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={onCreate} className="mt-4 grid gap-3 border-t border-line pt-4">
            <label className="grid gap-1 text-sm font-medium text-navy">
              New category
              <input className="h-11 border border-line bg-paper px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-navy">
              Description
              <input className="h-11 border border-line bg-paper px-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            {error ? <p className="text-sm text-brass-deep">{error}</p> : null}
            <button type="submit" className="h-11 bg-navy px-4 text-sm font-semibold text-paper">
              Add category
            </button>
          </form>
        </section>

        <section className="border border-line bg-surface p-5">
          <h2 className="font-serif text-2xl text-navy">People</h2>
          {accessError ? <p className="mt-3 text-sm text-brass-deep">{accessError}</p> : null}
          <ul className="mt-4 divide-y divide-line">
            {users.map((user) => (
              <li key={user.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-navy">
                    {user.displayName}
                    {user.active ? "" : " · inactive"}
                  </p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`role-${user.id}`}>
                    Role for {user.displayName}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    className="h-11 border border-line bg-paper px-2 text-sm"
                    value={user.role}
                    onChange={(event) => {
                      const result = setUserRole(user.id, event.target.value as Role);
                      setAccessError(result.ok ? null : result.message);
                    }}
                  >
                    {(["REQUESTER", "STAFF", "ADMIN"] as Role[]).map((role) => (
                      <option key={role} value={role}>
                        {labelRole(role)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="h-11 px-2 text-sm font-semibold text-navy"
                    onClick={() => {
                      const result = toggleUser(user.id);
                      setAccessError(result.ok ? null : result.message);
                    }}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <TracePanel />
    </div>
  );
}
