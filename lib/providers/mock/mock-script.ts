import { ScriptProvider, ScriptInput, ScriptResult, GeneratedSceneData } from "../types";

export class MockScriptProvider implements ScriptProvider {
  async generateScript(input: ScriptInput): Promise<ScriptResult> {
    // Simulate AI generation time
    await new Promise((r) => setTimeout(r, 600));

    const promptLower = input.prompt.toLowerCase();
    const isRealEstate = promptLower.includes("property") || promptLower.includes("estate") || promptLower.includes("home") || promptLower.includes("apartment") || promptLower.includes("villa");
    const isProduct = promptLower.includes("product") || promptLower.includes("app") || promptLower.includes("saas") || promptLower.includes("software") || promptLower.includes("tech");
    const isEducation = promptLower.includes("course") || promptLower.includes("learn") || promptLower.includes("teach") || promptLower.includes("education") || promptLower.includes("lesson");

    if (isRealEstate) {
      return {
        title: "Exclusive Luxury Villa Tour",
        summary: "A high-impact 30-second architectural showcase highlighting prime estate features and investment value.",
        estimatedTotalDuration: 24,
        scenes: [
          {
            sceneNumber: 1,
            duration: 7,
            script: "Welcome to 42 Horizon Crest, an ultra-modern architectural masterpiece nestled in the hills with breathtaking skyline views.",
            visualPrompt: "Modern luxury villa exterior with infinity pool at dusk",
            suggestedImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-in",
            transition: "fade",
          },
          {
            sceneNumber: 2,
            duration: 9,
            script: "Step inside to double-height ceilings, floor-to-ceiling glass, and an Italian-designed chef's kitchen tailored for luxury living.",
            visualPrompt: "Open-concept modern living room with marble kitchen island",
            suggestedImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "pan-right",
            transition: "slide-left",
          },
          {
            sceneNumber: 3,
            duration: 8,
            script: "This prime estate features five private suites and smart-home integration. Schedule your private VIP viewing today.",
            visualPrompt: "Spacious master bedroom with ocean view balcony",
            suggestedImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-out",
            transition: "fade",
          },
        ],
      };
    }

    if (isProduct) {
      return {
        title: "Next-Gen AI Platform Launch",
        summary: "Fast-paced SaaS feature walk-through demonstrating automation, analytics, and instant productivity gains.",
        estimatedTotalDuration: 22,
        scenes: [
          {
            sceneNumber: 1,
            duration: 7,
            script: "Are you spending countless hours editing videos manually? Meet Vilo AI, the intelligent video creation operating system.",
            visualPrompt: "Futuristic dark tech workspace with holographic dashboard",
            suggestedImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-in",
            transition: "fade",
          },
          {
            sceneNumber: 2,
            duration: 8,
            script: "Simply upload your scripts, slides, or images. In seconds, Vilo generates lifelike presenters, voiceovers, and polished scenes.",
            visualPrompt: "Multi-device UI mockup showing automated AI workflow",
            suggestedImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "pan-left",
            transition: "slide-left",
          },
          {
            sceneNumber: 3,
            duration: 7,
            script: "Scale your video production 10x faster without expensive studios. Start your free trial today at vilo.ai.",
            visualPrompt: "Dynamic growth chart with glowing metrics and CTA",
            suggestedImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-in",
            transition: "zoom",
          },
        ],
      };
    }

    if (isEducation) {
      return {
        title: "Mastering Machine Learning Fundamentals",
        summary: "Engaging educational module introducing key concepts with visual analogies and clear presenter guidance.",
        estimatedTotalDuration: 20,
        scenes: [
          {
            sceneNumber: 1,
            duration: 6,
            script: "Welcome back! Today we are decoding Neural Networks and how algorithms learn from patterns in real-world data.",
            visualPrompt: "Classroom / educational digital graphic with neural net nodes",
            suggestedImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-in",
            transition: "fade",
          },
          {
            sceneNumber: 2,
            duration: 8,
            script: "Just like our human brain strengthens connections with practice, artificial neurons adjust their weights through gradient descent.",
            visualPrompt: "Abstract 3D network visualization with glowing nodes",
            suggestedImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "pan-right",
            transition: "slide-left",
          },
          {
            sceneNumber: 3,
            duration: 6,
            script: "In our next module, we will build your first convolutional classifier. Let's dive right into the code!",
            visualPrompt: "Code editor displaying Python and PyTorch training loop",
            suggestedImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
            cameraEffect: "zoom-out",
            transition: "fade",
          },
        ],
      };
    }

    // Default dynamic generator based on user input
    return {
      title: input.prompt.slice(0, 36) || "Custom AI Video Project",
      summary: `An engaging video presentation generated for: "${input.prompt}"`,
      estimatedTotalDuration: 20,
      scenes: [
        {
          sceneNumber: 1,
          duration: 6,
          script: `Hello everyone! Today we are exploring ${input.prompt.slice(0, 40) || "this exciting new topic"}. Let's get right into the key highlights.`,
          visualPrompt: "Professional studio stage backdrop",
          suggestedImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
          cameraEffect: "zoom-in",
          transition: "fade",
        },
        {
          sceneNumber: 2,
          duration: 8,
          script: "When we look closely at what matters most, clarity and consistency make all the difference for your audience and brand.",
          visualPrompt: "Clean modern design composition with lighting accents",
          suggestedImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80",
          cameraEffect: "pan-right",
          transition: "slide-left",
        },
        {
          sceneNumber: 3,
          duration: 6,
          script: "Thank you for watching! Leave your questions below and follow for more visual updates.",
          visualPrompt: "Sleek creative workspace with warm ambient glow",
          suggestedImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
          cameraEffect: "zoom-out",
          transition: "fade",
        },
      ],
    };
  }
}
