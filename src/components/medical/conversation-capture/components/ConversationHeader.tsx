import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { PenTool, Mic, Settings } from 'lucide-react';
import AudioDenoisingDashboard from '@/src/components/medical/AudioDenoisingDashboard';

interface ConversationHeaderProps {
  title: string;
  subtitle: string;
  isManualMode: boolean;
  showDenoisingDashboard: boolean;
  onToggleMode: () => void;
  onToggleDashboard: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  title,
  subtitle,
  isManualMode,
  showDenoisingDashboard,
  onToggleMode,
  onToggleDashboard
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-medium mb-2">{title}</h1>
          <p className="text-gray">{subtitle}</p>
        </div>
        <Button
          onClick={onToggleMode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isManualMode ? (
            <>
              <Mic className="w-4 h-4" />
              Cambiar a voz
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4" />
              Modo manual
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-4">
        <Badge variant={isManualMode ? 'secondary' : 'default'}>
          {isManualMode ? 'Modo Manual' : 'Modo Voz'}
        </Badge>
        
        {!isManualMode && (
          <button
            onClick={onToggleDashboard}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
              showDenoisingDashboard 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Dashboard
          </button>
        )}
      </div>
      
      {showDenoisingDashboard && !isManualMode && (
        <AudioDenoisingDashboard />
      )}
    </div>
  );
};