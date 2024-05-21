import React, { useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { usePointLoader, useImageData } from "../hooks/useCOLMAPLoader";
import { OrbitControls } from "@react-three/drei";

import Image from "./Image";

interface ModelViewerProps {
	points: string;
	images: string;
	onLoaded?: () => void;
	clearScene: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
	points,
	images,
	onLoaded,
	clearScene,
}) => {
	const [isReady, setIsReady] = useState(false);

	const pointCloud = usePointLoader(points);
	const imgs = useImageData(images);
	const circleTexture = useLoader(
		THREE.TextureLoader,
		"/web-viewer/images/circle.png"
	);

	useEffect(() => {
		setIsReady(false); // Reset ready state on clearScene change
		if (!clearScene && pointCloud && circleTexture && imgs.length > 0) {
			pointCloud.material = new THREE.PointsMaterial({
				map: circleTexture,
				size: 0.005,
				transparent: true,
				depthWrite: false,
				alphaTest: 0.5,
				vertexColors: true,
			});
			pointCloud.rotation.z = Math.PI;
			setIsReady(true);
			if (typeof onLoaded === "function") {
				onLoaded();
			}
		}
	}, [pointCloud, circleTexture, imgs, onLoaded, clearScene]);

	return (
		<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
			<ambientLight />
			<pointLight />
			{isReady && pointCloud && <primitive object={pointCloud} />}
			{isReady &&
				imgs.map((imageData) => (
					<Image key={imageData.id} imageData={imageData} />
				))}
			<OrbitControls
				minDistance={0}
				maxDistance={20}
				rotateSpeed={0.5}
				zoomSpeed={0.5}
				panSpeed={2}
			/>
			<axesHelper args={[10]} />
		</Canvas>
	);
};

export default ModelViewer;
