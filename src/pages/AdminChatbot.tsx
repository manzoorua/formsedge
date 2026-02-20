import ChatbotSettingsManager from '@/components/admin/ChatbotSettingsManager';

export default function AdminChatbot() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chatbot Settings</h1>
        <p className="text-muted-foreground">Configure RAGcanvas chatbot integration</p>
      </div>

      <ChatbotSettingsManager />
    </div>
  );
}
