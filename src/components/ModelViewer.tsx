import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";

interface ModelViewerProps {
	id: number;
	rec_no: number;
	pointScale: number;
	camScale: number;
	controlsRef: React.MutableRefObject<any>;
	isAxisEnabled: boolean;
	clearScene: boolean;
	onLoaded: () => void;
	onOpenImageModal: (imageData: ImageData, camData: CameraData) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
	id,
	rec_no,
	pointScale,
	camScale,
	controlsRef,
	isAxisEnabled,
	clearScene,
	onLoaded,
	onOpenImageModal,
}) => {
	return (
		<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
			<ambientLight />
			<Scene
				id={id}
				rec_no={rec_no}
				pointScale={pointScale}
				camScale={camScale}
				clearScene={clearScene}
				isAxisEnabled={isAxisEnabled}
				onLoaded={onLoaded}
				onOpenImageModal={onOpenImageModal}
			/>
			<OrbitControls
				ref={controlsRef}
				minDistance={0}
				maxDistance={20}
				rotateSpeed={0.5}
				zoomSpeed={0.5}
				panSpeed={2}
				enableDamping={true}
				dampingFactor={0.2}
			/>
		</Canvas>
	);
};

export default ModelViewer;
