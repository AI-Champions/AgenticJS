const { Agent, Task, Team } = require("kaibanjs");

// Define agents
const profileAnalyst = new Agent({
  name: "Mary",
  role: "Profile Analyst",
  goal: "Extract structured information from conversational user input.",
  background: "Data Processor",
  tools: [], // Tools are omitted for now
});

const resumeWriter = new Agent({
  name: "Alex Mercer",
  role: "Resume Writer",
  goal: `Craft compelling, well-structured resumes 
    that effectively showcase job seekers qualifications and achievements.`,
  background: `Extensive experience in recruiting, 
    copywriting, and human resources, enabling 
    effective resume design that stands out to employers.`,
  tools: [],
});

// Define tasks
const processingTask = new Task({
  description: `Extract relevant details such as name, 
  experience, skills, and job history from the user's 'aboutMe' input. 
  aboutMe: {aboutMe}`,
  expectedOutput: "Structured data ready to be used for a resume creation.",
  agent: profileAnalyst,
});

const resumeCreationTask = new Task({
  description: `Utilize the structured data to create 
    a detailed and attractive resume. 
    Enrich the resume content by inferring additional details from the provided information.
    Include sections such as a personal summary, detailed work experience, skills, and educational background.`,
  expectedOutput: `A professionally formatted resume in markdown format, 
    ready for submission to potential employers.`,
  agent: resumeWriter,
});

// Create a team
const team = new Team({
  name: "Resume Creation Team",
  agents: [profileAnalyst, resumeWriter],
  tasks: [processingTask, resumeCreationTask],
  inputs: {
    aboutMe: `My name is David Llaca. 
    JavaScript Developer for 5 years. 
    I worked for three years at Disney, 
    where I developed user interfaces for their primary landing pages
     using React, NextJS, and Redux. Before Disney, 
     I was a Junior Front-End Developer at American Airlines, 
     where I worked with Vue and Tailwind. 
     I earned a Bachelor of Science in Computer Science from FIU in 2018, 
     and I completed a JavaScript bootcamp that same year.`,
  }, // Initial input for the first task
  env: {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  },
});

export default team;
