import React from "react";

import {
	IconX,
	IconRotate,
	IconArrowNarrowUp,
	IconArrowNarrowLeft,
	IconArrowNarrowDown,
	IconArrowNarrowRight,
	IconAxisX,
	IconArrowsMove,
	IconCamera,
	IconCircleDotted,
	IconDeviceGamepad,
	IconLayoutSidebarLeftExpandFilled,
} from "@tabler/icons-react";
import Key from "./Key";
import Mouse from "./Mouse";

const ControlsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
	<div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
		<div className="relative bg-gray-600 text-white rounded-lg shadow-lg p-4 border-2 max-w-full">
			<button className="absolute top-5 right-5" onClick={onClose}>
				<IconX size={24} stroke={2.5} color="white" />
			</button>
			<div className="flex flex-col justify-start items-center">
				<div className="flex flex-row gap-3 justify-center items-center text-3xl font-semibold font-cursive">
					<span>🏛️</span>
					<span>Shortcuts</span>
					<span className="font-serif text-sm">
						(Press{" "}
						<kbd className="rounded-[2px] p-[1px] border-[1px]">
							esc
						</kbd>{" "}
						to dismiss)
					</span>
				</div>
				<div className="flex flex-row justify-center items-center gap-4 p-8">
					<div className="flex flex-col justify-evenly items-center gap-2">
						<div className="flex flex-row gap-8 justify-center items-center">
							<div className="flex flex-col justify-start items-center gap-2">
								<div className="flex flex-row justify-center items-center gap-2 mr-4">
									<IconArrowsMove stroke={2} />
									<span className="text-center text-xl text-white font-light">
										Translate
									</span>
								</div>
								<div className="flex justify-center items-center">
									<div className="flex flex-col justify-center items-center gap-1">
										<div className="flex flex-row justify-start items-center gap-1">
											<div className="flex flex-col justify-center items-center">
												<span className="text-center text-medium text-white opacity-80 font-light">
													Down
												</span>
												<Key label="Q" />
											</div>
											<div className="flex flex-col justify-center items-center">
												<span className="text-center text-medium text-white opacity-80 font-light">
													Forward
												</span>
												<Key label="W" />
											</div>
											<div className="flex flex-col justify-center items-center">
												<span className="text-center text-medium text-white opacity-80 font-light">
													Up
												</span>
												<Key label="E" />
											</div>
											<div className="w-[20px]"></div>
										</div>
										<div className="flex flex-row justify-center items-center gap-1">
											<div className="w-[20px]"></div>
											<div className="flex flex-col justify-center items-center">
												<Key label="A" />
												<span className="text-center text-medium text-white opacity-80 font-light">
													Left
												</span>
											</div>
											<div className="flex flex-col justify-center items-center">
												<Key label="S" />
												<span className="text-center text-medium text-white opacity-80 font-light">
													Backward
												</span>
											</div>
											<div className="flex flex-col justify-center items-center">
												<Key label="D" />
												<span className="text-center text-medium text-white opacity-80 font-light">
													Right
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col justify-evenly items-center gap-3">
								<div className="flex flex-row justify-evenly items-center gap-8">
									<div className="flex flex-col justify-start items-center gap-2">
										<div className="flex flex-row justify-center items-center gap-2">
											<IconCamera stroke={2} />
											<span className="text-center text-lg text-white font-light">
												Camera Size
											</span>
										</div>
										<div className="flex justify-center items-center">
											<div className="flex flex-row justify-center items-center gap-1">
												<div className="flex flex-col justify-center items-center">
													<Key label="[" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Decrease
													</span>
												</div>
												<div className="flex flex-col justify-center items-center">
													<Key label="]" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Increase
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="flex flex-col justify-start items-center gap-2">
										<div className="flex flex-row justify-center items-center gap-2">
											<IconCircleDotted stroke={2} />
											<span className="text-center text-lg text-white font-light">
												Point Size
											</span>
										</div>
										<div className="flex justify-center items-center">
											<div className="flex flex-row justify-center items-center gap-1">
												<div className="flex flex-col justify-center items-center">
													<Key label="{" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Decrease
													</span>
												</div>
												<div className="flex flex-col justify-center items-center">
													<Key label="}" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Increase
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-row justify-evenly items-center gap-4">
									<div className="flex flex-col justify-start items-center gap-2">
										<div className="flex flex-row justify-center items-center gap-2">
											<IconAxisX stroke={2} />
											<span className="text-center text-lg text-white font-light">
												Toggle Axis
											</span>
										</div>
										<div className="flex justify-center items-center">
											<div className="flex flex-row justify-center items-center gap-1">
												<div className="flex flex-col justify-center items-center">
													<Key label="X" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Show/Hide
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="flex flex-col justify-start items-center gap-2">
										<div className="flex flex-row justify-center items-center gap-2">
											<IconDeviceGamepad stroke={2} />
											<span className="text-center text-lg text-white font-light">
												Toggle HUD
											</span>
										</div>
										<div className="flex justify-center items-center">
											<div className="flex flex-row justify-center items-center gap-1">
												<div className="flex flex-col justify-center items-center">
													<Key label="H" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Show/Hide
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="flex flex-col justify-start items-center gap-2">
										<div className="flex flex-row justify-center items-center gap-2">
											<IconLayoutSidebarLeftExpandFilled
												stroke={2}
											/>
											<span className="text-center text-lg text-white font-light">
												Side Panel
											</span>
										</div>
										<div className="flex justify-center items-center">
											<div className="flex flex-row justify-center items-center gap-1">
												<div className="flex flex-col justify-center items-center">
													<Key label="P" />
													<span className="text-center text-medium text-white opacity-80 font-light">
														Show/Hide
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-center items-center gap-16">
							<div className="flex flex-col justify-center gap-1">
								<div className="flex flex-row justify-center items-center w-[370px] h-[70px] rounded-2xl border-white border-2">
									<span className="font-serif font-extralight text-xl">
										Space
									</span>
								</div>
								<span className="text-center text-medium text-white opacity-80 font-light">
									Reset View
								</span>
							</div>
							<div className="flex flex-col justify-start items-center gap-2">
								<div className="flex flex-row justify-center items-center gap-2 mr-2">
									<IconRotate stroke={2} />
									<span className="text-center text-xl text-white font-light">
										Rotate
									</span>
								</div>
								<div className="flex justify-center items-center">
									<div className="flex flex-col justify-center items-center gap-1">
										<div className="flex flex-row justify-center items-center">
											<div className="flex flex-col justify-center items-center">
												<span className="text-center text-medium text-white opacity-80 font-light">
													Up
												</span>
												<Key
													label={
														<IconArrowNarrowUp
															size={32}
															stroke={2}
														/>
													}
												/>
											</div>
										</div>
										<div className="flex flex-row justify-center items-center gap-1">
											<div className="flex flex-col justify-center items-center">
												<Key
													label={
														<IconArrowNarrowLeft
															size={32}
															stroke={2}
														/>
													}
												/>
												<span className="text-center text-medium text-white opacity-80 font-light">
													Left
												</span>
											</div>
											<div className="flex flex-col justify-center items-center">
												<Key
													label={
														<IconArrowNarrowDown
															size={32}
															stroke={2}
														/>
													}
												/>
												<span className="text-center text-medium text-white opacity-80 font-light">
													Down
												</span>
											</div>
											<div className="flex flex-col justify-center items-center">
												<Key
													label={
														<IconArrowNarrowRight
															size={32}
															stroke={2}
														/>
													}
												/>
												<span className="text-center text-medium text-white opacity-80 font-light">
													Right
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<Mouse />
				</div>
			</div>
		</div>
	</div>
);

export default ControlsModal;
