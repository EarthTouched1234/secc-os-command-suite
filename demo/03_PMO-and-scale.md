# The PMO Layer — and Why It Scales Beyond Property

*This is the slide that turns a property sale into a platform sale.*

Everything in the DAR report is **one program** inside a portfolio. The PMO layer doesn't care
that it's property — it reads a health score, a RAG status, and a trajectory, and governs it the
same way it would govern an energy grid rollout or a construction program.

---

## Portfolio snapshot — The Eddy as a governed program

| Field | Value | Source |
|-------|-------|--------|
| Program | The Eddy at Riverview Landing | — |
| Domain | `property` (Property, Facilities & Asset Operations) | domain registry |
| Primary metric | Occupancy 95.8% | leasing engine |
| **RAG** | 🟢 **Green** | occupancy > 92% threshold |
| **Health score** | High (occupancy + leasing both above target) | auto-scored |
| **Trajectory** | ▲ Improving (+1.6 pts occupancy over period) | snapshot history |
| Watch flag | Work-order backlog (peaked 8) | risk rule |
| Governance | GUARDiAN enforcing all protected actions | zero-trust layer |

The number on this card was **not typed by anyone**. It was promoted through the governed
pipeline from the same data that produced the DAR. The manager sees status; the executive sees
the portfolio; both are looking at the *same verified record*.

---

## Why this is a management engine, not a property tool

A PMO (Portfolio Management Office) is industry-neutral by definition — it governs *programs*,
not *plumbing*. The engine needs only three things from any domain:

```
   1. a primary metric   (occupancy / uptime / schedule %)
   2. a threshold rule    (when is it red?)
   3. a trajectory metric (is it getting better or worse?)
```

Define those three for a new vertical and **the same engine governs it** — same RAG logic, same
trajectory math, same GUARDiAN gates, same contract enforcement. No new platform.

| Vertical | Primary metric | Red line | Already modeled? |
|----------|----------------|----------|------------------|
| **Property** *(live demo)* | Occupancy % | < 92% | ✅ running on real data |
| Energy / SCADA | Uptime % | threshold | ✅ domain defined |
| Construction | Cost Performance Index | < 0.9 | ✅ domain defined |
| Digital / IT | Uptime % / MTTR | threshold | ✅ domain defined |
| Enterprise ops | Cost variance % | threshold | ✅ domain defined |

> **The pitch:** "We proved the engine on property because property gives clean, daily,
> measurable data. The governance layer you just saw is the product. Property is the first
> program in your portfolio — not the last."

---

## The economic argument (close on this)

Traditional enterprise PMO tools require **more humans** as the portfolio grows — analysts to
chase status, assemble reports, reconcile spreadsheets. This engine inverts that: a fixed
framework of expert-trained agents absorbs the administrative load while a single executive
keeps full visibility and control.

> **It scales *down* in cost as it scales *up* in scope.**
