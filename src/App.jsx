import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, SkipForward, CheckCircle2, Lightbulb, List } from "lucide-react";

// Helper to remove vowels from a phrase
function removeVowels(phrase) {
  return phrase.replace(/[aeiou]/gi, '');
}

// Randomly split a string into chunks with a max of 3 letters.
// We'll also sometimes split earlier than 3 letters, to keep it sporadic.
function randomSplitOnce(str) {
  if (!str) return '';

  let segments = [];
  let group = '';

  for (let i = 0; i < str.length; i++) {
    group += str[i];

    // If we've reached 3 letters, forcibly split
    if (group.length === 3) {
      segments.push(group);
      group = '';
    } else {
      // Otherwise, a small chance to split earlier
      // Only if we're not at the last character
      if (i < str.length - 1 && Math.random() < 0.2) {
        segments.push(group);
        group = '';
      }
    }
  }
  // Push remainder
  if (group) {
    segments.push(group);
  }

  return segments.join(' ');
}

// Categories object
const EXAMPLE_PUZZLES = {
  "Jane Austen Novels": [
    "SENSE AND SENSIBILITY",
    "PRIDE AND PREJUDICE",
    "MANSFIELD PARK",
    "EMMA",
    "NORTHANGER ABBEY",
    "PERSUASION",
    "SANDITON",
    "LADY SUSAN",
    "THE WATSONS"
  ],
  "National Crime Agency": [
    "CHILD EXPLOITATION ONLINE PROTECTION",
    "NATIONAL CYBER CRIME UNIT",
    "MODERN SLAVERY AND HUMAN TRAFFICKING",
    "ORGANISED IMMIGRATION CRIME",
    "NATIONAL ASSESSMENT CENTRE",
    "NATIONAL DATA EXPLOITATION CAPABILITY",
    "SERIOUS CRIME ANALYSIS SECTION",
    "UK INTERNATIONAL CRIME BUREAU",
    "UK LIAISON BUREAU",
    "UK PROTECTED PERSONS SERVICE",
    "THREAT MANAGEMENT TEAM"
  ],
  "South London Superstars & Their Borough of Birth": [
    "DAVID BOWIE AND LAMBETH",
    "HERBERT GEORGE WELLS AND BROMLEY",
    "GARY OLDMAN AND LEWISHAM",
    "DOMINIC COOPER AND GREENWICH",
    "DERREN BROWN AND CROYDON",
    "TIM VINE AND SUTTON",
    "QUENTIN BLAKE AND BEXLEY"
  ],
  "Book Club Books": [
    "THE THREE BODY PROBLEM",
    "TRANSLATION STATE",
    "BIRNAM WOOD",
    "THE THIRD POLICEMAN",
    "I WHO HAVE NEVER KNOWN MEN"
  ],
  "Brands and their slogans": [
    "NIKE JUST DO IT",
    "APPLE THINK DIFFERENT",
    "KENTUCKY FRIED CHICKEN FINGER LICKIN GOOD",
    "MCDONALDS I'M LOVIN IT"
  ],
  "Famous characters and their creators": [
    "SPIDERMAN AND STAN LEE",
    "HARRY POTTER AND JK ROWLING",
    "ARTHUR DENT AND DOUGLAS ADAMS",
    "ELIZABETH BENNET AND JANE AUSTEN",
    "EDWARD CULLEN AND STEPHENIE MEYER"
  ],
  "Vine (RIP)": [
    "OH MY GOD HE ON XGAMES MODE",
    "STOP I COULD HAVE DROPPED MY CROISSANT",
    "LOOK AT ALL THOSE CHICKENS",
    "DO IT FOR THE VINE",
    "HURRICANE KATRINA MORE LIKE HURRICANE TORTILLA"
  ]
};

// Replacing Card, CardContent, Button, and Input with simpler components
const Card = ({ children }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: 'white' }}>
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div style={{ padding: '8px' }}>{children}</div>
);

const Button = ({ children, ...props }) => (
  <button
    style={{
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      margin: '4px'
    }}
    {...props}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    style={{
      padding: '8px',
      fontSize: '16px',
      width: '100%',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '8px'
    }}
    {...props}
  />
);

