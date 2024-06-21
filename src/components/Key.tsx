import React from "react";

interface KeyProps {
	label: React.ReactNode;
}

const Key: React.FC<KeyProps> = ({ label }) => (
	<div className="w-[100px] h-[100px]">
		<span className="">{label}</span>
	</div>
);

export default Key;
