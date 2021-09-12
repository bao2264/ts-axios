import { createError } from "./helpers/error";
import { parseHeaders } from "./helpers/headers";
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "./types";

export default function xhr(config: AxiosRequestConfig): AxiosPromise {

  return new Promise((resolve, reject) => {
    const { 
      url, 
      method = 'get', 
      data = null, 
      headers,
      responseType,
      timeout,
    } = config
  
    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }
  
    request.open(method.toUpperCase(), url, true)

    request.onreadystatechange = function() {
      if (request.readyState !== 4) {
        return
      }

      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData = responseType !== 'text' ? request.response : request.responseText

      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }

      handleResponse(response)
    }

    request.onerror = function() {
      reject(createError(
        'Network Error',
        config,
        null,
        request
      ))
    }

    request.ontimeout = function() {
      reject(createError(
        `Timeout of ${timeout} ms exceeded`,
        config,
        'ECONNABORTED',
        request
      ))
    }
  
    Object.entries<string>(headers).forEach(([name, val]) => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, val)
      }
    })
  
    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(createError(
          `Request failed with status code ${response.status}`,
          config,
          null,
          request,
          response
        ))
      }
    }

  })
  
}