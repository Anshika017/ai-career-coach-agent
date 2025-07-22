import { db } from "@/configs/db";
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import ImageKit from "imagekit";
import { historyTable } from "@/configs/schema";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const AiCareerChatAgent=createAgent({
    name:'AiCareerChatAgent',
    description:'An Ai Agent that answers career related questions',
    system:`You are a helpful, professional AI Career Coach Agent. Your role is to guide users with questions related to careers, including job search advices, interview preparation,resume improvement, skill development,career transitions , and industry trends.
    Always respond with clarity, encouragement, and actionable advice tailored to the user's needs.
    If the user asks something unrelated to careers (e.g., topics like health, relationships, coding help, or general trivial), gently inform them that you are a career coach and suggest relevant career-focussed questions instead `,
    model:gemini({
        model:"gemini-2.5-pro",
        apiKey:process.env.GEMINI_API_KEY
    })
})

export const AiResumeAnalyzerAgent=createAgent({
  name:'AiResumeAnalyzerAgent',
  description:'AI Resume Analyzer Agent help to return Report',
  system:`You are an advanced AI Resume Analyzer Agent.
Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format.
The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

🔷 INPUT: I will provide a plain text resume.
🎯 GOAL: Output a JSON report as per the schema below. The report should reflect:

overall_score (0-100)

overall_feedback (short message e.g., "Excellent", "Needs improvement")

summary_comment (1-2 sentence evaluation summary)

Section scores for:

Contact Info

Experience

Education

Skills

Each section should include:

score (as percentage)

Optional comment about that section

Tips for improvement (3-5 tips)

What's Good (1-3 strengths)

Needs Improvement (1-3 weaknesses)

Output JSON Schema:
{
  "overall_score": 85,
  "overall_feedback": "Excellent!",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 70,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 60,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "whats_good": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Some experience bullet points could be stronger.",
    "Missing a professional summary/objective."
  ]
}
`,
  model:gemini({
        model:"gemini-2.5-pro",
        apiKey:process.env.GEMINI_API_KEY
    })
})

export const AIRoadmapGeneratorAgent=createAgent({
  name:'AIRoadmapGeneratorAgent',
  description:'Generate Details Tree Like Flow Roadmap',
  system: `Generate a React flow tree-structured learning roadmap for the user's desired position/skills in the following format:

• Vertical tree structure with meaningful x/y positions to form a flow
• Structure should be similar to roadmap.sh layout
• Steps must be ordered from fundamentals to advanced
• Include branching for different specializations (if applicable)
• Ensure node positions are spaced with at least 200px vertically and 300px horizontally between nodes, so they don't overlap or cluster
• Each node must have:
  - a unique ID
  - type: "turbo"
  - position with x and y coordinates
  - data containing:
    - title: step name
    - description: short 1-2 line summary
    - link: helpful learning resource

• Response must be in this JSON format:

{
  roadmapTitle: '',
  description: '<3-5 Lines>',
  duration: '',
  initialNodes: [
    {
      id: '1',
      type: 'turbo',
      position: { x: 0, y: 0 },
      data: {
        title: 'Step Title',
        description: 'Short two-line explanation of what the step covers.',
        link: 'Helpful link for learning this step'
      }
    },
    ...
  ],
  initialEdges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2'
    },
    ...
  ]
}`

,
  model:gemini({
        model:"gemini-2.5-pro",
        apiKey:process.env.GEMINI_API_KEY
    })
})


export const AiCoverLetterGeneratorAgent = createAgent({
  name: 'AiCoverLetterGeneratorAgent',
  description: 'Generates personalized, professional cover letters based on user-provided resumes and job descriptions.',
  system: `
You are a highly skilled AI agent specializing in writing professional cover letters tailored to simplified user inputs.

Your task is to generate a personalized, compelling, and well-structured cover letter that aligns the applicant’s key skills with the role they are applying for.

Follow these instructions strictly:

1. Output Format:
   - Only return the final **cover letter text**.
   - Do **not** include markdown, code blocks, JSON, or explanatory notes.
   - The content must be ready to copy and paste into an email or document.

2. Tone & Style:
   - Maintain a **formal**, **enthusiastic**, and **confident** tone.
   - Ensure the writing is clear, concise, and professional (max ~400 words).
   - Avoid generic phrases; instead, personalize the letter based on the provided job title, company name, and skills.

3. Structure:
   - **Greeting**: Begin with a professional salutation (e.g., “Dear Hiring Team at [Company Name]” or “Dear [Company Name] Recruitment Team”).
   - **Introduction**: Mention the job title and company name, and express interest in the role.
   - **Body (2–3 paragraphs)**:
     - Highlight relevant experiences and strengths using the provided skills.
     - Emphasize how the applicant’s background can contribute to the company’s goals.
     - Optionally reference the company’s reputation, culture, or mission if relevant.
   - **Closing**: End with a polite and confident call to action (e.g., “I would welcome the opportunity to further discuss…”), and sign off professionally.

4. Content Requirements:
   - Use the **job title**, **company name**, and **key skills** to create a meaningful and personalized letter.
   - If the **applicant name** is provided, sign off using it. If not, end the letter with a general professional closing (e.g., “Sincerely”).
   - Ensure smooth, natural flow between paragraphs.

5. Addressing:
   - Do **not** use “To whom it may concern”.
   - Always refer directly to the **company name** and **position title** provided.

Input Format (JSON):
{
  "jobTitle": "<job title>",
  "companyName": "<company name>",
  "keySkills": "<comma-separated list of skills>",
  "applicantName": "<optional>"
}

Respond only with the final, properly formatted cover letter as plain text.
`
,
  model: gemini({
    model: "gemini-2.5-pro",
    apiKey: process.env.GEMINI_API_KEY
  })
});





