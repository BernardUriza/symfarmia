'use client';
import { useState, useEffect } from 'react';

interface Props {
  endpoint: string;
  fields: string[];
  title: string;
}

export default function ModelManager({ endpoint, fields, title }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchItems = async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveItem = async () => {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: editingId || undefined })
    });
    setForm({});
    setEditingId(null);
    fetchItems();
  };

  const editItem = (item: any) => {
    const f: Record<string, any> = {};
    fields.forEach(fld => { f[fld] = item[fld] ?? ''; });
    setForm(f);
    setEditingId(item.id);
  };

  const deleteItem = async (id: number) => {
    await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div className="p-4 border rounded mb-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="flex flex-col gap-2 mb-4">
        {fields.map(f => (
          <input
            key={f}
            name={f}
            placeholder={f}
            className="border p-1"
            value={form[f] || ''}
            onChange={handleChange}
          />
        ))}
        <button className="bg-blue-500 text-white px-2 py-1" onClick={saveItem}>
          {editingId ? 'Update' : 'Create'}
        </button>
      </div>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex gap-2 items-center">
            <span className="flex-1">
              {fields.map(f => item[f]).join(' - ')}
            </span>
            <button className="text-sm text-blue-600" onClick={() => editItem(item)}>Edit</button>
            <button className="text-sm text-red-600" onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
