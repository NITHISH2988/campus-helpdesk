export const team = [
  {
    name: "S. Nithish",
    register: "RA2411003050020",
    focus: "Coordinator, requirements and integration tracking; confirm API and UI handoffs.",
  },
  {
    name: "P. Karthik",
    register: "RA2411003050005",
    focus: "React views, routing, responsive styling and client-side validation.",
  },
  {
    name: "S.M.P. Deekshitulu",
    register: "RA2411003050006",
    focus: "Spring Boot controllers, service rules, API contracts and backend tests.",
  },
  {
    name: "P. Rahul",
    register: "RA2411003050029",
    focus: "Relational schema and JPA, seed data, integration quality, README and local deployment.",
  },
] as const;

export const audiences = [
  {
    user: "Requester",
    who: "Student or staff",
    need: "Submit a request, attach a location and category, view only their own requests, and follow progress.",
  },
  {
    user: "Helpdesk staff",
    who: "Facilities and IT",
    need: "Review incoming requests, assign a handler, change status and priority, add a work note, and close or reopen.",
  },
  {
    user: "Administrator",
    who: "Campus operations",
    need: "Maintain categories and staff access, and review aggregate workload without exposing requester detail.",
  },
] as const;

export const requirements = [
  {
    id: "FR-01",
    text: "Create a request with category, location, title and description.",
    check: "Required fields are validated in the client and on the service boundary. A successful create returns a ticket ID.",
  },
  {
    id: "FR-02",
    text: "View the request list and a ticket detail.",
    check: "The list is paginated. Requesters see only their records. Staff see the authorised queue.",
  },
  {
    id: "FR-03",
    text: "Update status and assignment.",
    check: "Staff-only. Legal transitions are enforced and recorded in history.",
  },
  {
    id: "FR-04",
    text: "Edit or withdraw an eligible request.",
    check: "A requester may edit or withdraw only while New. Staff may reopen a resolved ticket with a reason.",
  },
  {
    id: "FR-05",
    text: "Search and filter.",
    check: "Filter by ticket ID, category, status and date. Results respect access scope.",
  },
  {
    id: "FR-06",
    text: "Add comments and work notes.",
    check: "A public update and an internal note are distinguished. Internal notes are staff-only.",
  },
  {
    id: "FR-07",
    text: "Show an operational summary.",
    check: "Counts by status and category come from persisted records and do not expose requester details.",
  },
  {
    id: "FR-08",
    text: "Notify on important status changes.",
    check: "The notification request crosses a separate API boundary. This demo records delivery intent and sends nothing.",
  },
] as const;

export const nonFunctional = [
  "Responsive layout with clear navigation, labels, keyboard focus, and status text that does not rely on colour alone.",
  "Server-shaped validation and consistent JSON errors. No database credentials or tokens in source.",
  "Authorisation is decided on every protected action. Hiding a button is not access control.",
  "Synthetic demo identities only. Personal contact details are not part of the register.",
  "A reproducible local run, with environment names documented and secrets kept out of the repository.",
] as const;

export const views = [
  {
    name: "Home / dashboard",
    action: "Status and category totals, recent tickets for the signed-in role, and a prominent New request action.",
  },
  {
    name: "Request list",
    action: "Search, status and category filters, pagination, ticket ID, title, category, created date and status.",
  },
  {
    name: "Request detail",
    action: "Description, location, status timeline, comments, current assignee and only the actions that role may take.",
  },
  {
    name: "Create / edit",
    action: "Required-field feedback for location, category, title and description. Entered text stays if the API rejects it.",
  },
  {
    name: "Staff queue",
    action: "Unassigned and active tickets, priority, assignment, a legal status transition and internal work notes.",
  },
] as const;

export const layers = [
  {
    name: "User interface",
    tech: "React, React Router, CSS",
    duty: "Home, ticket list, ticket detail, new and edit form, dashboard.",
  },
  {
    name: "Operations API",
    tech: "Spring Boot",
    duty: "Controllers, services, validation and Spring Data JPA.",
  },
  {
    name: "Relational data",
    tech: "MySQL 8",
    duty: "Users, categories, tickets, comments and status history.",
  },
  {
    name: "HTTP / JSON",
    tech: "Fetch API",
    duty: "Field errors, loading and success states.",
  },
  {
    name: "Separate boundary",
    tech: "Notification service",
    duty: "REST API with a demo adapter. No real delivery.",
  },
  {
    name: "Quality",
    tech: "JUnit, MockMvc, React tests",
    duty: "Automated checks and a Docker Compose local setup.",
  },
] as const;

