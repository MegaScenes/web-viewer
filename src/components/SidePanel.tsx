import React, { useState, useEffect } from "react";
import {
	IconChevronCompactRight,
	IconChevronCompactLeft,
	IconMinusVertical,
} from "@tabler/icons-react";

import Card from "./Card";
import { SceneType } from "@/types/scene";

interface SidePanelProps {
	scene?: SceneType;
	rec_no?: number;
	numOfPts?: number;
	numOfCams?: number;
	onSelect: (scene: SceneType, no: number) => void;
	isOpen: boolean;
	togglePanel: (bool: boolean) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
	scene,
	rec_no,
	numOfPts,
	numOfCams,
	isOpen,
	togglePanel,
}) => {
	const [iconState, setIconState] = useState<string>("right");

	useEffect(() => {
		if (isOpen) {
			setIconState("line");
		} else {
			setIconState("right");
		}
	}, [isOpen]);

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

	return (
		<div className="fixed inset-y-0 left-0 z-20 flex">
			<div
				className={`transform transition-all duration-350 overflow-y-auto ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} bg-greyish h-full fixed inset-y-0 left-0 w-96 p-4 shadow-lg flex flex-row justify-center`}
			>
				<div className="flex flex-col w-11/12 mt-2">
					{scene ? (
						<h2 className="text-xl font-bold mb-4 text-offwhite break-all">
							Viewing Reconstruction{" "}
							<span className="text-blue-500">{rec_no}</span> for{" "}
							{"\n"}
							&quot;
							{scene.normalized_name}&quot;:
						</h2>
					) : (
						<h2 className="text-xl font-bold mb-4 text-offwhite">
							Search for a scene in the search bar!
						</h2>
					)}
					<div className="flex flex-col gap-4">
						{scene &&
							Array.from(
								{ length: scene.no_of_rec },
								(_, index) => (
									<Card
										key={index}
										rec_no={index}
										scene={scene}
										numOfPts={
											index === rec_no
												? numOfPts
												: undefined
										}
										numOfCams={
											index === rec_no
												? numOfCams
												: undefined
										}
										isSelected={
											rec_no !== undefined &&
											index === rec_no
										}
									/>
								)
							)}
					</div>
				</div>
			</div>
			<div
				className="relative flex items-center"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<button
					onClick={() => {
						togglePanel(!isOpen);
					}}
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
