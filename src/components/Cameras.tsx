import React, { useEffect, useState } from "react";
import Image from "./Image";
import type { ImageData } from "../hooks/useCOLMAPLoader";

interface CamerasProps {
	imageData: ImageData[];
	onAllImagesLoaded: () => void;
}

const Cameras: React.FC<CamerasProps> = ({ imageData, onAllImagesLoaded }) => {
	const [loadedCount, setLoadedCount] = useState(0);

	useEffect(() => {
		if (loadedCount === imageData.length) {
			onAllImagesLoaded();
		}
	}, [loadedCount, imageData.length, onAllImagesLoaded]);

	const handleImageLoaded = () => {
		setLoadedCount((prev) => prev + 1);
	};

	return (
		<>
			{imageData.map((image, index) => (
				<Image
					key={index}
					imageData={image}
					onLoaded={handleImageLoaded}
				/>
			))}
		</>
	);
};

export default Cameras;
