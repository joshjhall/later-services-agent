<script setup lang="ts">
// The story map (docs/discovery/story-map.md) grouped under Plan · Make · Run.
// One column per activity; rows are releases. `hi` marks cells the prototype builds.
type Cell = { t: string; hi?: boolean };
type Activity = { n: number; name: string; proto: Cell; r1: string };
type Phase = { name: string; acts: Activity[] };

const phases: Phase[] = [
  {
    name: "Plan",
    acts: [
      { n: 1, name: "Take the brief", proto: { t: "Goal, KPIs, questions", hi: true }, r1: "Upload brief" },
      { n: 2, name: "Plan the campaign", proto: { t: "—" }, r1: "Bill of materials" },
      { n: 3, name: "Cast creators", proto: { t: "Lineup with evidence", hi: true }, r1: "Rediscovery" },
    ],
  },
  {
    name: "Make",
    acts: [
      { n: 4, name: "Contract and brief", proto: { t: "—" }, r1: "Offers in band" },
      { n: 5, name: "Produce content", proto: { t: "Quiet creator · drafts", hi: true }, r1: "Fix requests" },
    ],
  },
  {
    name: "Run",
    acts: [
      { n: 6, name: "Go live and optimize", proto: { t: "Below-forecast card" }, r1: "Verify posts" },
      { n: 7, name: "Report and renew", proto: { t: "Roster reliability" }, r1: "Status drafts" },
    ],
  },
];
</script>

<template>
  <div class="map">
    <div class="label" />
    <div class="day">0 · Run my day: the queue, the log, tuning the agent <span class="tag">prototype</span></div>

    <div class="label" />
    <div class="phases">
      <div v-for="p in phases" :key="p.name" class="phase" :style="{ flex: p.acts.length }">{{ p.name }}</div>
    </div>

    <div class="label">Activity</div>
    <div class="row">
      <div v-for="a in phases.flatMap((p) => p.acts)" :key="a.n" class="act"><b>{{ a.n }}</b> {{ a.name }}</div>
    </div>

    <div class="label strong">Prototype</div>
    <div class="row">
      <div
        v-for="a in phases.flatMap((p) => p.acts)"
        :key="a.n"
        class="cell"
        :class="{ hi: a.proto.hi, empty: a.proto.t === '—' }"
      >{{ a.proto.t }}</div>
    </div>

    <div class="label">R1</div>
    <div class="row">
      <div v-for="a in phases.flatMap((p) => p.acts)" :key="a.n" class="cell faint">{{ a.r1 }}</div>
    </div>
  </div>
</template>

<style scoped>
.map { display: grid; grid-template-columns: 4.5rem 1fr; gap: 0.35rem 0.5rem; font-size: 0.62rem; align-items: stretch; }
.label { align-self: center; color: var(--muted-foreground); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.55rem; }
.label.strong { color: var(--primary); }
.day { padding: 0.3rem 0.6rem; border-radius: 0.4rem; background: var(--md-primary-container); color: var(--md-on-primary-container); font-weight: 600; }
.tag { margin-left: 0.4rem; padding: 0 0.4rem; border-radius: 999px; background: var(--md-on-primary-container); color: var(--md-primary-container); font-size: 0.5rem; }
.phases { display: flex; gap: 0.35rem; }
.phase { padding: 0.2rem 0.5rem; border-bottom: 2px solid var(--primary); color: var(--primary); font-weight: 700; font-size: 0.75rem; }
.row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem; }
.act { padding: 0.35rem 0.4rem; border-radius: 0.35rem; background: var(--md-surface-container-high); font-weight: 600; }
.act b { color: var(--primary); }
.cell { padding: 0.35rem 0.4rem; border-radius: 0.35rem; border: 1px solid var(--border); background: var(--card); }
.cell.hi { border-color: var(--primary); background: var(--md-primary-container); color: var(--md-on-primary-container); font-weight: 600; }
.cell.empty { color: var(--muted-foreground); text-align: center; background: transparent; border-style: dashed; }
.cell.faint { color: var(--muted-foreground); background: transparent; }
</style>
