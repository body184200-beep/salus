import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Send, ShieldAlert, Sparkles, AlertCircle, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sources?: Array<{ title: string; type: string }>;
  clarifyingQuestions?: string[];
  safetyAlert?: any;
  timestamp: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSymptomLogger?: (symptomName: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onOpenSymptomLogger }) => {
  const { language, t, isRtl } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text:
        language === 'ar'
          ? 'أهلاً بك، أنا الممرضة شهد السيد هاشم في منصة سالوس. تقدر تسألني بصوتك أو كتابة عن أي دواء من الأدوية الموثقة أو أي أثر جانبي حاسس بيه لمساعدتك في أمانك الدوائي.'
          : 'Welcome! I am Nurse Shahd El-Sayed Hashem on SALUS. Ask by voice or text about your medications, potential adverse effects, or symptoms.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSendQuery(transcript);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!speechSupported) {
      alert(
        language === 'ar'
          ? 'التعرف الصوتي المباشر غير مدعوم في هذا المتصفح. يمكنك كتابة سؤالك في المربع أدناه وسأجيبك فوراً.'
          : 'Speech recognition is not supported in this browser. Please type your question below.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Cannot start speech recognition:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendQuery = async (queryText = inputQuery) => {
    const q = queryText.trim();
    if (!q || loading) return;

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.queryAssistant(q, language);
      const answer = language === 'ar' ? res.answerTextAr : res.answerTextEn;

      const assistantMsg: Message = {
        sender: 'assistant',
        text: answer,
        sources: res.sources,
        clarifyingQuestions: language === 'ar' ? res.clarifyingQuestionsAr : res.clarifyingQuestionsEn,
        safetyAlert: res.safetyAlert,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak answer if user used voice
      if (isListening || q.length > 0) {
        speakText(answer);
      }
    } catch (err) {
      console.error('Assistant error:', err);
      const errMsg: Message = {
        sender: 'assistant',
        text:
          language === 'ar'
            ? 'المعلومة دي مش متوفرة بشكل موثوق حاليًا. يرجى استشارة الصيدلي أو الطبيب.'
            : 'Reliable information is not currently available. Please consult your pharmacist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col h-[85vh] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-salus-dark-teal to-salus-teal text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-salus-light-mint">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">
                  {language === 'ar' ? 'الممرضة الذكية: شهد السيد هاشم' : 'Nurse Shahd El-Sayed Hashem'}
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">تمريض إكلينيكي</span>
              </div>
              <p className="text-xs text-salus-light-mint/80">
                {language === 'ar' ? 'المساعد التمريضي لسلامة الأدوية ومتابعة الأعراض (بالعامية المصرية)' : 'Evidence-Backed Clinical Nursing Guide'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Example Chips */}
        <div className="px-4 py-2 bg-salus-bg border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-salus-muted whitespace-nowrap">
            {language === 'ar' ? 'جرّب أن تسأل:' : 'Try asking:'}
          </span>
          <button
            onClick={() => handleSendQuery('أنا باخد أملوديبين وحاسس بدوخة، ده ممكن يكون من الدوا؟')}
            className="px-3 py-1 bg-white rounded-full border border-gray-200 text-salus-text hover:border-salus-teal whitespace-nowrap"
          >
            "أنا باخد أملوديبين وحاسس بدوخة..."
          </button>
          <button
            onClick={() => handleSendQuery('هل الباراسيتامول من مسكنات NSAIDs؟')}
            className="px-3 py-1 bg-white rounded-full border border-gray-200 text-salus-text hover:border-salus-teal whitespace-nowrap"
          >
            "هل الباراسيتامول مسكن NSAID؟"
          </button>
          <button
            onClick={() => handleSendQuery('عندي تورم في الكاحل بعد أخذ نورفاسك')}
            className="px-3 py-1 bg-white rounded-full border border-gray-200 text-salus-text hover:border-salus-teal whitespace-nowrap"
          >
            "تورم الكاحل مع نورفاسك"
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-salus-teal text-white rounded-br-sm'
                    : 'bg-salus-bg text-salus-text border border-gray-200/70 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Spoken Audio Icon for Assistant */}
                {msg.sender === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-salus-muted">
                    <button
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1.5 text-salus-teal font-bold hover:underline"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'استمع للصوت' : 'Play Spoken Voice'}</span>
                    </button>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>
                )}
              </div>

              {/* Clarifying Questions & Actions */}
              {msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0 && (
                <div className="mt-2 space-y-1 max-w-[85%]">
                  <div className="text-[11px] font-bold text-salus-muted flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-salus-teal" />
                    <span>{language === 'ar' ? 'أسئلة توضيحية للمتابعة:' : 'Clarifying questions:'}</span>
                  </div>
                  {msg.clarifyingQuestions.map((cq, cqIdx) => (
                    <button
                      key={cqIdx}
                      onClick={() => handleSendQuery(cq)}
                      className="w-full text-start p-2 rounded-xl bg-salus-light-mint/50 border border-salus-teal/20 text-xs text-salus-dark-teal hover:bg-salus-light-mint transition-colors"
                    >
                      {cq}
                    </button>
                  ))}
                </div>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-salus-teal" />
                  <span>
                    {language === 'ar' ? 'المصدر الموثق: ' : 'Verified Evidence: '}
                    {msg.sources.map((s) => s.title).join(' • ')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-salus-teal text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ar' ? 'جارٍ تدقيق الأدلة الطبية وتجهيز الإجابة...' : 'Analyzing clinical evidence...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Big Microphone Button */}
        <div className="p-4 bg-salus-bg border-t border-gray-100 flex items-center gap-2 sm:gap-3">
          {/* Big Voice Microphone Button */}
          <button
            onClick={toggleListening}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transition-all ${
              isListening
                ? 'bg-salus-critical animate-pulse scale-110 shadow-rose-600/40'
                : 'bg-salus-teal hover:bg-salus-dark-teal shadow-salus-teal/30'
            }`}
            title={isListening ? 'Stop listening' : 'Start Egyptian Voice Input'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input Fallback */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder={
                isListening
                  ? language === 'ar'
                    ? 'تحدث الآن، أسمعك بوضوح...'
                    : 'Listening now, please speak...'
                  : language === 'ar'
                  ? 'اكتب سؤالك أو اضغط على الميكروفون للتحدث...'
                  : 'Type your question or click the mic to speak...'
              }
              className="w-full py-3.5 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-salus-teal/20 focus:border-salus-teal text-sm bg-white"
            />
          </div>

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-salus-dark-teal text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
