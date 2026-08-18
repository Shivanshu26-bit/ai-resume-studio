import { Resume, UserProfile } from "../types";

export const defaultUserProfile: UserProfile = {
  name: "Meena Shukla",
  email: "Meenashukla3211@gmail.com",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4owbeln06ShcDmz939csO4HP6hzVZM6zVggGvxGEQw4FIRCTKQZDhRNK6MSMN64wjkCNm6wzi5HXMqrVZ20AUdTMt6B6BAy3gpwN-zSMKMA_pY5y94k7x7CgBudSNEIxt9npwlQslnrDqTlZxF32bivGPSvTn5jgffZKw3vV01BeNPSCI4A8JL9nb54CB7zbRt5jWbmah6ES8kS8HHsyDrukhzs9KrOOIECWcQKOPt0lnhnULEveK",
  targetRole: "Senior Android Engineer",
  yearsOfExp: 6,
  isLoggedIn: true,
};

export const sampleResumes: Resume[] = [
  {
    id: "res-senior-dev",
    title: "Senior Dev Resume",
    targetRole: "Senior Android Engineer",
    lastEdited: "2 hours ago",
    updatedAt: Date.now() - 7200000,
    atsScore: 85,
    personal: {
      firstName: "Alex",
      lastName: "Chen",
      email: "alex.chen@example.com",
      phone: "(555) 987-6543",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/alexchen-dev",
      github: "https://github.com/alexchen",
      summary: "Experienced Android developer looking for new opportunities. Worked with Java and some Kotlin. Built several apps and published them to the Play Store over the last 5 years.",
    },
    experiences: [
      {
        id: "exp-1",
        title: "Senior Mobile Engineer",
        company: "Apex Tech Labs",
        location: "San Francisco, CA",
        startDate: "2021",
        endDate: "Present",
        current: true,
        bullets: [
          "Architected modern Android client using Kotlin, Jetpack Compose, and MVI architecture pattern for 500k+ active users.",
          "Spearheaded multi-module migration reducing clean build time by 45% across a team of 14 mobile developers.",
          "Integrated offline-first Room database and Ktor networking client with 99.9% crash-free user sessions."
        ],
      },
      {
        id: "exp-2",
        title: "Android Developer",
        company: "Vanguard Digital",
        location: "San Jose, CA",
        startDate: "2019",
        endDate: "2021",
        current: false,
        bullets: [
          "Developed core e-commerce checkout flow in Kotlin Coroutines, boosting successful conversion rate by 18%.",
          "Implemented automated CI/CD GitHub Actions pipelines deploying signed release bundles directly to Google Play internal track.",
          "Collaborated with UX and product teams to establish accessible Material 3 component design systems."
        ],
      }
    ],
    education: [
      {
        id: "edu-1",
        degree: "B.S. in Computer Science",
        school: "University of California, Berkeley",
        location: "Berkeley, CA",
        year: "2019",
      }
    ],
    skills: ["Kotlin", "Jetpack Compose", "Coroutines & Flow", "Hilt / Dagger", "Clean Architecture", "Room DB", "CI/CD", "Gradle"],
    analysis: {
      atsScore: 85,
      targetRole: "Senior Android Engineer",
      matchAssessment: "Excellent match for Senior Android Engineer roles.",
      recommendedKeywords: ["Kotlin Coroutines", "Jetpack Compose", "Hilt", "CI/CD"],
      insights: [
        {
          title: "Quantify Achievements",
          description: "2 of your experience bullets lack metrics. Try adding percentage improvements or user counts.",
          type: "trending_up"
        },
        {
          title: "Strengthen Action Verbs",
          description: "Replace passive phrases like 'Worked on' with 'Architected' or 'Spearheaded'.",
          type: "sort_by_alpha"
        }
      ],
      summaryOptimization: {
        originalDraft: "Experienced Android developer looking for new opportunities. Worked with Java and some Kotlin. Built several apps and published them to the Play Store over the last 5 years.",
        aiOptimized: "Results-driven Senior Android Engineer with 5+ years of experience specializing in Kotlin and modern architecture components. Proven track record of architecting scalable mobile applications, optimizing performance, and delivering high-impact solutions to the Play Store."
      }
    }
  },
  {
    id: "res-pm-cv",
    title: "Product Manager CV",
    targetRole: "Lead Product Manager",
    lastEdited: "Yesterday",
    updatedAt: Date.now() - 86400000,
    atsScore: 62,
    personal: {
      firstName: "Sarah",
      lastName: "Jenkins",
      email: "sarah.j@example.com",
      phone: "(555) 432-8765",
      location: "New York, NY",
      linkedin: "https://linkedin.com/in/sarahjenkins-pm",
      summary: "Product manager with experience managing roadmaps, leading sprints, and working with engineering and design teams.",
    },
    experiences: [
      {
        id: "exp-pm-1",
        title: "Product Manager",
        company: "FinTech Orbit",
        location: "New York, NY",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: [
          "Led roadmap planning for consumer payment products.",
          "Worked with developers to launch new onboarding features.",
          "Analyzed customer feedback to prioritize sprint backlogs."
        ],
      }
    ],
    education: [
      {
        id: "edu-pm-1",
        degree: "B.A. in Economics",
        school: "New York University",
        location: "New York, NY",
        year: "2020",
      }
    ],
    skills: ["Product Roadmap", "Agile / Scrum", "A/B Testing", "Data Analysis", "User Research"],
    analysis: {
      atsScore: 62,
      targetRole: "Lead Product Manager",
      matchAssessment: "Moderate match. Key analytics and business KPI impact metrics are missing.",
      recommendedKeywords: ["Growth Metrics", "OKR Strategy", "SQL / BigQuery", "PLG (Product-Led Growth)", "GTM Execution"],
      insights: [
        {
          title: "Add Revenue & Retention Impact",
          description: "Bullets should quantify ARR, DAU/MAU lift, or retention rate shifts.",
          type: "trending_up"
        },
        {
          title: "Highlight Cross-Functional Leadership",
          description: "Demonstrate direct ownership of go-to-market strategies.",
          type: "lightbulb"
        }
      ],
      summaryOptimization: {
        originalDraft: "Product manager with experience managing roadmaps, leading sprints, and working with engineering and design teams.",
        aiOptimized: "Data-driven Lead Product Manager with 4+ years spearheading high-growth fintech products. Adept at driving 30%+ retention increases through rigorous A/B experimentation, user discovery, and cross-functional engineering alignment."
      }
    }
  },
  {
    id: "res-startup-lead",
    title: "Startup Tech Lead v2",
    targetRole: "Founding Engineer / Tech Lead",
    lastEdited: "Oct 12",
    updatedAt: Date.now() - 1728000000,
    atsScore: 91,
    personal: {
      firstName: "Marcus",
      lastName: "Vance",
      email: "marcus.vance@tech.io",
      phone: "(555) 789-0123",
      location: "Austin, TX",
      linkedin: "https://linkedin.com/in/marcusvance",
      github: "https://github.com/marcusv",
      summary: "Entrepreneurial Founding Engineer and Mobile Architect with a history of taking 0-to-1 products to market. Deep expertise in high-throughput microservices and Kotlin multiplatform apps.",
    },
    experiences: [
      {
        id: "exp-lead-1",
        title: "Founding Tech Lead",
        company: "Nexus AI Systems",
        location: "Austin, TX",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: [
          "Built initial real-time mobile app and cloud backend from scratch in 4 months, acquiring 250k MAU in year one.",
          "Managed team of 8 full-stack and mobile engineers across 2 time zones, maintaining zero Sev-1 incidents.",
          "Secured Series A funding technical sign-off by passing rigorous enterprise SOC2 security audits."
        ],
      }
    ],
    education: [
      {
        id: "edu-lead-1",
        degree: "M.S. in Software Engineering",
        school: "UT Austin",
        location: "Austin, TX",
        year: "2018",
      }
    ],
    skills: ["System Architecture", "Kotlin Multiplatform", "Distributed Systems", "Cloud Run", "PostgreSQL", "Team Leadership"],
    analysis: {
      atsScore: 91,
      targetRole: "Founding Engineer / Tech Lead",
      matchAssessment: "Outstanding match with high-density leadership and technical keywords.",
      recommendedKeywords: ["K8s", "GraphQL", "Zero Trust Security", "Series A Diligence"],
      insights: [
        {
          title: "Pristine Metric Density",
          description: "Bullets contain strong outcome-focused percentages and user figures.",
          type: "check"
        }
      ],
      summaryOptimization: {
        originalDraft: "Entrepreneurial Founding Engineer and Mobile Architect with a history of taking 0-to-1 products to market.",
        aiOptimized: "Entrepreneurial Founding Tech Lead with 7+ years architecting scalable 0-to-1 mobile ecosystems. Proven track record scaling platforms to 250k+ MAU, leading elite engineering teams, and driving technical due diligence for institutional funding."
      }
    }
  }
];

export const demoAlexChenData = {
  firstName: "Alex",
  lastName: "Chen",
  email: "alex.chen@example.com",
  phone: "(555) 987-6543",
  location: "San Francisco, CA",
  linkedin: "https://linkedin.com/in/alexchen-dev",
  github: "https://github.com/alexchen",
  summary: "Experienced Android developer looking for new opportunities. Worked with Java and some Kotlin. Built several apps and published them to the Play Store over the last 5 years."
};
