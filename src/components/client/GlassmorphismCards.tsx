"use client";

import { motion } from "framer-motion";
import { TrendingUp, Shield, Users, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";

// Generate 500 unique activities
const generateActivityPool = () => {
  const nameGroups = [
    {
      // US/UK/Canada/Australia
      firstNames: ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"],
      lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Wilson", "Anderson", "Taylor", "Moore"],
      currencies: [
        { symbol: "$", min: 500, max: 10000 },   // USD
        { symbol: "£", min: 400, max: 8000 },    // GBP
        { symbol: "C$", min: 650, max: 12000 },  // CAD
        { symbol: "A$", min: 750, max: 14000 },  // AUD
      ]
    },
    {
      // Spanish/Latin America
      firstNames: ["Carlos", "Maria", "Jose", "Ana", "Luis", "Carmen", "Miguel", "Rosa", "Antonio", "Isabel"],
      lastNames: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres"],
      currencies: [
        { symbol: "$", min: 500, max: 10000 },   // USD (used in many Latin countries)
        { symbol: "€", min: 450, max: 9000 },    // EUR (Spain)
      ]
    },
    {
      // Chinese
      firstNames: ["Wei", "Li", "Ming", "Yan", "Chen", "Ling", "Zhang", "Xia", "Wang", "Mei"],
      lastNames: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou"],
      currencies: [
        { symbol: "¥", min: 3500, max: 70000 },  // CNY (Chinese Yuan)
      ]
    },
    {
      // Indian
      firstNames: ["Raj", "Priya", "Arjun", "Anjali", "Aditya", "Sanya", "Rohan", "Kavya", "Vikram", "Diya"],
      lastNames: ["Kumar", "Sharma", "Singh", "Patel", "Gupta", "Reddy", "Verma", "Mehta", "Iyer", "Nair"],
      currencies: [
        { symbol: "₹", min: 40000, max: 750000 }, // INR
      ]
    },
    {
      // Arabic
      firstNames: ["Ahmed", "Fatima", "Omar", "Aisha", "Hassan", "Zainab", "Khalid", "Layla", "Youssef", "Noor"],
      lastNames: ["Al-Ahmad", "Al-Hassan", "Al-Mohamed", "Al-Ali", "Al-Ibrahim", "Al-Khalil", "Al-Mansour", "Al-Said", "Al-Rashid", "Al-Amin"],
      currencies: [
        { symbol: "$", min: 500, max: 10000 },   // USD (commonly used)
        { symbol: "د.إ", min: 1800, max: 36000 }, // AED (UAE Dirham)
      ]
    },
    {
      // French
      firstNames: ["Pierre", "Marie", "Jean", "Sophie", "Luc", "Amelie", "Andre", "Chloe", "Henri", "Emma"],
      lastNames: ["Dubois", "Bernard", "Petit", "Robert", "Richard", "Durand", "Moreau", "Simon", "Laurent", "Lefevre"],
      currencies: [
        { symbol: "€", min: 450, max: 9000 },    // EUR
      ]
    },
    {
      // German
      firstNames: ["Hans", "Anna", "Klaus", "Greta", "Wolfgang", "Helga", "Stefan", "Ingrid", "Thomas", "Petra"],
      lastNames: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"],
      currencies: [
        { symbol: "€", min: 450, max: 9000 },    // EUR
      ]
    },
    {
      // Italian
      firstNames: ["Marco", "Giulia", "Luca", "Francesca", "Giovanni", "Elena", "Paolo", "Valentina", "Andrea", "Chiara"],
      lastNames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco"],
      currencies: [
        { symbol: "€", min: 450, max: 9000 },    // EUR
      ]
    },
    {
      // Japanese
      firstNames: ["Hiroshi", "Yuki", "Takeshi", "Sakura", "Kenji", "Akiko", "Daichi", "Hana", "Ryota", "Ayumi"],
      lastNames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"],
      currencies: [
        { symbol: "¥", min: 50000, max: 1000000 }, // JPY
      ]
    },
    {
      // Korean
      firstNames: ["Min-jun", "Ji-woo", "Seo-jun", "Seo-yeon", "Do-yun", "Ha-eun", "Ye-jun", "Ji-hyun", "Si-woo", "Soo-jin"],
      lastNames: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim"],
      currencies: [
        { symbol: "₩", min: 600000, max: 12000000 }, // KRW
      ]
    },
    {
      // Russian
      firstNames: ["Ivan", "Anastasia", "Dmitri", "Natasha", "Sergei", "Elena", "Alexei", "Olga", "Nikolai", "Katya"],
      lastNames: ["Ivanov", "Petrov", "Sidorov", "Kuznetsov", "Popov", "Sokolov", "Lebedev", "Kozlov", "Novikov", "Morozov"],
      currencies: [
        { symbol: "₽", min: 40000, max: 800000 }, // RUB
      ]
    },
    {
      // Nigerian
      firstNames: ["Chidi", "Amara", "Emeka", "Ngozi", "Obi", "Chiamaka", "Ade", "Zara", "Tunde", "Kemi"],
      lastNames: ["Okafor", "Adeyemi", "Oluwaseun", "Nwosu", "Okeke", "Adeleke", "Chukwu", "Okonkwo", "Eze", "Olayinka"],
      currencies: [
        { symbol: "₦", min: 400000, max: 4000000 }, // NGN
      ]
    },
    {
      // Brazilian
      firstNames: ["Bruno", "Gabriela", "Lucas", "Juliana", "Rafael", "Beatriz", "Felipe", "Camila", "Pedro", "Larissa"],
      lastNames: ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Costa", "Ferreira", "Rodrigues", "Alves", "Pereira"],
      currencies: [
        { symbol: "R$", min: 2500, max: 50000 }, // BRL
      ]
    },
  ];
  
  const actions = ["deposited", "bought", "sold"];
  const types = ["deposit", "buy", "sell"];
  const cryptos = ["BTC", "ETH", "XRP", "ADA", "SOL", "MATIC", "DOT", "AVAX", "LINK", "UNI"];
  const pool = [];
  const usedNames = new Set<string>();

  for (let i = 1; i <= 500; i++) {
    // Select random name group
    const nameGroup = nameGroups[Math.floor(Math.random() * nameGroups.length)];
    
    // Generate unique name from this group
    let fullName;
    let attempts = 0;
    do {
      const firstName = nameGroup.firstNames[Math.floor(Math.random() * nameGroup.firstNames.length)];
      const lastName = nameGroup.lastNames[Math.floor(Math.random() * nameGroup.lastNames.length)];
      fullName = `${firstName} ${lastName}`;
      attempts++;
      // If too many attempts, try a different group
      if (attempts > 20) {
        const altGroup = nameGroups[Math.floor(Math.random() * nameGroups.length)];
        const altFirstName = altGroup.firstNames[Math.floor(Math.random() * altGroup.firstNames.length)];
        const altLastName = altGroup.lastNames[Math.floor(Math.random() * altGroup.lastNames.length)];
        fullName = `${altFirstName} ${altLastName} ${i}`;
        break;
      }
    } while (usedNames.has(fullName));
    
    usedNames.add(fullName);

    const actionIndex = Math.floor(Math.random() * actions.length);
    const action = actions[actionIndex];
    const type = types[actionIndex];
    
    let amount;
    if (type === "deposit") {
      // Use currency from the same name group
      const currency = nameGroup.currencies[Math.floor(Math.random() * nameGroup.currencies.length)];
      const value = Math.floor(Math.random() * (currency.max - currency.min) + currency.min);
      amount = `${currency.symbol}${value.toLocaleString()}`;
    } else {
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
      const cryptoAmount = (Math.random() * 10 + 0.01).toFixed(2);
      amount = `${cryptoAmount} ${crypto}`;
    }

    pool.push({
      user: fullName,
      action,
      amount,
      type,
    });
  }

  return pool;
};

const quickStats = [
  { icon: TrendingUp, label: "24/7 Trading", value: "Non-Stop" },
  { icon: Shield, label: "Secure", value: "Bank-Level" },
];

export default function GlassmorphismCards() {
  const activityPool = useMemo(() => generateActivityPool(), []);
  const [usedIndices, setUsedIndices] = useState(new Set<number>());
  const [recentActivities, setRecentActivities] = useState<Array<{user: string; action: string; amount: string; type: string; id: string}>>([]);
  const [onlineUsers, setOnlineUsers] = useState(2847);
  const activityCounter = useRef(0);

  useEffect(() => {
    // Initialize with 8 random activities
    const initialIndices = new Set<number>();
    const initialActivities = [];
    
    for (let i = 0; i < 8; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * activityPool.length);
      } while (initialIndices.has(randomIndex));
      
      initialIndices.add(randomIndex);
      activityCounter.current++;
      initialActivities.push({ ...activityPool[randomIndex], id: `activity-${activityCounter.current}` });
    }
    
    setUsedIndices(initialIndices);
    setRecentActivities(initialActivities);

    // Random time between 2-6 seconds for each new activity
    const scheduleNextActivity = () => {
      const randomDelay = Math.random() * 4000 + 2000; // 2000-6000ms
      
      setTimeout(() => {
        setUsedIndices((prevIndices) => {
          // If all activities used, reset
          const indices = prevIndices.size >= activityPool.length ? new Set<number>() : new Set(prevIndices);

          // Find unused index
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * activityPool.length);
          } while (indices.has(randomIndex));

          indices.add(randomIndex);
          
          const randomActivity = activityPool[randomIndex];
          activityCounter.current++;
          const newActivity = { ...randomActivity, id: `activity-${activityCounter.current}` };
          
          setRecentActivities((prev) => [newActivity, ...prev.slice(0, 7)]);
          
          return indices;
        });
        
        scheduleNextActivity(); // Schedule the next one
      }, randomDelay);
    };

    scheduleNextActivity();

    // Update online users count
    const userInterval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10 - 3));
    }, 5000);

    return () => {
      clearInterval(userInterval);
    };
  }, []);

  return (
    <>
      {/* Recent Activity - Left Side */}
      <div className="absolute left-4 top-24 z-[6] hidden xl:block">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 min-w-[260px] max-h-[400px] overflow-hidden"
        >
          <p className="text-white text-xs font-semibold mb-2">Recent Activity</p>
          <div className="space-y-1.5">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  {activity.type === "buy" || activity.type === "deposit" ? (
                    <ArrowUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-white/80 truncate font-bold">{activity.user}</span>
                </div>
                <div className="text-right">
                  <p className="text-white/60">{activity.action}</p>
                  <p className="text-white font-semibold whitespace-nowrap">{activity.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Cards - Right Side */}
      <div className="absolute right-4 top-40 z-[6] hidden xl:block space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.6 }}
                whileHover={{ scale: 1.05, x: -10 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 w-40 cursor-pointer"
              >
                <Icon className="w-6 h-6 text-orange-500 mb-1" />
              <p className="text-white/60 text-xs mb-0.5 font-bold">{stat.label}</p>
                <p className="text-white text-base font-bold">{stat.value}</p>
              </motion.div>
            );
          })}
          {/* Active Users Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.05, x: -10 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 w-40 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-6 h-6 text-orange-500" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <p className="text-white/60 text-xs mb-0.5 font-bold">Active Users</p>
            <p className="text-white text-base font-bold">
              <AnimatedCounter value={onlineUsers.toString()} />
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
