/**
 * Sidebar with model selection and MCP controls
 */

import type { Model } from "@/types/chat";
import { MCPControls } from "./MCPControls";
import { ModelCapabilities } from "./ModelCapabilities";
import { ModelSelector } from "./ModelSelector";

interface SidebarProps {
	availableModels: Model[] | undefined;
	selectedModel: string;
	onModelSelect: (modelId: string) => void;
	currentlyStreaming: boolean;
	selectedModelData: Model | undefined;
	mcpEnabled: boolean;
	onMcpEnabledChange: (enabled: boolean) => void;
	selectedMcpServer: string;
	onMcpServerChange: (server: string) => void;
	mcpServers: string[];
	mcpTools: any[];
}

export const Sidebar = ({
	availableModels,
	selectedModel,
	onModelSelect,
	currentlyStreaming,
	selectedModelData,
	mcpEnabled,
	onMcpEnabledChange,
	selectedMcpServer,
	onMcpServerChange,
	mcpServers,
	mcpTools,
}: SidebarProps) => {
	return (
		<div className="bg-gray-50 border-r border-gray-200 p-4 lg:p-6 overflow-y-auto flex flex-col gap-4 lg:gap-6 h-screen overflow-scroll">
			<div>
				<h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900">
					Model Settings
				</h2>

				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium text-gray-700 block mb-2">
							Select Model:
						</label>
						<ModelSelector
							availableModels={availableModels}
							selectedModel={selectedModel}
							onModelSelect={onModelSelect}
							disabled={currentlyStreaming}
						/>
					</div>

					<ModelCapabilities model={selectedModelData} />
				</div>
			</div>

			<div className="border-t border-gray-200 pt-4 lg:pt-6">
				<h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900">
					MCP Settings
				</h2>
				<MCPControls
					mcpEnabled={mcpEnabled}
					onMcpEnabledChange={onMcpEnabledChange}
					selectedMcpServer={selectedMcpServer}
					onMcpServerChange={onMcpServerChange}
					mcpServers={mcpServers}
					mcpTools={mcpTools}
				/>
			</div>
		</div>
	);
};
