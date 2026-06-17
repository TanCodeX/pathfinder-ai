"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateGeminiContent } from "@/lib/gemini";
import { cachedGenerateGeminiContent, QUIZ_CACHE_TTL_MS, generateCacheKey } from "@/lib/cache";
import { buildSecurePrompt } from "@/lib/prompt-safety";
import { buildUserProfileContext } from "@/lib/ai-context";
import { parseAIJson } from "@/lib/validate";

// Fallback MCQ questions in case Gemini generation fails
const FALLBACK_QUESTIONS = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Transfer Machine Language",
      "Hyperlink Text Management Language",
      "Home Tool Markup Language",
    ],
    correctAnswer: "Hyper Text Markup Language",
    explanation: "HTML (Hyper Text Markup Language) is the standard markup language used to structure and display web pages.",
  },
  {
    question: "Which programming language runs natively inside web browsers?",
    options: [
      "Java",
      "Python",
      "C++",
      "JavaScript",
    ],
    correctAnswer: "JavaScript",
    explanation: "JavaScript is a high-level, interpreted scripting language that conforms to the ECMAScript specification and runs natively inside all modern browsers.",
  },
  {
    question: "What is React mainly used for in web development?",
    options: [
      "Database management",
      "Frontend user interface development",
      "Operating systems",
      "Network routing and security",
    ],
    correctAnswer: "Frontend user interface development",
    explanation: "React is a popular open-source JavaScript library developed by Meta specifically for building component-based frontend user interfaces.",
  },
  {
    question: "Which of the following database models is NoSQL?",
    options: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Oracle DB",
    ],
    correctAnswer: "MongoDB",
    explanation: "MongoDB is a leading document-oriented NoSQL database that stores data in JSON-like flexible documents.",
  },
  {
    question: "What does CSS handle in modern web development?",
    options: [
      "Server-side business logic",
      "Database storage and caching",
      "Styling, layout, and visual presentation",
      "User authentication and sessions",
    ],
    correctAnswer: "Styling, layout, and visual presentation",
    explanation: "CSS (Cascading Style Sheets) is a stylesheet language used to specify the layout, colors, fonts, and overall visual appearance of HTML documents.",
  },
  {
    question: "Which hook is commonly used to manage state inside a React function component?",
    options: [
      "useEffect",
      "useFetch",
      "useState",
      "useRouter",
    ],
    correctAnswer: "useState",
    explanation: "The useState hook is a built-in React hook that allows functional components to have local state variables that persist across renders.",
  },
  {
    question: "What is Node.js?",
    options: [
      "A frontend CSS styling framework",
      "An open-source server runtime environment for JavaScript",
      "A relational database system",
      "A code compilation package manager",
    ],
    correctAnswer: "An open-source server runtime environment for JavaScript",
    explanation: "Node.js is a cross-platform, open-source JavaScript runtime environment built on Chrome's V8 engine that allows developers to run JS code server-side.",
  },
  {
    question: "Which technology company originally created and released Java?",
    options: [
      "Google",
      "Sun Microsystems",
      "Microsoft",
      "Apple",
    ],
    correctAnswer: "Sun Microsystems",
    explanation: "Java was originally developed and released by James Gosling and his team at Sun Microsystems in 1995 (later acquired by Oracle).",
  },
  {
    question: "What does API stand for in software integration?",
    options: [
      "Application Programming Interface",
      "Advanced Program Interaction",
      "Applied Programming Internet",
      "Application Process Integration",
    ],
    correctAnswer: "Application Programming Interface",
    explanation: "An API (Application Programming Interface) is a set of defined rules and protocols that enables different software applications to communicate and exchange data.",
  },
  {
    question: "Which keyword is used to declare a variable in older JavaScript scopes that is function-scoped?",
    options: [
      "define",
      "string",
      "var",
      "integer",
    ],
    correctAnswer: "var",
    explanation: "In JavaScript, 'var' is the original keyword used to declare variables. It is function-scoped rather than block-scoped like 'let' and 'const'.",
  },
];

/**
 * Generates 10 unique MCQ questions based on user's industry, skills, and quiz category.
 */
