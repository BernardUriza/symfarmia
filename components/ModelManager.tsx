'use client';
import { useState, useEffect, useCallback } from 'react';

export interface FieldDef {
  name: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  options?: string[];
}

interface Props {
  endpoint: string;
  fields: Array<FieldDef | string>;
  title: string;
}

interface ModelItem {
  id: number;
  [key: string]: string | number;
}

export default function ModelManager({ endpoint, fields, title }: Props) {
  const [items, setItems] = useState<ModelItem[]>([]);
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const fieldDefs: FieldDef[] = fields.map(f =>
    typeof f === 'string' ? { name: f, type: 'text' } : f
  );

  const fetchItems = useCallback(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    setItems(data);
  }, [endpoint]);

  useEffect(() => { 
    fetchItems(); 
  }, [fetchItems]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value } = target;
    const val = type === 'checkbox' ? target.checked : value;
    setForm({ ...form, [name]: val });
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

  const editItem = (item: ModelItem) => {
    const f: Record<string, string | number | boolean> = {};
    fieldDefs.forEach(fd => {
      const value = item[fd.name];
      f[fd.name] = value;
    });
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
        {fieldDefs.map(fd => (
          <div key={fd.name} className="flex flex-col">
            {fd.type === 'select' ? (
              <select
                name={fd.name}
                className="border p-1"
                value={form[fd.name] ?? ''}
                onChange={handleChange}
              >
                {(fd.options || []).map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={fd.type === 'date' ? 'date' : fd.type === 'number' ? 'number' : fd.type === 'checkbox' ? 'checkbox' : 'text'}
                name={fd.name}
                className="border p-1"
                value={fd.type === 'checkbox' ? undefined : form[fd.name] ?? ''}
                checked={fd.type === 'checkbox' ? Boolean(form[fd.name]) : undefined}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <button className="bg-blue-500 text-white px-2 py-1" onClick={saveItem}>
          {editingId ? 'Update' : 'Create'}
        </button>
      </div>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id} className="flex gap-2 items-center">
            <span className="flex-1">
              {fieldDefs.map(f => item[f.name]).join(' - ')}
            </span>
            <button className="text-sm text-blue-600" onClick={() => editItem(item)}>
              Edit
            </button>
            <button className="text-sm text-red-600" onClick={() => deleteItem(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
