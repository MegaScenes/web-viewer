"use client";

import React from "react";
import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import("../components/ModelViewer"), {
	ssr: false,
});

import {
	IconZoomIn,
	IconZoomOut,
	IconRefresh,
	IconMenu2,
} from "@tabler/icons-react";
import OptionsDropdown from "../components/OptionsDropdown";
import SidePanel from "../components/SidePanel";

const Home = () => {
	return (
		<>
			<div className="flex flex-col h-screen">
				<div className="absolute top-3 left-0 w-full flex flex-row items-center justify-end px-4 py-2 z-10">
					<div className="flex flex-row items-center justify-between mr-3">
						<input
							type="search"
							name="search bar"
							placeholder="Search for scene..."
							className="w-full min-w-96 mx-4 p-2 text-black bg-white rounded shadow-lg"
						/>
						<OptionsDropdown />
					</div>
				</div>
				<div className="flex-grow relative bg-gray-100">
					<div className="absolute w-full h-full bg-greyish">
						<ModelViewer
							pointsUrl="/qutb_minar/0/points3D.bin"
							imagesUrl="/qutb_minar/0/images.bin"
						/>
					</div>

					<button
						className="absolute right-[30px] bottom-[147px] p-3 bg-red-500 rounded-full text-white shadow-lg"
						aria-label="Reset Button"
					>
						<IconRefresh size={24} stroke={1.5} color="white" />
					</button>
					<button
						className="absolute right-[30px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
						aria-label="Zoom In"
					>
						<IconZoomIn size={24} stroke={1.5} color="black" />
					</button>
					<button
						className="absolute right-[91px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
						aria-label="Zoom Out"
					>
						<IconZoomOut size={24} stroke={1.5} color="black" />
					</button>
				</div>
			</div>
			<SidePanel />
		</>
	);
};

export default Home;
