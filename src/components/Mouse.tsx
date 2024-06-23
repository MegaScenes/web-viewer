import React from "react";

const Mouse: React.FC = () => (
	<>
		<div className="relative"></div>
		<div className="relative">
			<svg
				width="50"
				height="100"
				viewBox="0 0 50 300"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="stroke-current text-white translate-x-[66px] translate-y-[1px]"
			>
				<path
					d="M25 0 Q0 50, 25 100 T25 200 T25 300"
					stroke="currentColor"
					strokeWidth="10"
					fill="transparent"
				/>
			</svg>
			<div className="h-[270px] w-[180px] rounded-full border-2 border-white"></div>
			<div className="absolute w-[2px] h-[80px] top-[100px] left-[90px] bg-white"></div>
			<div className="absolute w-[24px] h-[52px] bg-transparent border-2 border-white rounded-full top-[180px] left-[79px]"></div>
			<div className="absolute w-[79px] h-[2px] top-[206px] left-0 bg-white"></div>
			<div className="absolute w-[77px] h-[2px] top-[206px] left-[103px] bg-white"></div>
			<span className="absolute top-[156px] left-[20px] text-medium text-white opacity-80 font-light">
				Rotate
			</span>
			<span className="absolute top-[156px] right-[12px] text-medium text-white opacity-80 font-light">
				Translate
			</span>
			<span className="absolute top-[236px] left-[70px] text-medium text-white opacity-80 font-light">
				Zoom
			</span>
			<span className="absolute top-[280px] left-[54px] text-xs font-semibold text-white leading-relaxed tracking-wider opacity-90">
				Double Click <br /> Cameras for <br /> Image Meta!
			</span>
		</div>
	</>
);

export default Mouse;
