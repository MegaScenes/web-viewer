import { useEffect, useState } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { usePointLoader, useImageData } from "../hooks/useCOLMAPLoader";
import Cameras from "./Cameras";

interface SceneProps {
	points: string;
	images: string;
	onLoaded?: () => void;
	clearScene: boolean;
}

const Scene: React.FC<SceneProps> = ({
	points,
	images,
	clearScene,
	onLoaded,
}) => {
	const { scene } = useThree();
	const pointCloud = usePointLoader(points);
	const imgs = useImageData(images);
	const circleTexture = useLoader(
		THREE.TextureLoader,
		"/web-viewer/images/circle.png"
	);
	const [isPointCloudReady, setIsPointCloudReady] = useState(false);
	const [areImagesReady, setAreImagesReady] = useState(false);

	const isReady = isPointCloudReady && areImagesReady;

	const handleAllImagesLoaded = () => {
		//console.log("all images have been loaded and rendered");
		if (typeof onLoaded === "function") {
			onLoaded();
		}
	};

	useEffect(() => {
		if (clearScene) {
			scene.clear();
			setIsPointCloudReady(false);
			setAreImagesReady(false);
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

		if (isReady && typeof onLoaded === "function") {
			onLoaded();
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
		isReady,
	]);

	return (
		<>
			{isReady && (
				<>
					{pointCloud && <primitive object={pointCloud} />}
					<Cameras
						imageData={imgs}
						onAllImagesLoaded={handleAllImagesLoaded}
					/>
				</>
			)}
		</>
	);
};

export default Scene;
