import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useCOLMAPLoader, useImageData } from "../hooks/useCOLMAPLoader";
import { OrbitControls } from "@react-three/drei";

import Image from "./Image";

interface PointCloudViewerProps {
	pointsUrl: string;
	imagesUrl: string;
}

const ModelViewer: React.FC<PointCloudViewerProps> = ({
	pointsUrl,
	imagesUrl,
}) => {
	const pointCloud = useCOLMAPLoader(pointsUrl);
	const images = useImageData(imagesUrl);

	useEffect(() => {
		if (pointCloud) {
			pointCloud.rotation.z = Math.PI;
		}
	}, [pointCloud]);

	return (
		<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
			<ambientLight />
			<pointLight />
			{pointCloud && <primitive object={pointCloud} />}
			{images.map((imageData) => (
				<Image key={imageData.id} imageData={imageData} />
			))}
			<OrbitControls
				minDistance={0}
				maxDistance={20}
				rotateSpeed={0.5}
				zoomSpeed={0.5}
				panSpeed={0.5}
			/>
			<axesHelper args={[10]} />
		</Canvas>
	);
};

export default ModelViewer;