export const AiCareerAgent=inngest.createFunction(
    {id:'AiCareerAgent'},
    {event:'AiCareerAgent'},
    async({event,step})=>{
        const {userInput}=await event?.data;
        const result=await AiCareerChatAgent.run(userInput);
        return result;
    }
)

var imagekit = new ImageKit({
  //@ts-ignore
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    //@ts-ignore
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    //@ts-ignore
    urlEndpoint : process.env.IMAGEKIT_ENDPOINT_URL
});


export const AiResumeAgent=inngest.createFunction(
  {id:'AiResumeAgent'},
  {event:'AiResumeAgent'},
  async({event,step})=>{
    const {recordId,base64ResumeFile,pdfText, aiAgentType, userEmail}=await event.data;

    //Upload file to cloud storage

    const uploadFileUrl = await step.run("uploadImage",async()=>{
      const imageKitFile=await imagekit.upload({
        file: base64ResumeFile,
        fileName:`${Date.now()}.pdf`,
        isPublished:true 
      })

      return imageKitFile.url
    })
  

    const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText);

    //@ts-ignore
    const rawContent=aiResumeReport.output[0].content;

    const rawContentJson=rawContent.replace('```json','').replace('```','');
    const parseJson=JSON.parse(rawContentJson);
    //return parseJson;

    //save to DB

    const saveToDb=await step.run('SaveToDb',async()=>{

      const result=await db.insert(historyTable).values({
        recordId:recordId,
        content:parseJson,
        aiAgentType:aiAgentType,
        createdAt: new Date(),
        userEmail:userEmail,
        metaData:uploadFileUrl
      });
      console.log(result);
      return parseJson;
    })


  }
)


/*export const AIRoadmapAgent = inngest.createFunction(
  { id: 'AIRoadmapAgent' },
  { event: 'AIRoadmapAgent' },
  async ({ event, step }) => {
    const { roadmapId, userInput, userEmail } = await event.data;

    const roadmapResult = await AIRoadmapGeneratorAgent.run("UserInput:" + userInput);

    //@ts-ignore
    const rawContent = roadmapResult.output?.[0]?.content || "";

    const rawContentJson = rawContent.replace("```json", "").replace("```", "");
    const parseJson = JSON.parse(rawContentJson);

    // Save to DB
    await step.run("SaveToDb", async () => {
      const result=await db.insert(historyTable).values({
        recordId: roadmapId,
        content: parseJson,
        aiAgentType: "/ai-tools/ai-roadmap-agent",
        createdAt: new Date(),
        userEmail: userEmail,
        metaData: userInput,
      });
      console.log(result);
    });
    return parseJson;
  }
);*/

export const AIRoadmapAgent = inngest.createFunction(
  { id: 'AIRoadmapAgent' },
  { event: 'AIRoadmapAgent' },
  async ({ event, step }) => {
    const { roadmapId, userInput, userEmail } = event.data;

    const roadmapResult = await AIRoadmapGeneratorAgent.run("UserInput:" + userInput);

    //@ts-ignore
    const rawContent = roadmapResult.output?.[0]?.content || "";
    const rawContentJson = rawContent.replace("```json", "").replace("```", "");

    let parseJson;
    try {
      parseJson = JSON.parse(rawContentJson);
    } catch (err) {
      console.error("❌ Failed to parse JSON from AI output:", rawContentJson);
      throw new Error("Invalid JSON returned from AI agent");
    }

    // Save to DB
    await step.run("SaveToDb", async () => {
      const result = await db.insert(historyTable).values({
        recordId: roadmapId,
        content: parseJson,
        aiAgentType: "/ai-tools/ai-roadmap-agent",
        createdAt: new Date(),
        userEmail,
        metaData: userInput,
      });
      console.log("✅ DB Insert Result:", result);
    });

    console.log("✅ Returning AI Output from Inngest:", parseJson);
    return {
      output: parseJson, // Required for polling to work
    };
  }
);




export const AiCoverLetterAgent = inngest.createFunction(
  { id: 'AiCoverLetterAgent' },
  { event: 'AiCoverLetterAgent' },
  async ({ event, step }) => {
    const {
      coverid: coverLetterId,
      userInput = {},
      userEmail,
    } = event.data;

    const {
      jobTitle = "",
      companyName = "",
      keySkills = "",
      additionalNotes = "",
      applicantName = ""
    } = userInput;

    // Combine fields into a pseudo job description
    const jobDescription = `
      Job Title: ${jobTitle}
      Company: ${companyName}
      Required Skills: ${keySkills}
      Additional Notes: ${additionalNotes}
    `.trim();

    // Prepare input for AI agent
    const inputString = JSON.stringify({
      resumeText: "", // You can update this if resumeText is available
      jobDescription,
      applicantName,
      companyName,
      position: jobTitle,
    });

    // Call the AI agent
    const aiCoverLetterResult = await AiCoverLetterGeneratorAgent.run(inputString);

    // Extract cover letter content
    // @ts-ignore
    let coverLetterText = aiCoverLetterResult?.output?.[0]?.content?.trim() || "";

    if (!coverLetterText || coverLetterText.length < 100) {
      throw new Error("Cover letter content is too short or empty.");
    }

    // Structure result
    const parsedContent = {
      coverLetter: coverLetterText,
    };

    // Save to DB
    await step.run("SaveToDb", async () => {
      const result = await db.insert(historyTable).values({
        recordId: coverLetterId,
        content: parsedContent,
        aiAgentType: "/ai-tools/ai-cover-letter-agent",
        createdAt: new Date(),
        userEmail,
        metaData: userInput,
      });

      console.log("Saved to DB:", result);
    });

    return parsedContent;
  }
);
