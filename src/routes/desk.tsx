import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";

export const Route = createFileRoute("/desk")({
  head: () => ({ meta: [{ title: "Desk · Campus Helpdesk" }] }),
  component: DeskLayout,
});

function DeskLayout() {
  return (
    <SiteFrame>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <Outlet />
      </div>
    </SiteFrame>
  );
}
