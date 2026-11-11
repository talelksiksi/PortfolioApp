/*
 * Site content. Everything a visitor reads lives here, so updating the
 * portfolio never means touching the window manager.
 */
window.SITE = {
  owner: "Talel Ksiksi",
  studio: "CICTNA RDC",
  tagline: "Industrial software, integrations and web apps that ship.",
  email: "contact@cictnardc.net",
  // Contact form delivery. FormSubmit forwards AJAX posts to the address in
  // the URL; the very first submission triggers a one-time activation email
  // to that inbox. Set to "" to fall back to opening the visitor's mail app.
  contactEndpoint: "https://formsubmit.co/ajax/contact@cictnardc.net",
  github: "https://github.com/talelksiksi",
};

window.PROJECTS = [
  {
    id: "integration-toolkit",
    name: "Integration Toolkit",
    file: "IntegrationToolkit.exe",
    icon: "flow",
    category: "Web app · Integration",
    year: "2026",
    summary:
      "A visual API integration builder for designing data flows between warehouse systems: drag systems onto a canvas, wire them together, and export the workflow as code.",
    problem:
      "Integration projects stall in meetings because nobody can see how data moves between the WMS, the PLCs and the ERP. Whiteboard sketches never match what gets built.",
    solution:
      "A canvas where stakeholders lay out the systems themselves, configure each connection's data type, direction and update rate, watch animated packets flow, then hand developers generated JavaScript, cURL or Python.",
    highlights: [
      "6 system node types: WMS, PLC, API, Database, Kafka, REST",
      "Per-connection data type, direction and update frequency",
      "Animated data packets simulate live flow along each link",
      "One-click export to JavaScript, cURL or Python",
      "Keyboard shortcuts and a mobile-responsive canvas",
    ],
    stack: ["React 18", "SVG", "CSS3", "Vercel"],
    live: "https://integration-toolkit-eight.vercel.app",
  },
  {
    id: "tray-store-controller",
    name: "Tray Store Controller",
    file: "TrayStore.sim",
    icon: "tray",
    category: "Industrial automation · Simulation",
    year: "2026",
    summary:
      "A browser simulation of the controller software that runs an automated tray store: retrieval planning, PLC telegrams with checksums, and fault-safe recovery.",
    problem:
      "Automated storage controllers are hard to demo and harder to test: every move is physical, and a dropped PLC link mid-sequence can make a naive controller execute the same move twice.",
    solution:
      "A faithful model of the machine (channels of 12 trays on plain rollers, two powered transfer devices) plus a controller that plans the moves, sends one telegram at a time and waits for each ACK. After a link fault it asks the PLC for the status of the last move instead of resending it.",
    highlights: [
      "Finds the tray, picks the nearer channel end, cycles blocking trays through the nearest channel",
      "Telegram protocol with XOR checksums, one move in flight at a time",
      "Fault button drops the PLC link mid-sequence to prove recovery",
      "No move is ever executed twice",
      "Zero-dependency HTML, CSS and JavaScript",
    ],
    stack: ["JavaScript", "HTML5", "CSS", "PLC protocol design"],
    demo: "telegram",
  },
  {
    id: "opcua-connector",
    name: "OPC UA Connector",
    file: "OpcUaConnector.dll",
    icon: "plug",
    category: "Industrial library · C#",
    year: "2026",
    summary:
      "A C# library built around one interface with two implementations: a realistic in-process simulator for prototyping, and a real opc.tcp:// client verified against a live OPC UA server.",
    problem:
      "Teams building dashboards and alarm logic for factory equipment wait weeks for access to a real PLC, then discover their trigger logic behaves differently on live data.",
    solution:
      "Code against IOpcUaClient. Prototype with the mock, which drifts realistic values every second, then swap in the real adapter with zero changes: the same 9 trigger types evaluate through the same TriggerManager on both.",
    highlights: [
      "9 trigger types: AnyChange, Threshold (hysteresis), Deadband, RateOfChange, Direction, ValueChange, Bit, TimeBased, Connection",
      "Configurable security: None / Sign / SignAndEncrypt, policies, credentials",
      "Recursive, cycle-safe address-space browsing and endpoint discovery",
      "69 tests: 64 unit + real-server integration tests",
      "Live Blazor Server dashboard with streaming trigger log",
    ],
    stack: ["C#", ".NET", "OPC UA", "xUnit", "Blazor Server"],
  },
  {
    id: "warehouse-dashboard",
    name: "Warehouse Dashboard",
    file: "WarehouseDash.app",
    icon: "chart",
    category: "Web app · Real-time monitoring",
    year: "2026",
    summary:
      "A real-time operations dashboard for warehouse machines, inventory and orders, backed by an Express server that pushes live updates over WebSockets.",
    problem:
      "Shift leads juggle separate screens for machine status, stock levels and order backlog, and only learn about a stopped machine when the orders pile up.",
    solution:
      "One live view. An Express.js backend exposes machines, inventory and orders over a REST API and streams changes over WebSockets so the dashboard updates the moment the floor does.",
    highlights: [
      "REST API: health, machines, inventory, orders",
      "WebSocket push for live updates, no polling",
      "Companion to the Integration Toolkit",
    ],
    stack: ["Express.js", "WebSockets", "Node.js", "JavaScript"],
  },
  {
    id: "warehouse-portal",
    name: "Warehouse Portal",
    file: "WarehousePortal.app",
    icon: "portal",
    category: "Web app · Client portal",
    year: "2026",
    summary:
      "A client-facing portal demo for warehouse operations, giving customers a self-service window into their stock and orders.",
    problem:
      "Customers of a warehouse call or email to ask where their stock is, tying up the operations team with status questions.",
    solution:
      "A portal that puts the answers in front of the customer, built on the same data model as the internal dashboard.",
    highlights: [
      "Self-service view of stock and orders",
      "Shares its data model with the internal dashboard",
    ],
    stack: ["JavaScript", "Web"],
  },
  {
    id: "dental-clinic",
    name: "Dental Clinic Platform",
    file: "DentalClinic.web",
    icon: "tooth",
    category: "Web app · Healthcare",
    year: "2026",
    summary:
      "A comprehensive website and management front end for a dental clinic: services, booking, and the day-to-day running of the practice.",
    problem:
      "Small clinics run on phone calls, paper diaries and a brochure website that can't take a booking.",
    solution:
      "One site that sells the clinic to new patients and gives the front desk the tools to manage appointments.",
    highlights: [
      "Patient-facing site with services and booking",
      "Clinic management screens for the front desk",
    ],
    stack: ["JavaScript", "HTML", "CSS"],
  },
];

