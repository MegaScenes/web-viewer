import { useEffect, useState } from "react";
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

	const geometry = usePointLoader(id, no);
	const pointCloud = new THREE.Points(
		geometry,
		new THREE.PointsMaterial({
			vertexColors: true,
			size: pointScale,
			opacity: 1,
		})
	);
	const imgs = useImageData(id, no);
	const cams = useCameraData(id, no);
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
			if (pointCloud) {
				updateCounts(
					pointCloud.geometry.attributes.position.count,
					imgs.length
				);
			}
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
		updateCounts,
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
						camData={cams}
						camScale={camScale}
						onAllImagesLoaded={() => setAreImagesReady(true)}
					/>
					<axesHelper args={[10]} key={axesKey} />
				</>
			)}
		</>
	);
};

export default Scene;
