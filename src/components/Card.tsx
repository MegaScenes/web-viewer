import React from "react";

import { IconHash, IconFileCode } from "@tabler/icons-react";

const card: React.FC = () => {
	return (
		<div className="bg-whiteish shadow-lg rounded-lg h-[80px] flex flex-col justify-center items-center">
			<div className="flex flex-row h-[80px] w-full gap-2 justify-start">
				<img
					src="/images/statue_of_liberty.jpeg"
					alt="Statue of Liberty"
					className="h-[80px] w-[80px] rounded-tl-lg rounded-bl-lg"
				/>
				<div className="flex flex-col justify-center">
					<span className="text-offblack font-semibold">
						Statue of Liberty
					</span>
					<div className="flex flex-row justify-start items-center gap-1">
						<IconHash size={16} stroke={2} color="black" />
						<span className="text-[15px] font-medium">
							of reconstructions: 5
						</span>
					</div>
					<div className="flex flex-row justify-start items-center gap-1">
						<IconFileCode size={16} stroke={2} color="black" />
						<span className="text-[15px] font-medium">
							File size: 400 MB
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default card;
