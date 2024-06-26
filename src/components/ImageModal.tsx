import React, { useState, useEffect } from "react";
import {
	IconX,
	IconPhoto,
	IconFolder,
	IconWindowMinimize,
	IconWindowMaximize,
} from "@tabler/icons-react";
import Image from "next/image";
import type { ImageData, CameraData } from "../hooks/useCOLMAPLoader";
import useDelayedLinkActivation from "../hooks/useDelayedLinkActivation";

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
	const [isMinimized, setIsMinimized] = useState<boolean>(false);
	const isActive = useDelayedLinkActivation();

	const handleLinkClick = (
		event: React.MouseEvent<HTMLAnchorElement>,
		url: string
	) => {
		event.preventDefault();
		if (isActive) {
			window.open(url, "_blank", "noopener noreferrer");
		}
	};

	useEffect(() => {
		if (id === undefined || data === undefined) return;
		const imageData = data[0];
		const fetchImage = async (name: string) => {
			const response = await fetch(
				`${S3_IMAGES_URL}${getId(id)}/${name}`
			);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			setImgSrc(url);
		};

		fetchImage(imageData.name);
	}, [id, data]);

	if (data === undefined) return null;
	const imageData = data[0];
	const camData = data[1];

	const [, cat, , , file] = imageData.name.split("/");

	return (
		<>
			{isMinimized ? (
				<div className="absolute flex flex-col justify-center items-start left-[30px] bottom-[30px] w-[300px] h-[300px] bg-green-500">
					{imgSrc && (
						<div className="absolute bottom-0 left-0 z-50 transition-opacity duration-300 group">
							<Image
								className="max-h-[300px] w-auto border-2 group-hover:opacity-50 rounded-lg shadow-lg"
								src={imgSrc}
								alt={file}
								width={300}
								height={300}
							/>
							<button
								className="absolute top-5 left-5 text-white z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								onClick={onClose}
							>
								<IconX size={24} stroke={2.5} />
							</button>
							<button
								className="absolute top-[21.5px] right-[21.5px] text-white z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								onClick={() => setIsMinimized(false)}
							>
								<IconWindowMaximize size={20} stroke={2.5} />
							</button>
						</div>
					)}
				</div>
			) : (
				<div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
					<div className="relative bg-gray-600 text-white rounded-lg shadow-lg p-4 w-5/6 h-5/6 md:w-3/4 md:h-3/4 border-2 overflow-y-auto">
						<div className="flex flex-col justify-center items-center">
							<div className="relative w-full h-96">
								{imgSrc && (
									<div className="relative w-full h-full">
										<Image
											src={imgSrc}
											alt={file}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											style={{ objectFit: "contain" }}
											className="p-4"
										/>
									</div>
								)}
							</div>
							<div className="flex flex-col mb-2 md:mb-0 md:flex-row justify-center items-center gap-4 w-full">
								<a
									href={WIKI_IMAGE_URL + file}
									onClick={(e) =>
										handleLinkClick(
											e,
											WIKI_IMAGE_URL + file
										)
									}
									className="flex items-center gap-2 text-white text-xs py-2 px-4 border-2 border-white rounded-full md:hover:bg-slate-500 md:transition duration-300"
								>
									<IconPhoto size={14} stroke={2} /> View on
									Wikimedia
								</a>
								<a
									href={WIKI_CAT_URL + cat}
									onClick={(e) =>
										handleLinkClick(e, WIKI_CAT_URL + cat)
									}
									className="flex items-center gap-2 text-white text-xs py-2 px-4 border-2 border-white  rounded-full hmd:over:bg-slate-500 md:transition duration-300"
								>
									<IconFolder size={14} stroke={2} /> View
									Category
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
													.map((num) =>
														num.toFixed(3)
													)
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
													.map((num) =>
														num.toFixed(3)
													)
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
													.map((num) =>
														num.toFixed(3)
													)
													.join(", ")}
												]
											</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 px-4 font-semibold">
												dims:
											</td>
											<td className="py-2 px-4">
												{camData.width} x{" "}
												{camData.height}
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
							className="absolute top-5 right-5"
							onClick={onClose}
						>
							<IconX size={24} stroke={2.5} color="white" />
						</button>
						<button
							className="absolute top-[22px] left-[21.5px]"
							onClick={() => setIsMinimized(true)}
						>
							<IconWindowMinimize
								size={20}
								stroke={2.5}
								color="white"
							/>
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ImageModal;
