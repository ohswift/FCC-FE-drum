import React, { ChangeEvent, CSSProperties, MouseEvent } from "react";

type LengthControlType = "Break" | "Session";

interface LengthControlProps {
  type: string;
  count: number;
  handleClick: (sign: string, value: number) => void;
}
class LengthControl extends React.Component<LengthControlProps> {
  constructor(props: LengthControlProps) {
    super(props);
    console.log(props);
  }

  handleIncresement = () => {
    const count = this.props.count;
    this.props.handleClick("+", count);
  };

  handleDecresement = () => {
    const count = this.props.count;
    this.props.handleClick("-", count);
  };

  render() {
    return (
      <div className="length-control">
        <div
          className="control-title"
          id={this.props.type.toLowerCase() + "-label"}
        >
          {this.props.type + " Length"}
        </div>
        <button onClick={this.handleDecresement}>
          <i
            className="fa fa-arrow-down"
            id={this.props.type.toLowerCase() + "-decrement"}
          ></i>
        </button>
        <span id={this.props.type.toLowerCase() + "-length"}>
          {this.props.count}
        </span>
        <button onClick={this.handleIncresement}>
          <i
            className="fa fa-arrow-up"
            id={this.props.type.toLowerCase() + "-increment"}
          ></i>
        </button>
      </div>
    );
  }
}

interface AppState {
  timerType: LengthControlType;
  timer: number;
  brkLength: number;
  seshLength: number;
  timerState: "running" | "paused";
  timerId: number;
  warnning: boolean;
}

function formatTime(time_left: number) {
  const min = Math.floor(time_left / 60);
  const sec = time_left % 60;
  return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
}

class App extends React.Component<{}, AppState> {
  audioBeep: HTMLAudioElement | null = null;
  constructor(props: {}) {
    super(props);

    this.state = {
      timerType: "Session",
      timer: 25 * 60,
      brkLength: 5,
      seshLength: 25,
      timerState: "paused",
      timerId: 0,
      warnning: false,
    };
  }

  handleReset = () => {
    this.setState({
      timerType: "Session",
      timer: 25 * 60,
      brkLength: 5,
      seshLength: 25,
      timerState: "paused",
      warnning: false,
    });
    this.audioBeep?.pause();
    this.audioBeep!.currentTime = 0;
    this.stopTimer();
  };

  handleSetBrkLength = (sign: string) => {
    this.lengthConfig("brkLength", sign, this.state.brkLength, "Session");
  };

  handleSetSeshLength = (sign: string) => {
    this.lengthConfig("seshLength", sign, this.state.seshLength, "Break");
  };

  handlePlayOrStop = () => {
    const timerState = this.state.timerState;
    this.setState({
      timerState: timerState === "running" ? "paused" : "running",
    });
    if (timerState === "paused") {
      this.beginTimer();
    } else {
      this.stopTimer();
    }
  };

  beginTimer() {
    const timerId = setInterval(() => {
      const { timer, timerState } = this.state;
      if (timer == 0) {
        this.stopTimer();
        this.switchTimer();
        return;
      }
      if (timerState === "paused") {
        return;
      }
      this.setState({
        timer: timer - 1,
        timerId: timerId,
      });
    }, 1000);
  }

  switchTimer() {
    this.audioBeep?.play();
    this.setState({
      warnning: true,
    });
    setTimeout(() => {
      this.audioBeep?.pause();
      const { timerType, brkLength, seshLength } = this.state;
      const newTimer =
        timerType === "Session" ? brkLength * 60 : seshLength * 60;
      this.setState({
        warnning: false,
        timerType: timerType === "Session" ? "Break" : "Session",
        timer: newTimer,
      });
      this.beginTimer();
    }, 5000);
  }

  stopTimer() {
    const timerId = this.state.timerId;
    clearInterval(timerId);
  }

  lengthConfig(
    stateToChange: string,
    sign: string,
    currentLength: number,
    timerType: string
  ) {
    console.log(arguments);
    console.log(this.state);
    if (this.state.timerState === "running") {
      return;
    }
    console.log(arguments);
    if (this.state.timerType === timerType) {
      if (sign === "-" && currentLength !== 1) {
        this.setState({ [stateToChange]: currentLength - 1 } as unknown as Pick<
          AppState,
          keyof AppState
        >);
        console.log("---");
      } else if (sign === "+" && currentLength !== 60) {
        this.setState({ [stateToChange]: currentLength + 1 } as unknown as Pick<
          AppState,
          keyof AppState
        >);
        console.log("+++");
      }
    } else if (sign === "-" && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60,
      } as unknown as Pick<AppState, keyof AppState>);
    } else if (sign === "+" && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60,
      } as unknown as Pick<AppState, keyof AppState>);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="main-title">25 + 5 Clock</div>
        <LengthControl
          type="Break"
          count={this.state.brkLength}
          handleClick={this.handleSetBrkLength}
        ></LengthControl>
        <LengthControl
          type="Session"
          count={this.state.seshLength}
          handleClick={this.handleSetSeshLength}
        ></LengthControl>
        <div
          className="timer-container"
          style={{
            backgroundColor: this.state.warnning ? "red" : "transparent",
          }}
        >
          <div className="timer-title" id="timer-label">
            {this.state.warnning ? "warnning" : this.state.timerType}
          </div>
          <div className="countdown" id="time-left">
            {formatTime(this.state.timer)}
          </div>
        </div>
        <div className="play-control">
          <button id="start_stop" onClick={this.handlePlayOrStop}>
            <i
              className={
                this.state.timerState === "running"
                  ? "fas fa-pause"
                  : "fa fa-play"
              }
            ></i>
          </button>
          <button id="reset" onClick={this.handleReset}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
        <audio
          id="beep"
          preload="auto"
          ref={(audio) => {
            this.audioBeep = audio;
          }}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />
      </div>
    );
  }
}

export default App;
