import React, { useState, useEffect, useMemo } from "react";
import {
    IconChevronCompactRight,
    IconChevronCompactLeft,
    IconMinusVertical,
    IconX,
    IconPaperclip,
    IconBrandGithub,
    IconDatabase,
    IconWorld,
    IconCheck
} from "@tabler/icons-react";
import Tooltip from "@mui/material/Tooltip";

import Card from "./Card";
import { SceneType } from "../../types";

interface SidePanelProps {
    scene?: SceneType;
    rec_no?: number;
    onSelect: (scene: SceneType, no: number) => void;
    isOpen: boolean;
    togglePanel: (bool: boolean) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
    scene,
    rec_no,
    isOpen,
    togglePanel,
}) => {
    const [iconState, setIconState] = useState<string>("right");
    const [showButton, setShowButton] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [reconData, setReconData] = useState<Map<number, any>>(new Map());

    useEffect(() => {
        if (isOpen) {
            setIconState("line");
        } else {
            setIconState("right");
        }
        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => {
                setShowButton(true);
            }, 300);
        } else {
            setShowButton(false);
        }

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleMouseEnter = () => {
        if (isOpen && iconState === "line") {
            setIconState("left");
        }
    };

    const handleMouseLeave = () => {
        if (isOpen) {
            setIconState("line");
        }
    };

    const getIcon = () => {
        switch (iconState) {
            case "right":
                return (
                    <IconChevronCompactRight
                        size={24}
                        color="white"
                        stroke={3}
                    />
                );
            case "line":
                return <IconMinusVertical size={24} color="white" stroke={4} />;
            case "left":
                return (
                    <IconChevronCompactLeft
                        size={24}
                        color="white"
                        stroke={3}
                    />
                );
            default:
                return (
                    <IconChevronCompactRight
                        size={24}
                        color="white"
                        stroke={3}
                    />
                );
        }
    };

    // process point + camera metadata
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://megascenes.s3.us-west-2.amazonaws.com/metadata/recon_metadata.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const dataMap = new Map<number, any>();
                Object.entries(data).forEach(([key, value]: [string, any]) => {
                    dataMap.set(parseInt(key, 10), value.slice(2));
                });
                setReconData(dataMap)
            } catch (error) {
                console.error('Failed to fetch scenes:', error);
            }
        };

        fetchData();
    }, []);

    const handleEmailClick = () => {
        const email = "megascenes.dataset@gmail.com";
        navigator.clipboard.writeText(email).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <>
            <div className="fixed inset-y-0 left-0 z-20 flex select-none">
                <div
                    className={`transform transition-all duration-350 overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
                        } bg-greyish h-full fixed inset-y-0 left-0 w-full md:w-96 p-4 shadow-lg flex flex-row justify-center`}
                >
                    <div className="flex flex-col justify-between items-center w-full h-auto">
                        <div className="flex flex-col w-10/12 md:w-11/12 mt-4 md:mt-2">
                            {scene ? (
                                <h2
                                    className={`text-lg md:text-xl font-bold mb-4 text-offwhite break-all`}
                                >
                                    Viewing Reconstruction{" "}
                                    <span className="text-blue-500">
                                        #<span className="mr-0.5"></span>
                                        {rec_no}
                                    </span>{" "}
                                    for <br />
                                    &quot;
                                    {scene.normalized_name}&quot;:
                                </h2>
                            ) : (
                                <>
                                    <h2
                                        className={`text-xl font-bold mb-4 text-offwhite`}
                                    >
                                        Search for a scene in the search bar!
                                    </h2>
                                    <br />
                                    <div className="text-offwhite">
                                        <div className="mb-2">
                                            Website:{" "}
                                            <a href="https://megascenes.github.io/" target="_blank" rel="noopener noreferrer">
                                                <IconWorld className="inline-block ml-2 mb-1 text-blue-500" />
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            Paper:{" "}
                                            <a href="https://megascenes.github.io/MegaScenes_paper_v1.pdf" target="_blank" rel="noopener noreferrer">
                                                <IconPaperclip className="inline-block ml-2 mb-1 text-blue-500" />
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            GitHub:{" "}
                                            <a href="https://github.com/MegaScenes" target="_blank" rel="noopener noreferrer">
                                                <IconBrandGithub className="inline-block ml-2 mb-1 text-blue-500" />
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            Dataset:{" "}
                                            <a href="https://github.com/MegaScenes/dataset" target="_blank" rel="noopener noreferrer">
                                                <IconDatabase className="inline-block ml-2 mb-1 text-blue-500" />
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            Email:{" "}
                                            <span onClick={handleEmailClick} className="ml-2 select-text">{isCopied ? (
                                                <span>
                                                    [
                                                    <span>Copied!</span>
                                                    ]
                                                </span>
                                            ) : (
                                                <Tooltip title="Click to copy" arrow>
                                                    <span className="underline cursor-pointer">
                                                        [
                                                        <span className="underline text-blue-500">megascenes.dataset@gmail.com</span>
                                                        ]
                                                    </span>
                                                </Tooltip>
                                            )}</span>
                                            {isCopied && (
                                                <IconCheck className="inline-block ml-2 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex flex-col gap-4 select-none pb-4">
                                {scene &&
                                    Array.from(
                                        {
                                            length: scene.no_of_rec,
                                        },
                                        (_, index) => (
                                            <Card
                                                key={index}
                                                rec_no={index}
                                                scene={scene}
                                                numOfPts={
                                                    reconData.get(scene.id)[
                                                    index * 2 + 1
                                                    ]
                                                }
                                                numOfCams={
                                                    reconData.get(scene.id)[
                                                    index * 2
                                                    ]
                                                }
                                                isSelected={
                                                    rec_no !== undefined &&
                                                    index === rec_no
                                                }
                                            />
                                        )
                                    )}
                            </div>

                        </div>
                        <div className="pb-4 flex items-center justify-center bg-greyish rounded-lg">
                            <span className="text-red-500 mr-2">
                                Broken reconstruction?
                            </span>

                            <a className="text-blue-500 hover:text-blue-700 underline" href="https://forms.gle/SbH8rwraTU2n5etC9" target="_blank" rel="noopener noreferrer">
                                click here
                            </a>
                        </div>
                    </div>
                </div>
                <div
                    className="relative flex items-center"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => {
                            togglePanel(!isOpen);
                        }}
                        className={`hidden md:block text-offwhite font-bold py-2 px-4 rounded absolute top-1/2 transform -translate-y-1/2 transition-all duration-350 ${isOpen ? "translate-x-64" : "translate-x-0"
                            }`}
                        style={{
                            zIndex: 21,
                            transform: `translate(${isOpen ? "calc(24rem - 10px)" : "-10px"
                                }, -50%)`,
                        }}
                    >
                        {getIcon()}
                    </button>
                </div>
            </div>
            {showButton && (
                <button
                    className="md:hidden absolute top-5 right-5 z-40"
                    onClick={() => {
                        togglePanel(false);
                    }}
                >
                    <IconX size={24} stroke={2.5} color="white" />
                </button>
            )}
        </>
    );
};

export default SidePanel;
