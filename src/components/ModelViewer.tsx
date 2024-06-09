import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

interface ModelViewerProps {
	id: number;
	no: number;
	updateCounts: (pts: number, cams: number) => void;
	onLoaded: () => void;
	clearScene: boolean;
}

const MAX_SCALE = 5;
const MIN_SCALE = 0.2;

const ModelViewer: React.FC<ModelViewerProps> = ({
	id,
	no,
	updateCounts,
	onLoaded,
	clearScene,
}) => {
	const controlsRef = useRef<any>(null);
	const [scale, setScale] = useState<number>(1);
	const holdingAlt = useRef(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.altKey) {
				holdingAlt.current = true;
				if (controlsRef.current) {
					controlsRef.current.enableZoom = false;
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Alt") {
				holdingAlt.current = false;
				if (controlsRef.current) {
					controlsRef.current.enableZoom = true;
				}
			}
		};

		const handleWheel = (event: WheelEvent) => {
			if (holdingAlt.current) {
				event.preventDefault(); // prevent the page from scrolling
				const newScale = scale + (event.deltaY > 0 ? -0.05 : 0.05); // adjust scale based on scroll direction
				setScale(Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("wheel", handleWheel);
		};
	}, [scale, MIN_SCALE, MAX_SCALE]);

	return (
		<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
			<ambientLight />
			<pointLight />
			<Scene
				id={id}
				no={no}
				scale={scale}
				updateCounts={updateCounts}
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
