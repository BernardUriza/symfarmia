'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../app/providers/I18nProvider';

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
  const { t } = useTranslation();

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
    <div className="p-4 border rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <form onSubmit={(e) => { e.preventDefault(); saveItem(); }} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldDefs.map(fd => (
            <div key={fd.name}>
              <label htmlFor={fd.name} className="block text-sm font-medium text-gray-700 mb-2">
                {t(fd.name)}
              </label>
              {fd.type === 'select' ? (
                <select
                  id={fd.name}
                  name={fd.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={String(form[fd.name] ?? '')}
                  onChange={handleChange}
                >
                  {(fd.options || []).map(opt => (
                    <option key={opt} value={opt}>
                      {t(opt)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={fd.name}
                  type={fd.type === 'date' ? 'date' : fd.type === 'number' ? 'number' : fd.type === 'checkbox' ? 'checkbox' : 'text'}
                  name={fd.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={fd.type === 'checkbox' ? undefined : String(form[fd.name] ?? '')}
                  checked={fd.type === 'checkbox' ? Boolean(form[fd.name]) : undefined}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="min-h-[44px] bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {editingId ? t('update') : t('create')}
        </button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {fieldDefs.map(fd => (
                <th
                  key={fd.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t(fd.name)}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                {fieldDefs.map(fd => (
                  <td key={fd.name} className="px-6 py-4 whitespace-nowrap">
                    {String(item[fd.name] ?? '')}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => editItem(item)}
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => deleteItem(item.id)}
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
