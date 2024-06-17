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

const CAM_MAX_SCALE = 1;
const CAM_MIN_SCALE = 0.05;
const PT_MAX_SCALE = 0.1;
const PT_MIN_SCALE = 0.005;

const initialCameraSettings = {
	position: [0, 0, 10],
	fov: 75,
	zoom: 1,
};

const Home: React.FC = () => {
	const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
	const [hud, setHud] = useState<boolean>(true);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedRec, setSelectedRec] = useState<
		[SceneType, number] | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [clearScene, setClearScene] = useState<boolean>(false);
	const [counts, setCounts] = useState<[number, number, number] | undefined>(
		undefined
	);
	const [pointScale, setPointScale] = useState<number>(0.011);
	const [camScale, setCamScale] = useState<number>(0.5);
	const controlsRef = useRef<any>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case "[":
					setCamScale((prev) =>
						Math.max(prev - 0.025, CAM_MIN_SCALE)
					);
					break;
				case "]":
					setCamScale((prev) =>
						Math.min(prev + 0.025, CAM_MAX_SCALE)
					);
					break;
				case "{":
					setPointScale((prev) =>
						Math.max(prev - 0.005, PT_MIN_SCALE)
					);
					break;
				case "}":
					setPointScale((prev) =>
						Math.min(prev + 0.005, PT_MAX_SCALE)
					);
					break;
				case "`":
					setHud((prev) => !prev);
					break;
				case "Escape":
					setHud(true);
					break;
				case " ":
					if (controlsRef && controlsRef.current) {
						controlsRef.current.reset();
					}
					break;
				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const handleOnChangeTheme = useCallback(() => {
		setIsDarkTheme((prev) => !prev);
	}, []);

	const handleZoomIn = useCallback(() => {
		if (controlsRef.current) {
			const camera = controlsRef.current.object;
			camera.zoom *= 1.1;
			camera.updateProjectionMatrix();
		}
	}, []);

	const handleZoomOut = useCallback(() => {
		if (controlsRef.current) {
			const camera = controlsRef.current.object;
			camera.zoom *= 0.9;
			camera.updateProjectionMatrix();
		}
	}, []);

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

	const handleResetCamera = useCallback(() => {
		if (controlsRef.current) {
			const controls = controlsRef.current;
			const camera = controls.object;

			camera.position.set(...initialCameraSettings.position);
			camera.fov = initialCameraSettings.fov;
			camera.zoom = initialCameraSettings.zoom;
			camera.updateProjectionMatrix();

			controls.target.set(0, 0, 0);
			controls.update();
		}
	}, []);

	useEffect(() => {
		if (selectedRec) {
			setIsLoading(true);
		}
	}, [selectedRec]);

	return (
		<Suspense
			fallback={
				<div
					className={`fixed inset-0 ${
						isDarkTheme ? "bg-darkgrey" : ""
					} flex items-center justify-center`}
				>
					<div
						className={`animate-spin rounded-full border-t-4 ${
							isDarkTheme ? "border-white" : "border-black"
						} h-12 w-12`}
					></div>
				</div>
			}
		>
			<div className="flex flex-col h-screen">
				<div className="absolute top-3 left-0 w-full flex flex-row items-center justify-end px-4 py-2 z-10">
					<div className="flex flex-row items-center justify-between mr-3 gap-4">
						{hud && (
							<>
								<SearchBar
									onOptionClick={handleSelectScene}
									togglePanel={togglePanel}
								/>
								<OptionsDropdown
									id={
										selectedRec
											? selectedRec[0].id
											: undefined
									}
									rec_no={
										selectedRec ? selectedRec[1] : undefined
									}
									onChangeTheme={handleOnChangeTheme}
									onChangeHUD={() => setHud(false)}
								/>
							</>
						)}
					</div>
				</div>
				<div className="flex-grow relative">
					<div
						className={`absolute w-full h-full ${
							isDarkTheme ? "bg-darkgrey" : "bg-offwhite"
						} flex items-center justify-center`}
					>
						{isLoading && (
							<div className="flex items-center justify-center absolute inset-0">
								<div
									className={`border-t-transparent border-solid animate-spin rounded-full ${
										isDarkTheme
											? "border-white"
											: "border-black"
									} border-4 h-8 w-8`}
								></div>
							</div>
						)}
						{selectedRec ? (
							<ModelViewer
								key={selectedRec[0].id}
								id={selectedRec[0].id}
								no={selectedRec[1]}
								pointScale={pointScale}
								camScale={camScale}
								controlsRef={controlsRef}
								updateCounts={handleUpdateCounts}
								onLoaded={handleOnLoaded}
								clearScene={clearScene}
							/>
						) : (
							<div
								className={`flex items-center justify-center h-full ${
									isDarkTheme ? "text-white" : "text-black"
								}`}
							>
								<span>No scene selected</span>
							</div>
						)}
					</div>
					{hud && (
						<>
							<button
								className="absolute right-[30px] bottom-[147px] p-3 bg-red-500 rounded-full text-white shadow-lg"
								aria-label="Reset Button"
								onClick={handleResetCamera}
							>
								<IconRefresh
									size={24}
									stroke={1.5}
									color="white"
								/>
							</button>
							<button
								className="absolute right-[30px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
								aria-label="Zoom In"
								onClick={handleZoomIn}
							>
								<IconZoomIn
									size={24}
									stroke={1.5}
									color="black"
								/>
							</button>
							<button
								className="absolute right-[91px] bottom-[30px] p-3 bg-white rounded-full text-white shadow-lg"
								aria-label="Zoom Out"
								onClick={handleZoomOut}
							>
								<IconZoomOut
									size={24}
									stroke={1.5}
									color="black"
								/>
							</button>
						</>
					)}
				</div>
			</div>
			{hud && (
				<SidePanel
					isDarkTheme={isDarkTheme}
					scene={selectedRec ? selectedRec[0] : undefined}
					rec_no={selectedRec ? selectedRec[1] : undefined}
					numOfPts={counts ? counts[0] : undefined}
					numOfCams={counts ? counts[1] : undefined}
					onSelect={(scene: SceneType, no: number) => {
						handleSelectScene(scene, no);
					}}
					isOpen={isOpen}
					togglePanel={(bool: boolean) => togglePanel(bool)}
				/>
			)}
		</Suspense>
	);
};

export default Home;
