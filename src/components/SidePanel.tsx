import React, { useState, useEffect, useMemo } from "react";
import {
	IconChevronCompactRight,
	IconChevronCompactLeft,
	IconMinusVertical,
} from "@tabler/icons-react";

import Card from "./Card";
import reconMetadata from "../../public/data/recon_metadata.json";
import { SceneType } from "@/types/scene";

interface SidePanelProps {
	isDarkTheme: boolean;
	scene?: SceneType;
	rec_no?: number;
	onSelect: (scene: SceneType, no: number) => void;
	isOpen: boolean;
	togglePanel: (bool: boolean) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
	isDarkTheme,
	scene,
	rec_no,
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
						color={`${isDarkTheme ? "white" : "black"}`}
						stroke={3}
					/>
				);
			case "line":
				return (
					<IconMinusVertical
						size={24}
						color={`${isDarkTheme ? "white" : "black"}`}
						stroke={4}
					/>
				);
			case "left":
				return (
					<IconChevronCompactLeft
						size={24}
						color={`${isDarkTheme ? "white" : "black"}`}
						stroke={3}
					/>
				);
			default:
				return (
					<IconChevronCompactRight
						size={24}
						color={`${isDarkTheme ? "white" : "black"}`}
						stroke={3}
					/>
				);
		}
	};

	// process point + camera metadata
	const reconData = useMemo(() => {
		const dataMap = new Map();
		Object.entries(reconMetadata).forEach(([key, value]) => {
			dataMap.set(parseInt(key, 10), value.slice(2));
		});
		return dataMap;
	}, []);

	return (
		<div className="fixed inset-y-0 left-0 z-20 flex">
			<div
				className={`transform transition-all duration-350 overflow-y-auto ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${
					isDarkTheme ? "bg-greyish" : "bg-lessoffwhite"
				} h-full fixed inset-y-0 left-0 w-96 p-4 shadow-lg flex flex-row justify-center`}
			>
				<div className="flex flex-col w-11/12 mt-2">
					{scene ? (
						<h2
							className={`text-xl font-bold mb-4 ${
								isDarkTheme ? "text-offwhite" : ""
							} break-all`}
						>
							Viewing Reconstruction{" "}
							<span className="text-blue-500">
								#<span className="mr-0.5"></span>
								{rec_no}
							</span>{" "}
							for <br />
							&quot;
							{scene.normalized_name}&quot;:
						</h2>
					) : (
						<>
							<h2
								className={`text-xl font-bold mb-4 ${
									isDarkTheme ? "text-offwhite" : ""
								}`}
							>
								Search for a scene in the search bar!
							</h2>
							<br />
							<h3
								className={`text-sm font-bold mb-4 ${
									isDarkTheme ? "text-offwhite" : ""
								}`}
							>
								Note: some reconstructions take a while to load
								(~1-2 min) due to fetching uncompressed data
								from AWS S3.
							</h3>
						</>
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
											reconData.get(scene.id)[
												index * 2 + 1
											]
										}
										numOfCams={
											reconData.get(scene.id)[index * 2]
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
					className={`${
						isDarkTheme ? "text-offwhite" : ""
					} font-bold py-2 px-4 rounded absolute top-1/2 transform -translate-y-1/2 transition-all duration-350 ${
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
