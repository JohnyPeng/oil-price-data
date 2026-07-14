#!/usr/bin/env node

const fs = require("fs")
const https = require("https")
const path = require("path")

const projectRoot = path.resolve(__dirname, "../..")
const dataFile = path.join(projectRoot, "utils/oil-data.js")
const outputFile = process.env.REMOTE_OIL_OUTPUT
  ? path.resolve(projectRoot, process.env.REMOTE_OIL_OUTPUT)
  : path.join(projectRoot, "docs/latest-oil-price.json")

const defaultProviders = [
  {
    name: "今日油价查询",
    endpoint: "https://youjia.market.alicloudapi.com/lundroid/youjia",
    queryParam: "province"
  },
  {
    name: "极速油价查询",
    endpoint: "https://jisuoil.market.alicloudapi.com/oil/query",
    queryParam: "province"
  }
]

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})

async function main() {
  const source = fs.readFileSync(dataFile, "utf8")
  const parsed = parseOilData(source)
  const existingPayload = readExistingPayload()
  const nextWindowDate = isValidDateText(existingPayload && existingPayload.nextWindow && existingPayload.nextWindow.date)
    ? existingPayload.nextWindow.date
    : getCurrentNextWindow(source)
  const today = getChinaDate()
  const force = process.argv.includes("--force") || process.env.FORCE_UPDATE === "1"

  if (!force && today < nextWindowDate) {
    console.log(`未到调价窗口：今天 ${today}，下一窗口 ${nextWindowDate}，不调用 API。`)
    if (!existingPayload) {
      writeJson(buildPayload(parsed, parsed.provincePrices, parsed.priceSnapshots, nextWindowDate, "baseline"))
      console.log(`已生成本地基线 JSON：${outputFile}`)
    }
    return
  }

  const appCode = process.env.ALIYUN_OIL_APPCODE || ""
  if (!appCode) {
    throw new Error("缺少 GitHub Secret：ALIYUN_OIL_APPCODE")
  }

  const provinces = getSelectedProvinces(parsed.provincePrices.map((item) => item.province))
  console.log(`准备更新 ${provinces.length} 个地区：${provinces.join("、")}`)

  const apiPrices = []
  const failed = []
  for (const province of provinces) {
    try {
      const result = await fetchProvinceOilPrice(province, appCode)
      console.log(`${province}: ${result.providerName}`)
      apiPrices.push(...result.prices)
    } catch (error) {
      console.log(`${province}: ${error.message}`)
      failed.push(province)
    }
  }

  const updates = applyApiPriceUpdates(parsed.provincePrices, apiPrices)
  if (updates.length === 0) {
    throw new Error("接口返回中没有可写入的省份价格。")
  }

  const nextPrices = mergeProvincePrices(parsed.provincePrices, updates)
  const nextSnapshots = mergeSnapshots(parsed.priceSnapshots, updates)
  const newestDate = getNewestUpdateDate(updates) || today
  const nextWindow = addWorkingDays(newestDate, 10)
  writeJson(buildPayload(parsed, nextPrices, nextSnapshots, nextWindow, "api"))

  console.log(`成功更新 ${updates.length} 个地区。`)
  if (failed.length > 0) {
    console.log(`失败地区：${failed.join("、")}`)
  }
  console.log(`已写入：${outputFile}`)
}

function parseOilData(source) {
  const adjustmentsText = extractArray(source, "adjustments", "provincePrices")
  const provincePricesText = extractArray(source, "provincePrices", "priceSnapshots")
  const priceSnapshotsText = extractArray(source, "priceSnapshots", "cloudPayload")
  return {
    adjustments: evaluateArray(adjustmentsText),
    provincePrices: evaluateArray(provincePricesText),
    priceSnapshots: evaluateArray(priceSnapshotsText)
  }
}

function extractArray(source, name, nextName) {
  const pattern = new RegExp(`const ${name} = (\\[[\\s\\S]*?\\])\\n\\n(?:let|const) ${nextName}`)
  const match = source.match(pattern)
  if (!match) throw new Error(`无法解析 ${name} 数组`)
  return match[1]
}

function evaluateArray(arrayText) {
  return Function(`"use strict"; return (${arrayText});`)()
}

function readExistingPayload() {
  if (!fs.existsSync(outputFile)) return null
  try {
    return JSON.parse(fs.readFileSync(outputFile, "utf8"))
  } catch (error) {
    return null
  }
}

