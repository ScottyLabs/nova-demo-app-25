/**
 * Model capabilities display component
 */

import {
	Eye,
	FileAttachment04,
	MusicNotePlus,
	Palette,
} from "@untitledui/icons";
import type { Model } from "@/types/chat";
import {
	supportsAudioInput,
	supportsImageGeneration,
	supportsImageInput,
} from "@/utils/modelCapabilities";

interface ModelCapabilitiesProps {
	model: Model | undefined;
}

export const ModelCapabilities = ({ model }: ModelCapabilitiesProps) => {
	if (!model) return null;

	return (
		<div className="mt-3">
			<div className="text-xs font-medium text-gray-700 mb-2">
				Capabilities:
			</div>
			<div className="space-y-2">
				{supportsImageInput(model) && (
					<div
						className="px-3 py-2 rounded text-sm flex items-center gap-2"
						style={{
							backgroundColor: "hsla(140, 45%, 94%, 1)",
							color: "hsla(141, 84%, 24%, 1)",
						}}
					>
						<span>
							<Eye className="inline-block align-middle ml-1" />
						</span>
						<span>Can view images</span>
					</div>
				)}
				{supportsAudioInput(model) && (
					<div className="px-3 py-2 rounded text-sm flex items-center gap-2 bg-blue-50 text-blue-700">
						<span>
							<MusicNotePlus className="inline-block align-middle ml-1" />
						</span>
						<span>Can process audio</span>
					</div>
				)}
				<div className="px-3 py-2 rounded text-sm flex items-center gap-2 bg-red-50 text-red-700">
					<span>
						<FileAttachment04 className="inline-block align-middle ml-1" />
					</span>
					<span>Can process PDFs</span>
				</div>
				{supportsImageGeneration(model) && (
					<div className="px-3 py-2 rounded text-sm flex items-center gap-2 bg-purple-50 text-purple-700">
						<span>
							<Palette className="inline-block align-middle ml-1" />
						</span>
						<span>Can generate images</span>
					</div>
				)}
			</div>
		</div>
	);
};
