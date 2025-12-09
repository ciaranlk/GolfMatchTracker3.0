
import React, { useState, useEffect } from 'react';
import './index.css';

const initialCourseData = [
  { hole: 1, par: 4, si: 13 },
  { hole: 2, par: 3, si: 17 },
  { hole: 3, par: 4, si: 3 },
  { hole: 4, par: 5, si: 7 },
  { hole: 5, par: 4, si: 11 },
  { hole: 6, par: 4, si: 1 },
  { hole: 7, par: 3, si: 15 },
  { hole: 8, par: 5, si: 9 },
  { hole: 9, par: 4, si: 5 },
  { hole: 10, par: 4, si: 14 },
  { hole: 11, par: 4, si: 10 },
  { hole: 12, par: 3, si: 18 },
  { hole: 13, par: 4, si: 6 },
  { hole: 14, par: 4, si: 12 },
  { hole: 15, par: 5, si: 8 },
  { hole: 16, par: 3, si: 16 },
  { hole: 17, par: 5, si: 2 },
  { hole: 18, par: 4, si: 4 },
];

export default function App() {
  const [playerRed, setPlayerRed] = useState('Team Red');
  const [playerBlue, setPlayerBlue] = useState('Team Blue');
  const [hcpRed, setHcpRed] = useState(12);
  const [hcpBlue, setHcpBlue] = useState(10);
  const [scores, setScores] = useState(initialCourseData.map(() => ({ red: '', blue: '' })));
  const [matchStatus, setMatchStatus] = useState('All Square');

  const diff = Math.abs(hcpRed - hcpBlue);
  const redGivesShots = hcpRed > hcpBlue;
  const shotsGiven = initialCourseData
    .sort((a, b) => a.si - b.si)
    .slice(0, diff)
    .map(d => d.hole);

  const handleScoreChange = (i, team, value) => {
    const newScores = [...scores];
    newScores[i][team] = value;
    setScores(newScores);
  };

  const calculateResults = () => {
    let redUp = 0;
    let blueUp = 0;
    const results = [];

    for (let i = 0; i < scores.length; i++) {
      const red = parseInt(scores[i].red);
      const blue = parseInt(scores[i].blue);
      const giveShot = shotsGiven.includes(initialCourseData[i].hole);

      let r = red, b = blue;
      if (giveShot) {
        if (redGivesShots) {
          b -= 1;
        } else {
          r -= 1;
        }
      }

      if (!isNaN(r) && !isNaN(b)) {
        if (r < b) redUp++;
        else if (b < r) blueUp++;

        if (redUp > blueUp + (18 - i - 1)) {
          setMatchStatus(`${playerRed} wins ${redUp - blueUp}&${18 - i - (redUp - blueUp)}`);
          break;
        } else if (blueUp > redUp + (18 - i - 1)) {
          setMatchStatus(`${playerBlue} wins ${blueUp - redUp}&${18 - i - (blueUp - redUp)}`);
          break;
        } else if (i === 17) {
          if (redUp > blueUp) setMatchStatus(`${playerRed} wins 1up`);
          else if (blueUp > redUp) setMatchStatus(`${playerBlue} wins 1up`);
          else setMatchStatus('All Square');
        }
      }
    }
  };

  useEffect(() => {
    calculateResults();
  }, [scores, hcpRed, hcpBlue]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Golf Matchplay Tracker</h1>
      <h4>Balmore GC – Gents White</h4>

      <div style={{ marginBottom: '1rem' }}>
        <label>🔴 Team Red: <input value={playerRed} onChange={e => setPlayerRed(e.target.value)} /></label>
        <label style={{ marginLeft: '10px' }}>HCP Index: <input type="number" value={hcpRed} onChange={e => setHcpRed(+e.target.value)} /></label>
        <br />
        <label>🔵 Team Blue: <input value={playerBlue} onChange={e => setPlayerBlue(e.target.value)} /></label>
        <label style={{ marginLeft: '10px' }}>HCP Index: <input type="number" value={hcpBlue} onChange={e => setHcpBlue(+e.target.value)} /></label>
      </div>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Hole</th><th>Par</th><th>SI</th>
            <th style={{ color: 'red' }}>{playerRed}</th>
            <th style={{ color: 'blue' }}>{playerBlue}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {initialCourseData.map((h, i) => {
            const red = parseInt(scores[i].red);
            const blue = parseInt(scores[i].blue);
            const giveShot = shotsGiven.includes(h.hole);
            let r = red, b = blue;
            if (giveShot) {
              if (redGivesShots) b -= 1;
              else r -= 1;
            }

            let result = '';
            if (!isNaN(r) && !isNaN(b)) {
              if (r < b) result = playerRed;
              else if (b < r) result = playerBlue;
              else result = 'Half';
            }

            return (
              <tr key={h.hole}>
                <td>{h.hole}</td>
                <td>{h.par}</td>
                <td>{h.si}</td>
                <td>
                  <input value={scores[i].red} onChange={e => handleScoreChange(i, 'red', e.target.value)} style={{ width: '40px' }} />
                  {redGivesShots === false && giveShot ? <span style={{ color: 'red' }}> (-1)</span> : ''}
                </td>
                <td>
                  <input value={scores[i].blue} onChange={e => handleScoreChange(i, 'blue', e.target.value)} style={{ width: '40px' }} />
                  {redGivesShots === true && giveShot ? <span style={{ color: 'blue' }}> (-1)</span> : ''}
                </td>
                <td>{result}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>🏁 Match Status: {matchStatus}</p>
    </div>
  );
}
