"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";

const S3_BASE_URL =
	"https://megascenes.s3.us-west-2.amazonaws.com/reconstruct/";

const S3_AUX_URL =
	"https://megascenes.s3.us-west-2.amazonaws.com/reconstruct_aux/";

export type CameraData = {
	cameraId: number;
	model: string;
	width: number;
	height: number;
	params: number[];
};

interface CameraModel {
	model_id: number;
	model_name: string;
	num_params: number;
}

export type ImageData = {
	id: number;
	qvec: number[];
	tvec: number[];
	cameraId: number;
	name: string;
};

// camera models
const CAMERA_MODELS: CameraModel[] = [
	{ model_id: 0, model_name: "SIMPLE_PINHOLE", num_params: 3 },
	{ model_id: 1, model_name: "PINHOLE", num_params: 4 },
	{ model_id: 2, model_name: "SIMPLE_RADIAL", num_params: 4 },
	{ model_id: 3, model_name: "RADIAL", num_params: 5 },
	{ model_id: 4, model_name: "OPENCV", num_params: 8 },
	{ model_id: 5, model_name: "OPENCV_FISHEYE", num_params: 8 },
	{ model_id: 6, model_name: "FULL_OPENCV", num_params: 12 },
	{ model_id: 7, model_name: "FOV", num_params: 5 },
	{ model_id: 8, model_name: "SIMPLE_RADIAL_FISHEYE", num_params: 4 },
	{ model_id: 9, model_name: "RADIAL_FISHEYE", num_params: 5 },
	{ model_id: 10, model_name: "THIN_PRISM_FISHEYE", num_params: 12 },
];
const CAMERA_MODEL_IDS = Object.fromEntries(
	CAMERA_MODELS.map((model) => [model.model_id, model])
);

const getId = (id: number): string => {
	const paddedId = id.toString().padStart(6, "0");
	const urlSegment = `${paddedId.slice(0, 3)}/${paddedId.slice(3, 6)}`;
	return urlSegment;
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

const parseMiniImageData = (buffer: ArrayBuffer): ImageData[] => {
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

const parsePointData = (buffer: ArrayBuffer): THREE.BufferGeometry => {
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

	return geometry;
};

const parseMiniPointData = (buffer: ArrayBuffer): THREE.BufferGeometry => {
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

		const c = enhanceColor(r, g, b, 1.5, 1.5);
		points.push(x, y, z);
		colors.push(c.r / 255, c.g / 255, c.b / 255);
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(points, 3)
	);
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

	return geometry;
};

const parseCameraData = (buffer: ArrayBuffer): CameraData[] => {
	const dataview = new DataView(buffer);

	let offset = 0;
	const numCameras = Number(dataview.getBigUint64(offset, true));
	offset += 8;

	const cameras = [];

	for (let i = 0; i < numCameras; i++) {
		const cameraId = dataview.getInt32(offset, true);
		const modelId = dataview.getInt32(offset + 4, true);
		const width = Number(dataview.getBigUint64(offset + 8, true));
		const height = Number(dataview.getBigUint64(offset + 16, true));
		offset += 24;

		const model = CAMERA_MODEL_IDS[modelId];
		const params = [];
		for (let j = 0; j < 4; j++) {
			const param = dataview.getFloat64(offset, true);
			params.push(param);
			offset += 8;
		}

		cameras.push({
			cameraId,
			model: model.model_name,
			width,
			height,
			params,
		});
	}

	return cameras;
};

interface UrlState {
	url: string;
	usingMiniUrl: boolean;
}

export const useImageData = (id: number, rec_no: number): ImageData[] => {
	const [images, setImages] = useState<ImageData[]>([]);
	const [urlState, setUrlState] = useState<UrlState>(() => ({
		url: `${S3_AUX_URL}${encodeURIComponent(
			getId(id)
		)}/colmap/${encodeURIComponent(rec_no.toString())}/images.minibin`,
		usingMiniUrl: true,
	}));

	const handleNewUrlState = (newUrl: string) => {
		if (newUrl !== urlState.url) {
			setUrlState({
				url: newUrl,
				usingMiniUrl: true,
			});
		}
	};

	useEffect(() => {
		const newUrl = `${S3_AUX_URL}${encodeURIComponent(
			getId(id)
		)}/colmap/${encodeURIComponent(rec_no.toString())}/images.minibin`;
		handleNewUrlState(newUrl);
	}, [id, rec_no, handleNewUrlState]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchImageData = async () => {
			try {
				const response = await fetch(urlState.url, {
					signal: controller.signal,
				});
				if (!response.ok) {
					if (urlState.usingMiniUrl) {
						const fallbackUrl = `${S3_BASE_URL}${encodeURIComponent(
							getId(id)
						)}/colmap/${encodeURIComponent(
							rec_no.toString()
						)}/images.bin`;
						setUrlState({ url: fallbackUrl, usingMiniUrl: false });
						return;
					} else {
						throw new Error(
							`Failed to fetch from both URLs: ${response.status}`
						);
					}
				}
				const buffer = await response.arrayBuffer();
				const loadedImages = urlState.usingMiniUrl
					? parseMiniImageData(buffer)
					: parseImageData(buffer);
				setImages(loadedImages);
			} catch (error) {
				if ((error as Error).name === "AbortError") {
					console.log("Fetch was aborted");
				} else {
					console.error(
						"Unexpected error:",
						(error as Error).message
					);
				}
			}
		};

		fetchImageData();
		return () => {
			controller.abort();
		};
	}, [urlState, id, rec_no]);

	return images;
};

export const useCameraData = (id: number, rec_no: number): CameraData[] => {
	const [cameras, setCameras] = useState<CameraData[]>([]);
	const url = `${S3_BASE_URL}${encodeURIComponent(
		getId(id)
	)}/colmap/${encodeURIComponent(rec_no.toString())}/cameras.bin`;
	useEffect(() => {
		const controller = new AbortController();
		const fetchCameraData = async () => {
			try {
				const response = await fetch(url, {
					signal: controller.signal,
				});
				const buffer = await response.arrayBuffer();
				const loadedCameras = parseCameraData(buffer);
				setCameras(loadedCameras);
			} catch (error) {
				if ((error as Error).name === "AbortError") {
					console.log("Fetch was aborted");
				} else {
					console.error(
						"Unexpected error:",
						(error as Error).message
					);
				}
			}
		};

		fetchCameraData();
		return () => {
			controller.abort();
		};
	}, [url]);

	return cameras;
};

export const usePointLoader = (
	id: number,
	rec_no: number
): THREE.BufferGeometry | undefined => {
	const [pointCloud, setPointCloud] = useState<THREE.BufferGeometry>();
	const [urlState, setUrlState] = useState<UrlState>({
		url: `${S3_AUX_URL}${encodeURIComponent(
			getId(id)
		)}/colmap/${encodeURIComponent(rec_no.toString())}/points3D.minibin`,
		usingMiniUrl: true,
	});

	const handleNewUrlState = (newUrl: string) => {
		if (newUrl !== urlState.url) {
			setUrlState({
				url: newUrl,
				usingMiniUrl: true,
			});
		}
	};

	useEffect(() => {
		const newUrl = `${S3_AUX_URL}${encodeURIComponent(
			getId(id)
		)}/colmap/${encodeURIComponent(rec_no.toString())}/points3D.minibin`;
		handleNewUrlState(newUrl);
	}, [id, rec_no, handleNewUrlState]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchData = async () => {
			try {
				const response = await fetch(urlState.url, {
					signal: controller.signal,
				});
				if (!response.ok) {
					if (urlState.usingMiniUrl) {
						const fallbackUrl = `${S3_BASE_URL}${encodeURIComponent(
							getId(id)
						)}/colmap/${encodeURIComponent(
							rec_no.toString()
						)}/points3D.bin`;
						setUrlState({ url: fallbackUrl, usingMiniUrl: false });
						return;
					} else {
						throw new Error(
							`Failed to fetch from both URLs: ${response.status}`
						);
					}
				}
				const buffer = await response.arrayBuffer();
				console.log(urlState.url, urlState.usingMiniUrl);
				const cloud = urlState.usingMiniUrl
					? parseMiniPointData(buffer)
					: parsePointData(buffer);
				setPointCloud(cloud);
			} catch (error) {
				if ((error as Error).name === "AbortError") {
					console.log("Fetch was aborted");
				} else {
					console.error(
						"Unexpected error:",
						(error as Error).message
					);
				}
			}
		};

		fetchData();
		return () => {
			controller.abort();
		};
	}, [urlState, id, rec_no]);

	return pointCloud;
};
