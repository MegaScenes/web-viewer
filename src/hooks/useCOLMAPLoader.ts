"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";

const POINT_SIZE = 0.01;

export type CameraData = {
	cameraId: number;
	modelId: number;
	width: bigint;
	height: bigint;
	params: number[];
};

export type ImageData = {
	id: number;
	qvec: number[];
	tvec: number[];
	cameraId: number;
	name: string;
};

const parseImageData = (buffer: ArrayBuffer): ImageData[] => {
	const dataview = new DataView(buffer);
	let offset = 0;

	const numRegImages = dataview.getBigUint64(offset, true);
	offset += 8;

	const images = [];

	for (let i = 0; i < numRegImages; i++) {
		const imageId = dataview.getUint32(offset, true);
		offset += 4;

		const qvec = [
			dataview.getFloat64(offset, true),
			dataview.getFloat64(offset + 8, true),
			dataview.getFloat64(offset + 16, true),
			dataview.getFloat64(offset + 24, true),
		];
		const tvec = [
			dataview.getFloat64(offset + 32, true),
			dataview.getFloat64(offset + 40, true),
			dataview.getFloat64(offset + 48, true),
		];
		offset += 56;

		const cameraId = dataview.getUint32(offset, true);
		offset += 4;

		let imageName = "";
		while (offset < buffer.byteLength) {
			const charCode = dataview.getUint8(offset++);
			if (charCode === 0) break;
			imageName += String.fromCharCode(charCode);
		}

		let numPoints2D = dataview.getBigUint64(offset, true);
		offset += 8;
		offset += Number(numPoints2D) * 24;

		images.push({
			id: imageId,
			qvec,
			tvec,
			cameraId,
			name: imageName,
		});
	}

	if (images.length !== Number(numRegImages)) {
		throw new Error(
			`Expected ${numRegImages} images, but parsed ${images.length}`
		);
	}

	return images;
};

const enhanceColor = (
	r: number,
	g: number,
	b: number,
	brightnessFactor: number,
	saturationFactor: number
) => {
	let color = new THREE.Color(r / 255, g / 255, b / 255);
	let hsl = color.getHSL({ h: 0, s: 0, l: 0 });

	hsl.l = Math.min(1, hsl.l * brightnessFactor);
	hsl.s = Math.min(1, hsl.s * saturationFactor);

	color.setHSL(hsl.h, hsl.s, hsl.l);

	return {
		r: color.r * 255,
		g: color.g * 255,
		b: color.b * 255,
	};
};

const parseCOLMAP = (buffer: ArrayBuffer): THREE.Points => {
	const points: number[] = [];
	const colors: number[] = [];
	const dataview = new DataView(buffer);

	const numPoints = dataview.getBigUint64(0, true);
	let offset = 8;

	for (let i = 0; i < numPoints; i++) {
		const point3D_id = dataview.getBigUint64(offset, true);
		const x = dataview.getFloat64(offset + 8, true);
		const y = dataview.getFloat64(offset + 16, true);
		const z = dataview.getFloat64(offset + 24, true);
		offset += 32;

		const r = dataview.getUint8(offset);
		const g = dataview.getUint8(offset + 1);
		const b = dataview.getUint8(offset + 2);
		offset += 3;

		const error = dataview.getFloat64(offset, true);
		offset += 8;
		const c = enhanceColor(r, g, b, 1.5, 1.5);
		points.push(x, y, z);
		colors.push(c.r / 255, c.g / 255, c.b / 255);

		const track_length = dataview.getBigUint64(offset, true);
		offset += 8;

		offset += Number(track_length) * 8;
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(points, 3)
	);
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

	return new THREE.Points(
		geometry,
		new THREE.PointsMaterial({
			vertexColors: true,
			size: POINT_SIZE,
			opacity: 100,
		})
	);
};

const parseCameraData = (buffer: ArrayBuffer): CameraData[] => {
	const dataview = new DataView(buffer);

	let offset = 0;
	const numCameras = dataview.getBigUint64(offset, true);
	offset += 8;

	const cameras = [];

	for (let i = 0; i < numCameras; i++) {
		const cameraId = dataview.getInt32(offset, true);
		const modelId = dataview.getInt32(offset + 4, true);
		const width = dataview.getBigUint64(offset + 8, true);
		const height = dataview.getBigUint64(offset + 16, true);
		offset += 24;

		const params = [];
		for (let j = 0; j < 4; j++) {
			const param = dataview.getFloat64(offset, true);
			params.push(param);
			offset += 8;
		}

		cameras.push({ cameraId, modelId, width, height, params });
	}

	return cameras;
};

export const useImageData = (url: string): ImageData[] => {
	const [images, setImages] = useState<ImageData[]>([]);

	useEffect(() => {
		const fetchImageData = async () => {
			try {
				const response = await fetch(url);
				const buffer = await response.arrayBuffer();
				const loadedImages = parseImageData(buffer);
				setImages(loadedImages);
			} catch (error) {
				console.error("Failed to load image data:", error);
			}
		};

		fetchImageData();
	}, [url]);

	return images;
};

export const useCameraData = (url: string): CameraData[] => {
	const [cameras, setCameras] = useState<CameraData[]>([]);

	useEffect(() => {
		const fetchCameraData = async () => {
			try {
				const response = await fetch(url);
				const buffer = await response.arrayBuffer();
				const loadedCameras = parseCameraData(buffer);
				setCameras(loadedCameras);
			} catch (error) {
				console.error("Failed to load camera data:", error);
			}
		};

		fetchCameraData();
	}, [url]);

	return cameras;
};

export const useCOLMAPLoader = (url: string): THREE.Points | undefined => {
	const [pointCloud, setPointCloud] = useState<THREE.Points>();
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(url);
				const buffer = await response.arrayBuffer();
				const cloud = parseCOLMAP(buffer);
				setPointCloud(cloud);
			} catch (error) {
				console.error("Failed to load point cloud:", error);
			}
		};

		fetchData();
	}, [url]);

	return pointCloud;
};