export const techChoices = [
  {
    layer: "Frontend",
    tech: "React, JavaScript, React Router, CSS",
    duty: "Responsive views, forms, routing, client validation and API integration.",
  },
  {
    layer: "Main API",
    tech: "Java, Spring Boot, Bean Validation, Spring Data JPA",
    duty: "Role-aware REST endpoints, business rules, persistence and structured errors.",
  },
  {
    layer: "Database",
    tech: "MySQL 8",
    duty: "Users, categories, tickets, comments and status history with foreign keys.",
  },
  {
    layer: "Separate service",
    tech: "Notification service REST API",
    duty: "Accepts a notification event and returns an acknowledgement. Local demo adapter avoids real delivery.",
  },
  {
    layer: "Quality / local run",
    tech: "JUnit 5, MockMvc, React Testing Library, Docker Compose",
    duty: "Automated checks and reproducible local startup.",
  },
] as const;

export const entities = [
  {
    name: "users",
    fields:
      "user_id PK; display_name; email UNIQUE; role CHECK (REQUESTER, STAFF, ADMIN); active BOOLEAN. Authentication stays a local demo role until faculty approves an identity approach.",
  },
  {
    name: "categories",
    fields: "category_id PK; name UNIQUE; description; active BOOLEAN.",
  },
  {
    name: "tickets",
    fields:
      "ticket_id PK; requester_id FK users; assignee_id FK users NULL; category_id FK categories; title; description; location; priority; status; created_at; updated_at; version.",
  },
  {
    name: "ticket_comments",
    fields:
      "comment_id PK; ticket_id FK tickets; author_id FK users; body; visibility (PUBLIC, INTERNAL); created_at.",
  },
  {
    name: "ticket_status_history",
    fields:
      "history_id PK; ticket_id FK tickets; changed_by FK users; from_status; to_status; reason; changed_at.",
  },
] as const;

export const endpoints = [
  { method: "GET", path: "/tickets?status=&categoryId=&q=&page=", purpose: "List and search. A requester sees their own tickets. The staff queue follows role policy." },
  { method: "POST", path: "/tickets", purpose: "Create as the authenticated requester." },
  { method: "GET", path: "/tickets/{id}", purpose: "Read detail if the caller is the requester or authorised staff." },
  { method: "PUT", path: "/tickets/{id}", purpose: "Edit permitted fields while New." },
  { method: "DELETE", path: "/tickets/{id}", purpose: "Withdraw an eligible New ticket. No content." },
  { method: "PATCH", path: "/tickets/{id}/status", purpose: "Staff changes status, assignment or priority, with a reason." },
  { method: "POST", path: "/tickets/{id}/comments", purpose: "Add a public comment or a staff-only note." },
  { method: "GET", path: "/dashboard/summary", purpose: "Role-scoped aggregate counts." },
  { method: "POST", path: "/notifications/events", purpose: "Separate service endpoint. Internal demo use only." },
] as const;

export const rules = [
  {
    rule: "Required fields",
    text: "Title 5–100 characters. Description 10–2000 characters. Location and an active category are required. Input is trimmed. Blank text is rejected.",
  },
  {
    rule: "Status lifecycle",
    text: "New → Triaged → In progress → Resolved → Closed. Staff may return Resolved to In progress with a reason. Anything else is a 409 Conflict.",
  },
  {
    rule: "Ownership",
    text: "Requesters read and edit only their own requests, and only while New. The check runs on every route, not only in the menu.",
  },
  {
    rule: "Staff operations",
    text: "Only staff or an administrator can assign, change priority or status, and add an internal note. Public comments stay visible to the requester.",
  },
  {
    rule: "Audit history",
    text: "Every status change records the actor, the prior and new value, the time and the reason together with the ticket update.",
  },
  {
    rule: "Withdrawal",
    text: "A requester may withdraw only in New. The row is kept, with a history event, rather than destroyed.",
  },
  {
    rule: "Concurrency",
    text: "An entity version rejects a stale staff edit with 409 Conflict.",
  },
] as const;

export const security = [
  "Identity and access are decided on the server side of each action. The browser does not get to choose the role, requester or assignee.",
  "Filters are allow-listed. Page size is capped. Values are never concatenated into SQL.",
  "Secrets stay outside source control. Only placeholder names belong in an environment example.",
  "Demo identities are synthetic. Full descriptions are not written to a noisy log.",
  "Development CORS stays narrow. Any later public deployment would use HTTPS.",
] as const;

