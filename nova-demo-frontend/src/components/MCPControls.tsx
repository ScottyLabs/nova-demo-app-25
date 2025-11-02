/**
 * MCP (Model Context Protocol) configuration panel
 */

interface MCPControlsProps {
  mcpEnabled: boolean
  onMcpEnabledChange: (enabled: boolean) => void
  selectedMcpServer: string
  onMcpServerChange: (server: string) => void
  mcpServers: string[]
  mcpAutoApprove: boolean
  onMcpAutoApproveChange: (autoApprove: boolean) => void
  mcpTools: any[]
}

export const MCPControls = ({
  mcpEnabled,
  onMcpEnabledChange,
  selectedMcpServer,
  onMcpServerChange,
  mcpServers,
  mcpTools,
}: MCPControlsProps) => {
  return (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
    <input
      type="checkbox"
      checked={mcpEnabled}
      onChange={(e) => onMcpEnabledChange(e.target.checked)}
      className="rounded"
    />
    <span className="font-medium">Enable MCP Tools</span>
    </label>
    
    {mcpEnabled && (
    <>
      <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">MCP Server:</label>
      <select
        value={selectedMcpServer}
        onChange={(e) => onMcpServerChange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {mcpServers.map((server) => (
        <option key={server} value={server}>
          {server}
        </option>
        ))}
      </select>
      </div>

      {mcpTools.length > 0 && (
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Available Tools:</div>
        <div className="space-y-1">
        {mcpTools.map((tool, index) => (
          <div
          key={index}
          className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs flex items-center gap-1"
          >
          <span>🔧</span>
          <span>{tool.function?.name || 'Unknown'}</span>
          </div>
        ))}
        </div>
      </div>
      )}

      {mcpTools.length === 0 && (
      <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-2 rounded flex items-center gap-1">
        <span>⚠️</span>
        <span>No MCP tools available</span>
      </div>
      )}
    </>
    )}
  </div>
  )
}
