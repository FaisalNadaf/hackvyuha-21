/** @format */

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router";
import videoClip from "../assets/evolution.mp4";
import ErrorFace from "./pageNotFound";
import { motion } from "framer-motion";

const AllPersons = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await fetch(`http://localhost:5000/api/persons`);
			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}
			const json = await response.json();
			setData(json);
			setError(null);
		} catch (error) {
			console.error("Error fetching data:", error);
			setError("Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading)
		return (
			<div className="p-10 text-xl animate-pulse text-gray-600">
				Loading employees...
			</div>
		);
	if (error)
		return (
			<div className=" text-red-500">
				<ErrorFace />
			</div>
		);

	return (
		<div
			className="min-h-screen w-full p-16 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			style={{
				background:
					"linear-gradient(to bottom left, rgb(227, 181, 227), #97b8ef)",
			}}>
			{data?.persons?.map((person, index) => (
				<motion.div
					key={person.person_id}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg border border-white/30 p-6 flex flex-col items-center gap-4">
					<Avatar className="h-20 w-20 ring-2 ring-blue-300">
						<AvatarImage
							// src={`https://avatar.iran.liara.run/public/${person.entries[0].person_id}`}
							// src={`https://i.pravatar.cc/150?u=${person.entries[0].person_id}`}

							src={`https://robohash.org/${person.entries[0].person_id}`}
							alt={`Person ${index + 1}`}
						/>
						<AvatarFallback>EMP</AvatarFallback>
					</Avatar>
					<div className="text-center text-lg font-semibold text-gray-800">
						{person.entries[0].person_name}
					</div>
					<div className="rounded-lg overflow-hidden w-full h-16">
						<video
							src={videoClip}
							className="w-full h-full object-cover"
							autoPlay
							muted
							loop
							playsInline
						/>
					</div>

					<NavLink
						className="w-full"
						to={`/person/${person.entries[0]._id}`}>
						<Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
							Details <i className="ml-2 fa-solid fa-arrow-right"></i>
						</Button>
					</NavLink>
				</motion.div>
			))}
		</div>
	);
};

export default AllPersons;
