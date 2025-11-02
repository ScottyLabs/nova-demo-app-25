/**
 * Tool call approval modal dialog
 */

import type { ToolCall } from '@/types/chat'
import { Tool01 } from '@untitledui/icons'

interface ToolApprovalModalProps {
  show: boolean
  toolCalls: ToolCall[]
  onApprove: () => void
  onDecline: () => void
}

export const ToolApprovalModal = ({
  show,
  toolCalls,
  onApprove,
  onDecline,
}: ToolApprovalModalProps) => {
  if (!show) return null

  return (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 border border-black/20 rounded-lg p-6 max-w-md w-full mx-4">
    <h3 className="text-lg font-semibold mb-4 text-black">🔧 Tool Usage Request</h3>
    <p className="text-black/80 mb-4">The AI wants to use the following tools:</p>
    <div className="space-y-2 mb-6">
      {toolCalls.map((toolCall, index) => (
      <div key={index} className="bg-white/10 rounded p-3">
        <div className="font-medium text-black">
        <Tool01 className="inline-block align-middle ml-1" /> {toolCall.function?.name || 'Unknown Tool'}
        </div>
        {toolCall.function?.description && (
        <div className="text-sm text-black/70 mt-1">{toolCall.function.description}</div>
        )}
        <div className="text-xs text-black/60 mt-2">
        Arguments:{' '}
        {JSON.stringify(JSON.parse(toolCall.function?.arguments || '{}'), null, 2)}
        </div>
      </div>
      ))}
    </div>
    <p className="text-black/80 mb-4">Do you approve this action?</p>
    <div className="flex gap-3">
      <button
      onClick={onApprove}
      className="flex-1 text-black px-4 py-2 rounded font-medium transition-colors"
      style={{ backgroundColor: 'hsla(0, 0%, 96%, 1)' }}
      >
      ✅ Approve
      </button>
      <button
      onClick={onDecline}
      className="flex-1 text-black px-4 py-2 rounded font-medium transition-colors"
      style={{ backgroundColor: 'hsla(0, 0%, 96%, 1)' }}
      >
      ❌ Decline
      </button>
    </div>
    </div>
  </div>
  )
}
