import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { VariableSizeList as List } from "react-window";
import scenesRaw from "../../public/data/scenes.json";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";

interface SceneData {
	cat_name: string;
}

const scenesData: SceneData[] = scenesRaw as SceneData[];

const processedOptions = scenesData.map((scene) =>
	scene.cat_name
		.replace(/_/g, " ")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
);

const OuterElementContext = React.createContext({});
const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
	const outerProps = React.useContext(OuterElementContext);
	return <div ref={ref} {...props} {...outerProps} />;
});
OuterElementType.displayName = "OuterElementType";

const ListboxComponent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLElement>
>((props, ref) => {
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
});
ListboxComponent.displayName = "ListboxComponent";

const SearchBar: React.FC = () => {
	const [inputValue, setInputValue] = useState("");
	const [value, setValue] = useState<string | null>(null);
	const [options, setOptions] = useState(processedOptions);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const debouncedFilter = debounce((input) => {
			if (input) {
				setOptions(
					processedOptions.filter((name) =>
						name.toLowerCase().includes(input.toLowerCase())
					)
				);
			} else {
				setOptions(processedOptions);
			}
		}, 300);

		debouncedFilter(inputValue);

		return () => {
			debouncedFilter.cancel();
		};
	}, [inputValue]);

	const dynamicBorder = isDropdownOpen
		? "rounded-t-[20px]"
		: "rounded-[20px]";

	return (
		<Autocomplete
			freeSolo
			openOnFocus
			id="free-solo-scene-search"
			inputValue={inputValue}
			value={value}
			onInputChange={(event, newInputValue) =>
				setInputValue(newInputValue)
			}
			onChange={(event, maybeValue) => {
				setValue(maybeValue);
				if (maybeValue) {
					// Url encoding
					const revertName = encodeURIComponent(
						maybeValue.replace(/\s+/g, "_")
					);

					router.push(`/?scene=${revertName}`);
				}
			}}
			options={options}
			open={isDropdownOpen}
			onOpen={() => setIsDropdownOpen(true)}
			onClose={() => setIsDropdownOpen(false)}
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={`Search ${scenesData.length} scenes`}
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
						},
					}}
					className="w-full"
				/>
			)}
			ListboxComponent={ListboxComponent}
			className="w-full min-w-96 mx-4 text-black shadow-xl"
		/>
	);
};

export default SearchBar;