function buildPayload(parsed, prices, priceSnapshots, nextWindowDate, source) {
  return {
    schemaVersion: 1,
    source,
    generatedAt: new Date().toISOString(),
    latest: parsed.adjustments[0],
    nextWindow: {
      date: nextWindowDate,
      note: "按国内成品油调价机制估算，实际以官方发布为准"
    },
    prices,
    priceSnapshots,
    history: parsed.adjustments
  }
}

function writeJson(payload) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
}

function getSelectedProvinces(allProvinces) {
  const input = process.env.OIL_PROVINCES || "all"
  if (input.trim().toLowerCase() === "all" || input.trim() === "全部") {
    return allProvinces
  }

  const selected = input.split(/[,，\s]+/)
    .map((item) => normalizeProvinceName(item))
    .filter((item) => allProvinces.includes(item))
  return Array.from(new Set(selected))
}

async function fetchProvinceOilPrice(province, appCode) {
  const errors = []
  for (const provider of defaultProviders) {
    try {
      const response = await requestJson(buildApiUrl(provider.endpoint, {
        [provider.queryParam]: province
      }), appCode)
      const apiError = extractApiErrorMessage(response)
      if (apiError) throw new Error(apiError)

      const prices = extractApiPrices(response)
      if (prices.length > 0) {
        return { providerName: provider.name, prices }
      }
      errors.push(`${provider.name}: 未返回可识别油价`)
    } catch (error) {
      errors.push(`${provider.name}: ${error.message}`)
    }
  }

  throw new Error(errors.join("；"))
}

function buildApiUrl(endpoint, query) {
  const url = new URL(endpoint)
  Object.keys(query).forEach((key) => {
    url.searchParams.set(key, query[key])
  })
  return url.href
}

function requestJson(url, appCode) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "GET",
      timeout: 15000,
      headers: {
        Authorization: `APPCODE ${appCode}`,
        APPCODE: appCode
      }
    }, (res) => {
      let body = ""
      res.setEncoding("utf8")
      res.on("data", (chunk) => {
        body += chunk
      })
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }

        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(new Error(`接口返回不是 JSON：${error.message}`))
        }
      })
    })

    req.on("timeout", () => req.destroy(new Error("接口请求超时")))
    req.on("error", reject)
    req.end()
  })
}

function extractApiPrices(response) {
  const candidates = []
  walkObject(response, (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return
    const province = value.province || value.prov || value.region || value.area || value.city || value.name
    const p92 = value.p92 ?? value.type92 ?? value.oil92 ?? value.gasoline92 ?? value["92"] ?? value.gasoline92Price
    const p95 = value.p95 ?? value.type95 ?? value.oil95 ?? value.gasoline95 ?? value["95"] ?? value.gasoline95Price
    const p98 = value.p98 ?? value.type98 ?? value.oil98 ?? value.gasoline98 ?? value["98"] ?? value.gasoline98Price
    const diesel0 = value.diesel0 ?? value.type0 ?? value.oil0 ?? value.diesel ?? value["0"] ?? value.dieselPrice
    if (province && [p92, p95, p98, diesel0].some((item) => Number.isFinite(Number(item)))) {
      candidates.push(value)
    }
  })
  return candidates
}

function extractApiErrorMessage(response) {
  const topCode = response && (response.status ?? response.code ?? response.error_code ?? response.errCode)
  const respCode = response && response.resp && response.resp.RespCode
  const code = respCode ?? topCode
  const message = response && (
    response.msg ||
    response.message ||
    response.reason ||
    response.error ||
    response.errMsg ||
    (response.resp && response.resp.RespMsg)
  )

  if (code === undefined || code === null || code === "" || Number(code) === 0 || Number(code) === 1 || Number(code) === 200) {
    return ""
  }

  return message ? `接口返回错误 ${code}: ${message}` : `接口返回错误 ${code}`
}

function walkObject(value, visitor) {
  if (!value || typeof value !== "object") return
  visitor(value)
  if (Array.isArray(value)) {
    value.forEach((item) => walkObject(item, visitor))
    return
  }
  Object.values(value).forEach((item) => walkObject(item, visitor))
}

