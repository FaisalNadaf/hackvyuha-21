/** @format */

import React from "react";
import { DataChart } from "../Charts/roundChart";
import { LineChart } from "@/Charts/LineChart";

const Person = () => {
	return (
		<div
			className="flex  w-full h-full items-center justify-center gap-4 p-16 relative"
			style={{
				background:
					"linear-gradient(to bottom left, rgb(227, 181, 227), #97b8ef)",
			}}>
			<a href="/">
				{" "}
				<button
					className=" border-2 my-6 absolute top-0 right-16 px-10 mx-2 rounded-lg border-gray-600 shadow-lg  flex items-center justify-center	p-2  bg-[#65f4efbb] "
					variant="outline">
					Back
				</button>
			</a>
			<div className="w-2/3 h-full">
				<LineChart />
			</div>
			<div className="w-1/3 h-full">
				<DataChart />
			</div>
		</div>
	);
};

export default Person;
