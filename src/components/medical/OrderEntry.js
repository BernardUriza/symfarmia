'use client';
import React, { useState } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  ChevronLeft,
  ChevronRight,
  Pill,
  AlertCircle,
  Check,
} from 'lucide-react';

const getSuggestedOrders = (t) => [
  {
    category: t('categories.medications'),
    items: [
      {
        name: t('medications.ibuprofen.name'),
        dosage: t('medications.ibuprofen.dosage'),
        duration: t('medications.ibuprofen.duration'),
        priority: 'high',
      },
      {
        name: t('medications.paracetamol.name'),
        dosage: t('medications.paracetamol.dosage'),
        duration: t('medications.paracetamol.duration'),
        priority: 'medium',
      },
      {
        name: t('medications.sumatriptan.name'),
        dosage: t('medications.sumatriptan.dosage'),
        duration: t('medications.sumatriptan.duration'),
        priority: 'low',
      },
    ],
  },
  {
    category: t('categories.lab_tests'),
    items: [
      {
        name: t('lab_tests.complete_blood_count.name'),
        reason: t('lab_tests.complete_blood_count.reason'),
        priority: 'medium',
      },
      {
        name: t('lab_tests.inflammatory_markers.name'),
        reason: t('lab_tests.inflammatory_markers.reason'),
        priority: 'low',
      },
    ],
  },
  {
    category: t('categories.imaging'),
    items: [
      {
        name: t('imaging.head_ct.name'),
        reason: t('imaging.head_ct.reason'),
        priority: 'high',
      },
      {
        name: t('imaging.brain_mri.name'),
        reason: t('imaging.brain_mri.reason'),
        priority: 'low',
      },
    ],
  },
  {
    category: t('categories.consultations'),
    items: [
      {
        name: t('consultations.neurology.name'),
        reason: t('consultations.neurology.reason'),
        priority: 'medium',
      },
      {
        name: t('consultations.ophthalmology.name'),
        reason: t('consultations.ophthalmology.reason'),
        priority: 'low',
      },
    ],
  },
];
export function OrderEntry({ onNext, onPrevious }) {
  const { t } = useTranslation();

  const [selectedOrders, setSelectedOrders] = useState([]);

  const [customOrder, setCustomOrder] = useState('');

  const suggestedOrders = getSuggestedOrders(t);

  const toggleOrder = (categoryIndex, itemIndex) => {
    const orderId = `${categoryIndex}-${itemIndex}`;
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 ';
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {' '}
      <div className="text-center mb-6">
        {' '}
        <h1 className="text-2xl text-slate-900 mb-2">
          {t('entry.title')}
        </h1>{' '}
        <p className="text-slate-600 ">{t('entry.subtitle')}</p>{' '}
      </div>{' '}
      {/* Resumen de Órdenes Seleccionadas */}{' '}
      <Card className="bg-blue-50 border-blue-200">
        {' '}
        <CardHeader>
          {' '}
          <CardTitle className="text-blue-900 flex items-center gap-2">
            {' '}
            <Check className="h-5 w-5" /> {t('entry.selected_orders')} (
            {selectedOrders.length}){' '}
          </CardTitle>{' '}
        </CardHeader>{' '}
        <CardContent>
          {' '}
          {selectedOrders.length === 0 ? (
            <p className="text-blue-600 text-sm">
              {t('entry.no_orders_selected')}
            </p>
          ) : (
            <div className="space-y-2">
              {' '}
              {selectedOrders.map((orderId, index) => {
                const [categoryIndex, itemIndex] = orderId
                  .split('-')
                  .map(Number);

                const category = suggestedOrders[categoryIndex];

                const item = category.items[itemIndex];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg"
                  >
                    {' '}
                    <div>
                      {' '}
                      <span className="font-medium text-slate-900 ">
                        {item.name}
                      </span>{' '}
                      <span className="text-sm text-slate-500 ml-2">
                        ({category.category})
                      </span>{' '}
                    </div>{' '}
                    <Badge className={getPriorityColor(item.priority)}>
                      {' '}
                      {t(`orders.priority.${item.priority}`)}{' '}
                    </Badge>{' '}
                  </div>
                );
              })}{' '}
            </div>
          )}{' '}
        </CardContent>{' '}
      </Card>{' '}
      {/* Órdenes Sugeridas por Categoría */}{' '}
      <div className="space-y-6">
        {' '}
        {suggestedOrders.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            {' '}
            <CardHeader>
              {' '}
              <CardTitle className="flex items-center gap-2">
                {' '}
                <Pill className="h-5 w-5" /> {category.category}{' '}
              </CardTitle>{' '}
            </CardHeader>{' '}
            <CardContent>
              {' '}
              <div className="space-y-3">
                {' '}
                {category.items.map((item, itemIndex) => {
                  const orderId = `${categoryIndex}-${itemIndex}`;

                  const isSelected = selectedOrders.includes(orderId);
                  return (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50 ' : 'border-slate-200 hover:border-slate-300 '}`}
                      onClick={() => toggleOrder(categoryIndex, itemIndex)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${item.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleOrder(categoryIndex, itemIndex);
                        }
                      }}
                    >
                      {' '}
                      <div className="flex items-center justify-between">
                        {' '}
                        <div className="flex-1">
                          {' '}
                          <h4 className="font-medium text-slate-900 ">
                            {item.name}
                          </h4>{' '}
                          {item.dosage && (
                            <p className="text-sm text-slate-600 mt-1">
                              {' '}
                              <strong>{t('details.dose')}:</strong>{' '}
                              {item.dosage}{' '}
                            </p>
                          )}{' '}
                          {item.duration && (
                            <p className="text-sm text-slate-600 ">
                              {' '}
                              <strong>{t('details.duration')}:</strong>{' '}
                              {item.duration}{' '}
                            </p>
                          )}{' '}
                          {item.reason && (
                            <p className="text-sm text-slate-600 ">
                              {' '}
                              <strong>{t('details.indication')}:</strong>{' '}
                              {item.reason}{' '}
                            </p>
                          )}{' '}
                        </div>{' '}
                        <div className="flex items-center gap-2">
                          {' '}
                          <Badge className={getPriorityColor(item.priority)}>
                            {' '}
                            {t(`orders.priority.${item.priority}`)}{' '}
                          </Badge>{' '}
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>
                  );
                })}{' '}
              </div>{' '}
            </CardContent>{' '}
          </Card>
        ))}{' '}
      </div>{' '}
      {/* Orden Personalizada */}{' '}
      <Card>
        {' '}
        <CardHeader>
          {' '}
          <CardTitle className="flex items-center gap-2">
            {' '}
            <AlertCircle className="h-5 w-5" /> {t('entry.custom_order')}{' '}
          </CardTitle>{' '}
        </CardHeader>{' '}
        <CardContent>
          {' '}
          <Textarea
            value={customOrder}
            onChange={(e) => setCustomOrder(e.target.value)}
            placeholder={t('entry.custom_order_placeholder')}
            className="min-h-24"
          />{' '}
        </CardContent>{' '}
      </Card>{' '}
      {/* Navegación */}{' '}
      <div className="flex justify-between items-center pt-4">
        {' '}
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
          aria-label={t('entry.back_to_notes')}
        >
          {' '}
          <ChevronLeft className="h-4 w-4" /> {t('entry.back_to_notes')}{' '}
        </Button>{' '}
        <Button
          onClick={onNext}
          className="flex items-center gap-2"
          aria-label={t('entry.generate_summary')}
        >
          {' '}
          {t('entry.generate_summary')}{' '}
          <ChevronRight className="h-4 w-4" />{' '}
        </Button>{' '}
      </div>{' '}
    </div>
  );
}
