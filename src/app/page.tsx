"use client";
import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	Suspense,
} from "react";
import * as THREE from "three";
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
const PAN_DISTANCE = 0.5;
const ROTATE_DISTANCE = 0.01;

const initialCameraSettings = {
	position: [0, 0, 10],
	fov: 75,
	zoom: 1,
};

const panCamera = (
	controls: any,
	direction: "forward" | "backward" | "left" | "right" | "up" | "down",
	distance: number
) => {
	const panOffset = new THREE.Vector3();
	const targetDistance = controls.target.distanceTo(controls.object.position);

	switch (direction) {
		case "forward":
			panOffset.setFromMatrixColumn(controls.object.matrix, 0);
			panOffset.crossVectors(controls.object.up, panOffset);
			panOffset.multiplyScalar((distance * targetDistance) / 100);
			break;
		case "backward":
			panOffset.setFromMatrixColumn(controls.object.matrix, 0);
			panOffset.crossVectors(controls.object.up, panOffset);
			panOffset.multiplyScalar((-distance * targetDistance) / 100);
			break;
		case "left":
			panOffset.setFromMatrixColumn(controls.object.matrix, 0);
			panOffset.multiplyScalar((-distance * targetDistance) / 100);
			break;
		case "right":
			panOffset.setFromMatrixColumn(controls.object.matrix, 0);
			panOffset.multiplyScalar((distance * targetDistance) / 100);
			break;
		case "up":
			panOffset.setFromMatrixColumn(controls.object.matrix, 1);
			panOffset.multiplyScalar((distance * targetDistance) / 100);
			break;
		case "down":
			panOffset.setFromMatrixColumn(controls.object.matrix, 1);
			panOffset.multiplyScalar((-distance * targetDistance) / 100);
			break;
		default:
			break;
	}

	controls.target.add(panOffset);
	controls.object.position.add(panOffset);
	controls.update();
};

const rotateCamera = (
	controls: any,
	direction: "up" | "down" | "left" | "right",
	angle: number
) => {
	const spherical = new THREE.Spherical();
	const targetPosition = new THREE.Vector3().copy(controls.target);

	const cameraPosition = new THREE.Vector3()
		.copy(controls.object.position)
		.sub(targetPosition);
	spherical.setFromVector3(cameraPosition);

	switch (direction) {
		case "up":
			spherical.phi = Math.max(
				0,
				Math.min(Math.PI, spherical.phi - angle)
			);
			break;
		case "down":
			spherical.phi = Math.max(
				0,
				Math.min(Math.PI, spherical.phi + angle)
			);
			break;
		case "left":
			spherical.theta -= angle;
			break;
		case "right":
			spherical.theta += angle;
			break;
		default:
			break;
	}

	cameraPosition.setFromSpherical(spherical).add(targetPosition);
	controls.object.position.copy(cameraPosition);
	controls.update();
};