export default function MissingVowelsQuiz() {
  const [page, setPage] = useState("welcome");
  const [subject, setSubject] = useState("");

  const [puzzles, setPuzzles] = useState([]);
  const [displayPuzzles, setDisplayPuzzles] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const [history, setHistory] = useState([]); // track results in local storage

  // On mount, clear the existing leaderboard
  useEffect(() => {
    localStorage.removeItem("missingVowelsHistory");
    setHistory([]);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("missingVowelsHistory", JSON.stringify(history));
  }, [history]);

  // Called when user selects a subject
  const handleStartGame = () => {
    let chosenSubject = subject.trim();
    // If user hasn't selected a known subject, default to the first listed
    if (!chosenSubject || !EXAMPLE_PUZZLES[chosenSubject]) {
      chosenSubject = Object.keys(EXAMPLE_PUZZLES)[0];
    }

    const chosenPuzzles = EXAMPLE_PUZZLES[chosenSubject];

    // For each puzzle, remove vowels and then apply random splitting
    const generatedDisplay = chosenPuzzles.map((p) => {
      const noVowels = removeVowels(p);
      return randomSplitOnce(noVowels);
    });

    setSubject(chosenSubject);
    setPuzzles(chosenPuzzles);
    setDisplayPuzzles(generatedDisplay);

    setPage("game");
    setCurrentIndex(0);
    setUserInput("");
    setScore(0);
    setStartTime(Date.now());
    setEndTime(0);
  };

  const handleLeaderboard = () => {
    setPage("leaderboard");
  };

  // Move to next puzzle without updating score
  const handleSkip = () => {
    if (currentIndex < puzzles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
    } else {
      // finish
      setEndTime(Date.now());
      setPage("results");
      const timeTaken = (Date.now() - startTime) / 1000;
      setHistory([
        ...history,
        {
          subject,
          date: new Date().toLocaleString(),
          score: score,
          timeTaken,
        },
      ]);
    }
  };

  // Check answer
  useEffect(() => {
    if (!puzzles.length) return;
    const currentAnswer = puzzles[currentIndex];
    // Check if user input matches ignoring spaces and case
    const normalizedInput = userInput.replace(/\s+/g, '').toLowerCase();
    const normalizedAnswer = currentAnswer.replace(/\s+/g, '').toLowerCase();

    if (normalizedInput && normalizedInput === normalizedAnswer) {
      // correct!
      setScore((prev) => prev + 1);
      setUserInput("");
      if (currentIndex < puzzles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // finish!
        setEndTime(Date.now());
        setPage("results");
        const timeTaken = (Date.now() - startTime) / 1000;
        setHistory([
          ...history,
          {
            subject,
            date: new Date().toLocaleString(),
            score: score + 1,
            timeTaken,
          },
        ]);
      }
    }
  }, [userInput]);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Home button
  const handleHome = () => {
    setPage("welcome");
  };

  // Render logic
  if (page === "welcome") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 items-center">
                <Lightbulb className="text-blue-500 w-8 h-8" />
                <h1 className="text-2xl font-bold mb-2">Missing Vowels Quiz</h1>
                <p className="text-gray-600 mb-4 text-center">
                  Welcome! Pick a category below.
                </p>
                <select
                  style={{ padding: '8px', borderRadius: '4px', width: '100%', fontSize: '16px' }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">--Pick a category--</option>
                  {Object.keys(EXAMPLE_PUZZLES).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
                <Button onClick={handleStartGame}>
                  Start
                </Button>
                <Button onClick={handleLeaderboard} style={{ backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' }}>
                  <List className="mr-2 w-4 h-4" /> Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  } else if (page === "leaderboard") {
    // Show the user's history
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 relative">
        <button
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleHome}
        >
          <Home />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 text-center">Leaderboard / History</h2>
              {history.length === 0 ? (
                <p className="text-center text-gray-600">No records yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Score</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Time (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px' }}>{item.date}</td>
                        <td style={{ padding: '8px' }}>{item.subject}</td>
                        <td style={{ padding: '8px' }}>{item.score}</td>
                        <td style={{ padding: '8px' }}>{item.timeTaken.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  } else if (page === "game") {
    const puzzleDisplay = displayPuzzles[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 relative">
        {/* Home Button */}
        <button
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleHome}
        >
          <Home />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 text-center">{subject}</h2>
              <div className="text-center text-6xl font-bold mb-6">
                {puzzleDisplay}
              </div>
              <div className="flex flex-col items-center gap-4">
                <Input
                  placeholder="Type your guess..."
                  value={userInput}
                  onChange={handleUserInput}
                />
                <p className="text-gray-500">Round {currentIndex + 1} of {puzzles.length}</p>
                <Button onClick={handleSkip} style={{ backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' }}>
                  <SkipForward className="mr-2 w-4 h-4" /> Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  } else if (page === "results") {
    const timeTaken = (endTime - startTime) / 1000;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 relative">
        {/* Home Button */}
        <button
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={handleHome}
        >
          <Home />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 items-center text-center">
                <CheckCircle2 className="text-green-500 w-8 h-8" />
                <h2 className="text-xl font-semibold">Results</h2>
                <p className="text-gray-700">Subject: {subject}</p>
                <p className="text-gray-700">Score: {score}</p>
                <p className="text-gray-700">Time Taken: {timeTaken.toFixed(2)}s</p>
                <Button onClick={() => setPage("welcome")}>Play Again</Button>
                <Button onClick={() => setPage("leaderboard")} style={{ backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' }}>                  <List className="mr-2 w-4 h-4" /> Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  } else {
    return null;
  }
}
