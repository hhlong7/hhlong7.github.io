// Every fact on the site lives here. Items marked `todo` are waiting on Long's own wording;
// items marked `held` stay off the page until Long approves them.

export const profile = {
  name: "Long Hoang Ho",
  short: "Long",
  tagline: "EE + CS · Cal Poly SLO",
  email: "hhlong605@gmail.com",
  github: { label: "github.com/hhlong7", href: "https://github.com/hhlong7" },
  linkedin: { label: "linkedin.com/in/longhh605", href: "https://www.linkedin.com/in/longhh605/" },
  resume: { href: "/assets/resume.pdf", available: false },
  basedIn: "San Jose, CA",
  photo: "/assets/me.jpg",
}

export const bio = [
  "I'm an Electrical Engineering student at Cal Poly San Luis Obispo with a minor in Computer Science. My work spans RTL design, computer architecture, verification, and applied AI, bridging hardware and software at the systems level.",
  "I'm motivated to pursue opportunities in digital design, verification, embedded systems, and semiconductor engineering. I'm especially interested in processor microarchitecture and hardware-software co-design.",
  "Outside of class, I'm in Cal Poly's CARP research group working on GPU architecture, I do research with Prof. Andrew Danowitz on LLM inference and KV-cache memory, and I TA for CPE 2300 and 2301.",
]

// HOLD: waiting on Long's OK before this line goes public.
export const lookingFor = {
  held: true,
  text: "Right now I'm looking for Summer 2027 internships in GPU or CPU architecture, RTL design and verification, and physical design.",
}

export const facts: { label: string; value: string; href?: string }[] = [
  { label: "School", value: "Cal Poly San Luis Obispo" },
  { label: "Degree", value: "B.S. Electrical Engineering · CS minor" },
  { label: "Graduating", value: "2028" },
  { label: "Focus", value: "Digital design · Verification · Computer architecture · Embedded systems" },
  { label: "Based in", value: "San Jose, CA" },
  { label: "GitHub", value: "github.com/hhlong7", href: "https://github.com/hhlong7" },
]

export type Job = {
  role: string
  /** Label for the tiny preview on the monitor. */
  short: string
  org: string
  when: string
  body: string
  todo?: string
}

export const work: Job[] = [
  {
    role: "Teaching Assistant, CPE 2300 and 2301",
    short: "TA, CPE 2300 + 2301",
    org: "Cal Poly",
    when: "Fall 2026 to present",
    body: "TA for the CPE 2300 lecture sections and the CPE 2301 lab sections.",
  },
  {
    role: "Researcher, Cal Poly CARP",
    short: "Researcher, CARP GPU",
    org: "Computer Architecture Research Group · GPU architecture",
    when: "Apr 2026 to present",
    body: "Working on GAR GPU development with the group. My LFGPU fork grew out of this.",
  },
  {
    role: "Undergraduate Researcher, LLM inference and KV-cache memory",
    short: "Research, KV-cache memory",
    org: "Cal Poly · with Prof. Andrew Danowitz",
    when: "In progress",
    body: "Studying how big the KV cache really gets during LLM inference and whether similar prompts end up in similar places inside the model. Details are under current projects.",
  },
  {
    role: "Teaching Assistant, Python",
    short: "TA, Python",
    org: "Cal Poly Computer Science and Software Engineering Department · On-site",
    when: "Sep 2025 to Jan 2026",
    body: "Supported a biweekly lab section of 20+ students on Python fundamentals: lists, dictionaries, functions, control structures, I/O, and unit testing. Also responsible for grading.",
  },
  {
    role: "Intern, KBR",
    short: "Intern, KBR",
    org: "KBR",
    when: "TODO",
    body: "Worked on modular data centers and AI infrastructure. My report argued that modular data centers need extending, not replacing, to handle AI workloads, with energy storage acting as the control layer that isolates bursty AI loads from the grid.",
    todo: "Title and dates",
  },
]

export type Project = {
  id: string
  title: string
  description: string
  year: string
  meta: string
  body: string[]
  bullets?: string[]
  stats?: { value: string; label: string }[]
  stack: string[]
  link?: string
  /** Long's own screenshot, waveform or board photo. Until one exists, the preview shows a spec card. */
  image?: string
  todo?: { title: string; text: string }
  after?: string
}

