import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { VariableSizeList as List } from "react-window";
import { useRouter } from "next/navigation";
import { SceneType } from "@/types/scene";

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
									onMouseEnter={(e) =>
										(e.currentTarget.style.backgroundColor =
											"#f0f0f0")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.backgroundColor =
											"white")
									}
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
}
interface IdToRecCtMap {
	[key: string]: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onOptionClick }) => {
	const [inputValue, setInputValue] = useState("");
	const [value, setValue] = useState<SceneType | string | null>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [scenes, setScenes] = useState<SceneType[]>([]);
	const router = useRouter();
	const searchParams = useSearchParams();

	const idToRecCtMap = useMemo(() => {
		return idToRecCtData.reduce((acc, [id, number]) => {
			acc[id.toString()] = number;
			return acc;
		}, {} as IdToRecCtMap);
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
			}
		}
	}, [searchParams, idToRecCtMap, onOptionClick]);

	const handleOptionClick = (option: SceneType) => {
		onOptionClick(option, 0);
		router.push(`/?id=${encodeURIComponent(option.id)}&rec_no=0`);
	};

	const getOptionLabel = (option: string | SceneType) => {
		return typeof option === "string" ? option : option.normalized_name;
	};

	const filterOptions = (options: any[], { inputValue }: any) => {
		const filtered = options.filter((option) =>
			typeof option === "string"
				? option.toLowerCase().includes(inputValue.toLowerCase())
				: option.normalized_name
						.toLowerCase()
						.includes(inputValue.toLowerCase())
		);
		if (filtered.length === 0 && inputValue) {
			setIsDropdownOpen(false);
		}
		return filtered;
	};

	const options = useMemo(
		() =>
			scenes.map((scene) => ({
				id: scene.id,
				name: scene.name,
				normalized_name: scene.normalized_name,
				no_of_rec: scene.no_of_rec,
			})),
		[scenes]
	);

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
			onOpen={() => setIsDropdownOpen(true)}
			onClose={() => {
				setIsDropdownOpen(false);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={`Search ${scenes.length} scenes`}
					variant="outlined"
					InputLabelProps={{
						...params.InputLabelProps,
						shrink: false,
						style: { transform: "translate(14px, 10px) scale(1)" },
					}}
					InputProps={{
						...params.InputProps,
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
			className="w-full min-w-96 text-black shadow-xl"
		/>
	);
};

export default SearchBar;
