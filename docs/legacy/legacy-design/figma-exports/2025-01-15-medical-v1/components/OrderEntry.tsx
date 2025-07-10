import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ChevronLeft, ChevronRight, Plus, Trash2, Pill, TestTube, UserPlus, Sparkles } from 'lucide-react';

interface OrderEntryProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Order {
  id: string;
  type: 'medication' | 'lab' | 'referral';
  description: string;
  details: string;
  priority: 'routine' | 'urgent' | 'stat';
  selected: boolean;
}

export function OrderEntry({ onNext, onPrevious }: OrderEntryProps) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      type: 'medication',
      description: 'Ibuprofeno 400mg',
      details: 'Tomar 1 tableta cada 6 horas según necesidad para dolor de cabeza. Máximo 3 tabletas por día.',
      priority: 'routine',
      selected: true
    },
    {
      id: '2',
      type: 'medication',
      description: 'Sumatriptán 50mg',
      details: 'Tomar 1 tableta al inicio de la migraña. Puede repetir en 2 horas si es necesario.',
      priority: 'routine',
      selected: false
    },
    {
      id: '3',
      type: 'lab',
      description: 'Hemograma Completo',
      details: 'Para descartar causas subyacentes si las cefaleas persisten',
      priority: 'routine',
      selected: false
    },
    {
      id: '4',
      type: 'referral',
      description: 'Consulta Neurología',
      details: 'Si las cefaleas persisten a pesar del tratamiento o se desarrollan síntomas de alarma',
      priority: 'routine',
      selected: false
    }
  ]);

  const [newOrder, setNewOrder] = useState({
    type: 'medication',
    description: '',
    details: '',
    priority: 'routine'
  });

  const toggleOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, selected: !order.selected } : order
    ));
  };

  const addCustomOrder = () => {
    if (newOrder.description) {
      const order: Order = {
        id: Date.now().toString(),
        type: newOrder.type as 'medication' | 'lab' | 'referral',
        description: newOrder.description,
        details: newOrder.details,
        priority: newOrder.priority as 'routine' | 'urgent' | 'stat',
        selected: true
      };
      setOrders([...orders, order]);
      setNewOrder({ type: 'medication', description: '', details: '', priority: 'routine' });
    }
  };

  const removeOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'lab': return <TestTube className="h-4 w-4" />;
      case 'referral': return <UserPlus className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getOrderColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'lab': return 'bg-green-50 border-green-200 text-green-700';
      case 'referral': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medication': return 'Medicamento';
      case 'lab': return 'Laboratorio';
      case 'referral': return 'Referencia';
      default: return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'routine': return 'rutina';
      case 'urgent': return 'urgente';
      case 'stat': return 'STAT';
      default: return priority;
    }
  };

  const selectedOrders = orders.filter(order => order.selected);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">Asistente de Órdenes Médicas</h1>
        <p className="text-slate-600">Órdenes sugeridas por IA basadas en su evaluación clínica</p>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">{selectedOrders.length}</div>
            <div className="text-sm text-slate-500">Órdenes Seleccionadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">{orders.filter(o => o.type === 'medication').length}</div>
            <div className="text-sm text-slate-500">Medicamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">{orders.filter(o => o.type === 'lab').length}</div>
            <div className="text-sm text-slate-500">Estudios Lab</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">{orders.filter(o => o.type === 'referral').length}</div>
            <div className="text-sm text-slate-500">Referencias</div>
          </CardContent>
        </Card>
      </div>

      {/* Órdenes Sugeridas por IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Órdenes Sugeridas por IA
            <Badge variant="outline" className="ml-auto">
              Basado en Notas Clínicas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  order.selected 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={order.selected}
                    onCheckedChange={() => toggleOrder(order.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getOrderColor(order.type)}>
                        {getOrderIcon(order.type)}
                        <span className="ml-1">{getTypeLabel(order.type)}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getPriorityLabel(order.priority)}
                      </Badge>
                    </div>
                    <h4 className="text-slate-900 mb-1">{order.description}</h4>
                    <p className="text-sm text-slate-600">{order.details}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrder(order.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agregar Orden Personalizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Orden Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Tipo de Orden</label>
              <Select
                value={newOrder.type}
                onValueChange={(value) => setNewOrder({...newOrder, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medicamento</SelectItem>
                  <SelectItem value="lab">Laboratorio</SelectItem>
                  <SelectItem value="referral">Referencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Prioridad</label>
              <Select
                value={newOrder.priority}
                onValueChange={(value) => setNewOrder({...newOrder, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Rutina</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Descripción</label>
              <Input
                value={newOrder.description}
                onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                placeholder="Ingrese descripción de la orden"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Detalles</label>
              <Textarea
                value={newOrder.details}
                onChange={(e) => setNewOrder({...newOrder, details: e.target.value})}
                placeholder="Instrucciones adicionales o detalles"
                className="h-20"
              />
            </div>
          </div>
          <Button onClick={addCustomOrder} className="mt-4" disabled={!newOrder.description}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Orden
          </Button>
        </CardContent>
      </Card>

      {/* Resumen de Órdenes Seleccionadas */}
      {selectedOrders.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Resumen de Órdenes Seleccionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-2 text-sm text-green-800">
                  {getOrderIcon(order.type)}
                  <span>{order.description}</span>
                  <Badge variant="outline" className="text-xs">
                    {getPriorityLabel(order.priority)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Volver a Notas Clínicas
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Generar Resumen
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}