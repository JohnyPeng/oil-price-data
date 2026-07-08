const { daysBetween, literTrendText, trendClass, trendText } = require("./format")

const adjustments = [
  {
    id: "2026-06-04",
    date: "2026-06-04",
    gasolineChange: -525,
    dieselChange: -505,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202606/t20260604_1405695.html"
  },
  {
    id: "2026-05-21",
    date: "2026-05-21",
    gasolineChange: 75,
    dieselChange: 70,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202605/t20260521_1405346.html"
  },
  {
    id: "2026-05-08",
    date: "2026-05-08",
    gasolineChange: 320,
    dieselChange: 310,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202605/t20260508_1405100.html"
  },
  {
    id: "2026-04-21",
    date: "2026-04-21",
    gasolineChange: -555,
    dieselChange: -530,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202604/t20260421_1404789.html"
  },
  {
    id: "2026-03-23",
    date: "2026-03-23",
    gasolineChange: 1160,
    dieselChange: 1115,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202603/t20260323_1404295.html"
  },
  {
    id: "2026-03-09",
    date: "2026-03-09",
    gasolineChange: 695,
    dieselChange: 670,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202603/t20260309_1404075.html"
  },
  {
    id: "2026-02-24",
    date: "2026-02-24",
    gasolineChange: 175,
    dieselChange: 170,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202602/t20260224_1403852.html"
  },
  {
    id: "2026-02-03",
    date: "2026-02-03",
    gasolineChange: 205,
    dieselChange: 195,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202602/t20260203_1403566.html"
  },
  {
    id: "2026-01-20",
    date: "2026-01-20",
    gasolineChange: 85,
    dieselChange: 85,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202601/t20260120_1403319.html"
  },
  {
    id: "2026-01-06",
    date: "2026-01-06",
    gasolineChange: 0,
    dieselChange: 0,
    source: "国家发展改革委",
    sourceUrl: ""
  },
  {
    id: "2025-12-22",
    date: "2025-12-22",
    gasolineChange: -170,
    dieselChange: -165,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202512/t20251222_1402523.html"
  },
  {
    id: "2025-12-08",
    date: "2025-12-08",
    gasolineChange: -55,
    dieselChange: -55,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202512/t20251208_1402287.html"
  },
  {
    id: "2025-11-24",
    date: "2025-11-24",
    gasolineChange: -70,
    dieselChange: -65,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202511/t20251124_1401864.html"
  },
  {
    id: "2025-11-10",
    date: "2025-11-10",
    gasolineChange: 125,
    dieselChange: 120,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202511/t20251110_1401464.html"
  },
  {
    id: "2025-10-27",
    date: "2025-10-27",
    gasolineChange: -265,
    dieselChange: -255,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202510/t20251027_1401193.html"
  },
  {
    id: "2025-10-13",
    date: "2025-10-13",
    gasolineChange: -75,
    dieselChange: -70,
    source: "国家发展改革委",
    sourceUrl: "https://www.ndrc.gov.cn/xwdt/xwfb/202510/t20251013_1400937.html"
  },
  {
    id: "2025-09-23",
    date: "2025-09-23",
    gasolineChange: 0,
    dieselChange: 0,
    source: "国家发展改革委",
    sourceUrl: ""
  },
  {
    id: "2025-09-09",
    date: "2025-09-09",
    gasolineChange: 0,
    dieselChange: 0,
    source: "国家发展改革委",
    sourceUrl: ""
  }
]

const provincePrices = [
  { province: "北京", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10405, officialDieselTon: 9345 },
  { province: "天津", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10370, officialDieselTon: 9310 },
  { province: "河北", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10370, officialDieselTon: 9310 },
  { province: "山西", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10440, officialDieselTon: 9365 },
  { province: "内蒙古", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10385, officialDieselTon: 9325 },
  { province: "辽宁", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10370, officialDieselTon: 9310 },
  { province: "吉林", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10370, officialDieselTon: 9310 },
  { province: "黑龙江", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10370, officialDieselTon: 9310 },
  { province: "上海", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10385, officialDieselTon: 9315 },
  { province: "江苏", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10425, officialDieselTon: 9350 },
  { province: "浙江", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10425, officialDieselTon: 9365 },
  { province: "安徽", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10420, officialDieselTon: 9360 },
  { province: "福建", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10445, officialDieselTon: 9375 },
  { province: "江西", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10425, officialDieselTon: 9370 },
  { province: "山东", p92: 8.32, p95: 8.92, p98: 9.92, diesel0: 7.95, updatedAt: "2026-06-05", officialGasolineTon: 10380, officialDieselTon: 9320 },
  { province: "河南", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10390, officialDieselTon: 9330 },
  { province: "湖北", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10395, officialDieselTon: 9335 },
  { province: "湖南", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10435, officialDieselTon: 9395 },
  { province: "广东", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10450, officialDieselTon: 9380 },
  { province: "广西", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10515, officialDieselTon: 9445 },
  { province: "海南", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10515, officialDieselTon: 9445 },
  { province: "重庆", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10585, officialDieselTon: 9520 },
  { province: "四川", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10590, officialDieselTon: 9545 },
  { province: "贵州", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10550, officialDieselTon: 9470 },
  { province: "云南", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10580, officialDieselTon: 9500 },
  { province: "西藏", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: null, officialDieselTon: null },
  { province: "陕西", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10355, officialDieselTon: 9320 },
  { province: "甘肃", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10355, officialDieselTon: 9330 },
  { province: "青海", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10335, officialDieselTon: 9355 },
  { province: "宁夏", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10375, officialDieselTon: 9310 },
  { province: "新疆", p92: null, p95: null, p98: null, diesel0: null, updatedAt: "2026-06-04", officialGasolineTon: 10150, officialDieselTon: 9205 }
]

