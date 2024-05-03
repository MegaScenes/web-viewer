import { createContext } from "react";

const ControlsContext = createContext({
	handleReset: () => {},
	handleZoomIn: () => {},
	handleZoomOut: () => {},
});

export default ControlsContext;
