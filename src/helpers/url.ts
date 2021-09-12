import { encode, isDate, isObject } from "./utils"

export function buildURL(url: string, params?: any): string {
  if (!params) return url

  // 处理params
  const parts: string[] = []
  Object.entries(params).forEach(([key, val]) => {
    if (val === null || typeof val === 'undefined') {
      return
    }
    
    let values = []
    if (Array.isArray(val)) {
      key += '[]'
      values = val
    } else {
      values = [val]
    }

    values.forEach(v => {
      if (isDate(v)) {
        v = v.toISOString()
      } else if (isObject(v)) {
        v = JSON.stringify(v)
      }
      parts.push(`${encode(key)}=${encode(v)}`)
    })
  })

  const serializedParams = parts.join('&')
  if (serializedParams) {
    const hashIndex = url.indexOf('#')
    if (hashIndex !== -1) {
      url = url.slice(0, hashIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}