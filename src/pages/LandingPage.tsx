import Hero from "../components/landing/Hero";
import LandingSections from "../components/landing/LandingSections";

export default function LandingPage() {
  return (
    <main>
      <h1 className="sr-only">Synex — A New Standard in Online Trading</h1>
      <Hero />
      <LandingSections />
    </main>
  );
}
