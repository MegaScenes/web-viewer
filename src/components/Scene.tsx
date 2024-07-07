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
    const { camera, gl, scene } = useThree();
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

    const handleDoubleClick = useCallback((event: MouseEvent) => {
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 0.005;
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (pointCloud) {
            const intersects = raycaster.intersectObject(pointCloud as THREE.Object3D);
            if (intersects.length > 0) {
                const intersect = intersects[0];
                const pointId = (intersect.object as THREE.Points).geometry.attributes.pointId.getX(intersect.index!);
                console.log("Double-clicked point ID:", pointId);
            }
        }
    }, [camera, pointCloud]);

    useEffect(() => {
        gl.domElement.addEventListener("dblclick", handleDoubleClick);

        return () => {
            gl.domElement.removeEventListener("dblclick", handleDoubleClick);
        };
    }, [handleDoubleClick, gl.domElement]);

    return (
        <>
            {pointCloud && <primitive object={pointCloud} />}
            <Cameras
                imageData={imgs}
                camData={cams}
                camScale={camScale}
                onAllImagesLoaded={() => { }}
                onOpenImageModal={onOpenImageModal}
            />
            {isAxisEnabled && <axesHelper args={[10]} />}
        </>
    );
};

export default Scene;
