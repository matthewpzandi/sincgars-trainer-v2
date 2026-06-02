import React, { useMemo, useRef, useState } from "react";

const FCTN_ORDER = ["OFF", "Z", "REM", "RXMT", "SQ OFF", "SQ ON", "LD", "TST", "STBY"];
const RF_ORDER = ["LO", "M", "HI", "PA"];
const MODE_ORDER = ["---", "FH", "SC"];
const CMSC_ORDER = ["---", "CT", "PT"];
const CHAN_ORDER = ["---", "MAN", "1", "2", "3", "4", "5", "6", "CUE"];

const KEYS = [
  { label: "CMSC", digit: "1" },
  { label: "RCU", digit: "2" },
  { label: "SYNC", digit: "3" },
  { label: "FREQ", digit: "" },
  { label: "DATA", digit: "4" },
  { label: "GPS", digit: "5" },
  { label: "SA", digit: "6" },
  { label: "ERF\nOFST", digit: "" },
  { label: "CHG", digit: "7" },
  { label: "CID", digit: "8" },
  { label: "LOUT", digit: "9" },
  { label: "TIME", digit: "" },
  { label: "MENU\nCLR", digit: "" },
  { label: "LOAD", digit: "0" },
  { label: "STO", digit: "" },
  { label: "BATT\nCALL", digit: "" },
];

function nextValue(list, current) {
  const index = Math.max(0, list.indexOf(current));
  return list[(index + 1) % list.length];
}

function PartButton({ type, selected, installed, hidden, onClick }) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={installed}
      className={`partButton ${selected ? "selected" : ""} ${installed ? "installed" : ""}`}
    >
      {type === "battery" && <div className="miniBattery" />}
      {type === "door" && <div className="miniDoor">▣</div>}
      {type === "antenna" && <div className="miniAntenna" />}
      {type === "handset" && <div className="miniHandset" />}
      <strong>
        {type === "battery" && "BA-5590 Battery"}
        {type === "door" && "Battery Door"}
        {type === "antenna" && "Antenna"}
        {type === "handset" && "Handset"}
      </strong>
      <span>{installed ? "Installed" : selected ? "Tap matching spot" : "Tap to select"}</span>
    </button>
  );
}

function CoaxConnector() {
  return (
    <div className="coaxConnector">
      <div className="coaxCenter" />
    </div>
  );
}

function BluePort() {
  return (
    <div className="portOuter">
      <div className="portBlue">
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index} className="portPin" />
        ))}
      </div>
    </div>
  );
}

function FunctionKnob({ value, onRotate }) {
  const points = {
    RXMT: [22, 30],
    REM: [82, 30],
    Z: [148, 22],
    OFF: [160, 58],
    "SQ OFF": [50, 92],
    "SQ ON": [52, 142],
    LD: [84, 204],
    TST: [140, 204],
    STBY: [206, 188],
  };

  const [tx, ty] = points[value] || points.OFF;
  const angle = (Math.atan2(ty - 150, tx - 148) * 180) / Math.PI;

  return (
    <div className="functionArea">
      <span className={`knobLabel rxmt ${value === "RXMT" ? "active" : ""}`}>RXMT</span>
      <span className={`knobLabel rem ${value === "REM" ? "active" : ""}`}>REM</span>
      <span className={`knobLabel z boxed ${value === "Z" ? "active" : ""}`}>Z</span>
      <span className={`knobLabel offBox boxed ${value === "OFF" ? "active" : ""}`}>OFF</span>
      <span className={`knobLabel sqOff ${value === "SQ OFF" ? "active" : ""}`}>OFF</span>
      <span className="knobLabel sq">SQ</span>
      <span className={`knobLabel sqOn ${value === "SQ ON" ? "active" : ""}`}>ON</span>
      <span className={`knobLabel ld ${value === "LD" ? "active" : ""}`}>LD</span>
      <span className={`knobLabel tst ${value === "TST" ? "active" : ""}`}>TST</span>
      <span className={`knobLabel stby boxed ${value === "STBY" ? "active" : ""}`}>STBY</span>
      <span className="knobLabel fctn">FCTN</span>
      <button className="knob" type="button" onClick={onRotate} aria-label="Rotate FCTN knob">
        <span className="knobPointer" style={{ transform: `rotate(${angle}deg)` }} />
      </button>
    </div>
  );
}

