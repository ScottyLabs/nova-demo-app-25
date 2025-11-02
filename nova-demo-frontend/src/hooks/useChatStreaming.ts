/**
 * Custom hook for managing chat streaming
 * Unified hook that handles all streaming in one place
 */

import { useEffect } from 'react'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { experimental_streamedQuery as streamedQuery } from '@tanstack/react-query'
import type { Message } from '@/types/chat'
import { parseStreamingMessage, extractContent, extractImage } from '@/utils/streamParser'

interface UseChatStreamingProps {
  chatMessages: Message[]
  selectedModel: string
  mcpEnabled: boolean
  selectedMcpServer: string
  mcpAutoApprove: boolean
  lastMessage: string
  onMessageUpdate: (content: string, image?: any) => void
}

export const useChatStreaming = ({
  chatMessages,
  selectedModel,
  mcpEnabled,
  selectedMcpServer,
  mcpAutoApprove,
  lastMessage,
  onMessageUpdate,
}: UseChatStreamingProps) => {
  const streamingQuery = queryOptions({
  queryKey: ['chat', lastMessage],
  queryFn: streamedQuery({
    streamFn: async function () {
    const chat_history = chatMessages.map(({ role, content, image, audio, pdf }) => ({
      role,
      content,
      ...(image && { image }),
      ...(audio && { audio }),
      ...(pdf && { pdf }),
    }))

    const requestBody = {
      model_id: selectedModel,
      chat_history,
      use_mcp: mcpEnabled,
      mcp_server_type: selectedMcpServer,
      mcp_auto_approve: mcpAutoApprove,
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat_streaming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    return (async function* () {
      while (true) {
      const { done, value } = await reader.read()
      if (done) return
      yield new TextDecoder().decode(value)
      }
    })()
    },
  }),
  enabled: chatMessages.length > 0,
  refetchInterval: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  })

  const { data: streamingMessage, isFetching, isPending } = useQuery(streamingQuery)

  useEffect(() => {
  if (!streamingMessage) return

  try {
    const messages = parseStreamingMessage(streamingMessage)

    // Extract content and image
    const accContent = extractContent(messages)
    const assistantImage = extractImage(messages)

    if (accContent || assistantImage) {
    onMessageUpdate(accContent, assistantImage)
    }
  } catch (error) {
    console.error('Error parsing streaming message:', error, streamingMessage)
  }
  }, [streamingMessage])

  return {
  currentlyStreaming: isFetching,
  currentlySending: isPending,
  }
}
