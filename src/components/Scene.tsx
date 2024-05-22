import { useEffect, useState } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { usePointLoader, useImageData } from "../hooks/useCOLMAPLoader";
import Cameras from "./Cameras";
import { useProgress } from "@react-three/drei";

interface SceneProps {
	points: string;
	images: string;
	onLoaded?: () => void;
	clearScene: boolean;
	controlsRef: React.RefObject<any>;
}

const Scene: React.FC<SceneProps> = ({
	points,
	images,
	clearScene,
	onLoaded,
	controlsRef,
}) => {
	const { scene } = useThree();
	const { loaded, total } = useProgress();

	const pointCloud = usePointLoader(points);
	const imgs = useImageData(images);
	const circleTexture = useLoader(
		THREE.TextureLoader,
		"/web-viewer/images/circle.png"
	);
	const [isPointCloudReady, setIsPointCloudReady] = useState(false);
	const [areImagesReady, setAreImagesReady] = useState(false);
	const [axesKey, setAxesKey] = useState(Date.now());

	useEffect(() => {
		if (clearScene) {
			scene.clear();
			setIsPointCloudReady(false);
			setAreImagesReady(false);
			if (controlsRef && controlsRef.current) {
				controlsRef.current.reset();
			}
			setAxesKey(Date.now());
			return;
		}

		if (pointCloud && circleTexture) {
			pointCloud.material = new THREE.PointsMaterial({
				map: circleTexture,
				size: 0.005,
				transparent: true,
				depthWrite: false,
				alphaTest: 0.5,
				vertexColors: true,
			});
			pointCloud.rotation.z = Math.PI;
			setIsPointCloudReady(true);
		}

		if (imgs.length > 0) {
			setAreImagesReady(true);
		}

		if (isPointCloudReady && areImagesReady && loaded === total) {
			setAxesKey(Date.now());
			if (typeof onLoaded === "function") {
				onLoaded();
			}
		}
	}, [
		scene,
		pointCloud,
		circleTexture,
		imgs,
		onLoaded,
		clearScene,
		isPointCloudReady,
		areImagesReady,
		controlsRef,
		loaded,
		total,
	]);

	return (
		<>
			{isPointCloudReady && areImagesReady && (
				<>
					{pointCloud && <primitive object={pointCloud} />}
					<Cameras
						imageData={imgs}
						onAllImagesLoaded={() => setAreImagesReady(true)}
					/>
					<axesHelper args={[10]} key={axesKey} />
				</>
			)}
		</>
	);
};

export default Scene;