function RearView({ selectedPart, batteryInstalled, doorClosed, onSpot, onTurnFront }) {
  return (
    <div className="rearRadio">
      <div className="rearBody" />
      <div className="rearPlate" />
      <div className="viewLabel">REAR VIEW</div>

      <button
        type="button"
        className={`batterySlot ${(selectedPart === "battery" || selectedPart === "door") && !doorClosed ? "target" : ""}`}
        onClick={() => onSpot(batteryInstalled ? "door" : "battery")}
      >
        {batteryInstalled ? (
          <div className="batteryPack">
            <div className="batteryCap" />
            <div className="batteryTag">BA-5590</div>
            <div className="batteryText">INSERTED</div>
          </div>
        ) : (
          <div className="emptySlot">DROP BA-5590<br />BATTERY HERE</div>
        )}
      </button>

      {doorClosed && (
        <div className="closedDoor">
          DOOR LOCKED
          <span className="doorLatch" />
        </div>
      )}

      {batteryInstalled && !doorClosed && (
        <div className="rearStatus">✓ BATTERY INSERTED — CLOSE THE DOOR</div>
      )}

      {doorClosed && (
        <>
          <div className="rearStatus">✓ BATTERY DOOR CLOSED / LOCKED</div>
          <button type="button" className="continueButton" onClick={onTurnFront}>TURN RADIO OVER →</button>
        </>
      )}
    </div>
  );
}