const Home: React.FC = () => {
	const [hud, setHud] = useState<boolean>(true);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedRec, setSelectedRec] = useState<
		[SceneType, number] | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [clearScene, setClearScene] = useState<boolean>(false);
	const [pointScale, setPointScale] = useState<number>(0.011);
	const [camScale, setCamScale] = useState<number>(0.5);
	const [shortcutsDisabled, setShortcutsDisabled] = useState<boolean>(false);
	const [isAxisEnabled, setIsAxisEnabled] = useState<boolean>(true);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const controlsRef = useRef<any>(null);
	const movementRef = useRef<{ [key: string]: boolean }>({});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (shortcutsDisabled) return;

			switch (event.key) {
				case "[": // decrease camera scale
					setCamScale((prev) =>
						Math.max(prev - 0.025, CAM_MIN_SCALE)
					);
					break;
				case "]": // increase camera scale
					setCamScale((prev) =>
						Math.min(prev + 0.025, CAM_MAX_SCALE)
					);
					break;
				case "{": // decrease point scale
					setPointScale((prev) =>
						Math.max(prev - 0.005, PT_MIN_SCALE)
					);
					break;
				case "}": // increase point scale
					setPointScale((prev) =>
						Math.min(prev + 0.005, PT_MAX_SCALE)
					);
					break;
				case "H": // toggle hud
					setHud((prev) => !prev);
					break;
				case "h": // toggle hud
					setHud((prev) => !prev);
					break;
				case "Escape": // escape invisible hud
					setHud(true);
					setIsModalOpen(false);
					break;
				case " ": // reset camera
					if (controlsRef && controlsRef.current) {
						controlsRef.current.reset();
					}
					setIsAxisEnabled(true);
					break;
				case "p": // toggle side panel
					setIsOpen((prev) => !prev);
					setIsModalOpen(false);
					break;
				case "x": // toggle axis
					setIsAxisEnabled((prev) => !prev);
					break;
				case "w": // translate forward
				case "a": // translate left
				case "s": // translate right
				case "d": // translate right
				case "q": // translate down
				case "e": // translate up
				case "ArrowUp": // rotate up
				case "ArrowDown": // rotate down
				case "ArrowLeft": // rotate left
				case "ArrowRight": // rotate right
					movementRef.current[event.key] = true;
					break;
				default:
					break;
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			switch (event.key) {
				case "w":
				case "a":
				case "s":
				case "d":
				case "q":
				case "e":
				case "ArrowUp":
				case "ArrowDown":
				case "ArrowLeft":
				case "ArrowRight":
					movementRef.current[event.key] = false;
					break;
				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [shortcutsDisabled]);

	useEffect(() => {
		const animate = () => {
			if (controlsRef.current) {
				if (movementRef.current["w"]) {
					panCamera(controlsRef.current, "forward", PAN_DISTANCE);
				}
				if (movementRef.current["a"]) {
					panCamera(controlsRef.current, "left", PAN_DISTANCE);
				}
				if (movementRef.current["s"]) {
					panCamera(controlsRef.current, "backward", PAN_DISTANCE);
				}
				if (movementRef.current["d"]) {
					panCamera(controlsRef.current, "right", PAN_DISTANCE);
				}
				if (movementRef.current["q"]) {
					panCamera(controlsRef.current, "down", PAN_DISTANCE);
				}
				if (movementRef.current["e"]) {
					panCamera(controlsRef.current, "up", PAN_DISTANCE);
				}
				if (movementRef.current["ArrowUp"]) {
					rotateCamera(controlsRef.current, "up", ROTATE_DISTANCE);
				}
				if (movementRef.current["ArrowDown"]) {
					rotateCamera(controlsRef.current, "down", ROTATE_DISTANCE);
				}
				if (movementRef.current["ArrowLeft"]) {
					rotateCamera(controlsRef.current, "left", ROTATE_DISTANCE);
				}
				if (movementRef.current["ArrowRight"]) {
					rotateCamera(controlsRef.current, "right", ROTATE_DISTANCE);
				}
			}

			requestAnimationFrame(animate);
		};

		animate();
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

	const togglePanel = useCallback((value: boolean) => {
		setIsOpen(value);
		if (value) {
			setIsModalOpen(false);
		}
	}, []);

	const handleSelectScene = useCallback((scene: SceneType, no: number) => {
		setIsLoading(true);
		setClearScene(true);
		setSelectedRec([scene, no]);
		setClearScene(false);
	}, []);

	const handleOnLoaded = useCallback(() => {
		if (hud) setIsLoading(false);
	}, [hud]);

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

	const handleDisableShortcuts = useCallback((value: boolean) => {
		setShortcutsDisabled(value);
	}, []);

	const handleOnOpenModal = useCallback(() => {
		setIsModalOpen(true);
		togglePanel(false);
	}, []);

	const handleOnCloseModle = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	useEffect(() => {
		if (selectedRec) {
			setIsLoading(true);
		}
	}, [selectedRec]);

	return (
		<Suspense
			fallback={
				<div className={`bg-darkgrey flex items-center justify-center`}>
					<div
						className={`animate-spin rounded-full border-t-4 border-white h-12 w-12`}
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
									disableShortcuts={handleDisableShortcuts}
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
									isAxisEnabled={isAxisEnabled}
									isModalOpen={isModalOpen}
									onChangeHUD={() => setHud(false)}
									onOpenModal={handleOnOpenModal}
									onCloseModal={handleOnCloseModle}
									onAxisToggle={() =>
										setIsAxisEnabled((prev) => !prev)
									}
								/>
							</>
						)}
					</div>
				</div>
				<div className="flex-grow relative">
					<div
						className={`absolute w-full h-full bg-darkgrey flex items-center justify-center`}
					>
						{isLoading && (
							<div className="flex items-center justify-center absolute inset-0">
								<div
									className={`border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-8 w-8`}
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
								isAxisEnabled={isAxisEnabled}
								onLoaded={handleOnLoaded}
								clearScene={clearScene}
							/>
						) : (
							<div
								className={`flex items-center justify-center h-full text-white`}
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
					scene={selectedRec ? selectedRec[0] : undefined}
					rec_no={selectedRec ? selectedRec[1] : undefined}
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
