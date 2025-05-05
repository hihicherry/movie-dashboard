import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ScatterChart,
	Scatter,
} from "recharts";

const fetchMovies = async (language) => {
	const response = await axios.get(
		`https://api.themoviedb.org/3/movie/popular?api_key=${
			import.meta.env.VITE_TMDB_API_KEY
		}&language=${language}&page=1`
	);
	return response.data.results;
};

const fetchGenres = async (language) => {
	const response = await axios.get(
		`https://api.themoviedb.org/3/genre/movie/list?api_key=${
			import.meta.env.VITE_TMDB_API_KEY
		}&language=${language}`
	);
	return response.data.genres;
};

const App = () => {
	const [theme, setTheme] = useState(
		localStorage.getItem("theme") || "light"
	);
	const [language, setLanguage] = useState(
		localStorage.getItem("language") || "en-US"
	);
	const [selectedGenre, setSelectedGenre] = useState("all");
	const [chartWidth, setChartWidth] = useState(window.innerWidth);

	// 根據螢幕寬度動態設置圖表寬度
	useEffect(() => {
		const handleResize = () => setChartWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// 主題切換
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	// 語言切換
	useEffect(() => {
		document.documentElement.setAttribute(
			"lang",
			language === "en-US" ? "en" : "zh-TW"
		);
		localStorage.setItem("language", language);
	}, [language]);

	// 獲取電影和類型數據
	const { data: movies, isLoading: moviesLoading } = useQuery({
		queryKey: ["movies", language],
		queryFn: () => fetchMovies(language),
	});
	const { data: genres, isLoading: genresLoading } = useQuery({
		queryKey: ["genres", language],
		queryFn: () => fetchGenres(language),
	});

	if (moviesLoading || genresLoading)
		return (
			<div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
				<div className="text-2xl font-semibold text-primary animate-pulse">
					{language === "en-US" ? "Loading..." : "載入中..."}
				</div>
			</div>
		);

	// 處理類型名稱映射
	const genreMap = genres.reduce(
		(acc, genre) => ({ ...acc, [genre.id]: genre.name }),
		{}
	);

	// 過濾電影數據
	const filteredMovies =
		selectedGenre === "all"
			? movies
			: movies.filter((movie) =>
					movie.genre_ids.includes(parseInt(selectedGenre))
			  );

	// 準備柱狀圖數據
	const genreRatings = genres
		.map((genre) => {
			const genreMovies = movies.filter((movie) =>
				movie.genre_ids.includes(genre.id)
			);
			const avgRating = genreMovies.length
				? genreMovies.reduce(
						(sum, movie) => sum + movie.vote_average,
						0
				  ) / genreMovies.length
				: 0;
			return { genre: genre.name, rating: avgRating };
		})
		.filter((d) => d.rating > 0);

	// 動態設置 Tooltip 樣式
	const tooltipStyle = {
		backgroundColor: theme === "light" ? "#FFFFFF" : "#1F2937",
		border: "none",
		borderRadius: "8px",
		boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
		padding: "8px",
	};
	const itemStyle = {
		color: theme === "light" ? "#374151" : "#D1D5DB", // 動態文字顏色
	};

	// 根據螢幕寬度動態調整圖表寬度
	const getChartWidth = () => {
		const minWidth = 300;
		const maxWidth = 800;
		if (chartWidth < 640) return Math.max(minWidth, chartWidth * 0.9); // 小螢幕：90% 寬度，最小 300px
		if (chartWidth <= 1024)
			return Math.min(
				maxWidth,
				400 + ((chartWidth - 640) * (600 - 400)) / (1024 - 640)
			); // 中螢幕：400px 至 600px
		return maxWidth; // 大螢幕：最大 800px
	};

	return (
		<div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-full sm:max-w-7xl mx-auto">
				{/* 標題與切換按鈕 */}
				<div className="flex flex-col sm:flex-row justify-between items-center mb-8 animate-fade-in">
					<h1 className="text-4xl font-bold text-primary">
						{language === "en-US"
							? "Movie Dashboard"
							: "電影儀表板"}
					</h1>
					<div className="flex space-x-4 mt-4 sm:mt-0">
						<button
							onClick={() =>
								setTheme(theme === "light" ? "dark" : "light")
							}
							className="gradient-btn"
						>
							{theme === "light"
								? language === "en-US"
									? "Dark Mode"
									: "深色模式"
								: language === "en-US"
								? "Light Mode"
								: "淺色模式"}
						</button>
						<button
							onClick={() =>
								setLanguage(
									language === "en-US" ? "zh-TW" : "en-US"
								)
							}
							className="gradient-btn"
						>
							{language === "en-US" ? "中文" : "English"}
						</button>
					</div>
				</div>

				{/* 類型篩選 */}
				<div className="mb-8 animate-fade-in w-full">
					<label className="block text-lg font-medium text-text-light dark:text-text-dark mb-2">
						{language === "en-US"
							? "Filter by Genre"
							: "按類型篩選"}
					</label>
					<select
						value={selectedGenre}
						onChange={(e) => setSelectedGenre(e.target.value)}
						className="w-full sm:w-64 p-3 bg-primary text-white rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:outline-none transition"
					>
						<option value="all">
							{language === "en-US" ? "All Genres" : "所有類型"}
						</option>
						{genres.map((genre) => (
							<option key={genre.id} value={genre.id}>
								{genre.name}
							</option>
						))}
					</select>
				</div>

				{/* 電影表格 */}
				<div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in w-full">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse min-w-[800px]">
							<thead>
								<tr className="bg-primary text-white">
									<th className="p-4 text-left font-semibold">
										{language === "en-US"
											? "Title"
											: "標題"}
									</th>
									<th className="p-4 text-left font-semibold">
										{language === "en-US" ? "Year" : "年份"}
									</th>
									<th className="p-4 text-left font-semibold">
										{language === "en-US"
											? "Rating"
											: "評分"}
									</th>
									<th className="p-4 text-left font-semibold">
										{language === "en-US"
											? "Genres"
											: "類型"}
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredMovies.map((movie) => (
									<tr
										key={movie.id}
										className="border-b border-gray-200 dark:border-gray-700 transition-colors"
									>
										<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
											{movie.title}
										</td>
										<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
											{movie.release_date.split("-")[0]}
										</td>
										<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
											{movie.vote_average}
										</td>
										<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
											{movie.genre_ids
												.map((id) => genreMap[id])
												.join(", ")}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* 柱狀圖 */}
				<div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in w-full overflow-hidden">
					<h2 className="text-2xl font-semibold text-primary mb-4">
						{language === "en-US"
							? "Average Rating by Genre"
							: "類型平均評分"}
					</h2>
					<BarChart
						width={getChartWidth()}
						height={300}
						data={genreRatings}
						className="mx-auto"
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
						<XAxis
							dataKey="genre"
							stroke="#6B7280"
							overflow-hidden
						/>
						<YAxis stroke="#6B7280" />
						<Tooltip contentStyle={tooltipStyle} />
						<Bar dataKey="rating" fill="#F9A8D4" />
					</BarChart>
				</div>

				{/* 散點圖 */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in w-full overflow-hidden">
					<h2 className="text-2xl font-semibold text-primary mb-4">
						{language === "en-US"
							? "Rating vs Popularity"
							: "評分與熱門度比較"}
					</h2>
					<ScatterChart
						width={getChartWidth()}
						height={300}
						className="mx-auto"
					>
						<CartesianGrid stroke="#E5E7EB" />
						<XAxis
							type="number"
							dataKey="vote_average"
							name={language === "en-US" ? "Rating" : "評分"}
							stroke="#6B7280"
						/>
						<YAxis
							type="number"
							dataKey="popularity"
							name={
								language === "en-US" ? "Popularity" : "熱門度"
							}
							stroke="#6B7280"
						/>
						<Tooltip
							contentStyle={tooltipStyle}
							itemStyle={itemStyle}
							cursor={{ strokeDasharray: "3 3" }}
						/>
						<Scatter
							name={language === "en-US" ? "Movies" : "電影"}
							data={filteredMovies}
							fill="#C4B5FD"
						/>
					</ScatterChart>
				</div>
			</div>
		</div>
	);
};

export default App;
