// Paperless-NGX API
const PAPERLESS_TOKEN = import.meta.env.VITE_PAPERLESS_TOKEN

// Simple memory cache
const cache = new Map<string, { data: any, timestamp: number }>()

// Clear cache helper for mutations
function invalidateCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

async function fetchWithCache(url: string, options: RequestInit, cacheDurationMs: number) {
  const cacheKey = url
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cacheDurationMs) {
    return cached.data
  }
  
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`)
  }
  
  const data = await response.json()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

export async function fetchDocuments(query = '') {
  let url = '/api/documents/'
  if (query) {
    url += `?query=${encodeURIComponent(query)}`
  }

  // 15 seconds cache for documents, enough to make navigation feel instant 
  // but short enough to show new uploads quickly
  return fetchWithCache(url, {
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`,
      'Accept': 'application/json'
    }
  }, 15000)
}

export async function fetchTags() {
  return fetchWithCache('/api/tags/', {
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`,
      'Accept': 'application/json'
    }
  }, 5 * 60 * 1000) // 5 mins
}

export async function uploadDocument(file: File, title: string) {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('title', title)

  const response = await fetch('/api/documents/post_document/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`,
      'Accept': 'application/json'
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to upload document')
  }

  invalidateCachePrefix('/api/documents/')

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function updateDocumentTitle(id: number, title: string) {
  const response = await fetch(`/api/documents/${id}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  })

  if (!response.ok) {
    throw new Error('Failed to update document')
  }
  
  invalidateCachePrefix('/api/documents/')
  
  return response.json()
}

export async function getDocumentPreviewUrl(id: number): Promise<string> {
  const response = await fetch(`/api/documents/${id}/preview/`, {
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to load preview')
  }
  
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function deleteDocument(id: number) {
  const response = await fetch(`/api/documents/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${PAPERLESS_TOKEN}`
    }
  })

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete document')
  }
  
  invalidateCachePrefix('/api/documents/')
}

// ERP API (Brand_HR_Service)
// Proxied: /erp/* -> http://192.168.251.207:8090/api/* 

// ERP data rarely changes during a session, cache for 5 minutes
const ERP_CACHE_MS = 5 * 60 * 1000

export async function fetchCompanies() {
  return fetchWithCache('/erp/Companies', {
    headers: { 'Accept': 'application/json' }
  }, ERP_CACHE_MS)
}

export async function fetchDepartments(companyCode: string) {
  return fetchWithCache(`/erp/Departments?company=${encodeURIComponent(companyCode)}`, {
    headers: { 'Accept': 'application/json' }
  }, ERP_CACHE_MS)
}

export async function fetchDepartmentWorkers(department: string) {
  return fetchWithCache(`/erp/DepartmentWorkers?department=${encodeURIComponent(department)}`, {
    headers: { 'Accept': 'application/json' }
  }, ERP_CACHE_MS)
}

export async function fetchCompanyWorkers(companyCode: string) {
  return fetchWithCache(`/erp/CompanyWorkers?company=${encodeURIComponent(companyCode)}`, {
    headers: { 'Accept': 'application/json' }
  }, ERP_CACHE_MS)
}
