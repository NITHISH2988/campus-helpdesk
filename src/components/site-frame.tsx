import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { labelRole, useActor, useDesk } from "@/lib/desk/model";

const links = [
  { to: "/", label: "Overview", exact: true },
  { to: "/scope", label: "Scope", exact: false },
  { to: "/architecture", label: "Architecture", exact: false },
  { to: "/delivery", label: "Delivery", exact: false },
] as const;

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const desk = path.startsWith("/desk");

  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30">
        <div className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-2 sm:py-3">
            <img src="/srm-trichy-logo.png" alt="SRM Institute of Science and Technology, Tiruchirappalli" className="h-12 w-auto object-contain sm:h-16" />
          </div>
        </div>
        <div className="h-1 bg-brass" />
        <div className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link to="/" className="leading-tight">
              <span className="block font-serif text-2xl text-navy">Campus Helpdesk</span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-muted">
                Maintenance request system
              </span>
            </Link>
            <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="inline-flex h-11 items-center text-sm font-medium text-muted"
                  activeProps={{ className: "inline-flex h-11 items-center border-b-2 border-brass text-sm font-semibold text-navy" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/desk"
                className="inline-flex h-11 items-center bg-navy px-4 text-sm font-semibold text-paper"
                activeProps={{ className: "inline-flex h-11 items-center bg-navy-soft px-4 text-sm font-semibold text-paper" }}
              >
                Open the desk
              </Link>
            </nav>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-line bg-surface text-navy lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
              <span className="sr-only">Menu</span>
            </button>
          </div>
          {open ? (
            <nav id="mobile-nav" className="border-t border-line px-4 py-2 lg:hidden" aria-label="Primary">
              {links.map((item) => (
                <Link key={item.to} to={item.to} className="flex h-11 items-center text-sm font-medium text-navy">
                  {item.label}
                </Link>
              ))}
              <Link to="/desk" className="flex h-11 items-center text-sm font-semibold text-brass">
                Open the desk
              </Link>
            </nav>
          ) : null}
        </div>
        {desk ? <DeskBar /> : null}
      </header>
      <main id="content" className="flex-1">
        {children}
      </main>
      <footer className="mt-16 bg-navy text-paper">
        <div className="h-1 bg-brass" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-serif text-2xl">Campus Helpdesk and Maintenance Request System</p>
            <p className="mt-3 max-w-xl text-sm text-paper">
              A campus service portal for reporting and tracking facilities and IT requests. This browser
              prototype stores entries locally; connect an approved campus backend before using it for live
              operational records.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DeskBar() {
  const actor = useActor();
  const users = useDesk((state) => state.users);
  const setActor = useDesk((state) => state.setActor);
  const reset = useDesk((state) => state.reset);
  const staff = actor.role === "STAFF" || actor.role === "ADMIN";

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Desk">
          <DeskLink to="/desk" label="Dashboard" exact />
          <DeskLink to="/desk/requests" label="Requests" />
          {staff ? <DeskLink to="/desk/queue" label="Staff queue" /> : null}
          {actor.role === "ADMIN" ? <DeskLink to="/desk/admin" label="Administration" /> : null}
          <DeskLink to="/desk/new" label="New request" />
        </nav>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-navy">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted">Viewing as</span>
            <select
              className="h-11 min-w-0 flex-1 border border-line bg-paper px-2 text-sm text-ink sm:w-64"
              value={actor.id}
              onChange={(event) => setActor(Number(event.target.value))}
            >
              {users
                .filter((user) => user.active)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName} · {labelRole(user.role)}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="button"
            className="h-11 border border-line px-3 text-sm font-medium text-navy"
            onClick={() => reset()}
          >
            Clear local workspace
          </button>
        </div>
      </div>
    </div>
  );
}

function DeskLink({
  to,
  label,
  exact = false,
}: {
  to: "/desk" | "/desk/requests" | "/desk/queue" | "/desk/admin" | "/desk/new";
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="inline-flex h-11 shrink-0 items-center px-3 text-sm font-medium text-muted"
      activeProps={{ className: "inline-flex h-11 shrink-0 items-center border-b-2 border-brass px-3 text-sm font-semibold text-navy" }}
    >
      {label}
    </Link>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">{kicker}</p>
      <h1 className="mt-3 font-serif text-4xl text-navy md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-ink">{lede}</p>
    </header>
  );
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">{kicker}</p>
      <h2 className="mt-2 font-serif text-3xl text-navy">{title}</h2>
    </div>
  );
}
