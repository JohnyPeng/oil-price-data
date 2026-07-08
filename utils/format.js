function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

function formatDate(date) {
  const value = new Date(date)
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function daysBetween(from, to) {
  const start = new Date(formatDate(from)).getTime()
  const end = new Date(formatDate(to)).getTime()
  return Math.max(0, Math.ceil((end - start) / 86400000))
}

function trendClass(value) {
  if (value > 0) return "up"
  if (value < 0) return "down"
  return "flat"
}

function trendText(value) {
  if (value > 0) return `上调 ${value} 元/吨`
  if (value < 0) return `下调 ${Math.abs(value)} 元/吨`
  return "未调整"
}

function literTrendText(value) {
  const literChange = Math.abs(value * 0.00075).toFixed(2)
  if (value > 0) return `↑约${literChange}元/升`
  if (value < 0) return `↓约${literChange}元/升`
  return "—0.00元/升"
}

module.exports = {
  daysBetween,
  formatDate,
  literTrendText,
  trendClass,
  trendText
}