const priceSnapshots = [
  { province: "山东", date: "2026-06-05", p92: 8.32, p95: 8.92, p98: 9.92, diesel0: 7.95 }
]

let cloudPayload = null

function fixed(value) {
  return Number(value.toFixed(2))
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
}

function displayPrice(value) {
  return isNumber(value) ? value.toFixed(2).replace(/\.?0+$/, "") : "--"
}

function withApiOilNumbers(item) {
  const hasOilNumbers = [item.p92, item.p95, item.p98, item.diesel0].every(isNumber)
  return {
    ...item,
    priceBasis: hasOilNumbers ? "api" : "missing",
    priceBasisText: hasOilNumbers ? "最新油价" : "暂无油价"
  }
}

function withDisplayPrice(item) {
  const converted = withApiOilNumbers(item)
  return {
    ...converted,
    p92Text: displayPrice(converted.p92),
    p95Text: displayPrice(converted.p95),
    p98Text: displayPrice(converted.p98),
    diesel0Text: displayPrice(converted.diesel0)
  }
}

function getLatestAdjustment() {
  const latest = cloudPayload && cloudPayload.latest ? cloudPayload.latest : adjustments[0]
  return {
    ...latest,
    gasolineTrendClass: trendClass(latest.gasolineChange),
    dieselTrendClass: trendClass(latest.dieselChange),
    gasolineTrendText: trendText(latest.gasolineChange),
    dieselTrendText: trendText(latest.dieselChange)
  }
}

function getNextWindow(today = new Date()) {
  const remoteWindow = cloudPayload && cloudPayload.nextWindow
  const nextDate = remoteWindow ? remoteWindow.date : "2026-06-18"
  return {
    date: nextDate,
    daysLeft: daysBetween(today, nextDate),
    note: remoteWindow ? remoteWindow.note : "按国内成品油调价机制估算，实际以官方发布为准"
  }
}

function getProvincePrices() {
  const prices = cloudPayload && cloudPayload.prices && cloudPayload.prices.length ? cloudPayload.prices : provincePrices
  return prices.map(withDisplayPrice)
}

function getProvincePrice(province) {
  const prices = getProvincePrices()
  return prices.find((item) => item.province === getResolvedProvince(province)) || prices[0]
}

function getResolvedProvince(province) {
  const prices = getProvincePrices()
  const matched = prices.find((item) => item.province === province)
  return matched ? matched.province : prices[0].province
}

function getHistory() {
  const source = cloudPayload && cloudPayload.history && cloudPayload.history.length ? cloudPayload.history : adjustments
  return source.map((item) => ({
    ...item,
    gasolineTrendClass: trendClass(item.gasolineChange),
    dieselTrendClass: trendClass(item.dieselChange),
    gasolineTrendText: trendText(item.gasolineChange),
    dieselTrendText: trendText(item.dieselChange),
    gasolineLiterTrendText: literTrendText(item.gasolineChange),
    dieselLiterTrendText: literTrendText(item.dieselChange)
  }))
}

function getPriceHistory(province) {
  const resolvedProvince = getResolvedProvince(province)
  const source = cloudPayload && cloudPayload.priceSnapshots && cloudPayload.priceSnapshots.length ? cloudPayload.priceSnapshots : priceSnapshots
  return source
    .filter((item) => item.province === resolvedProvince)
    .filter((item) => [item.p92, item.p95, item.p98, item.diesel0].every(isNumber))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date,
      p92: fixed(item.p92),
      p95: fixed(item.p95),
      p98: fixed(item.p98),
      diesel0: fixed(item.diesel0)
    }))
}

function applyCloudPayload(payload) {
  if (!payload || !payload.latest || !payload.prices || payload.prices.length === 0) {
    return false
  }

  cloudPayload = payload
  return true
}

module.exports = {
  applyCloudPayload,
  getHistory,
  getLatestAdjustment,
  getNextWindow,
  getPriceHistory,
  getProvincePrice,
  getProvincePrices,
  getResolvedProvince
}
