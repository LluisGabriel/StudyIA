'use client';

import { useState, useEffect, useRef } from 'react';
import { academicQuestionAnswering } from '@/ai/flows/academic-question-answering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, BrainCircuit, MessageSquare } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const initialMessage: Message = { text: '¡Hola! Soy tu asistente académico. ¿En qué puedo ayudarte hoy?', sender: 'ai' };

export default function AcademicChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Exclude the initial greeting from the history sent to the AI
      const historyToSend = messages.filter(m => m.text !== initialMessage.text).slice(-10);

      const result = await academicQuestionAnswering({ 
          query: input,
          history: historyToSend,
      });
      setMessages([...newMessages, { text: result.answer, sender: 'ai' }]);
    } catch (error) {
      setMessages([...newMessages, { text: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.', sender: 'ai' }]);
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Chat Académico</CardTitle>
        </div>
        <CardDescription>Tu asistente personal para resolver dudas y obtener explicaciones.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
          {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
              )}
              <Card className={`max-w-md ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CardContent className="p-3 text-sm">{message.text}</CardContent>
              </Card>
              {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                  </Avatar>
              )}
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 pt-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 focus-within-gradient-border"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale algo a la IA..."
              disabled={isLoading}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" disabled={isLoading} className="mr-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
