import Hero from "../components/synex/Hero";
import LandingSections from "../components/synex/LandingSections";

export default function Index() {
  return (
    <main>
      <h1 className="sr-only">Synex — A New Standard in Wealth Management</h1>
      <Hero />
      <LandingSections />
    </main>
  );
}
