<script setup lang="ts">
// The navigational layout as a wireframe: top nav, core context, widget rail.
// `labels` numbers the AI surfaces (slide 3); `rail` hides the rail to show it is contextual;
// `chat` swaps the rail's widgets for a docked conversation.
withDefaults(defineProps<{ labels?: boolean; rail?: boolean; chat?: boolean; crumb?: string }>(), {
  labels: false,
  rail: true,
  chat: false,
  crumb: "Portfolio › Brightside › Holiday gifting",
});
</script>

<template>
  <div class="wf">
    <div class="top">
      <span class="logo">Later</span>
      <span class="crumb">{{ crumb }}</span>
      <span class="find">⌕ Find or ask <kbd>⌘K</kbd><b v-if="labels" class="n">1</b></span>
      <span class="me">Maya ▾</span>
    </div>
    <div class="body" :class="{ norail: !rail, chatting: chat }">
      <div class="core">
        <slot>
          <div class="row h"></div>
          <div class="evidence">
            <span>✓ Audience 68% US, 25–34</span><span>✓ On time 9 of 10</span><span>◐ Last post 2.1% ER vs 3.4% target</span>
            <b v-if="labels" class="n">3</b>
          </div>
          <div class="decision">
            <span>Approve</span><span>Approve with changes</span><span>Decline unless</span><span>Decline</span>
          </div>
          <div class="row short"></div>
          <div class="draft">Drafted brief for Ana <b v-if="labels" class="n">4</b></div>
        </slot>
      </div>
      <div v-if="rail" class="rail">
        <Transition name="swap" mode="out-in">
          <div v-if="!chat" key="widgets" class="stack">
            <div class="w">Similar campaigns</div>
            <div class="w">Next message · edit / send now</div>
            <div class="w">Recent activity</div>
          </div>
          <div v-else key="chat" class="stack chat">
            <div class="ctx">Context: Ana · Holiday gifting</div>
            <div class="msg me">How is Ana's last post doing vs her others?</div>
            <div class="msg agent">Early numbers, first 48h:</div>
            <div class="mini">
              <div class="bars"><i style="height:62%" /><i style="height:48%" /><i style="height:55%" /><i class="now" style="height:70%" /></div>
              <span>On pattern with her best</span>
            </div>
            <div class="msg me">Draft her a thank-you</div>
            <div class="entry">Ask a follow-up…</div>
          </div>
        </Transition>
        <b v-if="labels" class="n">{{ chat ? 5 : 2 }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wf { position: relative; border: 1.5px solid var(--border); border-radius: 0.75rem;
  background: var(--md-surface-container-lowest); font-size: 0.7rem; height: 100%; display: flex; flex-direction: column; }
.top { border-radius: 0.65rem 0.65rem 0 0; display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--border);
  background: var(--md-surface-container-low); }
.logo { font-weight: 700; color: var(--primary); }
.crumb { color: var(--muted-foreground); }
.find { position: relative; margin: 0 auto; padding: 0.25rem 1.2rem; border: 1px solid var(--primary); border-radius: 999px;
  color: var(--primary); font-weight: 600; }
kbd { font-size: 0.85em; opacity: 0.7; margin-left: 0.4rem; }
.me { color: var(--muted-foreground); }
.body { flex: 1; display: grid; grid-template-columns: 72fr 28fr; min-height: 0; }
.body.norail { grid-template-columns: 1fr; }
.body { transition: grid-template-columns 0.4s ease; }
.body.chatting { grid-template-columns: 64fr 36fr; }
.core { position: relative; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.55rem; }
.row { height: 1.1rem; border-radius: 0.3rem; background: var(--md-surface-container-high); }
.row.h { width: 45%; height: 1.4rem; background: var(--md-surface-container-highest); }
.row.short { width: 60%; }
.evidence { position: relative; display: flex; flex-wrap: wrap; gap: 0.3rem 0.8rem; padding: 0.45rem 0.6rem;
  border-radius: 0.4rem; background: var(--md-surface-container); color: var(--md-on-surface-variant); }
.decision { display: flex; gap: 0.4rem; }
.decision span { padding: 0.3rem 0.6rem; border-radius: 0.4rem; border: 1px solid var(--border); }
.decision span:first-child { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.draft { position: relative; padding: 0.5rem 0.7rem; border: 1px dashed var(--primary); border-radius: 0.4rem; color: var(--primary); width: 60%; }
.rail { border-bottom-right-radius: 0.65rem; position: relative; border-left: 1px solid var(--border); background: var(--md-surface-container-low); padding: 0.6rem;
  display: flex; flex-direction: column; gap: 0.5rem; }
.stack { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; }
.stack.chat { overflow: hidden; gap: 0.35rem; font-size: 0.62rem; }
.ctx { font-size: 0.56rem; font-weight: 600; color: var(--primary); }
.msg { padding: 0.25rem 0.45rem; border-radius: 0.45rem; max-width: 92%; }
.msg.me { align-self: flex-end; background: var(--primary); color: var(--primary-foreground); }
.msg.agent { align-self: flex-start; background: var(--md-surface-container-high); }
.mini { border: 1px solid var(--border); border-radius: 0.4rem; background: var(--card); padding: 0.3rem 0.4rem; color: var(--muted-foreground); }
.bars { display: flex; align-items: flex-end; gap: 0.2rem; height: 1.4rem; margin-bottom: 0.2rem; }
.bars i { flex: 1; border-radius: 0.15rem 0.15rem 0 0; background: var(--md-surface-container-highest); }
.bars i.now { background: var(--primary); }
.entry { margin-top: auto; padding: 0.3rem 0.45rem; border: 1px solid var(--primary); border-radius: 0.45rem; color: var(--muted-foreground); }
.swap-enter-active, .swap-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.swap-enter-from { opacity: 0; transform: translateX(0.8rem); }
.swap-leave-to { opacity: 0; }
.w { flex: 1; border-radius: 0.4rem; background: var(--card); border: 1px solid var(--border); padding: 0.4rem; color: var(--muted-foreground); }
.n { position: absolute; top: -0.6rem; right: -0.6rem; width: 1.3rem; height: 1.3rem; border-radius: 999px; display: grid; place-items: center;
  background: var(--primary); color: var(--primary-foreground); font-size: 0.7rem; }
</style>
