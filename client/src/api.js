// Small fetch wrapper: adds the JWT token and turns error responses into exceptions
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const CATEGORIES = ['Starters', 'Main Course', 'Biryani', 'Desserts', 'Beverages']
export const CATEGORY_ICONS = { Starters: '🥟', 'Main Course': '🍛', Biryani: '🍚', Desserts: '🍮', Beverages: '🥤' }
export const ORDER_STEPS = ['Placed', 'Preparing', 'Out for delivery', 'Delivered']
export const STATUS_COLORS = { Placed: 'secondary', Preparing: 'warning', 'Out for delivery': 'info', Delivered: 'success', Cancelled: 'danger' }

export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`

// '2026-10-24 18:05:00' -> '24 Oct, 6:05 pm'
export const formatDateTime = (value) =>
  new Date(value.replace(' ', 'T')).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