function FrontView({
  selectedPart,
  antennaInstalled,
  handsetPort,
  lcd,
  fctn,
  onSpot,
  onRotateKnob,
  onKey,
}) {
  return (
    <div className="frontRadio">
      <div className="leftBay" />
      <div className="centerBay" />
      <div className="rightBay" />

      <button
        type="button"
        className={`antennaSpot ${selectedPart === "antenna" && !antennaInstalled ? "target" : ""}`}
        onClick={() => onSpot("antenna")}
      >
        {antennaInstalled && <span className="antennaWhip" />}
        <CoaxConnector />
        <span className="smallFaceLabel">ANT</span>
      </button>

      <FunctionKnob value={fctn} onRotate={onRotateKnob} />

      <div className="lcdLabels">
        <span>PWR</span><span>MODE</span><span>CHAN</span><span>CMSC</span>
      </div>
      <div className="lcdWindow">
        <div className="lcdTop"><span>{lcd.pwr}</span><span>{lcd.mode}</span><span>{lcd.chan}</span><span>{lcd.cmsc}</span></div>
        <div className="lcdBottom">{lcd.lower}</div>
      </div>

      <div className="keypad">
        {KEYS.map((key) => (
          <button key={key.label} type="button" className="radioKey" onClick={() => onKey(key.label, key.digit)}>
            <span>{key.label}</span>
            {key.digit && <b>{key.digit}</b>}
          </button>
        ))}
      </div>
      <div className="rxmtLabel">RXMT</div>

      <button
        type="button"
        className={`portSpot fill ${selectedPart === "handset" ? "target" : ""}`}
        onClick={() => onSpot("fill")}
      >
        <BluePort />
        <span>AUD/<br />FILL</span>
      </button>

      <button
        type="button"
        className={`portSpot data ${selectedPart === "handset" ? "target" : ""}`}
        onClick={() => onSpot("data")}
      >
        <BluePort />
        <span>AUD/<br />DATA</span>
      </button>

      {handsetPort && (
        <div className={`handsetCable ${handsetPort}`}>
          <svg viewBox="0 0 265 165" aria-hidden="true">
            <path
              d={handsetPort === "fill"
                ? "M0 8 C48 10,70 36,98 68 S178 82,218 106"
                : "M0 8 C48 16,76 28,106 42 S178 70,218 106"}
              fill="none"
              stroke="#050505"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
          <div className="handsetBody" />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const successPlayedRef = useRef(false);

  const [scene, setScene] = useState("rear");
  const [selectedPart, setSelectedPart] = useState(null);
  const [batteryInstalled, setBatteryInstalled] = useState(false);
  const [doorClosed, setDoorClosed] = useState(false);
  const [antennaInstalled, setAntennaInstalled] = useState(false);
  const [handsetPort, setHandsetPort] = useState(null);

  const [fctn, setFctn] = useState("OFF");
  const [rf, setRf] = useState("LO");
  const [mode, setMode] = useState("---");
  const [cmsc, setCmsc] = useState("---");
  const [chan, setChan] = useState("---");
  const [freqs, setFreqs] = useState({ "2": "00000" });
  const [screen, setScreen] = useState("HOME");
  const [entry, setEntry] = useState("");
  const [busy, setBusy] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [message, setMessage] = useState("Rear view: select the BA-5590 Battery, then tap the rear battery bay.");

  const assembled = batteryInstalled && doorClosed && antennaInstalled && handsetPort === "fill";
  const powered = batteryInstalled && doorClosed && fctn !== "OFF";
  const currentFreq = freqs[chan] || "00000";

  const missionComplete = assembled &&
    fctn === "SQ ON" &&
    rf === "LO" &&
    mode === "SC" &&
    cmsc === "PT" &&
    chan === "2" &&
    freqs["2"] === "41300";

  function audioContext() {
    if (!audioOn) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioRef.current) audioRef.current = new Ctx();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }

  function tone(freq = 900, duration = 45, volume = 0.02, type = "sine") {
    const ctx = audioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration / 1000 + 0.02);
  }

  function click() { tone(1000, 18, 0.012); }
  function reject() { tone(210, 100, 0.02, "triangle"); }
  function confirm() { tone(780, 80, 0.018); }
  function readyBeep() { tone(950, 70, 0.018); setTimeout(() => tone(1150, 65, 0.016), 85); }

  function setInstruction(text) {
    setMessage(text);
    setHintVisible(false);
  }

  function changeScene(nextScene) {
    click();
    if (nextScene === "front" && !(batteryInstalled && doorClosed)) {
      setMessage("Install the battery and close the battery door before turning the radio over.");
      reject();
      return;
    }
    if (nextScene === "setup" && !assembled) {
      setMessage("Attach the antenna and connect the handset to AUD/FILL before setup.");
      reject();
      return;
    }
    setScene(nextScene);
    if (nextScene === "rear") setInstruction("Rear view: install the battery and close the door.");
    if (nextScene === "front") setInstruction("Front view: install the antenna and connect the handset to AUD/FILL.");
    if (nextScene === "setup") setInstruction("Setup: set FCTN to LD, then configure LO / SC / PT / CH 2 / 41300.");
  }

  function selectPart(part) {
    click();
    setSelectedPart(part);
    if (part === "battery") setInstruction("Battery selected. Tap the rear battery bay.");
    if (part === "door") setInstruction("Battery door selected. Tap the rear battery bay to close and lock it.");
    if (part === "antenna") setInstruction("Antenna selected. Tap the ANT connector.");
    if (part === "handset") setInstruction("Handset selected. Tap AUD/FILL or AUD/DATA. Mission success requires AUD/FILL.");
  }

  function assemblySpot(spot) {
    click();
    if (!selectedPart) {
      setMessage("Select the correct part first.");
      return;
    }

    if (spot === "battery" && selectedPart === "battery") {
      setBatteryInstalled(true);
      setSelectedPart(null);
      setInstruction("Battery inserted. Now select Battery Door and close it.");
      confirm();
      return;
    }

    if (spot === "door" && selectedPart === "door" && batteryInstalled) {
      setDoorClosed(true);
      setSelectedPart(null);
      setInstruction("Battery door closed and locked. Turn the radio over.");
      confirm();
      return;
    }

    if (spot === "antenna" && selectedPart === "antenna") {
      setAntennaInstalled(true);
      setSelectedPart(null);
      setInstruction("Antenna attached. Connect the handset to AUD/FILL.");
      confirm();
      return;
    }

    if ((spot === "fill" || spot === "data") && selectedPart === "handset") {
      setHandsetPort(spot);
      setSelectedPart(null);
      if (spot === "fill") {
        setInstruction("Handset connected to AUD/FILL. Correct for this mission.");
        confirm();
      } else {
        setMessage("Handset connected to AUD/DATA. It fits, but mission success requires AUD/FILL.");
        reject();
      }
      return;
    }

    setMessage("Wrong spot. That part does not connect there.");
    reject();
  }

  function rotateFctn() {
    click();
    if (!batteryInstalled) {
      setMessage("No battery installed. Radio cannot power on.");
      reject();
      return;
    }
    if (!doorClosed) {
      setMessage("Battery door is open. Close and lock it first.");
      reject();
      return;
    }

    const next = FCTN_ORDER[(FCTN_ORDER.indexOf(fctn) + 1) % FCTN_ORDER.length];
    setFctn(next);
    setScreen("HOME");
    setEntry("");

    if (next === "OFF") {
      setBusy(false);
      setInstruction("RT off.");
      return;
    }

    if (!assembled) {
      setMessage("Antenna and handset on AUD/FILL are required before operation.");
      reject();
      return;
    }

    if (next === "LD") {
      setBusy(true);
      setMessage("FCTN set to LD. WAIT displayed for 3 seconds.");
      setTimeout(() => {
        setBusy(false);
        readyBeep();
        setMessage("Load mode ready. MENU/CLR cycles fields. CHG changes the field.");
      }, 3000);
      return;
    }

    setInstruction(`FCTN set to ${next}.`);
  }

  function pressKey(label, digit) {
    click();

    if (!assembled) {
      setMessage("Complete battery door, antenna, and AUD/FILL handset connection before operating.");
      reject();
      return;
    }
    if (!powered) {
      setMessage("Radio is off. Rotate FCTN out of OFF.");
      return;
    }
    if (busy) {
      setMessage("WAIT is active.");
      return;
    }

    if (screen === "FREQ_ENTRY" && digit) {
      setEntry((prev) => (prev + digit).slice(0, 5));
      setMessage("Enter 5 frequency digits, then press STO.");
      return;
    }

    if (label === "MENU\nCLR") {
      if (screen === "FREQ_VIEW") {
        setScreen("FREQ_ENTRY");
        setEntry("");
        setMessage("Frequency cleared. Enter 41300.");
        return;
      }
      if (screen === "FREQ_ENTRY") {
        setEntry((prev) => prev.slice(0, -1));
        setMessage("CLR deleted the last digit.");
        return;
      }
      const order = ["VOL", "CHAN", "RF", "MODE", "COMSEC", "HOME"];
      const current = order.indexOf(screen);
      setScreen(order[(current + 1 + order.length) % order.length] || "VOL");
      setMessage("MENU cycles setup fields. Use CHG to change the displayed field.");
      return;
    }

    if (label === "CHG") {
      if (screen === "CHAN") {
        setChan((prev) => nextValue(CHAN_ORDER, prev));
        setMessage("Channel changed.");
      } else if (screen === "RF") {
        setRf((prev) => nextValue(RF_ORDER, prev));
        setMessage("Power changed. Mission requires LO.");
      } else if (screen === "MODE") {
        setMode((prev) => nextValue(MODE_ORDER, prev));
        setMessage("Mode changed. Mission requires SC.");
      } else if (screen === "COMSEC") {
        setCmsc((prev) => nextValue(CMSC_ORDER, prev));
        setMessage("COMSEC changed. Mission requires PT.");
      } else if (screen === "VOL") {
        setMessage("Volume changed.");
      } else {
        setMessage("Press MENU/CLR to a setup field first, then use CHG.");
      }
      return;
    }

    if (label === "FREQ") {
      if (fctn !== "LD") {
        setMessage("Set FCTN to LD before loading a frequency.");
        return;
      }
      if (mode !== "SC") {
        setMessage("Set MODE to SC first.");
        return;
      }
      if (cmsc !== "PT") {
        setMessage("Set COMSEC to PT first.");
        return;
      }
      if (chan === "---") {
        setMessage("Select Channel 2 first.");
        return;
      }
      setScreen("FREQ_VIEW");
      setMessage("FREQ selected. Press MENU/CLR to clear to dashes.");
      return;
    }

    if (label === "STO") {
      if (screen === "FREQ_ENTRY" && entry.length === 5) {
        setFreqs((prev) => ({ ...prev, [chan]: entry }));
        setScreen("HOME");
        setEntry("");
        tone(980, 70, 0.018);
        setMessage(`Stored frequency in CH ${chan}. Turn FCTN to SQ ON when ready.`);
      } else {
        setMessage("STO only works after a full 5-digit frequency entry.");
      }
      return;
    }

    if (label === "CMSC") {
      setScreen("COMSEC");
      setMessage("COMSEC selected. Use CHG until PT.");
      return;
    }

    if (label === "RCU") {
      setScreen("MODE");
      setMessage("MODE selected. Use CHG until SC.");
      return;
    }

    if (digit) {
      setMessage("Digit keys enter numbers only after FREQ and MENU/CLR.");
      return;
    }

    setMessage(`${label.replace("\n", " ")} is present for panel familiarity but is not modeled.`);
  }

  const lcd = useMemo(() => {
    if (!batteryInstalled || !powered) return { pwr: "", mode: "", chan: "", cmsc: "", lower: "" };
    if (busy) return { pwr: "WAIT", mode: "", chan: "", cmsc: "", lower: "WAIT" };
    if (screen === "CHAN") return { pwr: "", mode, chan, cmsc, lower: "CHANNEL" };
    if (screen === "RF") return { pwr: rf, mode, chan, cmsc, lower: "POWER" };
    if (screen === "MODE") return { pwr: rf, mode, chan, cmsc, lower: "MODE" };
    if (screen === "COMSEC") return { pwr: rf, mode, chan, cmsc, lower: "COMSEC" };
    if (screen === "FREQ_ENTRY") return { pwr: rf, mode, chan, cmsc, lower: entry.padEnd(5, "-") };
    if (screen === "FREQ_VIEW") return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
    return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
  }, [batteryInstalled, powered, busy, screen, mode, chan, cmsc, rf, entry, currentFreq]);

  if (missionComplete && !successPlayedRef.current) {
    successPlayedRef.current = true;
    setTimeout(() => confirm(), 0);
  }
  if (!missionComplete && successPlayedRef.current) successPlayedRef.current = false;

  const checklist = [
    ["Battery inserted", batteryInstalled],
    ["Battery door closed/locked", doorClosed],
    ["Radio turned to front", scene !== "rear"],
    ["Antenna installed", antennaInstalled],
    ["Handset connected to AUD/FILL", handsetPort === "fill"],
    ["LO power", rf === "LO"],
    ["SC mode", mode === "SC"],
    ["PT COMSEC", cmsc === "PT"],
    ["Channel 2", chan === "2"],
    ["Frequency 41300 stored in CH 2", freqs["2"] === "41300"],
    ["FCTN SQ ON", fctn === "SQ ON"],
  ];

  return (
    <div className="page">
      <header className="header">
        <div className="eyebrow">SINCGARS Integrated Trainer</div>
        <h1>Assembly + Single Channel Setup</h1>
        <p className="sub">Rear battery install → close and lock door → front connections → LO / SC / PT / CH 2 / 41300 / SQ ON.</p>
        <div className="tabs">
          <button type="button" className={`tab ${scene === "rear" ? "active" : ""}`} onClick={() => changeScene("rear")}>1 Rear</button>
          <button type="button" className={`tab ${scene === "front" ? "active" : ""}`} onClick={() => changeScene("front")}>2 Front</button>
          <button type="button" className={`tab ${scene === "setup" ? "active" : ""}`} onClick={() => changeScene("setup")}>3 Setup</button>
          <button type="button" className="tab" onClick={() => setAudioOn((prev) => !prev)}>{audioOn ? "Audio On" : "Audio Off"}</button>
        </div>
      </header>

      <main className="layout">
        <section className="radioShell">
          <div className="canvas">
            {scene === "rear" ? (
              <RearView
                selectedPart={selectedPart}
                batteryInstalled={batteryInstalled}
                doorClosed={doorClosed}
                onSpot={assemblySpot}
                onTurnFront={() => changeScene("front")}
              />
            ) : (
              <FrontView
                selectedPart={selectedPart}
                antennaInstalled={antennaInstalled}
                handsetPort={handsetPort}
                lcd={lcd}
                fctn={fctn}
                onSpot={assemblySpot}
                onRotateKnob={rotateFctn}
                onKey={pressKey}
              />
            )}
          </div>
        </section>

        <aside className="side">
          <section className="card">
            <h2>Parts Tray</h2>
            <p className="status">Tap a part, then tap the matching spot.</p>
            <div className="parts">
              <PartButton type="battery" selected={selectedPart === "battery"} installed={batteryInstalled} hidden={scene !== "rear" || batteryInstalled} onClick={() => selectPart("battery")} />
              <PartButton type="door" selected={selectedPart === "door"} installed={doorClosed} hidden={scene !== "rear" || !batteryInstalled || doorClosed} onClick={() => selectPart("door")} />
              <PartButton type="antenna" selected={selectedPart === "antenna"} installed={antennaInstalled} hidden={scene === "rear" || antennaInstalled} onClick={() => selectPart("antenna")} />
              <PartButton type="handset" selected={selectedPart === "handset"} installed={handsetPort === "fill"} hidden={scene === "rear" || handsetPort === "fill"} onClick={() => selectPart("handset")} />
            </div>
          </section>

          <section className="card">
            <div className="hintRow">
              <h2>Need help?</h2>
              <button type="button" className="hintBtn" onClick={() => setHintVisible((prev) => !prev)}>Hint</button>
            </div>
            <div className={`status ${hintVisible || missionComplete ? "" : "muted"}`} style={{ marginTop: 10 }}>
              {missionComplete ? <div className="success">SUCCESS</div> : hintVisible ? message : "Hint hidden."}
            </div>
          </section>

          <section className="card">
            <h2>Mission Criteria</h2>
            <p className="status">Handset can physically connect to either port, but mission success requires <b>AUD/FILL</b>. Then set LO / SC / PT / CH 2 / 41300 / SQ ON.</p>
            <ul className="checklist">
              {checklist.map(([text, done]) => (
                <li key={text}>{done ? "✅" : "⬜"} {text}</li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
