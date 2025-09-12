import BackgroundSlider from "@/components/client/BackgroundSlider";
import AnimatedButton from "@/components/client/AnimatedButton";
import { FiTrendingUp, FiShield, FiClock, FiGlobe } from "react-icons/fi";

export default function Home() {
  const images = ["/background-1.jpg", "/background-2.jpg", "/background-3.jpg"];

  const features = [
    {
      icon: <FiTrendingUp className="w-8 h-8 text-indigo-400" />,
      title: "Advanced Analytics",
      description: "Real-time market analysis with cutting-edge trading algorithms"
    },
    {
      icon: <FiShield className="w-8 h-8 text-green-400" />,
      title: "Secure Trading",
      description: "Bank-level security with multi-layer encryption protection"
    },
    {
      icon: <FiClock className="w-8 h-8 text-purple-400" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your trading needs"
    },
    {
      icon: <FiGlobe className="w-8 h-8 text-blue-400" />,
      title: "Global Markets",
      description: "Access to worldwide forex markets with competitive spreads"
    }
  ];

  const stats = [
    { number: "500K+", label: "Active Traders" },
    { number: "$2.5B", label: "Trading Volume" },
    { number: "150+", label: "Currency Pairs" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <BackgroundSlider images={images} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center text-white p-4 animate-text-focus-in max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Welcome to m4capital
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md text-gray-200 max-w-2xl mx-auto leading-relaxed">
            The future of Forex trading is here. Experience dynamic, fast, and user-centric trading with institutional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AnimatedButton href="/signup" text="Start Trading Now" />
            <AnimatedButton href="/login" text="Login" variant="secondary" />
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose m4capital?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of forex trading with our advanced platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Trade with Confidence
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                m4capital provides institutional-grade trading infrastructure with retail accessibility. 
                Our platform combines advanced technology with user-friendly design to deliver an 
                exceptional trading experience.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Whether you're a beginner or an experienced trader, our tools and analytics help you 
                make informed decisions in the dynamic forex market.
              </p>
              <AnimatedButton href="/signup" text="Get Started Today" />
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">0.1s</div>
                    <div className="text-sm text-gray-300">Execution Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                    <div className="text-sm text-gray-300">Market Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">0.01</div>
                    <div className="text-sm text-gray-300">Min Lot Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">1:500</div>
                    <div className="text-sm text-gray-300">Max Leverage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust m4capital for their forex trading needs. 
            Start your journey today with our user-friendly platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton href="/signup" text="Create Account" />
            <AnimatedButton href="/contact" text="Contact Sales" variant="secondary" />
          </div>
        </div>
      </section>
    </div>
  );
}