import React, { useState } from "react";
import {
	IconChevronCompactRight,
	IconChevronCompactLeft,
	IconMinusVertical,
} from "@tabler/icons-react";

import Card from "./Card";
import { Scene } from "@/types/scene";

interface SidePanelProps {
	onSelect: (data: Scene) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ onSelect }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [iconState, setIconState] = useState("right");

	const togglePanel = () => {
		if (isOpen) {
			setIsOpen(false);
			setIconState("right");
		} else {
			setIsOpen(true);
			setIconState("line");
		}
	};

	const handleMouseEnter = () => {
		if (isOpen && iconState === "line") {
			setIconState("left");
		}
	};

	const handleMouseLeave = () => {
		if (isOpen) {
			setIconState("line");
		}
	};

	const getIcon = () => {
		switch (iconState) {
			case "right":
				return (
					<IconChevronCompactRight
						size={24}
						color="white"
						stroke={3}
					/>
				);
			case "line":
				return <IconMinusVertical size={24} color="white" stroke={4} />;
			case "left":
				return (
					<IconChevronCompactLeft
						size={24}
						color="white"
						stroke={3}
					/>
				);
			default:
				return (
					<IconChevronCompactRight
						size={24}
						color="white"
						stroke={3}
					/>
				);
		}
	};

	// random data
	const scenes: Scene[] = [
		{
			name: "Garden",
			imgUrl: "/web-viewer/images/garden.jpeg",
			points: "/data/garden/0/points3D.bin",
			images: "/data/garden/0/images.bin",
		},
		{
			name: "Statue of Liberty",
			imgUrl: "/web-viewer/images/statue_of_liberty.jpeg",
			points: "/data/statue_of_liberty/5/points3D.bin",
			images: "/data/statue_of_liberty/5/images.bin",
		},
		{
			name: "Qutb Minar",
			imgUrl: "/web-viewer/images/qutb_minar.jpeg",
			points: "/data/qutb_minar/2/points3D.bin",
			images: "/data/qutb_minar/2/images.bin",
		},
	];

	return (
		<div className="fixed inset-y-0 left-0 z-20 flex">
			<div
				className={`transform transition-all duration-350 overflow-y-auto ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} bg-greyish h-full fixed inset-y-0 left-0 w-96 p-4 shadow-lg flex flex-row justify-center`}
			>
				<div className="flex flex-col w-11/12 mt-2">
					<h2 className="text-xl font-bold mb-4 text-whiteish">
						Results
					</h2>
					<div className="flex flex-col gap-4">
						{scenes.map((scene, index) => (
							<Card
								key={index}
								scene={scene}
								onClick={onSelect}
							/>
						))}
					</div>
				</div>
			</div>
			<div
				className="relative flex items-center"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<button
					onClick={togglePanel}
					className={`text-white font-bold py-2 px-4 rounded absolute top-1/2 transform -translate-y-1/2 transition-all duration-350 ${
						isOpen ? "translate-x-64" : "translate-x-0"
					}`}
					style={{
						zIndex: 21,
						transform: `translate(${
							isOpen ? "calc(24rem - 10px)" : "-10px"
						}, -50%)`,
					}}
				>
					{getIcon()}
				</button>
			</div>
		</div>
	);
};

export default SidePanel;
