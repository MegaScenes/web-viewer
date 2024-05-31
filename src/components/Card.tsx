import React from "react";

import { IconCircleDotted, IconCamera } from "@tabler/icons-react";
import { Scene } from "@/types/scene";

interface CardProps {
	scene: Scene;
	onClick: (scene: Scene) => void;
}

const card: React.FC<CardProps> = ({ scene, onClick }) => {
	return (
		<div
			className="h-[80px] rounded-lg hover:shadow-md hover:shadow-blue-500/50 hover:scale-105 transition-transform duration-300 ease-out border border-transparent hover:border-blue-500"
			onClick={() => onClick(scene)}
		>
			<div className="bg-offwhite shadow-lg rounded-lg h-[80px] flex flex-col justify-center items-center">
				<div className="flex flex-row h-[80px] w-full gap-2 justify-start">
					<div className="flex flex-row justify-center items-center h-[80px] w-[80px] rounded-tl-lg rounded-bl-lg border-r-2 gap-1 border-r-black">
						<span className="text-xl font-medium">#</span>
						<span className="text-2xl font-semibold">
							{scene.no}
						</span>
					</div>
					<div className="flex flex-col justify-center">
						<span className="text-offblack font-semibold">
							{scene.name}
						</span>
						<div className="flex flex-row justify-start items-center gap-1.5">
							<IconCircleDotted
								size={16}
								stroke={3}
								color="black"
							/>
							<span className="text-[15px] font-medium">
								Points: 10000
							</span>
						</div>
						<div className="flex flex-row justify-start items-center gap-1.5">
							<IconCamera size={16} stroke={2} color="black" />
							<span className="text-[15px] font-medium">
								Cameras: 100
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default card;
