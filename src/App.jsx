// PATCHED VERSION WITH:
// - Name editing per game
// - Reset scores per game
// - Export all games as JSON (can be converted to CSV externally)

import React, { useState, useEffect } from 'react';
import './App.css';

function calculateCourseHandicap(index, slope, rating) {
  return Math.round(index * (slope / 113) + (rating - 72));
}

function App() {
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('games');
    return saved ? JSON.parse(saved) : Array(8).fill(null);
  });
  const [activeGameIndex, setActiveGameIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('games', JSON.stringify(games));
  }, [games]);

  const startGame = (index) => {
    const redIndex = +document.getElementById(`redIndex${index}`).value;
    const blueIndex = +document.getElementById(`blueIndex${index}`).value;
    const rating = +document.getElementById(`rating${index}`).value;
    const slope = +document.getElementById(`slope${index}`).value;
    const redName = document.getElementById(`redName${index}`).value || 'Red';
    const blueName = document.getElementById(`blueName${index}`).value || 'Blue';

    const chRed = calculateCourseHandicap(redIndex, slope, rating);
    const chBlue = calculateCourseHandicap(blueIndex, slope, rating);
    const shotsGiven = Math.abs(chRed - chBlue);
    const shotsTo = chRed > chBlue ? 'Blue' : 'Red';

    const newGame = {
      redName, blueName, redIndex, blueIndex, rating, slope,
      chRed, chBlue, shotsGiven, shotsTo,
      holes: Array.from({ length: 18 }, (_, i) => ({ hole: i + 1, par: 4, si: i + 1, red: 0, blue: 0 }))
    };

    const updatedGames = [...games];
    updatedGames[index] = newGame;
    setGames(updatedGames);
    setActiveGameIndex(index);
  };

  const updateHole = (index, team, delta) => {
    const updated = [...games];
    updated[activeGameIndex].holes[index][team] += delta;
    if (updated[activeGameIndex].holes[index][team] < 0) updated[activeGameIndex].holes[index][team] = 0;
    setGames(updated);
  };

  const calculateResult = (hole) => {
    const { red, blue, si } = hole;
    const game = games[activeGameIndex];
    const strokeHoles = Array.from({ length: game.shotsGiven }, (_, i) => i + 1);
    let redScore = red;
    let blueScore = blue;

    if (strokeHoles.includes(si)) {
      if (game.shotsTo === 'Red') redScore--;
      else blueScore--;
    }

    if (redScore < blueScore) return game.redName;
    if (blueScore < redScore) return game.blueName;
    return 'Half';
  };

  const computeMatchStatus = (game) => {
    let redUp = 0, blueUp = 0, holesPlayed = 0;

    for (let i = 0; i < game.holes.length; i++) {
      const hole = game.holes[i];
      if (hole.red === 0 && hole.blue === 0) break;
      const result = calculateResult(hole);
      if (result === game.redName) redUp++;
      else if (result === game.blueName) blueUp++;
      holesPlayed++;
    }

    const diff = redUp - blueUp;
    const holesLeft = 18 - holesPlayed;

    if (diff > holesLeft) return `${game.redName} ${diff}&${holesLeft}`;
    if (diff < -holesLeft) return `${game.blueName} ${-diff}&${holesLeft}`;
    if (diff > 0 && holesPlayed === 18) return `${game.redName} 1 Up`;
    if (diff < 0 && holesPlayed === 18) return `${game.blueName} 1 Up`;
    if (holesPlayed === 18) return 'All Square';

    return diff > 0 ? `${game.redName} ${diff} Up` : diff < 0 ? `${game.blueName} ${-diff} Up` : 'All Square';
  };

  const resetGame = (index) => {
    if (!games[index]) return;
    const clone = { ...games[index], holes: games[index].holes.map(h => ({ ...h, red: 0, blue: 0 })) };
    const updated = [...games];
    updated[index] = clone;
    setGames(updated);
  };

  const exportGames = () => {
    const dataStr = JSON.stringify(games, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'golf_games.json';
    a.click();
  };

  return (
    <div className="app-container">
      <h1>Golf Matchplay Tracker</h1>

      <div className="game-list">
        {games.map((game, i) => (
          <button key={i} onClick={() => setActiveGameIndex(i)}>
            {game ? `${game.redName} vs ${game.blueName} (${computeMatchStatus(game)})` : `Game ${i + 1}`}
          </button>
        ))}
        <button onClick={exportGames}>Export</button>
      </div>

      {games.map((_, i) => (
        <div key={i} className="game-setup">
          <span>Game {i + 1}:</span>
          <input id={`redName${i}`} placeholder="Red" defaultValue={games[i]?.redName || ''} />
          <input id={`blueName${i}`} placeholder="Blue" defaultValue={games[i]?.blueName || ''} />
          <input type="number" id={`redIndex${i}`} defaultValue={games[i]?.redIndex || 10} />
          <input type="number" id={`blueIndex${i}`} defaultValue={games[i]?.blueIndex || 8} />
          <input type="number" id={`rating${i}`} defaultValue={games[i]?.rating || 72} />
          <input type="number" id={`slope${i}`} defaultValue={games[i]?.slope || 113} />
          <button onClick={() => startGame(i)}>Start</button>
          <button onClick={() => resetGame(i)}>Reset</button>
        </div>
      ))}

      {games[activeGameIndex] && (
        <div>
          <h3>{games[activeGameIndex].redName} vs {games[activeGameIndex].blueName}</h3>
          <p>{games[activeGameIndex].redName} CH: {games[activeGameIndex].chRed}, {games[activeGameIndex].blueName} CH: {games[activeGameIndex].chBlue}</p>
          <table>
            <thead>
              <tr>
                <th>Hole</th><th>Par</th><th>SI</th>
                <th>{games[activeGameIndex].redName}</th>
                <th>{games[activeGameIndex].blueName}</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {games[activeGameIndex].holes.map((hole, i) => (
                <tr key={i}>
                  <td>{hole.hole}</td>
                  <td><input value={hole.par} onChange={e => {
                    const updated = [...games];
                    updated[activeGameIndex].holes[i].par = +e.target.value;
                    setGames(updated);
                  }} /></td>
                  <td><input value={hole.si} onChange={e => {
                    const updated = [...games];
                    updated[activeGameIndex].holes[i].si = +e.target.value;
                    setGames(updated);
                  }} /></td>
                  <td>
                    <button onClick={() => updateHole(i, 'red', -1)}>-</button>
                    {hole.red}
                    <button onClick={() => updateHole(i, 'red', 1)}>+</button>
                  </td>
                  <td>
                    <button onClick={() => updateHole(i, 'blue', -1)}>-</button>
                    {hole.blue}
                    <button onClick={() => updateHole(i, 'blue', 1)}>+</button>
                  </td>
                  <td>{calculateResult(hole)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
