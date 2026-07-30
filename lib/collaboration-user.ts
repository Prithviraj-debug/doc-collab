/** Stable pastel colors for collaboration carets */
const CARET_COLORS = [
  "#0f766e", // teal
  "#b45309", // amber
  "#1d4ed8", // blue
  "#be123c", // rose
  "#7c3aed", // violet
  "#047857", // emerald
  "#c2410c", // orange
  "#0369a1", // sky
]

export function colorFromUserId(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return CARET_COLORS[hash % CARET_COLORS.length]!
}

export type CollaborationUser = {
  name: string
  color: string
}
