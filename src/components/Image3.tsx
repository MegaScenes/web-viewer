import React, { useRef } from "react";
import * as THREE from "three";
import type { ImageData } from "../hooks/useCOLMAPLoader";

interface ImageProps {
	imageData: ImageData;
}

const Image2: React.FC<ImageProps> = ({ imageData }) => {
	const coneRef = useRef<THREE.Mesh>(null);
	const baseRef = useRef<THREE.Mesh>(null);

	if (coneRef.current && baseRef.current) {
		const R = new THREE.Matrix4();
		const Q = new THREE.Quaternion(
			imageData.qvec[1],
			imageData.qvec[2],
			imageData.qvec[3],
			imageData.qvec[0]
		);
		R.makeRotationFromQuaternion(Q);

		const newR = new THREE.Matrix3(
			R.elements[0],
			R.elements[4],
			-1 * R.elements[8],
			-1 * R.elements[1],
			-1 * R.elements[5],
			R.elements[9],
			R.elements[2],
			R.elements[6],
			-1 * R.elements[10]
		);
		R.setFromMatrix3(newR);

		const position = new THREE.Vector3(
			imageData.tvec[0],
			-imageData.tvec[1], // Flipping y-axis for translation
			-imageData.tvec[2] // Flipping z-axis for translation
		);

		const R_T = R.clone().transpose();

		if (imageData.id === 2587) {
			console.log(R_T);
		}
		position.applyMatrix4(R_T).negate();
		const forward = new THREE.Vector3(1, 0, 0);
		forward.applyMatrix4(R_T);

		// cone position + rotation
		coneRef.current.position.copy(position);
		//coneRef.current.rotation.copy(rotation);
		//coneRef.current.quaternion.copy(quaternion);
		coneRef.current.lookAt(position.clone().add(forward));
		//coneRef.current.rotateX(Math.PI);

		// debugging
		const arrowHelper = new THREE.ArrowHelper(
			new THREE.Vector3(forward.x, forward.y, forward.z),
			new THREE.Vector3(0, 0, 0),
			0.1,
			0x111111
		);
		coneRef.current.add(arrowHelper);

		if (imageData.id === 2587) {
			console.log(R_T);
		}

		// base of cone position + rotation
		baseRef.current.position.copy(position);
		baseRef.current.rotation.copy(coneRef.current.rotation);
		baseRef.current.rotateX(-Math.PI / 2);
		baseRef.current.rotateZ(Math.PI / 4);

		const baseOffset = new THREE.Vector3(0, -0.015, 0);
		baseOffset.applyQuaternion(coneRef.current.quaternion);
		baseRef.current.position.add(baseOffset);
	}

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
