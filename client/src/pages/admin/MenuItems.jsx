import { useEffect, useState } from 'react'
import { api, CATEGORIES, rupees } from '../../api'
import { VegMark } from '../../components/FoodCard'

const emptyForm = { name: '', description: '', category: 'Starters', price: '', is_veg: true, is_available: true }

// Restaurant staff add, modify and remove food items
function MenuItems() {
  const [foods, setFoods] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = () => api('/foods?all=true').then(setFoods).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const startEdit = (f) => {
    setEditingId(f.id)
    setForm({ ...f, description: f.description || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = editingId
        ? await api(`/foods/${editingId}`, { method: 'PUT', body: form })
        : await api('/foods', { method: 'POST', body: form })
      setMessage({ text: res.message, type: 'success' })
      reset()
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  const toggleAvailable = async (f) => {
    await api(`/foods/${f.id}`, { method: 'PUT', body: { ...f, is_available: !f.is_available } })
    load()
  }

  const handleDelete = async (f) => {
    if (!window.confirm(`Remove "${f.name}" from the menu?`)) return
    try {
      const res = await api(`/foods/${f.id}`, { method: 'DELETE' })
      setMessage({ text: res.message, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h2 className="mb-3">Menu Items</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="card mb-4">
        <div className="card-body">
          <h5>{editingId ? 'Edit item' : 'Add new item'}</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="name">Name</label>
              <input id="name" name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="category">Category</label>
              <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label" htmlFor="price">Price (₹)</label>
              <input id="price" name="price" type="number" min="1" step="0.5" className="form-control" value={form.price} onChange={handleChange} required />
            </div>
            <div className="col-md-3 d-flex align-items-end gap-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="is_veg" name="is_veg" checked={form.is_veg} onChange={handleChange} />
                <label className="form-check-label" htmlFor="is_veg">Veg</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="is_available" name="is_available" checked={form.is_available} onChange={handleChange} />
                <label className="form-check-label" htmlFor="is_available">Available</label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="description">Description</label>
              <input id="description" name="description" className="form-control" value={form.description} onChange={handleChange} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-danger">{editingId ? 'Save changes' : 'Add item'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
          </div>
        </div>
      </form>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Item</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className={f.is_available ? '' : 'text-muted'}>
                  <td><VegMark veg={f.is_veg} /> {f.name}</td>
                  <td>{f.category}</td>
                  <td>{rupees(f.price)}</td>
                  <td>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={f.is_available} onChange={() => toggleAvailable(f)} aria-label={`${f.name} available`} />
                    </div>
                  </td>
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(f)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(f)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default MenuItems
