"use client";

import { useState } from "react";
import {
  GraduationCap,
  TrendingUp,
  Shield,
  LineChart,
  Brain,
  Play,
  CheckCircle2,
  Lock,
  Award,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  icon: any;
  lessons: Lesson[];
  progress: number;
}

export default function AcademyPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses: Course[] = [
    {
      id: "basics",
      title: "Trading Basics",
      description: "Learn the fundamentals of cryptocurrency trading",
      level: "Beginner",
      icon: GraduationCap,
      progress: 0,
      lessons: [
        {
          id: "1",
          title: "What is Cryptocurrency?",
          duration: "5 min",
          completed: false,
          locked: false,
        },
        {
          id: "2",
          title: "Understanding the Market",
          duration: "7 min",
          completed: false,
          locked: false,
        },
        {
          id: "3",
          title: "How to Read Charts",
          duration: "10 min",
          completed: false,
          locked: false,
        },
        {
          id: "4",
          title: "Placing Your First Trade",
          duration: "8 min",
          completed: false,
          locked: false,
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Analysis",
      description: "Master chart patterns and technical indicators",
      level: "Intermediate",
      icon: LineChart,
      progress: 0,
      lessons: [
        {
          id: "1",
          title: "Support & Resistance",
          duration: "12 min",
          completed: false,
          locked: false,
        },
        {
          id: "2",
          title: "Trend Lines & Channels",
          duration: "15 min",
          completed: false,
          locked: false,
        },
        {
          id: "3",
          title: "Moving Averages",
          duration: "10 min",
          completed: false,
          locked: false,
        },
        {
          id: "4",
          title: "RSI & MACD Indicators",
          duration: "18 min",
          completed: false,
          locked: false,
        },
        {
          id: "5",
          title: "Chart Patterns",
          duration: "20 min",
          completed: false,
          locked: false,
        },
      ],
    },
    {
      id: "risk",
      title: "Risk Management",
      description: "Protect your capital with proper risk strategies",
      level: "Intermediate",
      icon: Shield,
      progress: 0,
      lessons: [
        {
          id: "1",
          title: "Position Sizing Basics",
          duration: "8 min",
          completed: false,
          locked: false,
        },
        {
          id: "2",
          title: "Stop-Loss Strategies",
          duration: "12 min",
          completed: false,
          locked: false,
        },
        {
          id: "3",
          title: "Risk-Reward Ratio",
          duration: "10 min",
          completed: false,
          locked: false,
        },
        {
          id: "4",
          title: "Portfolio Diversification",
          duration: "15 min",
          completed: false,
          locked: false,
        },
      ],
    },
    {
      id: "strategies",
      title: "Trading Strategies",
      description: "Proven strategies for different market conditions",
      level: "Advanced",
      icon: TrendingUp,
      progress: 0,
      lessons: [
        {
          id: "1",
          title: "Day Trading Techniques",
          duration: "20 min",
          completed: false,
          locked: false,
        },
        {
          id: "2",
          title: "Swing Trading Strategy",
          duration: "18 min",
          completed: false,
          locked: false,
        },
        {
          id: "3",
          title: "Scalping Methods",
          duration: "15 min",
          completed: false,
          locked: false,
        },
        {
          id: "4",
          title: "Trend Following",
          duration: "22 min",
          completed: false,
          locked: false,
        },
      ],
    },
    {
      id: "ai",
      title: "AI Trading Signals",
      description: "Leverage AI for smarter trading decisions",
      level: "Advanced",
      icon: Brain,
      progress: 0,
      lessons: [
        {
          id: "1",
          title: "Understanding AI Signals",
          duration: "10 min",
          completed: false,
          locked: false,
        },
        {
          id: "2",
          title: "Sentiment Analysis",
          duration: "12 min",
          completed: false,
          locked: false,
        },
        {
          id: "3",
          title: "Combining AI with TA",
          duration: "15 min",
          completed: false,
          locked: false,
        },
        {
          id: "4",
          title: "Backtesting AI Strategies",
          duration: "18 min",
          completed: false,
          locked: false,
        },
      ],
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-green-500 bg-green-500/10";
      case "Intermediate":
        return "text-yellow-500 bg-yellow-500/10";
      case "Advanced":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold">M4Capital Academy</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Master cryptocurrency trading with our comprehensive courses. Learn
            at your own pace from beginner to advanced levels.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-gray-400">Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + c.lessons.length, 0)}
                </p>
                <p className="text-sm text-gray-400">Lessons</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-gray-400">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Available Courses</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 transition cursor-pointer"
                onClick={() => setSelectedCourse(course.id)}
              >
                {/* Course Header */}
                <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-12 h-12 text-blue-400" />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(
                        course.level
                      )}`}
                    >
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-400">{course.description}</p>
                </div>

                {/* Course Body */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-blue-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{course.lessons.length} lessons</span>
                    <span>
                      {course.lessons.reduce(
                        (sum, l) => sum + parseInt(l.duration),
                        0
                      )}{" "}
                      min
                    </span>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                    {course.progress > 0 ? "Continue" : "Start Course"}
                  </button>
                </div>

                {/* Lessons Preview */}
                <div className="border-t border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {course.lessons.length} lessons in this course
                  </p>
                  {course.lessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-2 py-1 text-sm"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : lesson.locked ? (
                        <Lock className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-gray-400 text-xs truncate">
                        {lesson.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Practice Trading CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Practice?</h3>
              <p className="text-gray-400">
                Try paper trading with virtual money to test your skills
                risk-free!
              </p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition whitespace-nowrap">
              Start Paper Trading →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
