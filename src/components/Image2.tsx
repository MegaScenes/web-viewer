import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ImageData } from "../hooks/useCOLMAPLoader";

interface ImageProps {
	imageData: ImageData;
}

const Image2: React.FC<ImageProps> = ({ imageData }) => {
	const coneRef = useRef<THREE.Mesh>(null);
	const baseRef = useRef<THREE.Mesh>(null);

	useEffect(() => {
		if (coneRef.current && baseRef.current) {
			const R = new THREE.Matrix4();
			const Q = new THREE.Quaternion(
				imageData.qvec[1],
				imageData.qvec[2],
				imageData.qvec[3],
				imageData.qvec[0]
			);

			R.makeRotationFromQuaternion(Q);

			const R_T = R.clone().transpose();
			const translation = new THREE.Vector3(
				imageData.tvec[0],
				imageData.tvec[1],
				imageData.tvec[2]
			);
			translation.applyMatrix4(R_T).negate();

			// apply 180 deg rotation about z-axis to convert
			// from colmap's world coord axes to three's axes
			const Ry_180deg = new THREE.Matrix4();
			Ry_180deg.set(
				-1,  0, 0, 0,
				 0, -1, 0, 0,
				 0,  0, 1, 0,
				 0,  0, 0, 1 
			);
			translation.applyMatrix4(Ry_180deg);
			R.premultiply(Ry_180deg);
			R_T.premultiply(Ry_180deg);

			const forward = new THREE.Vector3(0, 0, 1);
			forward.applyMatrix4(R_T);

			const position = new THREE.Vector3(
				imageData.tvec[0],
				imageData.tvec[1],
				imageData.tvec[2]
			);

			coneRef.current.position.copy(translation);
			// coneRef.current.lookAt(position.clone().add(forward.clone()));
			// coneRef.current.lookAt(new THREE.Vector3(0, 0, 0));

			// debugging
			const arrowHelper = new THREE.ArrowHelper(
				new THREE.Vector3(forward.x, forward.y, forward.z),
				new THREE.Vector3(0, 0, 0),
				0.1,
				0xffffee
			);
			coneRef.current.add(arrowHelper);

			if (imageData.id === 2587) {
				console.log(imageData.qvec);
				console.log(imageData.tvec);
				console.log(R);
				console.log(forward);
			}

			// base of cone position + rotation
			baseRef.current.position.copy(translation);
			baseRef.current.rotation.copy(coneRef.current.rotation);
			baseRef.current.rotateX(-Math.PI / 2);
			baseRef.current.rotateZ(Math.PI / 4);

			const baseOffset = new THREE.Vector3(0, -0.015, 0);
			baseOffset.applyQuaternion(coneRef.current.quaternion);
			baseRef.current.position.add(baseOffset);
		}
	}, [imageData]);

	return (
		<>
			<mesh ref={coneRef}>
				<coneGeometry args={[0.01, 0.03, 4]} />
				<meshBasicMaterial color="red" wireframe />
			</mesh>
			<mesh ref={baseRef}>
				<planeGeometry args={[0.014, 0.014]} />
				<meshBasicMaterial color="red" side={THREE.DoubleSide} />
			</mesh>
		</>
	);
};

export default Image2;
