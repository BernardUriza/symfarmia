"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  User, 
  Calendar,
  Phone,
  Mail,
  X
} from 'lucide-react';

// Mock patient data - replace with actual API call
const mockPatients = [
    {
      id: 'P001',
      name: 'María González',
      age: 35,
      phone: '555-0123',
      email: 'maria.gonzalez@email.com',
      urgency: 'high',
      status: 'active',
      lastVisit: '2024-01-10',
      condition: 'Hipertensión',
      nextAppointment: '2024-01-15'
    },
    {
      id: 'P002',
      name: 'Carlos Rodríguez',
      age: 42,
      phone: '555-0456',
      email: 'carlos.rodriguez@email.com',
      urgency: 'medium',
      status: 'active',
      lastVisit: '2024-01-08',
      condition: 'Diabetes Tipo 2',
      nextAppointment: null
    },
    {
      id: 'P003',
      name: 'Ana Martínez',
      age: 28,
      phone: '555-0789',
      email: 'ana.martinez@email.com',
      urgency: 'low',
      status: 'pending',
      lastVisit: '2024-01-05',
      condition: 'Control Rutinario',
      nextAppointment: '2024-01-20'
    },
    {
      id: 'P004',
      name: 'José López',
      age: 65,
      phone: '555-0321',
      email: 'jose.lopez@email.com',
      urgency: 'high',
      status: 'critical',
      lastVisit: '2024-01-12',
      condition: 'Cardiopatía',
      nextAppointment: 'Urgente'
    },
    {
      id: 'P005',
      name: 'Laura Sánchez',
      age: 31,
      phone: '555-0654',
      email: 'laura.sanchez@email.com',
      urgency: 'medium',
      status: 'active',
      lastVisit: '2024-01-09',
      condition: 'Embarazo',
      nextAppointment: '2024-01-16'
    }
];

const urgencyLabels = {
  all: 'Todas las Urgencias',
  high: 'Alta Prioridad',
  medium: 'Prioridad Media',
  low: 'Baja Prioridad'
};

const statusLabels = {
  all: 'Todos los Estados',
  active: 'Activo',
  pending: 'Pendiente',
  critical: 'Crítico'
};

const lastVisitLabels = {
  all: 'Cualquier Fecha',
  today: 'Hoy',
  week: 'Esta Semana',
  month: 'Este Mes'
};

const PatientQuickSearch = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    urgency: 'all',
    status: 'all',
    lastVisit: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const performSearch = (term) => {
      let filtered = mockPatients.filter(patient => 
        patient.name.toLowerCase().includes(term.toLowerCase()) ||
        patient.id.toLowerCase().includes(term.toLowerCase()) ||
        patient.phone.includes(term) ||
        patient.condition.toLowerCase().includes(term.toLowerCase())
      );

      // Apply filters
      if (selectedFilters.urgency !== 'all') {
        filtered = filtered.filter(patient => patient.urgency === selectedFilters.urgency);
      }
      if (selectedFilters.status !== 'all') {
        filtered = filtered.filter(patient => patient.status === selectedFilters.status);
      }
      if (selectedFilters.lastVisit !== 'all') {
        const today = new Date();
        filtered = filtered.filter(patient => {
          const visitDate = new Date(patient.lastVisit);
          const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));
          
          switch (selectedFilters.lastVisit) {
            case 'today':
              return daysDiff === 0;
            case 'week':
              return daysDiff <= 7;
            case 'month':
              return daysDiff <= 30;
            default:
              return true;
          }
        });
      }

      setSearchResults(filtered);
      setShowResults(filtered.length > 0);
    };

    if (searchTerm.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        performSearch(searchTerm);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, selectedFilters]);


  const handlePatientSelect = (patient) => {
    // Prevent double-clicks
    if (searchResults.length === 0) return;
    
    // Clear results immediately to prevent re-selection
    setSearchResults([]);
    setShowResults(false);
    
    // Call parent handler
    onPatientSelect(patient);
    setSearchTerm(patient.name);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const PatientCard = ({ patient }) => (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => handlePatientSelect(patient)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{patient.name}</h4>
            <p className="text-sm text-gray-500">
              {patient.age} años • ID: {patient.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(patient.urgency)}`}>
            {urgencyLabels[patient.urgency]}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(patient.status)}`}>
            {statusLabels[patient.status]}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Última visita: {new Date(patient.lastVisit).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{patient.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <AlertTriangle className="h-4 w-4" />
          <span>{patient.condition}</span>
        </div>
      </div>
      
      {patient.nextAppointment && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Calendar className="h-4 w-4" />
            <span>
              Próxima cita: {patient.nextAppointment === 'Urgente' ? 'Urgente' : new Date(patient.nextAppointment).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, ID, teléfono o condición..."
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded ${showFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Buscando...</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Filtros de Búsqueda</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgencia
              </label>
              <select
                value={selectedFilters.urgency}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
              >
                {Object.entries(urgencyLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Última Visita
              </label>
              <select
                value={selectedFilters.lastVisit}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, lastVisit: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
              >
                {Object.entries(lastVisitLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="mt-4 max-h-96 overflow-y-auto">
          <div className="mb-2 text-sm text-gray-600">
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
          </div>
          
          <div className="space-y-3">
            {searchResults.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && !isSearching && searchResults.length === 0 && (
        <div className="mt-4 p-4 text-center text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No se encontraron pacientes con "{searchTerm}"</p>
          <p className="text-sm mt-1">Intenta ajustar los filtros o crear un nuevo paciente</p>
        </div>
      )}
    </div>
  );
};

export default PatientQuickSearch;