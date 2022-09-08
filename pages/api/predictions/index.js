export default async function handler(req, res) {
	const response = await fetch("https://api.replicate.com/v1/predictions", {
		method: "POST",
		headers: {
			Authorization: `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			// Pinned to a specific version of kuprel/min-dalle, fetched from:
			// https://replicate.com/kuprel/min-dalle/versions
			version:
				"a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef",
			input: { prompt: req.body.prompt, grid_size: 1, step: 50, width: 768, height: 768, num_outputs: 1 },
		}),
	});

	if (response.status !== 201) {
		let error = await response.json();
		res.statusCode = 500;
		res.end(JSON.stringify({ detail: error.detail }));
		return;
	}

	const prediction = await response.json();
	res.statusCode = 201;
	res.end(JSON.stringify(prediction));
}
