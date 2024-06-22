import React from "react";

interface KeyProps {
	label: React.ReactNode;
}

const Key: React.FC<KeyProps> = ({ label }) => (
	<div className="flex flex-row justify-center items-center w-[70px] h-[70px] rounded-2xl border-white border-2">
		<span className="font-serif font-extralight text-xl">{label}</span>
	</div>
);

export default Key;