function applyApiPriceUpdates(provincePrices, apiPrices) {
  const normalized = new Map()
  apiPrices.forEach((item) => {
    const province = normalizeProvinceName(item.province || item.prov || item.region || item.area || item.city || item.name)
    if (!province) return
    normalized.set(province, {
      province,
      p92: toNumberOrNull(item.p92 ?? item.type92 ?? item.oil92 ?? item.gasoline92 ?? item["92"] ?? item.gasoline92Price),
      p95: toNumberOrNull(item.p95 ?? item.type95 ?? item.oil95 ?? item.gasoline95 ?? item["95"] ?? item.gasoline95Price),
      p98: toNumberOrNull(item.p98 ?? item.type98 ?? item.oil98 ?? item.gasoline98 ?? item["98"] ?? item.gasoline98Price),
      diesel0: toNumberOrNull(item.diesel0 ?? item.type0 ?? item.oil0 ?? item.diesel ?? item["0"] ?? item.dieselPrice),
      updatedAt: normalizeDateText(item.updateTime || item.updatetime || item.updatedAt || item.date) || getChinaDate()
    })
  })

  return provincePrices
    .map((before) => {
      const matched = normalized.get(before.province)
      if (!matched) return null
      return {
        province: before.province,
        before,
        after: {
          ...before,
          p92: matched.p92,
          p95: matched.p95,
          p98: matched.p98,
          diesel0: matched.diesel0,
          updatedAt: matched.updatedAt
        }
      }
    })
    .filter(Boolean)
}

function mergeProvincePrices(provincePrices, updates) {
  const updateMap = new Map(updates.map((item) => [item.province, item.after]))
  return provincePrices.map((item) => updateMap.get(item.province) || item)
}

function mergeSnapshots(priceSnapshots, updates) {
  const map = new Map()
  priceSnapshots.forEach((item) => {
    map.set(`${item.province}_${item.date}`, item)
  })

  updates.forEach(({ province, after }) => {
    if (![after.p92, after.p95, after.p98, after.diesel0].every(Number.isFinite)) return
    map.set(`${province}_${after.updatedAt}`, {
      province,
      date: after.updatedAt,
      p92: after.p92,
      p95: after.p95,
      p98: after.p98,
      diesel0: after.diesel0
    })
  })

  return Array.from(map.values())
    .sort((a, b) => `${a.province}_${a.date}`.localeCompare(`${b.province}_${b.date}`))
}

function getNewestUpdateDate(updates) {
  return updates
    .map((item) => item.after.updatedAt)
    .map(normalizeDateText)
    .filter(isValidDateText)
    .sort()
    .pop()
}

function normalizeProvinceName(value) {
  const text = String(value || "").trim()
  if (!text) return ""
  const map = {
    "北京市": "北京",
    "天津市": "天津",
    "河北省": "河北",
    "山西省": "山西",
    "内蒙古自治区": "内蒙古",
    "辽宁省": "辽宁",
    "吉林省": "吉林",
    "黑龙江省": "黑龙江",
    "上海市": "上海",
    "江苏省": "江苏",
    "浙江省": "浙江",
    "安徽省": "安徽",
    "福建省": "福建",
    "江西省": "江西",
    "山东省": "山东",
    "河南省": "河南",
    "湖北省": "湖北",
    "湖南省": "湖南",
    "广东省": "广东",
    "广西壮族自治区": "广西",
    "海南省": "海南",
    "重庆市": "重庆",
    "四川省": "四川",
    "贵州省": "贵州",
    "云南省": "云南",
    "西藏自治区": "西藏",
    "陕西省": "陕西",
    "甘肃省": "甘肃",
    "青海省": "青海",
    "宁夏回族自治区": "宁夏",
    "新疆维吾尔自治区": "新疆"
  }
  return map[text] || text.replace(/(省|市|自治区|壮族自治区|回族自治区|维吾尔自治区)$/, "")
}

function toNumberOrNull(value) {
  const num = Number(value)
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null
}

function getCurrentNextWindow(source) {
  const match = source.match(/const nextDate = remoteWindow \? remoteWindow\.date : "(20\d{2}-\d{2}-\d{2})"/)
  return match ? match[1] : getChinaDate()
}

function getChinaDate() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function addWorkingDays(dateText, days) {
  const normalized = normalizeDateText(dateText) || getChinaDate()
  const date = new Date(`${normalized}T00:00:00+08:00`)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    if (!isWeekend(date)) {
      left -= 1
    }
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function normalizeDateText(value) {
  const match = String(value || "").match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (!match) return ""
  return `${match[1]}-${pad(match[2])}-${pad(match[3])}`
}

function isValidDateText(value) {
  return /^20\d{2}-\d{2}-\d{2}$/.test(String(value || ""))
}

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function pad(value) {
  return String(value).padStart(2, "0")
}
