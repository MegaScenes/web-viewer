import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";
import { useThree } from "@react-three/fiber";

interface CameraProps {
	imageData: ImageData;
	camData?: CameraData;
	camScale: number;
	onLoaded: () => void;
}

const scale = 0.25;

const Camera: React.FC<CameraProps> = ({
	imageData,
	camData,
	camScale,
	onLoaded,
}) => {
	const [components, setComponents] = useState<JSX.Element[]>([]);
	const { scene } = useThree();

	useEffect(() => {
		const frames: JSX.Element[] = [];
		if (camData) {
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
			const t = new THREE.Vector3(
				imageData.tvec[0],
				imageData.tvec[1],
				imageData.tvec[2]
			);

			// position = -R^T • tvec
			t.applyMatrix4(R_T).negate();

			// apply 180 deg rotation about z-axis to convert
			// from colmap's world coord axes to three's axes
			const Ry_180deg = new THREE.Matrix4();
			Ry_180deg.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
			t.applyMatrix4(Ry_180deg);
			R.premultiply(Ry_180deg);
			R_T.premultiply(Ry_180deg);

			// we now have the correct: R, t

			const fx = camData.params[0];
			const fy = camData.model === "PINHOLE" ? camData.params[1] : fx;
			const cx = camData.params[camData.model === "PINHOLE" ? 2 : 1];
			const cy = camData.params[camData.model === "PINHOLE" ? 3 : 2];

			const K = new THREE.Matrix3().set(fx, 0, cx, 0, fy, cy, 0, 0, 1);
			for (let i = 0; i < 9; i++) {
				K.elements[i] /= scale;
			}
			const Kinv = K.clone().invert();
			if (imageData.id === 1846) {
				console.log("K:", K);
			}

			const T = new THREE.Matrix4().set(
				R_T.elements[0],
				R_T.elements[3],
				R_T.elements[6],
				t.x,
				R_T.elements[1],
				R_T.elements[4],
				R_T.elements[7],
				t.y,
				R_T.elements[2],
				R_T.elements[5],
				R_T.elements[8],
				t.z,
				0,
				0,
				0,
				1
			);

			const w = camData.width;
			const h = camData.height;

			const pointsPixel = [
				new THREE.Vector3(0, 0, 1),
				new THREE.Vector3(w, 0, 1),
				new THREE.Vector3(0, h, 1),
				new THREE.Vector3(w, h, 1),
			];
			// pixel to camera coordinate system
			const points = pointsPixel.map((p: THREE.Vector3) =>
				p.applyMatrix3(Kinv)
			);

			const width = Math.abs(points[1].x) + Math.abs(points[3].x);
			const height = Math.abs(points[1].y) + Math.abs(points[3].y);
			const depth = 1e-6;

			// image plane
			const planeGeometry = new THREE.BoxGeometry(width, height, depth);
			const planeMaterial = new THREE.MeshStandardMaterial({
				color: "red",
			});
			const plane = new THREE.Mesh(planeGeometry, planeMaterial);
			const planePosition = new THREE.Vector3(
				points[1].x,
				points[1].y,
				0
			);
			plane.position.copy(planePosition);
			plane.applyMatrix4(T);
			scene.add(plane);

			const pointsInWorld = points.map((p: THREE.Vector3) =>
				p.clone().applyMatrix4(R).add(t)
			);

			// Log pointsInWorld to debug
			console.log("pointsInWorld:", pointsInWorld);

			const lines = [
				[t, pointsInWorld[1]],
				[t, pointsInWorld[2]],
				[t, pointsInWorld[3]],
				[t, pointsInWorld[0]],
			];

			lines.forEach((line: THREE.Vector3[]) => {
				// Log line to debug
				console.log("line:", line);

				const geometry = new THREE.BufferGeometry().setFromPoints(line);
				const material = new THREE.LineBasicMaterial({
					color: "red",
				});
				const lineMesh = new THREE.Line(geometry, material);
				scene.add(lineMesh);
			});

			onLoaded();
		}
	}, []);

	return null;
};

export default Camera;