export const currentProjects: Project[] = [
  {
    id: "rv32imacz",
    title: "RV32IMACZ",
    description: "My RISC-V CPU: a seven-stage in-order core in SystemVerilog.",
    year: "2026",
    meta: "Passion project · started Mar 2026 · still growing",
    body: [
      "A simulation-first RISC-V processor built around a seven-stage in-order core in SystemVerilog. It implements RV32IMAC plus Zicsr/Zifencei, with a two-slot dual-issue front end, branch prediction (BHT, BTB, RAS), a two-level data cache hierarchy, a store buffer, atomics (LR/SC, AMOs), compressed instruction expansion, and full CSR, trap and timer-interrupt handling.",
      "It evolved from a 5-stage baseline, with each addition tracked against measurable performance. Software bring-up includes booting FreeRTOS and running CoreMark in simulation.",
    ],
    stats: [
      { value: "23/23", label: "directed tests" },
      { value: "16/16", label: "seeded random runs" },
      { value: "914 vs 1047", label: "cycles, 7-stage vs 5-stage" },
    ],
    todo: {
      title: "Out-of-order core",
      text: "I've been building an out-of-order core in the same repo. Waiting on Long's wording for what it does and where it's at.",
    },
    after: "After that, the plan is to take it through a backend flow, RTL to layout, as a personal project.",
    stack: ["SystemVerilog", "iverilog", "Verilator", "Python", "RISC-V Assembly", "FreeRTOS"],
    link: "https://github.com/hhlong7/RV32IMACZ",
  },
  {
    id: "lfgpu",
    title: "LFGPU",
    description: "A RISC-V GPU core, moving CARP's GAR GPU to standard RV32IM.",
    year: "2026",
    meta: "Personal project · May 2026 to present",
    body: [
      "My fork of Cal Poly CARP's GAR GPU (itself built on the open-source tiny-gpu) to learn GPU architecture hands-on. The goal is to migrate the whole ISA from a custom encoding to standard RV32IM, so the GPU can run real compiler-generated kernels and target the Vortex RISC-V GPU compiler.",
    ],
    bullets: [
      "Full RV32IM ISA rewrite across all RTL files (about 3000 lines of SystemVerilog).",
      "Machine-mode CSR support so kernels can read their thread ID.",
      "Rewrote the Rust assembler for standard RV32IM encodings and re-assembled all 13 kernels.",
      "Fixed a warp-pipeline deadlock and recorded baseline performance in RTL simulation.",
    ],
    stats: [
      { value: "~3000", label: "lines of RTL rewritten" },
      { value: "13", label: "kernels re-assembled" },
    ],
    stack: ["SystemVerilog", "cocotb", "iverilog", "Python", "Rust", "RISC-V Assembly"],
    link: "https://github.com/hhlong7/LFGPU",
  },
  {
    id: "kv-cache",
    title: "KV-cache footprint and semantic locality",
    description: "Research with Prof. Andrew Danowitz on LLM inference memory.",
    year: "2026",
    meta: "Research in progress · with Prof. Andrew Danowitz · Cal Poly",
    body: [
      "When an LLM generates text it keeps a KV cache, and that cache eats a lot of memory. I'm looking at how big it actually gets and whether there's structure in it we could take advantage of.",
    ],
    bullets: [
      "Inspected the KV cache tensors on Qwen2.5-0.5B-Instruct (grouped-query attention) and GPT-2 (multi-head attention).",
      "Checked the measured cache size against the formula you get from the model config, across a range of context lengths.",
      "Now: testing whether prompts that mean the same thing converge to similar hidden states as you go deeper through the layers.",
    ],
    after: "Still early, so no big conclusions yet.",
    stack: ["Python", "PyTorch", "Hugging Face", "LLM inference"],
  },
  {
    id: "cpe5350-accel",
    title: "Multi-tenant systolic-array DNN accelerator",
    description: "CPE 5350 team project on a Zybo Z7-20.",
    year: "2026",
    meta: "CPE 5350 final project · team project · Fall 2026",
    body: [
      "We're implementing the multi-tenant systolic-array accelerator from Reshadi and Gregg (PDP 2023) in SystemVerilog and running it on a Zybo Z7-20.",
    ],
    todo: { title: "My part", text: "Waiting on Long's wording for what he owns on the team." },
    stack: ["SystemVerilog", "Zybo Z7-20", "Vivado", "Systolic arrays"],
  },
  {
    id: "ta-app",
    title: "TA app",
    description: "Step-by-step help for students waiting on a TA.",
    year: "2026",
    meta: "Personal project · web app · early stage",
    body: [
      "A tool a TA can use for any class. While students wait for help, it walks them through problems step by step with an interactive interface instead of a plain text chat. It also tracks which topics students struggle with, so the TA knows where to focus.",
      "It comes from my experience as a TA in intro Python and digital design labs, where there are never quite enough TAs to go around.",
    ],
    stack: ["Web app", "Interactive UI", "AI"],
  },
]

