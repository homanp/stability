import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const openAIHandler = async (request, response) => {
    const {prompt} = request.body;

	const {data} = await openai.createCompletion({
		model: "text-davinci-002",
		prompt: `write a tagline about ${prompt}`,
	});

    response.json(data);
};

export default openAIHandler;
