import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

interface ModelViewerProps {
	id: number;
	no: number;
	pointScale: number;
	camScale: number;
	controlsRef: React.MutableRefObject<any>;
	onLoaded: () => void;
	clearScene: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
	id,
	no,
	pointScale,
	camScale,
	controlsRef,
	onLoaded,
	clearScene,
}) => {
	return (
		<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
			<ambientLight />
			<pointLight />
			<Scene
				id={id}
				no={no}
				pointScale={pointScale}
				camScale={camScale}
				clearScene={clearScene}
				onLoaded={onLoaded}
				controlsRef={controlsRef}
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