// HOLD: topics aren't final; waiting on Long's OK before this shows.
export const upNext = {
  held: true,
  items: [
    "A special-topics GPU project with Prof. Pantoja.",
    "An accelerator project, an FFT engine, with Prof. Danowitz in Spring 2027.",
  ],
}

export const finishedProjects: Project[] = [
  {
    id: "riscv-mcpu",
    title: "32-bit RISC-V microprocessor",
    description: "From a multicycle baseline to a 5-stage pipeline on a Basys3.",
    year: "2026",
    meta: "Sep 2025 to Mar 2026",
    body: [
      "An RTL implementation of a RISC-V datapath, from a multicycle baseline to a 5-stage pipeline with hazard detection and forwarding. Verified in Vivado simulation and deployed on a Basys3 FPGA.",
    ],
    stack: ["SystemVerilog", "Vivado", "Basys3"],
    link: "https://github.com/hhlong7/RISC-V-MCPU",
  },
  {
    id: "reasoning-agent",
    title: "Limited-memory inductive reasoning agent",
    description: "Learns under a fixed memory budget by compressing facts into rules.",
    year: "2026",
    meta: "Spring 2026 · CSC 480 team project",
    body: [
      "An agent that learns under a fixed memory budget by compressing repeated facts into first-order logic rules (Z3), then answers queries about facts it never stored. Benchmarked against three baseline agents on 8 datasets.",
    ],
    stats: [
      { value: "3", label: "baseline agents" },
      { value: "8", label: "datasets" },
    ],
    stack: ["Python", "Z3", "Horn clauses"],
    link: "https://github.com/hhlong7/Limited-Memory-Inductive-Reasoning-Agent",
  },
  {
    id: "fpt",
    title: "FPT embedded systems training",
    description: "Modern C++ for embedded work, ending in an IoT robot project.",
    year: "2026",
    meta: "Summer 2026 · FPT",
    body: [
      "A summer course in modern C++ for embedded work, from memory layout and pointers through OOP, templates, unit testing and design patterns, wrapped up with an IoT robot mini project and a capstone.",
    ],
    todo: { title: "Draft", text: "Waiting on Long to confirm this description." },
    stack: ["C++", "Embedded", "Unit testing"],
    link: "https://github.com/hhlong7/FPT",
  },
  {
    id: "fpga-seq",
    title: "FPGA sequence recognizer",
    description: "A memory game on a Basys3 with FSMs and seven-segment feedback.",
    year: "2025",
    meta: "Jul to Aug 2025",
    body: [
      "A memory-based logic game on a Basys3 FPGA that records, stores and validates input sequences across difficulty levels, with optimized FSMs, D flip-flop storage and seven-segment feedback.",
    ],
    stack: ["SystemVerilog", "Vivado", "XDC"],
  },
  {
    id: "pcba",
    title: "Rube Goldberg machine PCBA",
    description: "A custom PCB control system, from schematic to bring-up.",
    year: "2025",
    meta: "2024 to 2025",
    body: [
      "A custom PCB control system for an automated Rube Goldberg machine: schematic capture, layout, component selection, soldering, and bring-up with sensors and actuators.",
    ],
    stack: ["PCB design", "Fusion", "Arduino"],
  },
  {
    id: "audio-dac",
    title: "Audio DAC converter",
    description: "Signal integrity and filter design, verified in SPICE first.",
    year: "2025",
    meta: "2024 to 2025",
    body: [
      "An audio digital-to-analog converter circuit, focused on signal integrity, filter design and frequency response, verified in SPICE before hardware.",
    ],
    stack: ["SPICE", "Analog"],
  },
]

export type Course = { code: string; title: string; note?: string }
export type CourseGroup = { name: string; courses: Course[] }

export const coursesNow: Course[] = [
  { code: "CPE 5350", title: "Digital System Design", note: "Advanced RTL design, FSMs, synthesis, FPGA implementation." },
  { code: "CPE 5300", title: "Computer Microarchitecture", note: "Processor microarchitecture, studied through research papers." },
  { code: "CSC 3001", title: "Modern Application Development", note: "Full-stack web development, APIs, frameworks, engineering practices." },
]

