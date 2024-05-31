"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import("../components/ModelViewer"), {
	ssr: false,
});

import { IconZoomIn, IconZoomOut, IconRefresh } from "@tabler/icons-react";
import OptionsDropdown from "../components/OptionsDropdown";
import SidePanel from "../components/SidePanel";
import SearchBar from "../components/SearchBar";
import { Scene } from "@/types/scene";

const Home: React.FC = () => {
	const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [clearScene, setClearScene] = useState(false);

	const handleSelectScene = (scene: Scene) => {
		setIsLoading(true);
		setClearScene(true);
		setSelectedScene(scene);
		setClearScene(false);
	};

	useEffect(() => {
		if (selectedScene) {
			setIsLoading(true);
		}
	}, [selectedScene]);

	return (
		<>
			<div className="flex flex-col h-screen">
				<div className="absolute top-3 left-0 w-full flex flex-row items-center justify-end px-4 py-2 z-10">
					<div className="flex flex-row items-center justify-between mr-3 gap-2">
						<SearchBar />
						<OptionsDropdown />
					</div>
				</div>
				<div className="flex-grow relative bg-gray-100">
					<div className="absolute w-full h-full bg-darkgrey flex items-center justify-center">
						{isLoading && (
							<div className="flex items-center justify-center absolute inset-0">
								<div className="border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-8 w-8"></div>
							</div>
						)}
						{selectedScene ? (
							<ModelViewer
								key={selectedScene.no}
								points={selectedScene.points!}
								images={selectedScene.images!}
								onLoaded={() => setIsLoading(false)}
								clearScene={clearScene}
							/>
						) : (
							<div className="flex items-center justify-center h-full text-white">
								<span>No scene selected</span>
							</div>
						)}
					</div>

					<button
						className="absolute right-[30px] bottom-[147px] p-3 bg-red-500 rounded-full text-white shadow-lg"
						aria-label="Reset Button"
					>
						<IconRefresh size={24} stroke={1.5} color="white" />
					</button>
					<button
						className="absolute right-[30px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
						aria-label="Zoom In"
					>
						<IconZoomIn size={24} stroke={1.5} color="black" />
					</button>
					<button
						className="absolute right-[91px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
						aria-label="Zoom Out"
					>
						<IconZoomOut size={24} stroke={1.5} color="black" />
					</button>
				</div>
			</div>
			<SidePanel onSelect={handleSelectScene} />
		</>
	);
};

export default Home;
