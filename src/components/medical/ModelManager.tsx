'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../providers/I18nProvider';

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
    let data: ModelItem[] = [];
    if (res.ok) {
      try {
        data = await res.json();
      } catch (error) {
        console.warn(`Failed to parse JSON from ${endpoint}`, error);
      }
    } else {
      console.error(`Failed to fetch items: ${res.status} ${res.statusText}`);
    }
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
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 bg-white dark:bg-slate-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
      <form onSubmit={(e) => { e.preventDefault(); saveItem(); }} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldDefs.map(fd => (
            <div key={fd.name}>
              <label htmlFor={fd.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t(fd.name)}
              </label>
              {fd.type === 'select' ? (
                <select
                  id={fd.name}
                  name={fd.name}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
          className="min-h-[44px] bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {editingId ? t('update') : t('create')}
        </button>
      </form>

      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              {fieldDefs.map(fd => (
                <th
                  key={fd.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {t(fd.name)}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                {fieldDefs.map(fd => (
                  <td key={fd.name} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {String(item[fd.name] ?? '')}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => editItem(item)}
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
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
