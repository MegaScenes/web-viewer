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
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";
interface SceneProps {
	id: number;
	rec_no: number;
	pointScale: number;
	camScale: number;
	clearScene: boolean;
	isAxisEnabled: boolean;
	onLoaded?: () => void;
	onOpenImageModal: (imageData: ImageData, camData: CameraData) => void;
}

const Scene: React.FC<SceneProps> = ({
	id,
	rec_no,
	pointScale,
	camScale,
	clearScene,
	isAxisEnabled,
	onLoaded,
	onOpenImageModal,
}) => {
	const { scene } = useThree();
	const { loaded, total } = useProgress();
	const [pointCloud, setPointCloud] = useState<THREE.Points | null>(null);

	const geometry = usePointLoader(id, rec_no);
	const imgs = useImageData(id, rec_no);
	const cams = useCameraData(id, rec_no);
	const circleTexture = useLoader(
		THREE.TextureLoader,
		"/web-viewer/images/circle.png"
	);

	const initializePointCloud = useCallback(() => {
		const material = new THREE.PointsMaterial({
			map: circleTexture,
			size: pointScale,
			transparent: true,
			depthWrite: false,
			alphaTest: 0.5,
			vertexColors: true,
		});
		const newPointCloud = new THREE.Points(geometry, material);
		newPointCloud.rotation.z = Math.PI;
		setPointCloud(newPointCloud);
	}, [geometry, pointScale, circleTexture]);

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
			pointCloud.geometry.attributes.position
		) {
			onLoaded?.();
		}
	}, [loaded, total, onLoaded, pointCloud]);

	return (
		<>
			{pointCloud && <primitive object={pointCloud} />}
			<Cameras
				imageData={imgs}
				camData={cams}
				camScale={camScale}
				onAllImagesLoaded={() => {}}
				onOpenImageModal={onOpenImageModal}
			/>
			{isAxisEnabled && <axesHelper args={[10]} />}
		</>
	);
};

export default Scene;
