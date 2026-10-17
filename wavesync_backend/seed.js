// wavesync_backend/seed.js
// PostgreSQL Prisma seed file — replaces the Mongoose seed.js
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const prisma = new PrismaClient();

const seedDatabase = async () => {
  try {
    console.log("🔥 Connected to PostgreSQL. Initiating Database Wipe...");

    // 1. DELETE ALL DATA (order matters for FK constraints)
    await prisma.referral.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.mentorship.deleteMany({});
    await prisma.collabApplicant.deleteMany({});
    await prisma.collabPost.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("🗑️  All existing data cleared.");

    const defaultPassword = await bcrypt.hash("Password@123", 10);

    // ==========================================
    // 🎓 PHASE 1: SEEDING STUDENTS
    // ==========================================
    console.log("🌱 Seeding Students...");

    const student1 = await prisma.user.create({
      data: {
        fullName: "Aarav Sharma",
        email: "aarav@test.com",
        password: defaultPassword,
        role: "student",
        isVerified: true,
        isProfileComplete: true,
        headline: "Senior MERN Stack Developer | React Native Specialist",
        bio: "I build highly scalable web and mobile applications.",
        visibilityMode: "public",
        studentDetails: {
          university: "Navrachana University",
          course: "B.Tech Computer Science",
          semester: "6th",
          skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "Tailwind CSS", "React Native", "API Development"],
          experience: [{
            company: "TechNova Solutions",
            role: "Full Stack Intern",
            startDate: "Jun 2023",
            endDate: "Aug 2023",
            description: "Built responsive dashboards using React and Tailwind CSS."
          }],
          careerPreferences: {
            fields: ["Full Stack (MERN)", "Mobile Development"],
            jobTypes: ["Summer Internship", "Full-Time Role"],
            timeline: ["Immediately"]
          },
          aiCareerRoadmap: [
            "🔥 Your Tech Stack, Experience, and Projects perfectly align with your goals!",
            "💡 Make sure to highlight your E-Commerce Platform project in your resume."
          ]
        }
      }
    });

    const student2 = await prisma.user.create({
      data: {
        fullName: "Priya Patel",
        email: "priya@test.com",
        password: defaultPassword,
        role: "student",
        isVerified: true,
        isProfileComplete: true,
        headline: "Aspiring Data Scientist | ML Enthusiast",
        bio: "Fascinated by data patterns and artificial intelligence.",
        visibilityMode: "public",
        studentDetails: {
          university: "Navrachana University",
          course: "B.Tech Computer Science",
          semester: "4th",
          skills: ["C++", "Java", "HTML", "CSS"],
          experience: [],
          careerPreferences: {
            fields: ["Data Science & Analytics"],
            jobTypes: ["Summer Internship"],
            timeline: ["Within 6 Months"]
          },
          aiCareerRoadmap: [
            "To achieve your goal in Data Science, prioritize learning: Python, SQL, and Pandas.",
            "Start by building a foundational project tailored specifically for Data Science."
          ]
        }
      }
    });

    const student3 = await prisma.user.create({
      data: {
        fullName: "Rohan Desai",
        email: "rohan@test.com",
        password: defaultPassword,
        role: "student",
        isVerified: true,
        isProfileComplete: true,
        headline: "Frontend UI Developer",
        bio: "Passionate about pixel-perfect UI and component-driven architecture using React.",
        visibilityMode: "public",
        studentDetails: {
          university: "Navrachana University",
          course: "BCA",
          semester: "6th",
          skills: ["React", "HTML", "CSS", "JavaScript", "Figma"],
          experience: [],
          careerPreferences: {
            fields: ["Frontend Engineering"],
            jobTypes: ["Summer Internship"],
            timeline: ["Immediately"]
          }
        }
      }
    });

    const student4 = await prisma.user.create({
      data: {
        fullName: "Neha Gupta",
        email: "neha@test.com",
        password: defaultPassword,
        role: "student",
        isVerified: true,
        isProfileComplete: false,
        headline: "",
        bio: "",
        visibilityMode: "private",
        studentDetails: {
          university: "Navrachana University",
          course: "B.Tech IT",
          semester: "2nd",
          skills: [],
          experience: [],
          careerPreferences: {}
        }
      }
    });

    console.log("🎓 Students created.");

    // --- SEED STUDENT PROJECTS ---
    const proj1 = await prisma.project.create({
      data: {
        studentId: student1.id,
        title: "E-Commerce Platform",
        description: "A full-stack application with user authentication, cart management, and Razorpay integration.",
        technologies: ["React", "Node.js", "MongoDB", "Express", "Razorpay"],
        github: "https://github.com/test/ecommerce",
        live: "https://test-ecommerce.com"
      }
    });

    const proj2 = await prisma.project.create({
      data: {
        studentId: student2.id,
        title: "Library Management System",
        description: "A simple desktop application to manage books.",
        technologies: ["Java", "Swing", "MySQL"],
        github: "https://github.com/test/library"
      }
    });

    const proj3 = await prisma.project.create({
      data: {
        studentId: student3.id,
        title: "Personal Portfolio UI",
        description: "A highly interactive and responsive portfolio built using React and modern CSS animations.",
        technologies: ["React", "CSS", "HTML", "Framer Motion"],
        github: "https://github.com/test/portfolio"
      }
    });

    // --- SEED COLLAB BOARD POSTS ---
    await prisma.collabPost.createMany({
      data: [
        {
          authorId: student1.id,
          type: "Hackathon",
          title: "Looking for a UI/UX Designer for a Hackathon!",
          description: "We have the backend sorted using Node.js, but need someone to design the Figma screens.",
          roles: ["UI/UX Designer"],
          isActive: true
        },
        {
          authorId: student2.id,
          type: "Project",
          title: "Need help setting up a Python environment",
          description: "I am trying to learn Data Science but getting errors installing Pandas.",
          roles: ["Python Mentor"],
          isActive: true
        },
        {
          authorId: student3.id,
          type: "Study Group",
          title: "DSA Study Group for Placements",
          description: "Starting a daily LeetCode grind focusing on Arrays and Trees.",
          roles: ["Coding Buddy"],
          isActive: true
        }
      ]
    });

    // ==========================================
    // 🏢 PHASE 2: SEEDING COMPANIES & ALUMNI
    // ==========================================
    console.log("🏢 Seeding Companies and Alumni...");

    const alumni1 = await prisma.user.create({
      data: {
        fullName: "Vikram Singh",
        email: "vikram@alumni.com",
        password: defaultPassword,
        role: "alumni",
        isVerified: true,
        isProfileComplete: true,
        headline: "Senior Backend Engineer @ Google",
        bio: "I build scalable systems and love mentoring juniors.",
        visibilityMode: "public",
        alumniDetails: { graduationYear: "2020", company: "Google", role: "Senior Software Engineer" }
      }
    });

    const alumni2 = await prisma.user.create({
      data: {
        fullName: "Anjali Verma",
        email: "anjali@alumni.com",
        password: defaultPassword,
        role: "alumni",
        isVerified: true,
        isProfileComplete: true,
        headline: "Frontend UI Developer @ Amazon",
        bio: "Specializing in React and Web Performance.",
        visibilityMode: "public",
        alumniDetails: { graduationYear: "2022", company: "Amazon", role: "Frontend Developer" }
      }
    });

    const company1 = await prisma.user.create({
      data: {
        fullName: "TechNova HR",
        email: "hr@technova.com",
        password: defaultPassword,
        role: "company",
        isVerified: true,
        isProfileComplete: true,
        headline: "TechNova Recruiting",
        bio: "We are a fast-growing startup building next-gen e-commerce solutions.",
        visibilityMode: "public",
        companyDetails: { companyName: "TechNova Solutions", hrContact: "Sarah Jenkins", industryType: "Technology" }
      }
    });

    const company2 = await prisma.user.create({
      data: {
        fullName: "DataSphere AI HR",
        email: "careers@datasphere.com",
        password: defaultPassword,
        role: "company",
        isVerified: true,
        isProfileComplete: true,
        headline: "Hiring Top Data Talent",
        bio: "Pioneering machine learning models for the finance sector.",
        visibilityMode: "public",
        companyDetails: { companyName: "DataSphere AI", hrContact: "Michael Ross", industryType: "Artificial Intelligence" }
      }
    });

    // ==========================================
    // 💼 PHASE 3: SEEDING JOBS
    // ==========================================
    console.log("💼 Seeding Jobs...");

    const job1 = await prisma.job.create({
      data: {
        postedById: company1.id,
        title: "MERN Stack Intern",
        companyName: "TechNova Solutions",
        description: "Looking for an intern to help build our React/Node frontend and backend.",
        requirements: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
        jobType: "Internship",
        location: "Remote (Global)",
        salaryRange: "₹20,000/month",
        status: "open"
      }
    });

    const job2 = await prisma.job.create({
      data: {
        postedById: company1.id,
        title: "React Web Developer",
        companyName: "TechNova Solutions",
        description: "Full-Time role for building dashboards.",
        requirements: ["React", "JavaScript", "Tailwind CSS", "UI/UX"],
        jobType: "Full-Time Role",
        location: "Bangalore, KA",
        salaryRange: "₹8L - ₹12L",
        status: "open"
      }
    });

    const job3 = await prisma.job.create({
      data: {
        postedById: alumni1.id,
        title: "Frontend Engineering Intern",
        companyName: "Google",
        description: "Join the search team to build accessible UI components.",
        requirements: ["React", "HTML", "CSS", "JavaScript"],
        jobType: "Summer Internship",
        location: "Hyderabad, TS",
        salaryRange: "₹60,000/month",
        status: "open"
      }
    });

    const job4 = await prisma.job.create({
      data: {
        postedById: company2.id,
        title: "Data Science Intern",
        companyName: "DataSphere AI",
        description: "Join our ML team to clean datasets and build predictive models.",
        requirements: ["Python", "SQL", "Pandas", "Machine Learning"],
        jobType: "Summer Internship",
        location: "Bangalore, KA",
        salaryRange: "₹30,000/month",
        status: "open"
      }
    });

    const job5 = await prisma.job.create({
      data: {
        postedById: alumni1.id,
        title: "Senior System Architect",
        companyName: "Google",
        description: "Looking for a seasoned backend engineer to lead architecture.",
        requirements: ["Node.js", "System Design", "AWS", "Docker"],
        jobType: "Full-Time Role",
        location: "Remote (Global)",
        salaryRange: "₹40L - ₹60L",
        status: "open"
      }
    });

    const job6 = await prisma.job.create({
      data: {
        postedById: company1.id,
        title: "Junior MERN Stack Engineer",
        companyName: "TechNova Solutions",
        description: "We are strictly looking for a MERN stack developer with hands-on experience building E-Commerce platforms.",
        requirements: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JavaScript"],
        jobType: "Full-Time Role",
        location: "Remote",
        salaryRange: "₹6L - ₹10L",
        status: "open"
      }
    });

    const job7 = await prisma.job.create({
      data: {
        postedById: alumni1.id,
        title: "React Native Mobile Developer",
        companyName: "Google",
        description: "Looking for a mobile developer to build cross-platform apps using React Native.",
        requirements: ["React Native", "JavaScript", "API Development"],
        jobType: "Summer Internship",
        location: "Remote",
        salaryRange: "₹45,000/month",
        status: "open"
      }
    });

    // ==========================================
    // 🤝 PHASE 4: SEEDING MENTORSHIP & APPLICATIONS
    // ==========================================
    console.log("🤝 Seeding Mentorships and Applications...");

    await prisma.mentorship.createMany({
      data: [
        {
          studentId: student1.id,
          alumniId: alumni1.id,
          message: "Hi Vikram, I am highly interested in backend architecture at scale.",
          status: "pending"
        },
        {
          studentId: student3.id,
          alumniId: alumni2.id,
          message: "Hi Anjali, I love your work at Amazon! Could you review my React portfolio?",
          status: "pending"
        },
        {
          studentId: student1.id,
          alumniId: alumni2.id,
          message: "Hi Anjali, I'd love to learn about React performance.",
          status: "accepted"
        },
        {
          studentId: student2.id,
          alumniId: alumni1.id,
          message: "Hi Vikram, looking for guidance on transitioning into Data Science.",
          status: "pending"
        },
        {
          studentId: student4.id,
          alumniId: alumni1.id,
          message: "Hello Vikram, can you refer me to Google?",
          status: "rejected"
        }
      ]
    });

    await prisma.application.createMany({
      data: [
        // Aarav applied to MERN Intern
        {
          jobId: job1.id,
          studentId: student1.id,
          fitScore: 98,
          status: "applied"
        },
        // Aarav gets an OFFER
        {
          jobId: job2.id,
          studentId: student1.id,
          fitScore: 88,
          status: "offered"
        },
        // Aarav is INTERVIEWING at Google
        {
          jobId: job3.id,
          studentId: student1.id,
          fitScore: 85,
          status: "interviewing"
        },
        // Aarav gets an alumni REFERRAL (shortlisted)
        {
          jobId: job5.id,
          studentId: student1.id,
          fitScore: 92,
          status: "shortlisted",
          isReferral: true,
          referredById: alumni1.id
        },
        // Priya gets REJECTED
        {
          jobId: job1.id,
          studentId: student2.id,
          fitScore: 45,
          status: "rejected"
        },
        // Rohan is SHORTLISTED
        {
          jobId: job1.id,
          studentId: student3.id,
          fitScore: 82,
          status: "shortlisted"
        },
        // Neha just APPLIED
        {
          jobId: job2.id,
          studentId: student4.id,
          fitScore: 20,
          status: "applied"
        }
      ]
    });

    // Persist the alumni referral as a formal Referral record too
    await prisma.referral.create({
      data: {
        alumniId: alumni1.id,
        studentId: student1.id,
        jobId: job5.id,
        companyName: "Google",
        notes: "Referred internally by Vikram Singh after completing our backend architecture mentorship session.",
        status: "referred"
      }
    });

    console.log("🎉 DATABASE SEEDED COMPLETELY WITH POSTGRESQL DATA! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();