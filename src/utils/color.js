export function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(99, 102, 241, ${alpha})`
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const int = Number.parseInt(value, 16)
  if (Number.isNaN(int)) return `rgba(99, 102, 241, ${alpha})`
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
