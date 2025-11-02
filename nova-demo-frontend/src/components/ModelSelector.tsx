/**
 * Model selection dropdown with search functionality
 */

import { useRef, useEffect, useState } from 'react'
import type { Model } from '@/types/chat'
import {
  supportsImageInput,
  supportsAudioInput,
  supportsImageGeneration,
} from '@/utils/modelCapabilities'
import { Eye, MusicNotePlus, Palette } from '@untitledui/icons'

interface ModelSelectorProps {
  availableModels: Model[] | undefined
  selectedModel: string
  onModelSelect: (modelId: string) => void
  disabled?: boolean
}

export const ModelSelector = ({
  availableModels,
  selectedModel,
  onModelSelect,
  disabled = false,
}: ModelSelectorProps) => {
  const [modelSearchOpen, setModelSearchOpen] = useState(false)
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const modelSearchRef = useRef<HTMLDivElement>(null)

  const selectedModelData = availableModels?.find((m) => m.id === selectedModel)

  // Filter models based on search query
  const filteredModels =
  availableModels?.filter(
    (model) =>
    (model.name || model.id).toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
  ) || []

  // Close dropdown when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (modelSearchRef.current && !modelSearchRef.current.contains(event.target as Node)) {
    setModelSearchOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
  }, [])

  return (
  <div className="relative" ref={modelSearchRef}>
    <button
    onClick={() => setModelSearchOpen(!modelSearchOpen)}
    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-left flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-clip"
    disabled={disabled}
    >
    <div className="flex items-center justify-between flex-1">
      <span className="truncate text-sm">{selectedModelData?.name || selectedModel}</span>
      <div className="flex items-center gap-1 ml-2">
      {selectedModelData && supportsImageInput(selectedModelData) && (
        <span 
          className="text-xs" 
          style={{ color: '#0A712E' }}
          title="Supports image input"
        >
        <Eye className="inline-block align-middle ml-1" /> 
        </span>
      )}
      {selectedModelData && supportsAudioInput(selectedModelData) && (
        <span className="text-xs text-blue-600" title="Supports audio input">
        <MusicNotePlus className="inline-block align-middle ml-1" />
        </span>
      )}
      {selectedModelData && supportsImageGeneration(selectedModelData) && (
        <span className="text-xs text-purple-600" title="Can generate images">
        <Palette className="inline-block align-middle ml-1" />
        </span>
      )}
      </div>
    </div>
    <svg
      className={`w-4 h-4 transition-transform text-gray-600 ${modelSearchOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </button>

    {modelSearchOpen && (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
      <div className="w-full p-2 border-b border-gray-200">
      <input
        type="text"
        placeholder="Search models..."
        value={modelSearchQuery}
        onChange={(e) => setModelSearchQuery(e.target.value)}
        className="bg-gray-50 w-full border border-gray-300 rounded px-2 py-1 text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      </div>
      <div className="max-h-40 overflow-y-auto">
      {filteredModels.length === 0 ? (
        <div className="p-3 text-gray-500 text-sm">No models found</div>
      ) : (
        filteredModels.map((model) => (
        <button
          key={model.id}
          onClick={() => {
          onModelSelect(model.id)
          setModelSearchOpen(false)
          setModelSearchQuery('')
          }}
          className={`w-full text-left p-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
          selectedModel === model.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-900">{model.name || model.id}</div>
            <div className="text-xs text-gray-600 truncate">{model.id}</div>
          </div>
          <div className="flex gap-1">
            {supportsImageInput(model) && (
            <span
              className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: '#E9F7EF', color: '#0A712E' }}
              title="Supports image input"
            >
                <Eye className="inline-block align-middle ml-1" />
            </span>
            )}
            {supportsAudioInput(model) && (
            <span
              className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded"
              title="Supports audio input"
            >
                <MusicNotePlus className="inline-block align-middle ml-1" />
            </span>
            )}
            {supportsImageGeneration(model) && (
            <span
              className="text-xs bg-purple-50 text-purple-600 px-1 py-0.5 rounded"
              title="Can generate images"
            >
              <Palette className="inline-block align-middle ml-1" />
            </span>
            )}
          </div>
          </div>
        </button>
        ))
      )}
      </div>
    </div>
    )}
  </div>
  )
}
