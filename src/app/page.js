import Hero from "./components/Hero";
import CarrierIntegrationHero from "./components/CarrierIntegrationHero";
import PrimeFreight from "./components/PrimeFreight";
import NewComp from "./components/newcomp";
import Records from "./components/Records";
import ReliableShipping from "./components/ReliableShipping";

export default function Home() {
  return (
    <>
      <Hero />
      <CarrierIntegrationHero />
      <PrimeFreight />
      <ReliableShipping />
      <NewComp />
      <Records />
      {/* Removed the older duplicate stats section (ShippingStats) because 'OUR RECORDS' now contains the authoritative stats. */}

    </>
  );
}
