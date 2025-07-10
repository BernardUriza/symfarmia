"use client";

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';
import ActionButton from '../../components/ui/ActionButton';
import { UserPlusIcon, DocumentTextIcon, ChartBarIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../app/providers/I18nProvider';
import { 
  Users, 
  FileText, 
  Stethoscope, 
  Activity, 
  Calendar, 
  Plus,
  Eye,
  Edit3,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  Heart,
  Zap
} from 'lucide-react';

// Enhanced Dashboard Card with better dark mode and desktop layout
const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  value, 
  href, 
  buttonText,
  trend,
  stats,
  className = "",
  iconColor = "blue"
}: {
  title: string;
  description: string;
  icon: any;
  value: string;
  href: string;
  buttonText: string;
  trend?: string;
  stats?: Array<{label: string, value: string, color?: string}>;
  className?: string;
  iconColor?: string;
}) => {
  const { t } = useTranslation();
  const getIconColors = (color: string) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dashboard-card-hover dark-mode-transition flex flex-col ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColors(iconColor)}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('cards.patients.total_label')}</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          </div>
          
          {stats && stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}:</span>
              <span className={`font-semibold ${
                stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-900 dark:text-white'
              }`}>{stat.value}</span>
            </div>
          ))}
          
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        
        <Link 
          href={href}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

// Desktop Sidebar Panels
const QuickActionsPanel = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 dashboard-card-hover dark-mode-transition">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('sidebar.quick_actions.title')}
      </h3>
      
      <div className="space-y-3">
        <Link
          href="/dashboard/patients?action=new"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-gray-900 dark:text-white">{t('sidebar.quick_actions.new_patient')}</span>
        </Link>
        
        <Link
          href="/dashboard/medicalReports?action=new"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-gray-900 dark:text-white">{t('sidebar.quick_actions.new_report')}</span>
        </Link>
        
        <Link
          href="/consultation"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-gray-900 dark:text-white">{t('sidebar.quick_actions.new_consultation')}</span>
        </Link>
      </div>
    </div>
  );
};

const TranscriptionCard = () => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [micPermission, setMicPermission] = React.useState<string>('prompt');
  const recognitionRef = React.useRef<any>(null);

  // Check microphone permission
  React.useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' })
        .then(result => setMicPermission(result.state))
        .catch(() => setMicPermission('prompt'));
    }
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission if needed
      if (micPermission !== 'granted') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
      }

      // Check for speech recognition support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        alert(`Error de reconocimiento: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 dashboard-card-hover dark-mode-transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isRecording 
              ? 'bg-red-100 dark:bg-red-900/50' 
              : 'bg-emerald-100 dark:bg-emerald-900/50'
          }`}>
            <MicrophoneIcon className={`w-6 h-6 ${
              isRecording 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('cards.transcription.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRecording ? 'Grabando...' : t('cards.transcription.description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isRecording ? 'Grabando' : t('cards.transcription.status_ready')}
          </span>
        </div>
      </div>

      {/* Recording interface */}
      <div className="text-center mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <MicrophoneIcon className="w-5 h-5" />
            Iniciar Grabación
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            Detener Grabación
          </button>
        )}
      </div>

      {/* Live transcript display */}
      {transcript && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transcripción:</p>
          <p className="text-gray-900 dark:text-white text-sm">{transcript}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('cards.transcription.consultations_today')}</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">24</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('cards.transcription.time_saved')}</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">4.2h</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Link
          href="/consultation"
          className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('cards.transcription.new_consultation')}
        </Link>
        <Link
          href="/dashboard/transcriptions"
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {t('cards.transcription.view_transcriptions')}
        </Link>
      </div>
    </div>
  );
};

const RecentActivityPanel = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 dashboard-card-hover dark-mode-transition">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('sidebar.recent_activity.title')}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">{t('sidebar.recent_activity.new_patient_registered')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.recent_activity.ago_2_minutes')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <MicrophoneIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">{t('sidebar.recent_activity.consultation_transcribed')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.recent_activity.ago_15_minutes')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">{t('sidebar.recent_activity.study_completed')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.recent_activity.ago_30_minutes')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemStatusPanel = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 dashboard-card-hover dark-mode-transition">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('sidebar.system_status.title')}
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900 dark:text-white">{t('sidebar.system_status.api_medical')}</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400">{t('sidebar.system_status.status_active')}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900 dark:text-white">{t('sidebar.system_status.database')}</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400">{t('sidebar.system_status.status_connected')}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-900 dark:text-white">{t('sidebar.system_status.backups')}</span>
          </div>
          <span className="text-xs text-yellow-600 dark:text-yellow-400">{t('sidebar.system_status.status_scheduled')}</span>
        </div>
      </div>
    </div>
  );
};

