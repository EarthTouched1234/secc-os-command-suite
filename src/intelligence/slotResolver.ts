// SRSM — Slot Resolver. Deterministic: a NormalizedOutput → the visual slots it earns.
// Guardrail: INFERRED never visualizes (no authority without confidence).

import type { NormalizedOutput } from './normalized'

export type SlotType = 'KPI_panel' | 'chart' | 'timeline' | 'system_graph' | 'heatmap'

export interface VisualSlot {
  type: SlotType
  priority: 'primary' | 'secondary'
}

export function resolveSlots(o: NormalizedOutput): VisualSlot[] {
  // Doctrine guard: no confidence → no authority rendering.
  if (o.sourceState === 'INFERRED') return []

  const slots: VisualSlot[] = []

  // Non-negotiable maps
  if (o.type === 'PMO') slots.push({ type: 'KPI_panel', priority: 'primary' })
  if (o.type === 'SEIS') slots.push({ type: 'system_graph', priority: 'primary' })

  // Data-driven secondary slots
  if (o.metrics && Object.keys(o.metrics).length > 0) slots.push({ type: 'chart', priority: 'secondary' })
  if (o.timeline && o.timeline.length > 0) slots.push({ type: 'timeline', priority: 'secondary' })
  if (o.sourceState === 'PARTIAL') slots.push({ type: 'heatmap', priority: 'secondary' })

  return slots
}
