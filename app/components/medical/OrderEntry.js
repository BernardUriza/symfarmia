import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ChevronLeft, ChevronRight, Pill, Calendar, AlertCircle, Check } from 'lucide-react';

const baseOrders = [
  {
    key: 'category_medications',
    items: [
      { name: 'Ibuprofeno 400mg', dosage: 'Cada 6 horas según necesidad', duration: '5 días', priority: 'high' },
      { name: 'Paracetamol 500mg', dosage: 'Cada 8 horas según necesidad', duration: '3 días', priority: 'medium' },
      { name: 'Sumatriptán 50mg', dosage: 'Una dosis al inicio del dolor', duration: 'PRN', priority: 'low' }
    ]
  },
  {
    key: 'category_labs',
    items: [
      { name: 'Hemograma completo', reason: 'Descartar proceso infeccioso', priority: 'medium' },
      { name: 'PCR y VSG', reason: 'Marcadores inflamatorios', priority: 'low' }
    ]
  },
  {
    key: 'category_imaging',
    items: [
      { name: 'TAC de cráneo simple', reason: 'Descartar patología intracraneal', priority: 'high' },
      { name: 'Resonancia magnética cerebral', reason: 'Si persisten síntomas', priority: 'low' }
    ]
  },
  {
    key: 'category_consults',
    items: [
      { name: 'Neurología', reason: 'Evaluación especializada de cefalea', priority: 'medium' },
      { name: 'Oftalmología', reason: 'Si hay síntomas visuales', priority: 'low' }
    ]
  }
];

export function OrderEntry({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [customOrder, setCustomOrder] = useState('');

  const suggestedOrders = useMemo(() =>
    baseOrders.map(o => ({ ...o, category: t(`orders.${o.key}`) })), [t]);

  const toggleOrder = (categoryIndex, itemIndex) => {
    const orderId = `${categoryIndex}-${itemIndex}`;
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">{t('orders.title')}</h1>
        <p className="text-slate-600">{t('orders.description')}</p>
      </div>

      {/* Resumen de Órdenes Seleccionadas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Check className="h-5 w-5" />
            {t('orders.selected')} ({selectedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOrders.length === 0 ? (
            <p className="text-blue-600 text-sm">{t('orders.none')}</p>
          ) : (
            <div className="space-y-2">
              {selectedOrders.map((orderId, index) => {
                const [categoryIndex, itemIndex] = orderId.split('-').map(Number);
                const category = suggestedOrders[categoryIndex];
                const item = category.items[itemIndex];
                return (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-sm text-slate-500 ml-2">({category.category})</span>
                    </div>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Órdenes Sugeridas por Categoría */}
      <div className="space-y-6">
        {suggestedOrders.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const orderId = `${categoryIndex}-${itemIndex}`;
                  const isSelected = selectedOrders.includes(orderId);
                  
                  return (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleOrder(categoryIndex, itemIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{item.name}</h4>
                          {item.dosage && (
                            <p className="text-sm text-slate-600 mt-1">
                              <strong>{t('orders.dosage_label')}</strong> {item.dosage}
                            </p>
                          )}
                          {item.duration && (
                            <p className="text-sm text-slate-600">
                              <strong>{t('orders.duration_label')}</strong> {item.duration}
                            </p>
                          )}
                          {item.reason && (
                            <p className="text-sm text-slate-600">
                              <strong>{t('orders.reason_label')}</strong> {item.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orden Personalizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('orders.custom_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customOrder}
            onChange={(e) => setCustomOrder(e.target.value)}
            placeholder={t('orders.custom_placeholder')}
            className="min-h-24"
          />
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          {t('orders.back_to_notes')}
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          {t('orders.generate_summary')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );}