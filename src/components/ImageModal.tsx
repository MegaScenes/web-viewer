import React, { useState, useEffect } from "react";
import { IconX, IconPhoto, IconFolder } from "@tabler/icons-react";
import Image from "next/image";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";

const S3_IMAGES_URL = "https://megascenes.s3.us-west-2.amazonaws.com/images/";
const WIKI_IMAGE_URL = "https://commons.wikimedia.org/wiki/File:";
const WIKI_CAT_URL = "https://commons.wikimedia.org/wiki/Category:";

const getId = (id: number): string => {
	const paddedId = id.toString().padStart(6, "0");
	const urlSegment = `${paddedId.slice(0, 3)}/${paddedId.slice(3, 6)}`;
	return urlSegment;
};

interface ImageModalProps {
	id?: number;
	data?: [ImageData, CameraData];
	onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ id, data, onClose }) => {
	const [imgSrc, setImgSrc] = useState<string | null>(null);
	if (data === undefined) return null;
	const imageData = data[0];
	const camData = data[1];

	useEffect(() => {
		if (id === undefined || data === undefined) return;
		const fetchImage = async (name: string) => {
			const response = await fetch(
				`${S3_IMAGES_URL}${getId(id)}/${name}`
			);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			setImgSrc(url);
		};

		fetchImage(imageData.name);
	}, [imageData]);

	const [, cat, , , file] = imageData.name.split("/");

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
			<div className="relative bg-gray-600 text-white rounded-lg shadow-lg p-4  w-3/4 h-auto">
				<div className="flex flex-col justify-center items-center">
					<div className="relative w-full h-96">
						{imgSrc && (
							<div className="relative w-full h-full">
								<Image
									src={imgSrc}
									alt={file}
									fill={true}
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									style={{ objectFit: "contain" }}
									className="p-4"
								/>
							</div>
						)}
					</div>
					<div className="flex flex-row justify-center items-center gap-4 w-full">
						<a
							href={`${WIKI_IMAGE_URL}${file}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-white text-xs py-2 px-4 border-2 border-white rounded-full hover:bg-slate-500 transition duration-300"
						>
							<IconPhoto size={14} stroke={2} /> View on Wikimedia
						</a>
						<a
							href={`${WIKI_CAT_URL}${cat}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-white text-xs py-2 px-4 border-2 border-white  rounded-full hover:bg-slate-500 transition duration-300"
						>
							<IconFolder size={14} stroke={2} /> View Category
						</a>
					</div>
					<div className="w-full overflow-auto">
						<table className="w-full text-left border-collapse">
							<tbody>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										image_id:
									</td>
									<td className="py-2 px-4">
										{imageData.id}
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										camera_id:
									</td>
									<td className="py-2 px-4">
										{camData.cameraId}
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										camera_model:
									</td>
									<td className="py-2 px-4">
										{camData.model}
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										camera_params:
									</td>
									<td className="py-2 px-4">
										[
										{camData.params
											.map((num) => num.toFixed(3))
											.join(", ")}
										]
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										qw, qx, qy, qz:
									</td>
									<td className="py-2 px-4">
										[
										{imageData.qvec
											.map((num) => num.toFixed(3))
											.join(", ")}
										]
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										tx, ty, tz:
									</td>
									<td className="py-2 px-4">
										[
										{imageData.tvec
											.map((num) => num.toFixed(3))
											.join(", ")}
										]
									</td>
								</tr>
								<tr className="border-b">
									<td className="py-2 px-4 font-semibold">
										dims:
									</td>
									<td className="py-2 px-4">
										{camData.width} x {camData.height}
									</td>
								</tr>
								<tr>
									<td className="py-2 px-4 font-semibold">
										name:
									</td>
									<td className="py-2 px-4">
										{imageData.name}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<button
					className="absolute top-5 right-5 text-white"
					onClick={() => {
						onClose();
						console.log("clicked");
					}}
				>
					<IconX size={24} stroke={2.5} />
				</button>
			</div>
		</div>
	);
};

export default ImageModal;