export async function generateQuiz(category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      name: true,
      industry: true,
      currentRole: true,
      targetRole: true,
      careerGoals: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });
  if (!user) throw new Error("User not found");

  const profileContext = buildUserProfileContext(user);

  const normalizedSkills = user.skills
    ? Array.from(new Set(user.skills.map((s) => String(s).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))
    : [];

  const categoryPrompts = {
    Technical: "Generate 10 technical interview questions focusing on programming concepts, data structures, system design, algorithms, and practical technical knowledge.",
    Behavioral: "Generate 10 behavioral interview questions focusing on teamwork, leadership, conflict resolution, communication, and past experiences. Use scenarios like 'Tell me about a time when...' or 'How would you handle...'",
    Situational: "Generate 10 situational interview questions focusing on hypothetical workplace scenarios — how the candidate would handle specific on-the-job situations, ethical dilemmas, and decision-making.",
  };

  const categoryIntro = categoryPrompts[category] || categoryPrompts.Technical;

  const prompt = buildSecurePrompt({
    context: profileContext,
    task: `You are a highly experienced hiring manager and strict quiz generator.

${categoryIntro}

Generate EXACTLY 10 UNIQUE MCQ questions.`,
    context: "The candidate has listed their industry, skills, and a quiz category below.",
    untrustedData: [
      { label: "industry", value: user.industry || "software", maxLength: 200 },
      { label: "skills", value: normalizedSkills.join(", ") || "Not specified", maxLength: 1000 },
      { label: "category", value: category, maxLength: 200 },
    ],
    outputRules: `RULES:
- Exactly 10 questions only. No repetition.
- Each question must be highly relevant.
- Each question must have 4 FULL, realistic options (do NOT use labels like 'A', 'B', 'C', 'D' at the beginning of options).
- Only ONE correct answer.
- The 'correctAnswer' field MUST exactly match the string text of one of the options.
- Include a helpful, 1-2 sentence 'explanation' for the correct answer.

Return ONLY a valid JSON object matching this schema. Do not output any markdown code fences, headers, or extra text:

{
  "questions": [
    {
      "question": "Descriptive question text?",
      "options": [
        "Option text 1",
        "Option text 2",
        "Option text 3",
        "Option text 4"
      ],
      "correctAnswer": "Option text 3",
      "explanation": "Detailed explanation of why Option 3 is correct."
    }
  ]
}`,
  });

  try {
    const result = await generateGeminiContent(prompt);
    const quiz = parseAIJson(result.response.text());

    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new Error("Invalid questions structure received from AI.");
    }

    return quiz.questions.slice(0, 10);
  } catch (error) {
    console.error("AI Quiz generation failed, using default questions:", error);
    return FALLBACK_QUESTIONS;
  }
}

/**
 * Saves a quiz result and generates AI-powered feedback if mistakes were made.
 */
export async function saveQuizResult(questions, answers, score, category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const profileContext = buildUserProfileContext(user);

  const sanitizedAnswers = Array.isArray(answers)
    ? answers.slice(0, questions.length)
    : [];

  while (sanitizedAnswers.length < questions.length) {
    sanitizedAnswers.push(null);
  }

  // Map user answers to question outcomes
  const questionResults = [];
  const wrongAnswers = [];

  questions.forEach((q, index) => {
    if (!q?.question) return;

    const userAnswer = sanitizedAnswers[index];
    const isCorrect = q.correctAnswer === userAnswer;

    const mappedQuestion = {
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswer,
      isCorrect,
      explanation: q.explanation,
    };

    questionResults.push(mappedQuestion);

    if (!isCorrect) {
      wrongAnswers.push(mappedQuestion);
    }
  });

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers
      .slice(0, 3)
      .map((q) => `Q: ${q.question}\nCorrect answer was: ${q.correctAnswer}\nUser answered: ${q.userAnswer || "No Answer"}`)
      .join("\n\n");

    const tipPrompt = buildSecurePrompt({
      context: profileContext,
      task: "You are a supportive career mentor. The candidate completed a quiz. Provide an encouraging, actionable improvement tip (strictly max 2 sentences) recommending key learning areas. Be positive, warm, and professional. Do not refer to question indexes or speak critically.",
      untrustedData: [
        { label: "industry", value: user.industry || "software", maxLength: 200 },
        { label: "category", value: category, maxLength: 200 },
        { label: "score", value: String(score), maxLength: 50 },
        { label: "wrongAnswers", value: wrongText, maxLength: 4000 },
      ],
    });

    try {
      const tipResult = await generateGeminiContent(tipPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (e) {
      console.error("Failed to generate custom AI improvement tip:", e);
      improvementTip = "Focus on reviewing core programming concepts and regular system design patterns to strengthen your skills.";
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category,
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving assessment to database:", error);
    throw new Error("Failed to save quiz results.");
  }
}

/**
 * Fetches all assessments for the signed-in user, newest first.
 */
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) return [];

  return db.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetches a single assessment by ID.
 */
export async function getAssessment(id) {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) return null;

  const assessment = await db.assessment.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  return assessment;
}