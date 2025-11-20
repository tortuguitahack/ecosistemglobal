import React, { useState, useRef, useEffect } from 'react';
import { getAiResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useData } from '../hooks/useData';
import { decode, decodeAudioData } from '../services/audioUtils';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "¡Hola! Soy tu asistente de IA. Puedo darte resúmenes del rendimiento de cualquier sistema. Por ejemplo, prueba a preguntar: '¿cuál es el estado de AutoLead Pro?'" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null); // message text
  const { systems } = useData();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
  }, [isOpen]);

  const playAudio = async (base64Audio: string, text: string) => {
    if (!audioContextRef.current || !base64Audio) return;
    setIsSpeaking(text);
    try {
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioContextRef.current,
            24000,
            1,
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
        source.onended = () => setIsSpeaking(null);
    } catch(e) {
        console.error("Error playing audio", e);
        setIsSpeaking(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const historyForApi = messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));
        
      const { text: aiResponseText, sources } = await getAiResponse(input, historyForApi, systems, isThinkingMode);
      let audioData = '';
      if (aiResponseText && !isThinkingMode) { // No speech for long thinking responses
          audioData = await generateSpeech(aiResponseText);
      }
      
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText, audioData, sources };
      setMessages(prev => [...prev, aiMessage]);
      if (audioData) {
          playAudio(audioData, aiResponseText);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'ai', text: 'Lo siento, ha ocurrido un error al contactar con la IA.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900/80 backdrop-blur-xl shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-gray-700`}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white"><i className="fas fa-brain text-indigo-400 mr-2"></i> Asistente IA</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </header>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end max-w-xs lg:max-w-sm ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                    </div>
                    {msg.sender === 'ai' && msg.audioData && (
                         <button onClick={() => playAudio(msg.audioData!, msg.text)} disabled={!!isSpeaking} className="ml-2 text-gray-400 hover:text-white disabled:opacity-50">
                             <i className={`fas ${isSpeaking === msg.text ? 'fa-volume-up fa-beat' : 'fa-volume-high'}`}></i>
                         </button>
                    )}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400 max-w-xs lg:max-w-sm bg-gray-800/50 p-2 rounded-lg">
                        <p className="font-semibold mb-1">Fuentes:</p>
                        <ul className="space-y-1">
                            {msg.sources.map((source, i) => source.web && (
                                <li key={i} className="truncate">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 underline flex items-center">
                                        <i className="fas fa-link text-gray-500 mr-2"></i>
                                        <span>{source.web.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-xl">
                  <p className="text-sm animate-pulse">Pensando...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <footer className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </div>
           <div className="mt-3 flex items-center justify-end text-sm">
              <label htmlFor="thinking-mode" className="mr-2 text-gray-400">Modo de pensamiento profundo</label>
              <div onClick={() => setIsThinkingMode(!isThinkingMode)} className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isThinkingMode ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isThinkingMode ? 'translate-x-6' : ''}`}></div>
              </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AiAssistant;