// The Recycle Bin. Real lessons, mostly learned the hard way.
window.TRASH = [
  {
    file: "resend_on_timeout.js",
    what: "First tray-store controller: when the PLC didn't answer, resend the move.",
    lesson:
      "If the link drops after the PLC executed the move, a resend moves the tray twice. Now the controller asks the PLC for the status of the last move instead.",
  },
  {
    file: "auto_trust_all_certs.cs",
    what: "Early OPC UA adapter that auto-accepted every server certificate to make demos connect faster.",
    lesson:
      "That defeats the whole point of OPC UA security. AutoAcceptUntrustedCertificates now defaults to false.",
  },
  {
    file: "dashboard_polls_every_500ms.js",
    what: "Warehouse dashboard v0 that polled the REST API twice a second.",
    lesson: "Hammered the server and still felt laggy. WebSockets push changes only when the floor changes.",
  },
  {
    file: "portfolio_v1_scroll_forever.html",
    what: "A portfolio that was one very long scrolling page.",
    lesson: "Nobody scrolled past the hero. You're looking at the replacement.",
  },
];

window.SERVICES = [
  {
    title: "Industrial integration",
    text: "PLC, OPC UA and WMS integration; controllers, telegram protocols and fault-safe sequencing for automated storage.",
  },
  {
    title: "Operations dashboards",
    text: "Real-time monitoring for machines, inventory and orders, with live push updates instead of polling.",
  },
  {
    title: "Web & client portals",
    text: "Customer-facing sites and self-service portals that take load off your operations team.",
  },
  {
    title: "Simulators & digital twins",
    text: "Test and demo control logic before the hardware exists, against realistic drifting data.",
  },
];
