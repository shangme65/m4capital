import BackgroundSlider from "@/components/client/BackgroundSlider";
import AnimatedButton from "@/components/client/AnimatedButton";

export default function Home() {
  const images = ["/background-1.jpg", "/background-2.jpg", "/background-3.jpg"];

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundSlider images={images} />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 text-center text-white p-4 animate-text-focus-in">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to m4capital
        </h1>
        <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
          The future of Forex trading is here. Dynamic, fast, and user-centric.
        </p>
        <div className="space-x-4">
          <AnimatedButton href="/login" text="Get Started" />
          <AnimatedButton href="/dashboard" text="Dashboard" variant="secondary" />
        </div>
      </div>
    </div>
  );
}