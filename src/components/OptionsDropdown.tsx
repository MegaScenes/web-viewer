import React from "react";
import { IconChevronsDown } from "@tabler/icons-react";

// will need a url as prop for downloading a binary file
const OptionsDropdown = () => {
	return (
		<button className="bg-gray-600 pl-5 pr-5 pt-2 pb-2 rounded-full shadow-lg">
			<div className="flex flex-row items-center justify-center gap-1">
				<span className="text-white font-semibold">Options</span>
				<IconChevronsDown size={24} stroke={1.5} color="white" />
			</div>
		</button>
	);
};

export default OptionsDropdown;
