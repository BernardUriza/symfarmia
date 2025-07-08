import React, { useState } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ChevronLeft, ChevronRight, Pill, Calendar, AlertCircle, Check } from 'lucide-react';

const suggestedOrders = [
  {
    category: 'Medicamentos',
    items: [
      { name: 'Ibuprofeno 400mg', dosage: 'Cada 6 horas según necesidad', duration: '5 días', priority: 'high' },
      { name: 'Paracetamol 500mg', dosage: 'Cada 8 horas según necesidad', duration: '3 días', priority: 'medium' },
      { name: 'Sumatriptán 50mg', dosage: 'Una dosis al inicio del dolor', duration: 'PRN', priority: 'low' }
    ]
  },
  {
    category: 'Exámenes de Laboratorio',
    items: [
      { name: 'Hemograma completo', reason: 'Descartar proceso infeccioso', priority: 'medium' },
      { name: 'PCR y VSG', reason: 'Marcadores inflamatorios', priority: 'low' }
    ]
  },
  {
    category: 'Estudios de Imagen',
    items: [
      { name: 'TAC de cráneo simple', reason: 'Descartar patología intracraneal', priority: 'high' },
      { name: 'Resonancia magnética cerebral', reason: 'Si persisten síntomas', priority: 'low' }
    ]
  },
  {
    category: 'Interconsultas',
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
        <h1 className="text-2xl text-slate-900 mb-2">Órdenes y Prescripciones</h1>
        <p className="text-slate-600">Seleccione las órdenes médicas recomendadas por la IA</p>
      </div>

      {/* Resumen de Órdenes Seleccionadas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Órdenes Seleccionadas ({selectedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOrders.length === 0 ? (
            <p className="text-blue-600 text-sm">No hay órdenes seleccionadas</p>
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
                              <strong>Dosis:</strong> {item.dosage}
                            </p>
                          )}
                          {item.duration && (
                            <p className="text-sm text-slate-600">
                              <strong>Duración:</strong> {item.duration}
                            </p>
                          )}
                          {item.reason && (
                            <p className="text-sm text-slate-600">
                              <strong>Indicación:</strong> {item.reason}
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
            Orden Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customOrder}
            onChange={(e) => setCustomOrder(e.target.value)}
            placeholder="Escriba aquí cualquier orden adicional o instrucciones especiales..."
            className="min-h-24"
          />
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver a Notas
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Generar Resumen
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}