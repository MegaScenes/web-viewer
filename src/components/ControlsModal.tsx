import React from "react";

import { IconX } from "@tabler/icons-react";
import Key from "./Key";

const ControlsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
	<div className="fixed inset-0 flex items-center justify-center z-50">
		<div className="bg-gray-600 text-white rounded-lg shadow-lg p-4 relative">
			<button
				className="absolute top-2 right-2 text-white"
				onClick={onClose}
			>
				<IconX size={20} stroke={2.5} />
			</button>
			<div className="text-center">
				<p className="text-lg font-semibold">Controls</p>
				<p>Under development...</p>
			</div>
		</div>
	</div>
);

export default ControlsModal;
