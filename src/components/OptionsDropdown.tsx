import React, { useState, useRef, useEffect } from "react";
import {
	IconCaretDownFilled,
	IconCaretUpFilled,
	IconBrightnessFilled,
	IconDownload,
	IconHospital,
	IconBrandGithub,
	IconAppWindow,
	IconKeyboard,
} from "@tabler/icons-react";
import ControlsModal from "./ControlsModal";

const S3_BASE_URL =
	"https://megascenes.s3.us-west-2.amazonaws.com/reconstruct/";

interface Option {
	id: string;
	label: string;
	icon: JSX.Element;
	onClick: () => void;
}

interface OptionsDropdownProps {
	id?: number;
	rec_no?: number;
	onChangeTheme: () => void;
	onChangeHUD: () => void;
}

const getId = (id: number): string => {
	const paddedId = id.toString().padStart(6, "0");
	const urlSegment = `${paddedId.slice(0, 3)}/${paddedId.slice(3, 6)}`;
	return urlSegment;
};

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
	id,
	rec_no,
	onChangeTheme,
	onChangeHUD,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setIsOpen(!isOpen);
	};

	const downloadFile = async (fileType: string) => {
		if (id && rec_no) {
			const fileUrl = `${S3_BASE_URL}${encodeURIComponent(
				getId(id)
			)}/colmap/${encodeURIComponent(rec_no.toString())}/${fileType}`;
			try {
				const response = await fetch(fileUrl);
				const blob = await response.blob(); // Directly handle as blob
				const href = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = href;
				link.download = fileType;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(href);
			} catch (error) {
				console.error("Error downloading the file:", error);
			}
		}
	};

	const options: Option[] = [
		{
			id: "hud",
			label: "Hide HUD",
			icon: <IconHospital size={16} stroke={2.5} />,
			onClick: () => onChangeHUD(),
		},
		{
			id: "theme",
			label: "Swap Theme",
			icon: <IconBrightnessFilled size={16} />,
			onClick: () => onChangeTheme(),
		},
		{
			id: "controls",
			label: "Controls",
			icon: <IconKeyboard size={16} stroke={2.5} />,
			onClick: () => setIsModalOpen(true),
		},
		{
			id: "download",
			label: "Download",
			icon: <IconDownload size={16} stroke={3} />,
			onClick: () => {
				downloadFile("images.bin");
				downloadFile("points3D.bin");
				downloadFile("cameras.bin");
			},
		},
		{
			id: "github",
			label: "Github",
			icon: <IconBrandGithub size={16} stroke={2.5} />,
			onClick: () => {
				window.open(
					"https://github.com/MegaScenes/web-viewer/",
					"_blank"
				);
			},
		},
		{
			id: "website",
			label: "Website",
			icon: <IconAppWindow size={16} stroke={2.5} />,
			onClick: () => {
				window.open("https://megascenes.github.io/", "_blank");
			},
		},
	];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref]);
	return (
		<div className="relative" ref={ref}>
			<button
				className="bg-gray-600 pl-5 pr-5 pt-2 pb-2 rounded-full shadow-lg"
				onClick={toggleDropdown}
			>
				<div className="flex flex-row items-center justify-center gap-3">
					<span className="text-white font-medium font-sans">
						Options
					</span>
					{isOpen ? (
						<IconCaretUpFilled
							size={16}
							stroke={1.5}
							color="white"
						/>
					) : (
						<IconCaretDownFilled
							size={16}
							stroke={1.5}
							color="white"
						/>
					)}
				</div>
			</button>
			{isOpen && (
				<ul className="absolute bg-white shadow-md mt-2 rounded-md w-full z-10">
					{options.map((option, index) => (
						<li
							key={option.id}
							className={`p-2 hover:bg-gray-200 cursor-pointer ${
								index === 0 ? "rounded-t-md" : ""
							} ${
								index === options.length - 1
									? "rounded-b-md"
									: ""
							}`}
							onClick={option.onClick}
						>
							<div className="flex flex-row justify-between items-center">
								<span className="font-medium text-sm">
									{option.label}
								</span>
								<div>{option.icon}</div>
							</div>
						</li>
					))}
				</ul>
			)}
			{isModalOpen && (
				<ControlsModal onClose={() => setIsModalOpen(false)} />
			)}
		</div>
	);
};

export default OptionsDropdown;
