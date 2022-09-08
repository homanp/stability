import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import ky from "ky-universal";
import { BRANDS } from "../lib/constants";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function Index() {
	const [brand, setBrand] = useState(0);
	const [prediction, setPrediction] = useState(null);
	const [tagline, setTagline] = useState(null);
	const [prompt, setPrompt] = useState(null);
	const [error, setError] = useState(null);

	const generateButtonColor = (index) => {
		switch (index) {
			case 0:
				return BRANDS[brand].colors[1];
			case 1:
				return BRANDS[brand].colors[2];
			case 2:
				return BRANDS[brand].colors[0];
		}
	};

	const handleBrandChange = async (e) => {
		setBrand(e.target.value);
	};

	const handleCopyRegenration = async () => {
		const completion = await ky
			.post("/api/openai", { json: { prompt: `${BRANDS[brand].name} ${prompt}` } })
			.json();

		setTagline(completion.choices[0]?.text);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setPrompt(e.target.prompt.value);
		const completion = await ky
			.post("/api/openai", { json: { prompt: e.target.prompt.value } })
			.json();
		setTagline(completion.choices[0]?.text);
		const response = await fetch("/api/predictions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: e.target.prompt.value,
			}),
		});
		let prediction = await response.json();
		if (response.status !== 201) {
			setError(prediction.detail);
			return;
		}
		setPrediction(prediction);

		while (
			prediction.status !== "succeeded" &&
			prediction.status !== "failed"
		) {
			await sleep(1000);
			const response = await fetch("/api/predictions/" + prediction.id);
			prediction = await response.json();
			if (response.status !== 200) {
				setError(prediction.detail);
				return;
			}
			setPrediction(prediction);
		}
	};

	return (
		<div>
			<Head>
				<title>Getting started with Replicate + Next.js</title>
			</Head>

			<p>Generate an Ad with Stable Diffusion</p>

			<div style={{ display: "flex", alignItems: "center" }}>
				<form onSubmit={handleSubmit} style={{ marginRight: "20px" }}>
					<input type="text" name="prompt" />
					<button style={{marginLeft: '5px'}} type="submit">Go!</button>
				</form>
				<div style={{ display: "flex", alignItems: "center" }}>
					<p style={{ marginRight: "10px" }}>Select brand:</p>
					<select
						style={{ marginRight: "10px" }}
						onChange={handleBrandChange}
					>
						{BRANDS.map((brand, index) => (
							<option key={brand.name} value={index}>
								{brand.name}
							</option>
						))}
					</select>
					{BRANDS[brand].colors.map((color) => (
						<div
							key={color}
							style={{
								backgroundColor: color,
								height: "20px",
								width: "20px",
								marginRight: "5px",
							}}
						></div>
					))}
				</div>
				<button style={{marginLeft: '20px'}} onClick={handleCopyRegenration}>Regenerate copy</button>
			</div>

			{error && <div>{error}</div>}

			{prediction && (
				<div>
					<p>{prediction.status}</p>
					<div style={{ display: "flex", alignItems: "center" }}>
						{prediction.output &&
							BRANDS[brand].colors.map((color, index) => (
								<div
									key={color}
									style={{
										marginRight: "10px",
										position: "relative",
										width: "375px",
										overflow: "hidden",
										height: "594px",
										background: "#f5f5f5",
										objectFit: "cover",
										backgroundRepeat: "no-repeat",
										backgroundPosition: "center top",
										backgroundImage: `
									url(${prediction.output[prediction.output.length - 1]})
                `,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "flex-end",
									}}
								>
									<div
										className="content"
										style={{
											background: `linear-gradient(0deg, ${BRANDS[brand].colors[index]} 40%, rgba(255, 255, 255, 0) 100%)`,
										}}
									>
										<p className="headline">{tagline}</p>
										<button
											style={{
												background: `${generateButtonColor(
													index
												)}`,
												padding: "10px 40px",
												border: 0,
												borderRadius: 20,
												color: "#fff",
												fontSize: "20px",
											}}
										>
											Swipe up
										</button>
									</div>
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	);
}

export default Index;