export const milestones = [
  { id: "1", name: "Proposal", work: "Confirm the problem, users, boundaries and user stories with faculty.", out: "Approved problem statement and responsibilities." },
  { id: "2", name: "Design", work: "Wireframes, architecture, schema, endpoints and transition rules.", out: "Reviewed design package." },
  { id: "3", name: "Implementation", work: "React views, Spring Boot layers, SQL/JPA and the notification API.", out: "A working path across at least two related entities." },
  { id: "4", name: "Integration", work: "Connect UI, API and database. Validation, access checks, errors and tests.", out: "Test output, an issue log and a demonstration checklist." },
  { id: "5", name: "Demo", work: "Package the local setup, seed synthetic records, capture evidence.", out: "README, a reproducible demo and the final report." },
] as const;

export const tests = [
  { level: "React component", check: "Required fields, validation message, status badge, empty, error and loading states.", evidence: "Test output and screenshots." },
  { level: "Service unit tests", check: "Allowed and blocked transitions, ownership, reopen and assignment.", evidence: "JUnit pass/fail totals." },
  { level: "Controller / API", check: "Create 201, invalid input 400, missing 404, forbidden 403, illegal transition 409.", evidence: "MockMvc request and response tests." },
  { level: "Repository", check: "Persist and retrieve a ticket with its category and user. Join and history stay in one transaction.", evidence: "Test database or CI report." },
  { level: "End-to-end demo", check: "Requester creates a ticket. Staff assigns and advances it. The requester sees progress. Filter and summary update.", evidence: "Dated screenshots and the seed data." },
] as const;

export const deploySteps = [
  { step: "Prerequisites", text: "JDK 21, Node.js LTS, Docker Engine and Git. Record the exact versions in the README." },
  { step: "Configuration", text: "Copy the environment example and set database name, user, password, host and API port. Keep the real file out of Git." },
  { step: "Database", text: "Compose starts MySQL with a named volume and a health check, then applies versioned migrations and synthetic seed data." },
  { step: "Backend", text: "Run Spring Boot on the local profile against that database. Document the wrapper command once the project is generated." },
  { step: "Notification API", text: "Start the notification component with the no-op adapter and point the backend at its URL." },
  { step: "Frontend", text: "Install from the lockfile, set the API base URL, and start the React development server." },
  { step: "Verification", text: "Hit health, create a seeded request, exercise a staff transition, and confirm the row is still in MySQL." },
] as const;

export const outcomes = [
  { id: "CO-1", text: "Semantic HTML, CSS layout, navigation, accessible forms and tables, and responsive pages." },
  { id: "CO-2", text: "JavaScript and React components, events, forms, routing, hooks and client-side validation." },
  { id: "CO-3", text: "Relational design, SQL CRUD and joins, parameterised reporting queries, and JDBC connectivity concepts." },
  { id: "CO-4", text: "Spring Boot setup, controller, service and domain layers, business rules and tests." },
  { id: "CO-5", text: "JPA entities and repositories, plus a separately runnable notification API integrated through the backend." },
] as const;

export const packageList = [
  "Faculty-approved problem statement, users, scope and functional requirements.",
  "Architecture diagram, UI wireframes, ER description and schema or migration scripts.",
  "React frontend, Spring Boot backend and notification service source.",
  "Synthetic seed data, the endpoint list and request/response examples.",
  "Test plan, actual results, an issue log and representative screenshots.",
  "Reproducible deployment instructions, an environment template and a README.",
  "An individual contribution statement from each member. Everyone can explain the whole system.",
] as const;

export const demoFlow = [
  "Open the dashboard and explain requester access beside staff access.",
  "Submit a request with invalid fields, then create a valid synthetic request.",
  "Find it in the staff queue, assign it, and move it through the allowed workflow with a reason.",
  "Return to the requester and show the status timeline and the public update.",
  "Filter the list and show the aggregate counts.",
  "Explain the related records, the notification boundary, the tests and the local run.",
] as const;

export const sqlJoin = `SELECT t.ticket_id, t.title, c.name AS category, t.status,
       u.display_name AS requester
FROM tickets t
JOIN categories c ON c.category_id = t.category_id
JOIN users u ON u.user_id = t.requester_id
WHERE t.status = ? AND t.created_at >= ?
ORDER BY t.created_at DESC;`;

export const sqlCount = `SELECT status, COUNT(*) AS ticket_count
FROM tickets
GROUP BY status
ORDER BY status;`;
