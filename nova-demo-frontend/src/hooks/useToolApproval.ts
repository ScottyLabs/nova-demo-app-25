/**
 * Custom hook for handling tool call approvals
 * Simplified to only manage approval state - streaming is handled by useChatStreaming
 */

import { useState } from 'react'
import type { Message, ToolCall } from '@/types/chat'

export const useToolApproval = (
  onMessageAdd: (message: Message) => void
) => {
  const [showToolApproval, setShowToolApproval] = useState(false)
  const [pendingToolCalls, setPendingToolCalls] = useState<ToolCall[]>([])
  const [approvedToolCalls, setApprovedToolCalls] = useState<ToolCall[] | null>(null)

  const handleToolCallApproval = async (approved: boolean) => {
    setShowToolApproval(false)

    if (!approved) {
      // User declined - add a message and clear pending calls
      const declineMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Tool execution cancelled by user.',
        timestamp: new Date(),
      }
      onMessageAdd(declineMessage)
      setPendingToolCalls([])
      setApprovedToolCalls(null)
      return
    }

    // User approved - set the approved tool calls which will trigger streaming
    setApprovedToolCalls([...pendingToolCalls])
    setPendingToolCalls([])
  }

  const requestToolApproval = (toolCalls: ToolCall[]) => {
    setPendingToolCalls(toolCalls)
    setShowToolApproval(true)

    // Add a system message to chat
    const approvalMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🔧 **Tool Usage Request**\n\nI would like to use the following tools:\n${toolCalls
        .map((tc) => `• **${tc.function?.name}**: ${tc.function?.description || 'No description'}`)
        .join('\n')}\n\nDo you approve this action?`,
      timestamp: new Date(),
    }

    onMessageAdd(approvalMessage)
  }

  const clearApprovedToolCalls = () => {
    setApprovedToolCalls(null)
  }

  return {
    showToolApproval,
    pendingToolCalls,
    approvedToolCalls,
    handleToolCallApproval,
    requestToolApproval,
    clearApprovedToolCalls,
  }
}
