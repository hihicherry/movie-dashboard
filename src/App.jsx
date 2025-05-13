import { useState, useEffect, useMemo } from "react";
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
import GenreFilter from "./GenreFilter";

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

// 防抖函數
const debounce = (func, wait) => {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
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
	const [sortConfig, setSortConfig] = useState({
		key: "title",
		direction: "asc",
	});
	const [searchQuery, setSearchQuery] = useState("");

	// 動態設置圖表寬度（防抖）
	useEffect(() => {
		const debouncedResize = debounce(
			() => setChartWidth(window.innerWidth),
			100
		);
		window.addEventListener("resize", debouncedResize);
		debouncedResize();
		return () => window.removeEventListener("resize", debouncedResize);
	}, []);

	// 主題切換
	useEffect(() => {
		document.documentElement.classList.add(
			"transition-colors",
			"duration-500"
		);
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

	// 獲取電影和類型數據（添加緩存）
	const {
		data: movies = [], // 默認空數組
		isLoading: moviesLoading,
		error: moviesError,
	} = useQuery({
		queryKey: ["movies", language],
		queryFn: () => fetchMovies(language),
		staleTime: 5 * 60 * 1000, // 5 分鐘緩存
		cacheTime: 10 * 60 * 1000, // 10 分鐘保留
	});
	const {
		data: genres = [], // 默認空數組
		isLoading: genresLoading,
		error: genresError,
	} = useQuery({
		queryKey: ["genres", language],
		queryFn: () => fetchGenres(language),
		staleTime: 5 * 60 * 1000,
		cacheTime: 10 * 60 * 1000,
	});

	// 處理類型名稱映射
	const genreMap = genres.reduce(
		(acc, genre) => ({ ...acc, [genre.id]: genre.name }),
		{}
	);

	// 過濾電影數據（使用 useMemo）
	const filteredMovies = useMemo(() => {
		return selectedGenre === "all"
			? movies
			: movies.filter((movie) =>
					movie.genre_ids.includes(parseInt(selectedGenre))
			  );
	}, [movies, selectedGenre]);

	// 排序電影數據（使用 useMemo）
	const sortedMovies = useMemo(() => {
		const sorted = [...filteredMovies].sort((a, b) => {
			if (sortConfig.key === "title") {
				return sortConfig.direction === "asc"
					? a.title.localeCompare(b.title)
					: b.title.localeCompare(a.title);
			}
			if (sortConfig.key === "year") {
				return sortConfig.direction === "asc"
					? a.release_date.localeCompare(b.release_date)
					: b.release_date.localeCompare(a.release_date);
			}
			if (sortConfig.key === "rating") {
				return sortConfig.direction === "asc"
					? a.vote_average - b.vote_average
					: b.vote_average - a.vote_average;
			}
			return 0;
		});
		return sorted;
	}, [filteredMovies, sortConfig]);

	// 搜索電影數據（使用 useMemo）
	const searchedMovies = useMemo(() => {
		return sortedMovies.filter((movie) =>
			movie.title.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [sortedMovies, searchQuery]);

	// 準備柱狀圖數據（使用 useMemo）
	const genreRatings = useMemo(() => {
		return genres
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
	}, [genres, movies]);

	// 錯誤處理
	if (moviesError || genresError) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
				<div className="text-2xl font-semibold text-red-500">
					{language === "en-US"
						? "Error loading data"
						: "載入數據失敗"}
				</div>
			</div>
		);
	}

	// 加載中提示
	if (moviesLoading || genresLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
				<div className="text-2xl font-semibold text-primary animate-pulse">
					{language === "en-US" ? "Loading..." : "載入中..."}
				</div>
			</div>
		);
	}

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

	// 排序處理
	const sortMovies = (key) => {
		const direction =
			sortConfig.key === key && sortConfig.direction === "asc"
				? "desc"
				: "asc";
		setSortConfig({ key, direction });
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
					<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4 sm:mt-0">
						<button
							onClick={() =>
								setTheme(theme === "light" ? "dark" : "light")
							}
							className="gradient-btn"
							aria-label={
								theme === "light"
									? "Switch to dark mode"
									: "Switch to light mode"
							}
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
							aria-label={
								language === "en-US"
									? "Switch to Chinese"
									: "Switch to English"
							}
						>
							{language === "en-US" ? "中文" : "English"}
						</button>
					</div>
				</div>

				{/* 篩選與搜索 */}
				<div className="mb-8 animate-fade-in w-full">
					<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
						<GenreFilter
							language={language}
							genres={genres}
							selectedGenre={selectedGenre}
							onGenreChange={setSelectedGenre}
							theme={theme}
						/>
						<div>
							<label className="block text-lg font-medium text-text-light dark:text-text-dark mb-2">
								{language === "en-US"
									? "Search Movies"
									: "搜索電影"}
							</label>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={
									language === "en-US"
										? "Search movies..."
										: "搜索電影..."
								}
								className="w-full sm:w-64 p-3 bg-primary text-white rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:outline-none transition"
								aria-label={
									language === "en-US"
										? "Search movies"
										: "搜索電影"
								}
							/>
						</div>
					</div>
				</div>

				{/* 電影卡片（小螢幕） */}
				<div className="block sm:hidden mb-8 animate-fade-in">
					{searchedMovies.length === 0 ? (
						<p className="text-text-light dark:text-text-dark">
							{language === "en-US"
								? "No movies found"
								: "未找到電影"}
						</p>
					) : (
						searchedMovies.map((movie) => (
							<div
								key={movie.id}
								className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
							>
								<h3 className="text-lg font-semibold text-primary">
									{movie.title}
								</h3>
								<p className="text-text-light dark:text-text-dark">
									{language === "en-US" ? "Year" : "年份"}:{" "}
									{movie.release_date.split("-")[0]}
								</p>
								<p className="text-text-light dark:text-text-dark">
									{language === "en-US" ? "Rating" : "評分"}:{" "}
									{movie.vote_average}
								</p>
								<p className="text-text-light dark:text-text-dark">
									{language === "en-US" ? "Genres" : "類型"}:{" "}
									{movie.genre_ids
										.map((id) => genreMap[id])
										.join(", ")}
								</p>
							</div>
						))
					)}
				</div>

				{/* 電影表格（大螢幕） */}
				<div className="hidden sm:block mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in w-full">
					<div className="overflow-x-auto">
						<table
							className="w-full border-collapse min-w-[800px]"
							aria-label={
								language === "en-US"
									? "Movies table"
									: "電影表格"
							}
						>
							<thead>
								<tr className="bg-primary text-white">
									<th
										className="p-4 text-left font-semibold cursor-pointer"
										onClick={() => sortMovies("title")}
									>
										{language === "en-US"
											? "Title"
											: "標題"}
										{sortConfig.key === "title" && (
											<span>
												{sortConfig.direction === "asc"
													? " ↑"
													: " ↓"}
											</span>
										)}
									</th>
									<th
										className="p-4 text-left font-semibold cursor-pointer"
										onClick={() => sortMovies("year")}
									>
										{language === "en-US" ? "Year" : "年份"}
										{sortConfig.key === "year" && (
											<span>
												{sortConfig.direction === "asc"
													? " ↑"
													: " ↓"}
											</span>
										)}
									</th>
									<th
										className="p-4 text-left font-semibold cursor-pointer"
										onClick={() => sortMovies("rating")}
									>
										{language === "en-US"
											? "Rating"
											: "評分"}
										{sortConfig.key === "rating" && (
											<span>
												{sortConfig.direction === "asc"
													? " ↑"
													: " ↓"}
											</span>
										)}
									</th>
									<th className="p-4 text-left font-semibold">
										{language === "en-US"
											? "Genres"
											: "類型"}
									</th>
								</tr>
							</thead>
							<tbody>
								{searchedMovies.length === 0 ? (
									<tr>
										<td
											colSpan="4"
											className="p-4 text-center text-text-light dark:text-text-dark"
										>
											{language === "en-US"
												? "No movies found"
												: "未找到電影"}
										</td>
									</tr>
								) : (
									searchedMovies.map((movie) => (
										<tr
											key={movie.id}
											className="border-b border-gray-200 dark:border-gray-700 transition-colors"
										>
											<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
												{movie.title}
											</td>
											<td className="p-4 text-text-light dark:text-text-dark leading-relaxed">
												{
													movie.release_date.split(
														"-"
													)[0]
												}
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
									))
								)}
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
						aria-label={
							language === "en-US"
								? "Average rating by genre chart"
								: "類型平均評分圖表"
						}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
						<XAxis dataKey="genre" stroke="#6B7280" />
						<YAxis stroke="#6B7280" />
						<Tooltip contentStyle={tooltipStyle} />
						<Bar dataKey="rating" fill="#F9A8D4" />
					</BarChart>
					{/* 屏幕閱讀器專用數據表格 */}
					<div className="sr-only">
						<table>
							<caption>
								{language === "en-US"
									? "Average Rating by Genre"
									: "類型平均評分"}
							</caption>
							<thead>
								<tr>
									<th>
										{language === "en-US"
											? "Genre"
											: "類型"}
									</th>
									<th>
										{language === "en-US"
											? "Rating"
											: "評分"}
									</th>
								</tr>
							</thead>
							<tbody>
								{genreRatings.map((item) => (
									<tr key={item.genre}>
										<td>{item.genre}</td>
										<td>{item.rating.toFixed(2)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
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
						aria-label={
							language === "en-US"
								? "Rating vs popularity chart"
								: "評分與熱門度比較圖表"
						}
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
							data={searchedMovies}
							fill="#C4B5FD"
						/>
					</ScatterChart>
					{/* 屏幕閱讀器專用數據表格 */}
					<div className="sr-only">
						<table>
							<caption>
								{language === "en-US"
									? "Rating vs Popularity"
									: "評分與熱門度比較"}
							</caption>
							<thead>
								<tr>
									<th>
										{language === "en-US"
											? "Title"
											: "標題"}
									</th>
									<th>
										{language === "en-US"
											? "Rating"
											: "評分"}
									</th>
									<th>
										{language === "en-US"
											? "Popularity"
											: "熱門度"}
									</th>
								</tr>
							</thead>
							<tbody>
								{searchedMovies.map((movie) => (
									<tr key={movie.id}>
										<td>{movie.title}</td>
										<td>{movie.vote_average}</td>
										<td>{movie.popularity}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
