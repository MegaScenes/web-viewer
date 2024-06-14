import { useEffect, useState, useCallback } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
	usePointLoader,
	useImageData,
	useCameraData,
} from "../hooks/useCOLMAPLoader";
import Cameras from "./Cameras";
import { useProgress } from "@react-three/drei";

interface SceneProps {
	id: number;
	no: number;
	pointScale: number;
	camScale: number;
	onLoaded?: () => void;
	updateCounts: (pts: number, cams: number) => void;
	clearScene: boolean;
	controlsRef: React.RefObject<any>;
}

const Scene: React.FC<SceneProps> = ({
	id,
	no,
	pointScale,
	camScale,
	onLoaded,
	updateCounts,
	clearScene,
	controlsRef,
}) => {
	const { scene } = useThree();
	const { loaded, total } = useProgress();
	const [pointCloud, setPointCloud] = useState<THREE.Points | null>(null);

	const geometry = usePointLoader(id, no);
	const imgs = useImageData(id, no);
	const cams = useCameraData(id, no);
	const circleTexture = useLoader(
		THREE.TextureLoader,
		"/web-viewer/images/circle.png"
	);

	const initializePointCloud = useCallback(() => {
		const material = new THREE.PointsMaterial({
			vertexColors: true,
			size: pointScale,
			opacity: 1,
		});
		const newPointCloud = new THREE.Points(geometry, material);
		newPointCloud.rotation.z = Math.PI;
		setPointCloud(newPointCloud);
	}, [geometry, pointScale]);

	useEffect(() => {
		if (clearScene) {
			scene.clear();
			setPointCloud(null);
			return;
		}
		initializePointCloud();
	}, [clearScene, initializePointCloud, scene]);

	useEffect(() => {
		if (circleTexture && pointCloud) {
			(pointCloud.material as THREE.PointsMaterial).map = circleTexture;
			(pointCloud.material as THREE.PointsMaterial).needsUpdate = true;
		}
	}, [circleTexture, pointCloud]);

	useEffect(() => {
		if (
			loaded === total &&
			pointCloud &&
			pointCloud.geometry.attributes.position &&
			imgs.length > 0
		) {
			updateCounts(
				pointCloud.geometry.attributes.position.count,
				imgs.length
			);
			onLoaded?.();
		}
	}, [loaded, total, pointCloud, imgs, onLoaded, updateCounts, controlsRef]);

	return (
		<>
			{pointCloud && <primitive object={pointCloud} />}
			<Cameras
				imageData={imgs}
				camData={cams}
				camScale={camScale}
				onAllImagesLoaded={() => {}}
			/>
			<axesHelper args={[10]} />
		</>
	);
};

export default Scene;
