"use client";
import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	Suspense,
} from "react";
import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import("../components/ModelViewer"), {
	ssr: false,
});

import { IconZoomIn, IconZoomOut, IconRefresh } from "@tabler/icons-react";
import OptionsDropdown from "../components/OptionsDropdown";
import SidePanel from "../components/SidePanel";
import SearchBar from "../components/SearchBar";
import { SceneType } from "@/types/scene";

const CAM_MAX_SCALE = 5;
const CAM_MIN_SCALE = 0.2;

const Home: React.FC = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedRec, setSelectedRec] = useState<
		[SceneType, number] | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [clearScene, setClearScene] = useState(false);
	const [counts, setCounts] = useState<[number, number, number] | undefined>(
		undefined
	);
	const [camScale, setCamScale] = useState(1);
	const [altKeyDown, setAltKeyDown] = useState(false);
	const controlsRef = useRef<any>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Alt") {
				setAltKeyDown(true);
				if (controlsRef.current) {
					controlsRef.current.enableZoom = false;
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Alt") {
				setAltKeyDown(false);
				if (controlsRef.current) {
					controlsRef.current.enableZoom = true;
				}
			}
		};

		const handleWheel = (event: WheelEvent) => {
			if (altKeyDown) {
				event.preventDefault(); // prevent the page from scrolling
				const newScale = camScale + (event.deltaY > 0 ? -0.05 : 0.05); // adjust scale based on scroll direction
				setCamScale(
					Math.min(Math.max(newScale, CAM_MIN_SCALE), CAM_MAX_SCALE)
				);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("wheel", handleWheel);
		};
	}, []);

	const handleZoomIn = useCallback(() => {
		if (altKeyDown) {
			setCamScale((prev) => Math.min(prev + 0.1, CAM_MAX_SCALE));
		} else {
			if (controlsRef.current) {
				const camera = controlsRef.current.object;
				camera.zoom *= 1.1;
				camera.updateProjectionMatrix();
			}
		}
	}, [altKeyDown]);

	const handleZoomOut = useCallback(() => {
		if (altKeyDown) {
			setCamScale((prev) => Math.max(prev - 0.1, CAM_MIN_SCALE));
		} else {
			if (controlsRef.current) {
				const camera = controlsRef.current.object;
				camera.zoom *= 0.9;
				camera.updateProjectionMatrix();
			}
		}
	}, [altKeyDown]);

	const togglePanel = useCallback((bool: boolean) => {
		setIsOpen(bool);
	}, []);

	const handleSelectScene = useCallback((scene: SceneType, no: number) => {
		setIsLoading(true);
		setClearScene(true);
		setSelectedRec([scene, no]);
		setClearScene(false);
	}, []);

	const handleOnLoaded = useCallback(() => {
		setIsLoading(false);
	}, []);

	const handleUpdateCounts = useCallback(
		(pts: number, cams: number) => {
			if (selectedRec) setCounts([pts, cams, selectedRec[1]]);
		},
		[selectedRec]
	);

	useEffect(() => {
		if (selectedRec) {
			setIsLoading(true);
		}
	}, [selectedRec]);

	return (
		<Suspense
			fallback={
				<div className="fixed inset-0 bg-darkgrey flex items-center justify-center">
					<div className="animate-spin rounded-full border-t-4 border-white h-12 w-12"></div>
				</div>
			}
		>
			<div className="flex flex-col h-screen">
				<div className="absolute top-3 left-0 w-full flex flex-row items-center justify-end px-4 py-2 z-10">
					<div className="flex flex-row items-center justify-between mr-3 gap-4">
						<SearchBar
							onOptionClick={handleSelectScene}
							togglePanel={togglePanel}
						/>
						<OptionsDropdown />
					</div>
				</div>
				<div className="flex-grow relative bg-gray-100">
					<div className="absolute w-full h-full bg-darkgrey flex items-center justify-center">
						{isLoading && (
							<div className="flex items-center justify-center absolute inset-0">
								<div className="border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-8 w-8"></div>
							</div>
						)}
						{selectedRec ? (
							<ModelViewer
								key={selectedRec[0].id}
								id={selectedRec[0].id}
								no={selectedRec[1]}
								camScale={camScale}
								controlsRef={controlsRef}
								updateCounts={handleUpdateCounts}
								onLoaded={handleOnLoaded}
								clearScene={clearScene}
							/>
						) : (
							<div className="flex items-center justify-center h-full text-white">
								<span>No scene selected</span>
							</div>
						)}
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
						onClick={handleZoomIn}
					>
						<IconZoomIn size={24} stroke={1.5} color="black" />
					</button>
					<button
						className="absolute right-[91px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
						aria-label="Zoom Out"
						onClick={handleZoomOut}
					>
						<IconZoomOut size={24} stroke={1.5} color="black" />
					</button>
				</div>
			</div>

			<SidePanel
				scene={selectedRec ? selectedRec[0] : undefined}
				rec_no={selectedRec ? selectedRec[1] : undefined}
				numOfPts={counts ? counts[0] : undefined}
				numOfCams={counts ? counts[1] : undefined}
				onSelect={handleSelectScene}
				isOpen={isOpen}
				togglePanel={(bool: boolean) => togglePanel(bool)}
			/>
		</Suspense>
	);
};

export default Home;