export const coursesPlanned: Course[] = [
  { code: "EE 3329", title: "Cyber-Physical Systems" },
  { code: "EE 5515", title: "Advanced DSP" },
  { code: "CPE 4190", title: "Applied Parallel Computing" },
]

export const coursesDone: CourseGroup[] = [
  {
    name: "Computer engineering",
    courses: [
      { code: "CPE 333", title: "Computer Architecture", note: "Processor design, pipelining, memory hierarchy, performance analysis." },
      { code: "CPE 233", title: "Computer Design and Assembly Language", note: "Digital logic design, datapath construction, low-level assembly." },
    ],
  },
  {
    name: "Electrical engineering",
    courses: [
      { code: "EE 335", title: "Electromagnetic Fields and Transmission", note: "Wave propagation, transmission lines, Maxwell's equations, RF fundamentals." },
      { code: "EE 255", title: "Electromagnetic Energy Conversion", note: "Electric machines, transformers, motors, generators, power conversion." },
      { code: "EE 2328", title: "Signals and Systems", note: "Continuous and discrete-time systems, Fourier and Laplace transforms, convolution." },
      { code: "EE 3306", title: "Electronics 1", note: "Diodes, BJTs, MOSFETs, amplifier circuits, biasing." },
      { code: "EE 400", title: "Special Problems", note: "Independent research and advanced project work." },
    ],
  },
  {
    name: "Computer science and math",
    courses: [
      { code: "CSC 480", title: "Artificial Intelligence", note: "Search, planning, MDPs, Bayesian networks, machine learning fundamentals." },
      { code: "CSC 357", title: "Systems Programming", note: "C, memory management, Unix system calls, processes, concurrency." },
      { code: "CSC 202", title: "Data Structures", note: "Algorithms, complexity analysis, trees, graphs, sorting, hashing." },
      { code: "STAT 3310", title: "Probability and Random Processes", note: "Probability theory, random variables, distributions, stochastic processes." },
    ],
  },
]

export const interests: { title: string; line: string; more: string; todo?: boolean }[] = [
  {
    title: "Computer architecture",
    line: "Pipelines, caches, and the place where hardware meets software.",
    more: "It's the reason I built RV32IMACZ. Every feature I add, like branch prediction or a second cache level, gets measured against cycle counts, so I can actually see what each idea buys.",
  },
  {
    title: "Digital design + RTL",
    line: "SystemVerilog and FPGAs, with designs I can simulate and measure.",
    more: "I like designs I can put on a board. That started with a sequence game on a Basys3 and now it's a systolic-array accelerator on a Zybo Z7-20.",
  },
  {
    title: "Verification",
    line: "Directed tests, seeded random runs, and Python testbenches.",
    more: "A design only counts once I can prove it works. For my CPU that means 23 directed tests and 16 seeded random runs, plus cocotb testbenches on the GPU side.",
  },
  {
    title: "GPU architecture",
    line: "Learning it hands-on through CARP's GAR GPU and my LFGPU fork.",
    more: "With CARP I work on the GAR GPU, and on my own I'm moving my LFGPU fork over to standard RV32IM so it can run real compiler-generated kernels.",
  },
  {
    title: "Applied AI",
    line: "Reasoning agents, and tools that help people learn.",
    more: "I built a reasoning agent that learns under a fixed memory budget for CSC 480, and I'm working on a TA app that walks waiting students through problems step by step.",
  },
  {
    title: "AI ethics + fairness",
    line: "How technical systems affect the people who use them.",
    more: "The more I work on AI tools, the more I care about who they work well for and who gets left out.",
    todo: true,
  },
]

export const community = {
  orgs: [
    { name: "Cal Poly CARP", meta: "Member · Computer Architecture Research · Apr 2026 to present", body: "Contributed to GAR GPU development." },
    { name: "IEEE", meta: "Member", body: "Part of the TCCA, TCuARCH, CASS, and Computer Society communities." },
  ],
  volunteering: [
    { name: "Viet Career Guide", meta: "Volunteer · Education · May to Aug 2025" },
    { name: "Saint Vincent de Paul", meta: "Volunteer staff · Social services · Sep 2023 to Feb 2024" },
  ],
  leadershipTodo: "Waiting on Long for leadership roles (title, organization, dates, one line on what he led).",
}