const RecentActivityItem = ({ 
  title, 
  description, 
  time, 
  type 
}: {
  title: string;
  description: string;
  time: string;
  type: 'patient' | 'report' | 'study';
}) => {
  const getIcon = () => {
    switch (type) {
      case 'patient': return <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'report': return <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'study': return <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'patient': return 'bg-blue-100 dark:bg-blue-900';
      case 'report': return 'bg-green-100 dark:bg-green-900';
      case 'study': return 'bg-purple-100 dark:bg-purple-900';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
      <div className={`w-8 h-8 ${getBgColor()} rounded-lg flex items-center justify-center`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <Clock className="h-3 w-3" />
        {time}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 medical-dashboard">
      {/* Enhanced Header with dark mode */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 dark-mode-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('subtitle')}
              </p>
            </div>
            
            {/* Theme toggle in header */}
            <div className="flex items-center space-x-4">
              <ThemeToggle className="theme-toggle-animation" />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full status-indicator"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('system_active')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with optimized desktop layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop: 3-column grid, Mobile: single column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Primary cards - take more space on desktop */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title={t('cards.patients.title')}
                description={t('cards.patients.description')}
                icon={Users}
                value="2,543"
                href="/dashboard/patients"
                buttonText={t('cards.patients.button')}
                iconColor="blue"
                stats={[
                  {label: t('cards.patients.active_label'), value: "2,341", color: "green"},
                  {label: t('cards.patients.new_today_label'), value: "12", color: "blue"}
                ]}
              />
              
              <DashboardCard
                title={t('cards.reports.title')}
                description={t('cards.reports.description')}
                icon={FileText}
                value="1,847"
                href="/dashboard/medicalReports"
                buttonText={t('cards.reports.button')}
                iconColor="emerald"
                stats={[
                  {label: t('cards.reports.pending_label'), value: "23", color: "orange"},
                  {label: t('cards.reports.completed_label'), value: "1,824", color: "green"}
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title={t('cards.studies.title')}
                description={t('cards.studies.description')}
                icon={Activity}
                value="3,629"
                href="/dashboard/studies"
                buttonText={t('cards.studies.button')}
                iconColor="purple"
                stats={[
                  {label: t('cards.studies.this_month_label'), value: "847", color: "blue"},
                  {label: t('cards.studies.scheduled_label'), value: "156", color: "orange"}
                ]}
              />
              
              <TranscriptionCard />
            </div>
          </div>
          
          {/* Sidebar - desktop only */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6">
            <QuickActionsPanel />
            <RecentActivityPanel />
            <SystemStatusPanel />
          </div>
        </div>

        {/* Additional Dashboard Analytics */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.daily_analysis')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-900 dark:text-white">{t('analytics.consultations_completed')}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">47</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-white">{t('analytics.system_efficiency')}</span>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">98.2%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-900 dark:text-white">{t('analytics.average_time')}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">12.4 min</span>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('recent_activity')}
            </h3>
            
            <div className="space-y-3">
              <RecentActivityItem
                title={t('activity.new_patient_registered')}
                description={t('activity.patient_data')}
                time={t('activity.ago_5_min')}
                type="patient"
              />
              
              <RecentActivityItem
                title={t('activity.medical_report_generated')}
                description={t('activity.blood_test_data')}
                time={t('activity.ago_15_min')}
                type="report"
              />
              
              <RecentActivityItem
                title={t('activity.study_completed')}
                description={t('activity.mri_data')}
                time={t('activity.ago_30_min')}
                type="study"
              />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/dashboard/activity"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('activity.view_all_activity')} →
              </Link>
            </div>
          </div>
        </div>

        {/* System Management */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('system_management.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/dashboard/categories"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('system_management.categories.title')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('system_management.categories.description')}</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/study-types"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('system_management.study_types.title')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('system_management.study_types.description')}</p>
                </div>
              </Link>
              
              <Link 
                href="/dashboard/settings"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('system_management.configuration.title')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('system_management.configuration.description')}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}