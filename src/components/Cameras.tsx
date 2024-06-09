import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Camera from "./Camera";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";

interface CamerasProps {
	imageData: ImageData[];
	camData: CameraData[];
	scale: number;
	onAllImagesLoaded: () => void;
}

const Cameras: React.FC<CamerasProps> = ({
	imageData,
	camData,
	scale,
	onAllImagesLoaded,
}) => {
	const groupRef = useRef<THREE.Group>(null);
	const [loadedCount, setLoadedCount] = useState(0);

	useEffect(() => {
		if (loadedCount === imageData.length) {
			onAllImagesLoaded();
		}
	}, [loadedCount, imageData.length, onAllImagesLoaded]);

	const handleImageLoaded = useCallback(() => {
		setLoadedCount((prev) => prev + 1);
	}, []);

	useEffect(() => {
		const currentGroup = groupRef.current;

		if (currentGroup && currentGroup.parent) {
			currentGroup.parent.add(currentGroup);
		}

		return () => {
			if (currentGroup && currentGroup.parent) {
				currentGroup.parent.remove(currentGroup);
			}
		};
	}, []);

	return (
		<group ref={groupRef}>
			{imageData.map((image, index) => (
				<Camera
					key={image.id}
					imageData={image}
					camData={camData.find(
						(cam) => cam.cameraId === image.cameraId
					)}
					scale={scale}
					onLoaded={handleImageLoaded}
				/>
			))}
		</group>
	);
};

export default Cameras;
