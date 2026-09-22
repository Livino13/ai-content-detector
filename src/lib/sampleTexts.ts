export interface SampleText {
  id: string;
  title: string;
  description: string;
  type: 'AI' | 'Human' | 'Mixed';
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'ai-sample-1',
    title: 'AI Essay (ChatGPT Style)',
    description: 'Uniform, formal AI-style explanation of AI in healthcare.',
    type: 'AI',
    text: `Artificial intelligence is rapidly transforming modern healthcare by enabling faster diagnoses and more personalized treatment plans for patients worldwide. Furthermore, machine learning models can analyze vast medical datasets in seconds, uncovering subtle patterns that human doctors might easily overlook during routine examinations. Moreover, hospitals that adopt these intelligent systems consistently report shorter waiting times, lower operating costs, and measurably better patient outcomes every year. Consequently, policymakers and medical leaders are investing heavily in digital infrastructure to support the widespread adoption of clinical artificial intelligence tools. In conclusion, the thoughtful integration of artificial intelligence into healthcare promises a future of faster, fairer, and more effective medical care for everyone.`
  },
  {
    id: 'human-sample-1',
    title: 'Human Blog Article',
    description: 'Casual, bursty human writing about cold brew coffee habits.',
    type: 'Human',
    text: `Cold brew. That's it. That's the whole trick I wish someone had told me three summers ago when I was still sugaring my iced coffee into syrup. I used to buy those pricey bottles at the grocery store. Twelve bucks! For coffee water. Now? A mason jar, a bag of coarse grounds, and patience. Coarse. Seriously, grind it like breadcrumbs or you will get sludge. I steep mine on the counter overnight, roughly twelve hours, then strain it through a cheesecloth into a pitcher that barely fits my fridge shelf. Mornings feel different now. Slower. My wallet noticed first.`
  },
  {
    id: 'mixed-sample-1',
    title: 'Mixed / Hybrid Content',
    description: 'Human sourdough story blended with AI-polished summary — shows all three heatmap bands.',
    type: 'Mixed',
    text: `My first loaf? A total brick. I burned the bottom, set off the smoke alarm, and my flatmate laughed for a week straight. Furthermore, I kept baking every Sunday even though my loaves were flat and pale. I started baking in January because the bakery near my flat shut down, so now I bake fresh loaves every single Sunday morning. Moreover, I still feel like the whole process is guesswork mixed with stubborn hope. Furthermore, controlled fermentation cultivates beneficial bacteria that improve digestibility while developing complex flavor profiles over extended proofing periods. Precise temperature control during bulk fermentation ensures consistent crumb structure and optimal crust caramelization in every baking session.`
  }
];
