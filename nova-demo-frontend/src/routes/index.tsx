import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import "highlight.js/styles/github-dark.css";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
// Components
import { Sidebar } from "@/components/Sidebar";
// Hooks
import { useAvailableModels } from "@/hooks/useAvailableModels";
import { useChatStreaming } from "@/hooks/useChatStreaming";
import { useMCP } from "@/hooks/useMCP";
// Types
import type { AudioData, ImageData, Message, PdfData } from "@/types/chat";

export const Route = createFileRoute("/")({
	component: ChatDemo,
});
function ChatDemo() {
	// State management
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [lastMessage, setLastMessage] = useState<string>("");
	const [inputValue, setInputValue] = useState("");
	const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
	const [uploadedAudio, setUploadedAudio] = useState<AudioData | null>(null);
	const [uploadedPdf, setUploadedPdf] = useState<PdfData | null>(null);
	const [selectedModel, setSelectedModel] = useState(
		"qwen/qwen3-vl-30b-a3b-instruct",
	);
	const [mcpEnabled, setMcpEnabled] = useState(false);
	const [selectedMcpServer, setSelectedMcpServer] = useState("cmu_api");
	const [mcpAutoApprove, setMcpAutoApprove] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Fetch available models
	const { data: availableModels } = useAvailableModels();
	const selectedModelData = availableModels?.find(
		(m) => m.id === selectedModel,
	);

	// MCP integration
	const { mcpServers, mcpTools } = useMCP(mcpEnabled, selectedMcpServer);

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
				role: "assistant",
				content,
				...(image && { image }),
				timestamp: new Date(),
			};

			setChatMessages((prev) => {
				if (prev.length === 0 || prev[prev.length - 1].role !== "assistant") {
					return [...prev, assistantMessage];
				} else {
					const newMessages = [...prev];
					newMessages[newMessages.length - 1] = assistantMessage;
					return newMessages;
				}
			});
		},
	});

	// Message sending handler
	const handleSendMessage = () => {
		if (!inputValue.trim() && !uploadedImage && !uploadedAudio && !uploadedPdf)
			return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content:
				inputValue.trim() ||
				(uploadedImage
					? "Image uploaded"
					: uploadedAudio
						? "Audio uploaded"
						: "PDF uploaded"),
			image: uploadedImage || undefined,
			audio: uploadedAudio || undefined,
			pdf: uploadedPdf || undefined,
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userMessage]);
		setLastMessage(
			inputValue.trim() ||
				(uploadedImage
					? "Describe this image"
					: uploadedAudio
						? "Transcribe this audio"
						: "Analyze this document"),
		);

		// Reset inputs
		setInputValue("");
		setUploadedImage(null);
		setUploadedAudio(null);
		setUploadedPdf(null);
	};

	// Handle model selection and close sidebar on mobile
	const handleModelSelect = (modelId: string) => {
		setSelectedModel(modelId);
		// Close sidebar on mobile after selection
		if (window.innerWidth < 1024) {
			setSidebarOpen(false);
		}
	};

	return (
		<div className="flex bg-white text-black overflow-hidden">
			{/* Mobile Menu Button */}
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
				aria-label="Toggle sidebar"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					{sidebarOpen ? (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					) : (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					)}
				</svg>
			</button>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 lg:w-80
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
			>
				<Sidebar
					availableModels={availableModels}
					selectedModel={selectedModel}
					onModelSelect={handleModelSelect}
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
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col h-screen w-full lg:w-auto">
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
	);
}
