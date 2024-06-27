import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import Camera from "./Camera";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";

interface CamerasProps {
	imageData: ImageData[];
	camData: CameraData[];
	camScale: number;
	onAllImagesLoaded: () => void;
	onOpenImageModal: (imageData: ImageData, camData: CameraData) => void;
}

const Cameras: React.FC<CamerasProps> = ({
	imageData,
	camData,
	camScale,
	onAllImagesLoaded,
	onOpenImageModal,
}) => {
	const { camera, gl } = useThree();
	const groupRef = useRef<THREE.Group>(null);
	const lastTapRef = useRef(0);
	const [loadedCount, setLoadedCount] = useState(0);
	const [planeMeshes, setPlaneMeshes] = useState<THREE.Mesh[]>([]);
	const [lineMeshes, setLineMeshes] = useState<THREE.Line[]>([]);
	const [selectedCamera, setSelectedCamera] = useState<THREE.Mesh | null>(
		null
	);

	useEffect(() => {
		if (loadedCount === imageData.length) {
			onAllImagesLoaded();
		}
	}, [loadedCount, imageData.length, onAllImagesLoaded]);

	const handleImageLoaded = useCallback(() => {
		setLoadedCount((prev) => prev + 1);
	}, []);

	const handlePlaneRef = useCallback(
		(mesh: THREE.Mesh | null | undefined) => {
			if (!mesh) {
				setPlaneMeshes([]);
				return;
			}
			setPlaneMeshes((prev) => [
				...prev.filter((m) => m.uuid !== mesh.uuid),
				mesh,
			]);
		},
		[]
	);

	const handleLineRef = useCallback((line: THREE.Line | null | undefined) => {
		if (!line) {
			setLineMeshes([]);
			return;
		}
		setLineMeshes((prev) => [
			...prev.filter((l) => l.uuid !== line.uuid),
			line,
		]);
	}, []);

	const handleDoubleClick = useCallback(
		(x: number, y: number) => {
			// Adjusted to accept coordinates directly
			const raycaster = new THREE.Raycaster();
			const mouse = new THREE.Vector2(
				(x / window.innerWidth) * 2 - 1,
				-(y / window.innerHeight) * 2 + 1
			);

			raycaster.setFromCamera(mouse, camera);

			const intersects = raycaster.intersectObjects(planeMeshes, true);

			if (selectedCamera) {
				(
					selectedCamera.material as THREE.MeshStandardMaterial
				).color.set("red");
				const prevLines = lineMeshes.filter(
					(line) => line.userData.planeId === selectedCamera.uuid
				);
				prevLines.forEach((line: THREE.Line) => {
					(line.material as THREE.LineBasicMaterial).color.set("red");
				});
			}

			if (intersects.length > 0) {
				const cam = intersects[0].object as THREE.Mesh;
				setSelectedCamera(cam as THREE.Mesh);

				(cam.material as THREE.MeshStandardMaterial).color.set(
					"rgb(255, 0, 255)"
				);
				const lines = lineMeshes.filter(
					(line) => line.userData.planeId === cam.uuid
				);

				lines.forEach((line: THREE.Line) => {
					(line.material as THREE.LineBasicMaterial).color.set(
						"rgb(255, 0, 255)"
					);
				});

				onOpenImageModal(cam.userData.imageData, cam.userData.camData);
			}
		},
		[planeMeshes, lineMeshes, camera, selectedCamera, onOpenImageModal]
	);

	useEffect(() => {
		const handleDbClick = (event: MouseEvent) => {
			handleDoubleClick(event.clientX, event.clientY);
		};

		const handleTchEnd = (event: TouchEvent) => {
			const now = Date.now();
			const doubleTapDelay = 300;

			// Ensure there's a touch event and check the double-tap timing
			if (
				event.changedTouches.length > 0 &&
				now - lastTapRef.current < doubleTapDelay
			) {
				const touch = event.changedTouches[0];
				handleDoubleClick(touch.clientX, touch.clientY);
			}

			lastTapRef.current = now;
		};
		gl.domElement.addEventListener("dblclick", handleDbClick);
		gl.domElement.addEventListener("touchend", handleTchEnd);

		return () => {
			gl.domElement.removeEventListener("dblclick", handleDbClick);
			gl.domElement.removeEventListener("touchend", handleTchEnd);
		};
	}, [handleDoubleClick, gl.domElement]);

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
					camScale={camScale}
					onLoaded={handleImageLoaded}
					onPlaneRef={handlePlaneRef}
					onLineRef={handleLineRef}
				/>
			))}
		</group>
	);
};

export default Cameras;
