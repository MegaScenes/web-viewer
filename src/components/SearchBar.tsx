import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { VariableSizeList as List } from "react-window";
import { useRouter } from "next/navigation";
import { SceneType } from "../../types";
import { IconMenu2 } from "@tabler/icons-react";

const OuterElementContext = React.createContext({});
const OuterElementType = React.memo(
	React.forwardRef<HTMLDivElement>((props, ref) => {
		const outerProps = React.useContext(OuterElementContext);
		return <div ref={ref} {...props} {...outerProps} />;
	})
);
OuterElementType.displayName = "OuterElementType";

const ListboxComponent = React.memo(
	React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
		(props, ref) => {
			const { children, ...other } = props;
			const itemData = React.Children.toArray(children);
			const itemCount = itemData.length;

			return (
				<div ref={ref}>
					<OuterElementContext.Provider value={other}>
						<List
							height={250}
							width="100%"
							itemData={itemData}
							itemCount={itemCount}
							itemSize={() => 40}
							outerElementType={OuterElementType}
						>
							{({ data, index, style }) => (
								<div
									style={{
										...style,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										paddingRight: 10,
										cursor: "pointer",
										backgroundColor: "white",
									}}
									key={index}
								>
									{data[index]}
								</div>
							)}
						</List>
					</OuterElementContext.Provider>
				</div>
			);
		}
	)
);
ListboxComponent.displayName = "ListboxComponent";

import catToIdData from "../../public/data/recon_cat_to_id.json";
import idToRecCtData from "../../public/data/id_and_recon_ct.json";

interface SearchBarProps {
	onOptionClick: (scene: SceneType, rec_no: number) => void;
	togglePanel: (bool: boolean) => void;
	disableShortcuts: (bool: boolean) => void;
}
interface IdToRecCtMap {
	[key: string]: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
	onOptionClick,
	togglePanel,
	disableShortcuts,
}) => {
	const [inputValue, setInputValue] = useState("");
	const [value, setValue] = useState<SceneType | string | null>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [scenes, setScenes] = useState<SceneType[]>([]);
	const router = useRouter();
	const searchParams = useSearchParams();

	const idToRecCtMap = useMemo(() => {
		return idToRecCtData.reduce((acc, [id, number]) => {
			acc[id.toString()] = number;
			return acc;
		}, {} as IdToRecCtMap);
	}, []);

	const favoriteScenes = useMemo(() => {
		return [
			"Pantheon de Paris",
			"Giralda",
			"Dome des Invalides",
			"Great Sphynx - Louvre A23",
			"Qutb Minar",
			"Wooden church in Calinesti Caeni",
			"Kapellbrucke",
			"Puits de Moise",
			"Puerta de Europa, Madrid",
			"Karmravor",
			"Teide",
		];
	}, []);

	// load scenes
	useEffect(() => {
		const loadedScenes = Object.entries(catToIdData).map(([name, id]) => ({
			id,
			name,
			normalized_name: name
				.replace(/_/g, " ")
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, ""),
			no_of_rec: idToRecCtMap[id],
		}));
		setScenes(loadedScenes);

		const id = searchParams.get("id");
		const rec_no = searchParams.get("rec_no");
		if (id && rec_no) {
			const sceneId = parseInt(id, 10);
			const foundScene = loadedScenes.find(
				(scene) => scene.id === sceneId
			);
			if (foundScene) {
				onOptionClick(foundScene, Number(rec_no));
				setValue(foundScene.normalized_name);
				togglePanel(true);
			}
		}
	}, [searchParams, idToRecCtMap, onOptionClick, togglePanel]);

	const handleOptionClick = (option: SceneType) => {
		router.push(`/?id=${encodeURIComponent(option.id)}&rec_no=0`);
	};

	const getOptionLabel = (option: string | SceneType) => {
		return typeof option === "string" ? option : option.normalized_name;
	};

	const filterOptions = (options: any[], _: any) => {
		const filtered = options.filter((option) =>
			typeof option === "string"
				? option.toLowerCase().includes(inputValue.toLowerCase())
				: option.normalized_name
						.toLowerCase()
						.includes(inputValue.toLowerCase())
		);
		// round bottom corners with no options available
		if (filtered.length === 0 && inputValue) {
			setIsDropdownOpen(false);
		}

		const favoriteFiltered = filtered.filter((option) =>
			favoriteScenes.includes(option.normalized_name)
		);
		const nonFavoriteFiltered = filtered.filter(
			(option) => !favoriteScenes.includes(option.normalized_name)
		);

		if (!inputValue) {
			nonFavoriteFiltered.sort((a, b) =>
				a.normalized_name.localeCompare(b.normalized_name)
			);
			return [...favoriteFiltered, ...nonFavoriteFiltered];
		}
		return filtered;
	};

	const options = useMemo(() => scenes, [scenes]);

	return (
		<Autocomplete
			freeSolo
			openOnFocus
			id="free-solo-scene-search"
			inputValue={inputValue}
			value={
				value
					? typeof value === "string"
						? value
						: value.normalized_name
					: null
			}
			onInputChange={(event, newInputValue) =>
				setInputValue(newInputValue)
			}
			onChange={(event, newValue: any) => {
				if (
					newValue &&
					typeof newValue === "object" &&
					"id" in newValue
				) {
					setValue(newValue);
					handleOptionClick(newValue);
					setIsDropdownOpen(false);
				} else {
					setValue(null);
				}
			}}
			options={options}
			getOptionLabel={getOptionLabel}
			filterOptions={filterOptions}
			open={isDropdownOpen}
			onOpen={() => {
				setIsDropdownOpen(true);
				togglePanel(false);
			}}
			onClose={() => {
				setIsDropdownOpen(false);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={`Search ${scenes.length} scenes`}
					variant="outlined"
					onFocus={() => disableShortcuts(true)}
					onBlur={() => disableShortcuts(false)}
					InputLabelProps={{
						...params.InputLabelProps,
						shrink: false,
						style: {
							transform: "translate(14px, 10px) scale(1)",
						},
					}}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<button
								onClick={(
									e: React.MouseEvent<HTMLButtonElement>
								) => {
									e.stopPropagation();
									togglePanel(true);
								}}
							>
								<IconMenu2
									className="md:hidden mr-2"
									size={20}
									stroke={1.5}
									color="currentColor"
								/>
							</button>
						),
						style: {
							height: "40px",
							borderRadius: isDropdownOpen
								? "20px 20px 0 0"
								: "20px",
							backgroundColor: "white",
							paddingLeft: "15px",
							paddingRight: "15px",
						},
					}}
					className="w-full"
				/>
			)}
			ListboxComponent={ListboxComponent}
			className="w-full min-w-64 md:min-w-96 shadow-xl rounded-[20px]"
		/>
	);
};

export default SearchBar;
