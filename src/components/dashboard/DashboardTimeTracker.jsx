'use client';
import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  StopCircle,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  Target,
} from 'lucide-react';
function DashboardTimeTracker() {
  const [currentSession, setCurrentSession] = useState({
    isActive: false,
    startTime: null,
    patientId: null,
    consultationType: null,
    elapsedTime: 0,
  });

  const [todayMetrics, setTodayMetrics] = useState({
    totalConsultations: 0,
    averageTime: 0,
    shortestTime: 0,
    longestTime: 0,
    totalTime: 0,
    efficiency: 0,
  });

  const [weeklyData, setWeeklyData] = useState([]);

  const [doctorStats, setDoctorStats] = useState([]);
  useEffect(() => {
    let interval;
    if (currentSession.isActive && currentSession.startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - currentSession.startTime;
        setCurrentSession((prev) => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession.isActive, currentSession.startTime]);
  useEffect(() => {
    fetchMetrics();
    fetchWeeklyData();
    fetchDoctorStats();
  }, []);

  const fetchMetrics = async () => {
    // Mock data - replace with actual API call

    const mockMetrics = {
      totalConsultations: 12,
      averageTime: 14.5,
      shortestTime: 8,
      longestTime: 28,
      totalTime: 174,
      efficiency: 87,
    };
    setTodayMetrics(mockMetrics);
  };
  const fetchWeeklyData = async () => {
    // Mock weekly data - replace with actual API call

    const mockWeeklyData = [
      { day: 'Lun', avgTime: 12.5, consultations: 15 },
      { day: 'Mar', avgTime: 14.2, consultations: 18 },
      { day: 'Mié', avgTime: 13.8, consultations: 16 },
      { day: 'Jue', avgTime: 15.1, consultations: 14 },
      { day: 'Vie', avgTime: 14.5, consultations: 12 },
      { day: 'Sáb', avgTime: 16.2, consultations: 8 },
      { day: 'Dom', avgTime: 13.5, consultations: 6 },
    ];
    setWeeklyData(mockWeeklyData);
  };
  const fetchDoctorStats = async () => {
    // Mock doctor stats - replace with actual API call

    const mockDoctorStats = [
      { name: 'Dr. García', avgTime: 12.3, consultations: 18, efficiency: 92 },
      { name: 'Dra. López', avgTime: 15.7, consultations: 15, efficiency: 85 },
      {
        name: 'Dr. Martínez',
        avgTime: 11.8,
        consultations: 20,
        efficiency: 95,
      },
      {
        name: 'Dra. Rodríguez',
        avgTime: 14.2,
        consultations: 12,
        efficiency: 88,
      },
    ];
    setDoctorStats(mockDoctorStats);
  };
  const startSession = (patientId, consultationType) => {
    setCurrentSession({
      isActive: true,
      startTime: Date.now(),
      patientId,
      consultationType,
      elapsedTime: 0,
    });
  };

  const pauseSession = () => {
    setCurrentSession((prev) => ({ ...prev, isActive: false }));
  };

  const stopSession = () => {
    if (currentSession.startTime) {
      const sessionDuration = currentSession.elapsedTime;
      // Here you would save the session data to your backend console.log('Session completed:', { duration: sessionDuration, patientId: currentSession.patientId, consultationType: currentSession.consultationType });
    }
    setCurrentSession({
      isActive: false,
      startTime: null,
      patientId: null,
      consultationType: null,
      elapsedTime: 0,
    });
    // Refresh metrics after session ends fetchMetrics();
  };
  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600 ';
    if (efficiency >= 75) return 'text-yellow-600 ';
    return 'text-red-600 ';
  };
  const getEfficiencyIcon = (efficiency) => {
    if (efficiency >= 90) return <TrendingUp className="h-4 w-4" />;
    if (efficiency >= 75) return <Target className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };
  return (
    <div className="space-y-6">
      {' '}
      {/* Active Session Tracker */}{' '}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {' '}
        <div className="flex items-center justify-between mb-4">
          {' '}
          <h3 className="text-lg font-semibold text-gray-900 ">
            Sesión Actual
          </h3>{' '}
          <div
            className={`flex items-center space-x-2 ${currentSession.isActive ? 'text-green-600 ' : 'text-gray-400'}`}
          >
            {' '}
            <div
              className={`w-2 h-2 rounded-full ${currentSession.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            ></div>{' '}
            <span className="text-sm">
              {currentSession.isActive ? 'Activa' : 'Inactiva'}
            </span>{' '}
          </div>{' '}
        </div>{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {' '}
          <div className="bg-gray-50 rounded-lg p-4">
            {' '}
            <div className="flex items-center justify-between mb-2">
              {' '}
              <span className="text-sm text-gray-600 ">
                Tiempo Transcurrido
              </span>{' '}
              <Timer className="h-4 w-4 text-gray-400" />{' '}
            </div>{' '}
            <div className="text-2xl font-bold text-gray-900 ">
              {' '}
              {formatTime(currentSession.elapsedTime)}{' '}
            </div>{' '}
          </div>{' '}
          <div className="bg-gray-50 rounded-lg p-4">
            {' '}
            <div className="flex items-center justify-between mb-2">
              {' '}
              <span className="text-sm text-gray-600 ">
                Tipo de Consulta
              </span>{' '}
              <User className="h-4 w-4 text-gray-400" />{' '}
            </div>{' '}
            <div className="text-sm font-medium text-gray-900 ">
              {' '}
              {currentSession.consultationType || 'No iniciada'}{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex space-x-3">
          {' '}
          {!currentSession.isActive && !currentSession.startTime && (
            <button
              onClick={() => startSession('PAT001', 'Consulta General')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {' '}
              <Play className="h-4 w-4" /> <span>Iniciar Sesión</span>{' '}
            </button>
          )}{' '}
          {currentSession.isActive && (
            <button
              onClick={pauseSession}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {' '}
              <Pause className="h-4 w-4" /> <span>Pausar</span>{' '}
            </button>
          )}{' '}
          {!currentSession.isActive && currentSession.startTime && (
            <button
              onClick={() =>
                setCurrentSession((prev) => ({ ...prev, isActive: true }))
              }
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {' '}
              <Play className="h-4 w-4" /> <span>Reanudar</span>{' '}
            </button>
          )}{' '}
          {currentSession.startTime && (
            <button
              onClick={stopSession}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {' '}
              <StopCircle className="h-4 w-4" /> <span>Finalizar</span>{' '}
            </button>
          )}{' '}
        </div>{' '}
      </div>{' '}
      {/* Today's Metrics */}{' '}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {' '}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas del Día
        </h3>{' '}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {' '}
          <div className="text-center">
            {' '}
            <div className="text-2xl font-bold text-blue-600 ">
              {todayMetrics.totalConsultations}
            </div>{' '}
            <div className="text-sm text-gray-600 ">Consultas</div>{' '}
          </div>{' '}
          <div className="text-center">
            {' '}
            <div className="text-2xl font-bold text-green-600 ">
              {todayMetrics.averageTime} min
            </div>{' '}
            <div className="text-sm text-gray-600 ">Promedio</div>{' '}
          </div>{' '}
          <div className="text-center">
            {' '}
            <div className="text-2xl font-bold text-yellow-600 ">
              {todayMetrics.totalTime} min
            </div>{' '}
            <div className="text-sm text-gray-600 ">Tiempo Total</div>{' '}
          </div>{' '}
          <div className="text-center">
            {' '}
            <div
              className={`text-2xl font-bold ${getEfficiencyColor(todayMetrics.efficiency)}`}
            >
              {' '}
              {todayMetrics.efficiency}%{' '}
            </div>{' '}
            <div className="text-sm text-gray-600 ">Eficiencia</div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
      {/* Weekly Trend */}{' '}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {' '}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tendencia Semanal
        </h3>{' '}
        <div className="space-y-3">
          {' '}
          {weeklyData.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              {' '}
              <div className="flex items-center space-x-3">
                {' '}
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {' '}
                  <Calendar className="h-4 w-4 text-blue-600 " />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <div className="text-sm font-medium text-gray-900 ">
                    {day.day}
                  </div>{' '}
                  <div className="text-xs text-gray-500 ">
                    {day.consultations} consultas
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="text-right">
                {' '}
                <div className="text-sm font-medium text-gray-900 ">
                  {day.avgTime} min
                </div>{' '}
                <div className="text-xs text-gray-500 ">promedio</div>{' '}
              </div>{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      {/* Doctor Performance */}{' '}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {' '}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Médico
        </h3>{' '}
        <div className="space-y-4">
          {' '}
          {doctorStats.map((doctor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              {' '}
              <div className="flex items-center space-x-3">
                {' '}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {' '}
                  <User className="h-5 w-5 text-blue-600 " />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <div className="text-sm font-medium text-gray-900 ">
                    {doctor.name}
                  </div>{' '}
                  <div className="text-xs text-gray-500 ">
                    {doctor.consultations} consultas
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex items-center space-x-4">
                {' '}
                <div className="text-right">
                  {' '}
                  <div className="text-sm font-medium text-gray-900 ">
                    {doctor.avgTime} min
                  </div>{' '}
                  <div className="text-xs text-gray-500 ">promedio</div>{' '}
                </div>{' '}
                <div
                  className={`flex items-center space-x-1 ${getEfficiencyColor(doctor.efficiency)}`}
                >
                  {' '}
                  {getEfficiencyIcon(doctor.efficiency)}{' '}
                  <span className="text-sm font-medium">
                    {doctor.efficiency}%
                  </span>{' '}
                </div>{' '}
              </div>{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
export { DashboardTimeTracker };
