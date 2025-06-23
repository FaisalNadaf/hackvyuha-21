/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const splitIntoParts = (total, parts = 15) => {
	if (total <= 0 || parts <= 0) return Array(parts).fill(0);

	// Average value for each part
	const average = total / parts;

	// Generate values around the average with slight randomness
	let result = Array.from({ length: parts }, () => {
		// Vary within ±30% of average but clamp between min and max
		const variation = average * 0.3;
		const min = Math.max(1, Math.floor(average - variation));
		const max = Math.ceil(average + variation);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	});

	// Adjust the sum to exactly match the total
	let currentSum = result.reduce((sum, val) => sum + val, 0);
	let diff = total - currentSum;

	// Distribute the difference evenly (±1) to get exact match
	let i = 0;
	while (diff !== 0) {
		if (diff > 0) {
			result[i % parts]++;
			diff--;
		} else if (diff < 0 && result[i % parts] > 1) {
			result[i % parts]--;
			diff++;
		}
		i++;
	}

	return result;
};

export function LineChart() {
	const { personId } = useParams();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (personId) {
			fetch(`http://localhost:5000/api/person/${personId}`)
				.then((res) => res.json())
				.then(setData)
				.catch(() => setError("Unable to fetch data."))
				.finally(() => setLoading(false));
		}
	}, [personId]);

	if (loading) return <div className="p-6">Loading chart...</div>;
	if (error) return <div className="p-6 text-red-500">{error}</div>;
	if (!data?.entries?.length) return <div>No data available</div>;

	const zone = data.entries[0].zone_times;

	const deskTotal =
		zone.desk1 +
		zone.desk2 +
		zone.desk3 +
		zone.desk4 +
		zone.desk5 +
		zone.desk6 +
		zone.desk7;

	const deskData = splitIntoParts(deskTotal);
	const meetingData = splitIntoParts(zone.meeting);
	const breakData = splitIntoParts(zone.break);

	const chartData = Array.from({ length: 15 }).map((_, i) => ({
		point: `${i + 1}`,
		desk: deskData[i],
		meeting: meetingData[i],
		break: breakData[i],
	}));

	const chartConfig = {
		desk: { label: "Desk", color: "#4F46E5" },
		meeting: { label: "Meeting", color: "#22C55E" },
		break: { label: "Break", color: "#F59E0B" },
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			className="w-full">
			<Card
				className="rounded-2xl shadow-md"
				style={{
					background:
						"linear-gradient(135deg, rgba(227,181,227,0.5), rgba(151,184,239,0.7))",
				}}>
				<CardHeader>
					<CardTitle className="text-xl font-semibold text-gray-800">
						👤 {data.entries[0].person_name}
					</CardTitle>
					<CardDescription className="text-sm text-gray-600">
						🆔 ID: {data.entries[0].person_id}
					</CardDescription>
				</CardHeader>

				<CardContent>
					<ChartContainer config={chartConfig}>
						<AreaChart
							data={chartData}
							margin={{ top: 10, left: 12, right: 12 }}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
							/>
							<XAxis
								dataKey="point"
								tickLine={false}
								axisLine={false}
								tick={{ fill: "#334155" }}
								tickMargin={10}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dot" />}
							/>
							<Area
								type="monotone"
								dataKey="desk"
								stroke={chartConfig.desk.color}
								fill={chartConfig.desk.color}
								fillOpacity={0.3}
							/>
							<Area
								type="monotone"
								dataKey="meeting"
								stroke={chartConfig.meeting.color}
								fill={chartConfig.meeting.color}
								fillOpacity={0.3}
							/>
							<Area
								type="monotone"
								dataKey="break"
								stroke={chartConfig.break.color}
								fill={chartConfig.break.color}
								fillOpacity={0.3}
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</motion.div>
	);
}
