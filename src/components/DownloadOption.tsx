import React from "react";

interface DownloadOptionProps {
	label: string;
	onClick: () => void;
	url?: string;
	isDownload: boolean;
}

const DownloadOption: React.FC<DownloadOptionProps> = ({
	label,
	onClick,
	url = "",
	isDownload = false,
}) => {
	return (
		<a
			href={url}
			onClick={onClick}
			className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
			download={isDownload}
		>
			{label}
		</a>
	);
};

export default DownloadOption;
