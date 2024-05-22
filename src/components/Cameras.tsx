import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Image from "./Image";
import type { ImageData } from "../hooks/useCOLMAPLoader";

interface CamerasProps {
	imageData: ImageData[];
	onAllImagesLoaded: () => void;
}

const Cameras: React.FC<CamerasProps> = ({ imageData, onAllImagesLoaded }) => {
	const groupRef = useRef<THREE.Group>(null);
	const [loadedCount, setLoadedCount] = useState(0);

	useEffect(() => {
		if (loadedCount === imageData.length) {
			onAllImagesLoaded();
		}
	}, [loadedCount, imageData.length, onAllImagesLoaded]);

	const handleImageLoaded = () => {
		setLoadedCount((prev) => prev + 1);
	};

	useEffect(() => {
		if (groupRef.current) {
			const scene = groupRef.current.parent;
			if (scene) {
				scene.add(groupRef.current);
			}
		}

		return () => {
			if (groupRef.current) {
				const scene = groupRef.current.parent;
				if (scene) {
					scene.remove(groupRef.current);
				}
			}
		};
	}, []);

	return (
		<group ref={groupRef}>
			{imageData.map((image, index) => (
				<Image
					key={index}
					imageData={image}
					onLoaded={handleImageLoaded}
				/>
			))}
		</group>
	);
};

export default Cameras;
