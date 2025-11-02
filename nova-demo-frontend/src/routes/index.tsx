import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import 'highlight.js/styles/github-dark.css'

// Types
import type { Message, ImageData, AudioData, PdfData } from '@/types/chat'

// Hooks
import { useAvailableModels } from '@/hooks/useAvailableModels'
import { useMCP } from '@/hooks/useMCP'
import { useChatStreaming } from '@/hooks/useChatStreaming'

// Components
import { Sidebar } from '@/components/Sidebar'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatInput } from '@/components/ChatInput'

export const Route = createFileRoute('/')({
  component: ChatDemo,
})
function ChatDemo() {
  // State management
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [lastMessage, setLastMessage] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null)
  const [uploadedAudio, setUploadedAudio] = useState<AudioData | null>(null)
  const [uploadedPdf, setUploadedPdf] = useState<PdfData | null>(null)
  const [selectedModel, setSelectedModel] = useState('qwen/qwen3-vl-30b-a3b-instruct')
  const [mcpEnabled, setMcpEnabled] = useState(false)
  const [selectedMcpServer, setSelectedMcpServer] = useState('cmu_api')
  const [mcpAutoApprove, setMcpAutoApprove] = useState(true)

  // Fetch available models
  const { data: availableModels } = useAvailableModels()
  const selectedModelData = availableModels?.find((m) => m.id === selectedModel)

  // MCP integration
  const { mcpServers, mcpTools } = useMCP(mcpEnabled, selectedMcpServer)

  // Streaming chat - unified streaming handler
  const { currentlyStreaming, currentlySending } = useChatStreaming({
  chatMessages,
  selectedModel,
  mcpEnabled,
  selectedMcpServer,
  mcpAutoApprove,
  lastMessage,
  onMessageUpdate: (content, image) => {
    const assistantMessage: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    ...(image && { image }),
    timestamp: new Date(),
    }

    setChatMessages((prev) => {
    if (prev.length === 0 || prev[prev.length - 1].role !== 'assistant') {
      return [...prev, assistantMessage]
    } else {
      const newMessages = [...prev]
      newMessages[newMessages.length - 1] = assistantMessage
      return newMessages
    }
    })
  },
  })

  // Message sending handler
  const handleSendMessage = () => {
  if (!inputValue.trim() && !uploadedImage && !uploadedAudio && !uploadedPdf) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content:
    inputValue.trim() ||
    (uploadedImage
      ? 'Image uploaded'
      : uploadedAudio
      ? 'Audio uploaded'
      : 'PDF uploaded'),
    image: uploadedImage || undefined,
    audio: uploadedAudio || undefined,
    pdf: uploadedPdf || undefined,
    timestamp: new Date(),
  }

  setChatMessages((prev) => [...prev, userMessage])
  setLastMessage(
    inputValue.trim() ||
    (uploadedImage
      ? 'Describe this image'
      : uploadedAudio
      ? 'Transcribe this audio'
      : 'Analyze this document')
  )

  // Reset inputs
  setInputValue('')
  setUploadedImage(null)
  setUploadedAudio(null)
  setUploadedPdf(null)
  }

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        availableModels={availableModels}
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        currentlyStreaming={currentlyStreaming}
        selectedModelData={selectedModelData}
        mcpEnabled={mcpEnabled}
        onMcpEnabledChange={setMcpEnabled}
        selectedMcpServer={selectedMcpServer}
        onMcpServerChange={setSelectedMcpServer}
        mcpServers={mcpServers}
        mcpAutoApprove={mcpAutoApprove}
        onMcpAutoApproveChange={setMcpAutoApprove}
        mcpTools={mcpTools}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <ChatMessages messages={chatMessages} />

        <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSendMessage}
          uploadedImage={uploadedImage}
          uploadedAudio={uploadedAudio}
          uploadedPdf={uploadedPdf}
          onImageUpload={setUploadedImage}
          onAudioUpload={setUploadedAudio}
          onPdfUpload={setUploadedPdf}
          onImageRemove={() => setUploadedImage(null)}
          onAudioRemove={() => setUploadedAudio(null)}
          onPdfRemove={() => setUploadedPdf(null)}
          currentlyStreaming={currentlyStreaming}
          currentlySending={currentlySending}
          selectedModel={selectedModelData}
          mcpEnabled={mcpEnabled}
          mcpToolsCount={mcpTools.length}
          mcpAutoApprove={mcpAutoApprove}
        />
      </div>
    </div>
  )
}
