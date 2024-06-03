import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ImageData } from "../hooks/useCOLMAPLoader";

interface CameraProps {
	imageData: ImageData;
	onLoaded: () => void;
}

const Camera: React.FC<CameraProps> = ({ imageData, onLoaded }) => {
	const coneRef = useRef<THREE.Mesh>(null);
	const baseRef = useRef<THREE.Mesh>(null);

	useEffect(() => {
		if (coneRef.current && baseRef.current) {
			const R = new THREE.Matrix4();
			// quaternion matrix
			const Q = new THREE.Quaternion(
				imageData.qvec[1],
				imageData.qvec[2],
				imageData.qvec[3],
				imageData.qvec[0]
			);
			// rotation matrix
			R.makeRotationFromQuaternion(Q);
			// transpose of rotation matrix
			const R_T = R.clone().transpose();
			// translation vector
			const translation = new THREE.Vector3(
				imageData.tvec[0],
				imageData.tvec[1],
				imageData.tvec[2]
			);

			// position = -R^T • tvec
			translation.applyMatrix4(R_T).negate();

			// apply 180 deg rotation about z-axis to convert
			// from colmap's world coord axes to three's axes
			const Ry_180deg = new THREE.Matrix4();
			Ry_180deg.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
			translation.applyMatrix4(Ry_180deg);
			R.premultiply(Ry_180deg);
			R_T.premultiply(Ry_180deg);

			// view direction = [0 0 1] @ R^T
			const forward = new THREE.Vector3(0, 0, 1);
			forward.applyMatrix4(R_T);

			// debugging
			// const dir = new THREE.ArrowHelper(
			// 	new THREE.Vector3(forward.x, forward.y, forward.z),
			// 	new THREE.Vector3(0, 0, 0),
			// 	0.1,
			// 	0xffffee
			// );
			//coneRef.current.add(dir);

			// position
			coneRef.current.position.copy(translation);
			// viewing direction
			coneRef.current.lookAt(translation.clone().add(forward));
			// orient bottom of cone in view direction
			coneRef.current.rotateX(-Math.PI / 2);

			// base of cone position + rotation
			baseRef.current.position.copy(translation);
			baseRef.current.rotation.copy(coneRef.current.rotation);
			baseRef.current.rotateX(-Math.PI / 2);
			baseRef.current.rotateZ(Math.PI / 4);

			const baseOffset = new THREE.Vector3(0, -0.15, 0);
			baseOffset.applyQuaternion(coneRef.current.quaternion);
			baseRef.current.position.add(baseOffset);
			onLoaded();
		}
	}, [imageData.qvec, imageData.tvec, onLoaded]);

	return (
		<>
			<mesh ref={coneRef}>
				<coneGeometry args={[0.1, 0.3, 4]} />
				<meshBasicMaterial color="red" wireframe />
			</mesh>
			<mesh ref={baseRef}>
				<planeGeometry args={[0.14, 0.14]} />
				<meshBasicMaterial color="red" side={THREE.DoubleSide} />
			</mesh>
		</>
	);
};

export default Camera;
