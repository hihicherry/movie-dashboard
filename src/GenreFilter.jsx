import React from "react";
import Select from "react-select";

const GenreFilter = ({
	language,
	genres,
	selectedGenre,
	onGenreChange,
	theme,
}) => {
	// 準備 react-select 的選項
	const options = [
		{
			value: "all",
			label: language === "en-US" ? "All Genres" : "所有類型",
		},
		...genres.map((genre) => ({
			value: genre.id.toString(),
			label: genre.name,
		})),
	];

	// 根據主題自訂 react-select 樣式
	const customStyles = {
		control: (provided) => ({
			...provided,
			backgroundColor: "#F9A8D4", // primary color
			borderColor: "#F9A8D4",
			boxShadow: "none",
			borderRadius: "0.5rem",
			padding: "0.5rem",
			"&:hover": {
				borderColor: "#F472B6", // primaryHover
			},
			"&:focus": {
				borderColor: "#C4B5FD", // accent
				boxShadow: "0 0 0 2px #C4B5FD", // focus:ring-2 accent
			},
		}),
		singleValue: (provided) => ({
			...provided,
			color: "#FFFFFF", // white text
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: theme === "light" ? "#F5F5F5" : "#1F2937", // background.light/dark
			borderRadius: "0.5rem",
			boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? "#F472B6" // primaryHover
				: state.isFocused
				? "#C4B5FD" // accent
				: theme === "light"
				? "#F5F5F5" // background.light
				: "#1F2937", // background.dark
			color:
				state.isSelected || state.isFocused
					? "#FFFFFF" // white text for selected/focused
					: theme === "light"
					? "#374151" // text.light
					: "#D1D5DB", // text.dark
			padding: "0.75rem 1rem",
			"&:hover": {
				backgroundColor: "#C4B5FD", // accent
				color: "#FFFFFF",
			},
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: "#FFFFFF",
			"&:hover": {
				color: "#FFFFFF",
			},
		}),
		indicatorSeparator: (provided) => ({
			...provided,
			backgroundColor: "#FFFFFF",
		}),
	};

	// 查找當前選中的選項
	const selectedOption = options.find(
		(option) => option.value === selectedGenre
	);

	return (
		<div>
			<label className="block text-lg font-medium text-text-light dark:text-text-dark mb-2">
				{language === "en-US" ? "Filter by Genre" : "按類型篩選"}
			</label>
			<Select
				options={options}
				value={selectedOption}
				onChange={(option) => onGenreChange(option.value)}
				styles={customStyles}
				className="w-full sm:w-64"
				classNamePrefix="react-select"
				aria-label={language === "en-US" ? "Select genre" : "選擇類型"}
			/>
		</div>
	);
};

export default GenreFilter;
