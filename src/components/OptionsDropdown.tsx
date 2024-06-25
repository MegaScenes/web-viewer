import React, { useRef, useEffect } from "react";
import {
	IconCaretDownFilled,
	IconCaretUpFilled,
	IconDownload,
	IconHospital,
	IconBrandGithub,
	IconAppWindow,
	IconKeyboard,
	IconAxisX,
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
	isMenuOpen: boolean;
	isAxisEnabled: boolean;
	isModalOpen: boolean;
	onChangeHUD: () => void;
	onOpenModal: () => void;
	onCloseModal: () => void;
	onAxisToggle: () => void;
	toggleMenu: (value: boolean) => void;
}

const getId = (id: number): string => {
	const paddedId = id.toString().padStart(6, "0");
	const urlSegment = `${paddedId.slice(0, 3)}/${paddedId.slice(3, 6)}`;
	return urlSegment;
};

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
	id,
	rec_no,
	isMenuOpen,
	isAxisEnabled,
	isModalOpen,
	onChangeHUD,
	onOpenModal,
	onCloseModal,
	onAxisToggle,
	toggleMenu,
}) => {
	const ref = useRef<HTMLDivElement>(null);

	const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		toggleMenu(!isMenuOpen);
	};

	const downloadFile = async (fileType: string) => {
		if (id !== undefined && rec_no != undefined) {
			const fileUrl = `${S3_BASE_URL}${encodeURIComponent(
				getId(id)
			)}/colmap/${encodeURIComponent(rec_no.toString())}/${fileType}`;
			try {
				const response = await fetch(fileUrl);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const blob = await response.blob(); // directly handle as blob
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
			id: "shortcuts",
			label: "Shortcuts",
			icon: <IconKeyboard size={16} stroke={2.5} />,
			onClick: () => {
				onOpenModal();
				toggleMenu(false);
			},
		},
		{
			id: "hud",
			label: "Hide HUD",
			icon: <IconHospital size={16} stroke={2.5} />,
			onClick: () => {
				onChangeHUD();
				toggleMenu(false);
			},
		},
		{
			id: "axis",
			label: isAxisEnabled ? "Hide Axis" : "Show Axis",
			icon: <IconAxisX size={16} stroke={2.5} />,
			onClick: () => {
				onAxisToggle();
				toggleMenu(false);
			},
		},
		{
			id: "download",
			label: "Download",
			icon: <IconDownload size={16} stroke={3} />,
			onClick: () => {
				downloadFile("images.bin");
				downloadFile("points3D.bin");
				downloadFile("cameras.bin");
				toggleMenu(false);
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
				toggleMenu(false);
			},
		},
		{
			id: "website",
			label: "Website",
			icon: <IconAppWindow size={16} stroke={2.5} />,
			onClick: () => {
				window.open("https://megascenes.github.io/", "_blank");
				toggleMenu(false);
			},
		},
	];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				toggleMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref, toggleMenu]);
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
					{isMenuOpen ? (
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
			{isMenuOpen && (
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
			{isModalOpen && <ControlsModal onClose={onCloseModal} />}
		</div>
	);
};

export default OptionsDropdown;
