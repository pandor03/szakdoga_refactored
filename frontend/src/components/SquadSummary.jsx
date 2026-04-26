export default function SquadSummary({ squadScreen }) {
  return (
    <div className="card squad-summary-card">
      <h2>Csapat összegzés</h2>

      <p>Keret méret: {squadScreen.squad?.squadSize}</p>
      <p>Kezdők: {squadScreen.squad?.starterCount}</p>
      <p>Pad: {squadScreen.squad?.benchCount}</p>
      <p>Tartalék: {squadScreen.squad?.reserveCount}</p>
      <p>Átlag életkor: {squadScreen.squad?.averageAge}</p>
      <p>Átlag overall: {squadScreen.squad?.averageOverall}</p>
      <p>Piaci érték: {squadScreen.squad?.totalMarketValue}</p>
    </div>
  );
}