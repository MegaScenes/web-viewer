import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";
import { useThree } from "@react-three/fiber";

interface CameraProps {
	imageData: ImageData;
	camData?: CameraData;
	camScale: number;
	onLoaded: () => void;
	onPlaneRef: (mesh: THREE.Mesh | null | undefined) => void;
	onLineRef: (line: THREE.Line | null | undefined) => void;
}

const Camera: React.FC<CameraProps> = ({
	imageData,
	camData,
	camScale,
	onLoaded,
	onPlaneRef,
	onLineRef,
}) => {
	const { scene } = useThree();
	const groupRef = useRef<THREE.Group>(new THREE.Group());
	const planeRef = useRef<THREE.Mesh>();

	useEffect(() => {
		const group = groupRef.current;
		scene.add(group);

		return () => {
			while (group.children.length) {
				const child = group.children[0];
				if (child instanceof THREE.Mesh) {
					onPlaneRef(null);
				} else if (child instanceof THREE.Line) {
					onLineRef(null);
				}
				group.remove(child);
			}
			scene.remove(group);
		};
	}, [scene, onPlaneRef, onLineRef]);

	const cameraData = useMemo(() => {
		if (!camData) return null;

		const R = new THREE.Matrix4();
		const Q = new THREE.Quaternion(
			imageData.qvec[1],
			imageData.qvec[2],
			imageData.qvec[3],
			imageData.qvec[0]
		);
		R.makeRotationFromQuaternion(Q);
		const R_T = R.clone().transpose();
		const t = new THREE.Vector3(
			imageData.tvec[0],
			imageData.tvec[1],
			imageData.tvec[2]
		);

		t.applyMatrix4(R_T).negate();

		const Ry_180deg = new THREE.Matrix4();
		Ry_180deg.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		t.applyMatrix4(Ry_180deg);
		R.premultiply(Ry_180deg);
		R_T.premultiply(Ry_180deg);

		let fx = 0,
			fy = 0,
			cx = 0,
			cy = 0;

		if (
			["SIMPLE_PINHOLE", "SIMPLE_RADIAL", "RADIAL"].includes(
				camData.model
			)
		) {
			fx = camData.params[0];
			fy = camData.params[0];
			cx = camData.params[1];
			cy = camData.params[2];
		} else if (
			["PINHOLE", "OPENCV", "OPENCV_FISHEYE", "FULL_OPENCV"].includes(
				camData.model
			)
		) {
			fx = camData.params[0];
			fy = camData.params[1];
			cx = camData.params[2];
			cy = camData.params[3];
		}

		// const fx = camData.params[0];
		// const fy = camData.model === "PINHOLE" ? camData.params[1] : fx;
		// const cx = camData.params[camData.model === "PINHOLE" ? 2 : 1];
		// const cy = camData.params[camData.model === "PINHOLE" ? 3 : 2];

		const K = new THREE.Matrix3().set(fx, 0, cx, 0, fy, cy, 0, 0, 1);
		K.multiplyScalar(1 / camScale);
		const Kinv = K.clone().invert();

		// additional scaling from hloc implementation
		const W = cx * 2;
		const H = cy * 2;
		const imageExtent = Math.max(
			(camScale * W) / 1024.0,
			(camScale * H) / 1024.0
		);
		const worldExtent = Math.max(W, H) / (fx + fy) / 0.5;
		const scale = (0.5 * imageExtent) / worldExtent;

		const T = new THREE.Matrix4().set(
			R_T.elements[0],
			R_T.elements[4],
			R_T.elements[8],
			t.x,
			R_T.elements[1],
			R_T.elements[5],
			R_T.elements[9],
			t.y,
			R_T.elements[2],
			R_T.elements[6],
			R_T.elements[10],
			t.z,
			0,
			0,
			0,
			1
		);

		const w = camData.width;
		const h = camData.height;

		const pointsPixel = [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(w, 0, 1),
			new THREE.Vector3(0, h, 1),
			new THREE.Vector3(w, h, 1),
		];
		const points = pointsPixel.map((p: THREE.Vector3) =>
			p.applyMatrix3(Kinv)
		);

		points.forEach((p) => {
			p.multiplyScalar(scale);
		});

		const width = Math.abs(points[1].x) + Math.abs(points[3].x);
		const height = Math.abs(points[1].y) + Math.abs(points[3].y);
		const depth = 1e-6;

		const centerX = (points[1].x + points[2].x) / 2;
		const centerY = 0;

		const pointsInWorld = points.map((p: THREE.Vector3) =>
			p.clone().applyMatrix4(R_T).add(t)
		);

		return {
			T,
			width,
			height,
			depth,
			centerX,
			centerY,
			scale,
			pointsInWorld,
			lines: [
				[t, pointsInWorld[1]],
				[t, pointsInWorld[2]],
				[t, pointsInWorld[3]],
				[t, pointsInWorld[4]],
			],
		};
	}, [camData, imageData, camScale]);

	useEffect(() => {
		if (cameraData) {
			const group = groupRef.current;
			while (group.children.length > 0) {
				group.remove(group.children[0]);
			}

			// image plane
			const planeGeometry = new THREE.BoxGeometry(
				cameraData.width,
				cameraData.height,
				cameraData.depth
			);
			const planeMaterial = new THREE.MeshStandardMaterial({
				color: "red",
			});
			const plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.position.set(
				cameraData.centerX,
				cameraData.centerY,
				camScale * cameraData.scale
			);
			plane.applyMatrix4(cameraData.T);
			scene.add(plane);
			group.add(plane);
			plane.userData.imageData = imageData;
			plane.userData.camData = camData;
			planeRef.current = plane;
			onPlaneRef(plane);

			cameraData.lines.forEach((line: THREE.Vector3[]) => {
				const geometry = new THREE.BufferGeometry().setFromPoints(line);
				const material = new THREE.LineBasicMaterial({
					color: "red",
				});
				const lineMesh = new THREE.Line(geometry, material);
				lineMesh.userData.planeId = plane.uuid;
				scene.add(lineMesh);
				group.add(lineMesh);
				onLineRef(lineMesh);
			});

			onLoaded();
		}

		return () => {
			onPlaneRef(null);
		};
	}, [
		cameraData,
		camScale,
		onLoaded,
		scene,
		onPlaneRef,
		onLineRef,
		camData,
		imageData,
	]);

	useEffect(() => {
		const plane = planeRef.current;
		onPlaneRef(plane);

		return () => {
			onPlaneRef(null);
		};
	}, [cameraData, onPlaneRef]);

	return <group ref={groupRef} />;
};

export default Camera;
