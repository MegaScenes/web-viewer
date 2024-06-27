import { useState, useEffect } from "react";

function useDelayedLinkActivation(delay: number = 1000): boolean {
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsActive(true), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	return isActive;
}

export default useDelayedLinkActivation;
