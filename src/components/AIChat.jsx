"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../app/providers/I18nProvider';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const AIChat = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: t('ai_assistant_welcome') || 'Hello! I\'m your AI Medical Analytics Assistant. I can help you analyze patient data, identify trends, and provide clinical insights. What would you like to explore?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mockResponses = {
    'diabetes': {
      content: 'Based on your patient data, I can see diabetes-related visits have increased 18% this quarter. Key insights:\\n\\n• **Type 2 Diabetes**: 78% of cases\\n• **Age Group**: Primarily 45-65 years\\n• **HbA1c Trends**: Average 7.2% (target <7.0%)\\n• **Recommendation**: Consider enhanced patient education programs and more frequent monitoring for patients with HbA1c >8.0%',
      suggestions: ['Show HbA1c trends', 'Medication adherence rates', 'Dietary counseling effectiveness']
    },
    'patient satisfaction': {
      content: 'Your patient satisfaction metrics show excellent performance:\\n\\n• **Overall Rating**: 94.2% (↑2.1% from last month)\\n• **Wait Time Satisfaction**: 91.5%\\n• **Communication Quality**: 96.8%\\n• **Facility Cleanliness**: 93.2%\\n\\n**Key Drivers**: Shorter wait times and improved communication protocols implemented last month are showing positive results.',
      suggestions: ['Detailed satisfaction breakdown', 'Comparison with industry benchmarks', 'Patient feedback analysis']
    },
    'treatment outcomes': {
      content: 'Treatment outcome analysis for the past 6 months:\\n\\n• **Recovery Rate**: 87.3% (↑3.4%)\\n• **Readmission Rate**: 4.2% (↓1.8%)\\n• **Treatment Adherence**: 82.1%\\n• **Complications**: 2.8% (↓0.9%)\\n\\n**Best Performing**: Cardiovascular treatments (92% success rate)\\n**Needs Attention**: Respiratory treatments (78% success rate)',
      suggestions: ['Cardiovascular success factors', 'Respiratory treatment protocol review', 'Adherence improvement strategies']
    },
    'revenue analysis': {
      content: 'Financial performance analysis:\\n\\n• **Monthly Revenue**: $124,500 (↑15.3%)\\n• **Revenue per Patient**: $287 (↑8.2%)\\n• **Insurance Reimbursement**: 94.7% success rate\\n• **Outstanding Claims**: $18,200 (↓22.1%)\\n\\n**Growth Drivers**: Increased patient volume and improved billing efficiency. New insurance contracts contributing 12% of revenue growth.',
      suggestions: ['Billing efficiency metrics', 'Insurance contract analysis', 'Revenue forecasting']
    },
    'default': {
      content: 'I can help you analyze various aspects of your medical practice. Here are some areas I can assist with:\\n\\n• **Patient Analytics**: Demographics, satisfaction, and treatment patterns\\n• **Clinical Metrics**: Diagnosis accuracy, treatment outcomes, medication adherence\\n• **Financial Analysis**: Revenue trends, cost analysis, insurance metrics\\n• **Operational Efficiency**: Wait times, resource utilization, workflow optimization\\n\\nWhat specific area would you like me to analyze?',
      suggestions: ['Analyze patient demographics', 'Show treatment success rates', 'Review revenue trends', 'Operational efficiency metrics']
    }
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = mockResponses['default'];

    if (lowerMessage.includes('diabetes') || lowerMessage.includes('diabetic')) {
      response = mockResponses['diabetes'];
    } else if (lowerMessage.includes('satisfaction') || lowerMessage.includes('patient feedback')) {
      response = mockResponses['patient satisfaction'];
    } else if (lowerMessage.includes('treatment') || lowerMessage.includes('outcome') || lowerMessage.includes('recovery')) {
      response = mockResponses['treatment outcomes'];
    } else if (lowerMessage.includes('revenue') || lowerMessage.includes('financial') || lowerMessage.includes('money')) {
      response = mockResponses['revenue analysis'];
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    return content.split('\\n').map((line, index) => (
      <div key={index} className="mb-1">
        {line.startsWith('•') ? (
          <div className="flex items-start ml-4">
            <span className="text-blue-500 mr-2">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        ) : line.startsWith('**') && line.endsWith('**') ? (
          <div className="font-semibold text-gray-900 dark:text-white mt-2">
            {line.replace(/\\*\\*/g, '')}
          </div>
        ) : (
          <span>{line}</span>
        )}
      </div>
    ));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('ai_assistant')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('powered_by_ai')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('online')}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-500 ml-2' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 mr-2'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="w-5 h-5 text-white" />
                ) : (
                  <SparklesIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
              }`}>
                <div className="text-sm">
                  {message.type === 'user' ? message.content : formatMessage(message.content)}
                </div>
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-xs bg-white dark:bg-slate-600 border border-gray-200 dark:border-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-slate-500 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('ask_medical_question')}
              rows="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => handleSuggestionClick('Show patient demographics')}
            className="flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ChartBarIcon className="w-3 h-3 mr-1" />
            {t('demographics')}
          </button>
          <button
            onClick={() => handleSuggestionClick('Analyze treatment outcomes')}
            className="flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <HeartIcon className="w-3 h-3 mr-1" />
            {t('outcomes')}
          </button>
          <button
            onClick={() => handleSuggestionClick('Review revenue trends')}
            className="flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ClipboardDocumentListIcon className="w-3 h-3 mr-1" />
            {t('revenue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;