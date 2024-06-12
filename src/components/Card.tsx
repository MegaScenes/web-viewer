import React from "react";

import { IconCircleDotted, IconCamera } from "@tabler/icons-react";
import { SceneType } from "@/types/scene";
import { useRouter } from "next/navigation";

interface CardProps {
	scene: SceneType;
	rec_no: number;
	numOfPts?: number;
	numOfCams?: number;
	isSelected: boolean;
}

const Card: React.FC<CardProps> = ({
	scene,
	rec_no,
	numOfPts,
	numOfCams,
	isSelected,
}) => {
	const router = useRouter();

	return (
		<div
			className={`h-[80px] rounded-lg hover:shadow-md hover:shadow-blue-500/50 hover:scale-105 transition-transform duration-300 ease-out border border-transparent hover:border-blue-500`}
			onClick={() => {
				router.push(
					`/?id=${encodeURIComponent(
						scene.id
					)}&rec_no=${encodeURIComponent(rec_no.toString())}`
				);
			}}
		>
			<div className="bg-offwhite shadow-lg rounded-lg h-[80px] flex flex-col justify-center items-center">
				<div className="flex flex-row h-[80px] w-full gap-2 justify-start">
					<div className="flex flex-row justify-center items-center min-w-[50px] rounded-tl-lg rounded-bl-lg border-r-2 gap-0.5 border-r-black">
						<span
							className={`text-xl font-medium ${
								isSelected ? "text-blue-500" : ""
							}`}
						>
							#
						</span>
						<span
							className={`text-2xl ${
								isSelected
									? "text-blue-500 font-bold"
									: "font-medium"
							}`}
						>
							{rec_no}
						</span>
					</div>
					<div className="flex flex-col justify-center">
						<span className="max-w-[260px] text-offblack font-semibold overflow-hidden truncate">
							{scene.normalized_name}
						</span>
						<div className="flex flex-row justify-start items-center gap-1.5">
							<IconCircleDotted
								size={16}
								stroke={3}
								color="black"
							/>
							<span className="text-[15px] font-medium">
								Points:{" "}
								{numOfPts ? numOfPts : "? (click to view)"}
							</span>
						</div>
						<div className="flex flex-row justify-start items-center gap-1.5">
							<IconCamera size={16} stroke={2} color="black" />
							<span className="text-[15px] font-medium">
								Cameras:{" "}
								{numOfCams ? numOfCams : "? (click to view)"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Card;
