/**
 * timeSystem.js
 * ------------------------------------------------------------------------
 * The single, universal simulation clock. Milestone 1 uses it to drive
 * planet positions; later milestones (spacecraft, asteroids, satellites)
 * will all read from this same clock rather than keeping separate timers,
 * per the project's system design.
 * ------------------------------------------------------------------------
 */

const SPEED_STEPS = [0.1, 0.5, 1, 5, 25, 100, 500, 2000]; // days-per-real-second multipliers... see note below
// NOTE: values represent "simulated days advanced per real second" at each step.

export class TimeSystem {
  constructor() {
    this.currentDate = new Date();
    this.epoch = new Date(this.currentDate.getTime());
    this.elapsedDays = 0;
    this.speedIndex = 2; // default = 1 day/sec
    this.isPaused = false;
    this._listeners = new Set();
  }

  get speed() {
    return SPEED_STEPS[this.speedIndex];
  }

  onChange(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    for (const cb of this._listeners) cb(this.getState());
  }

  getState() {
    return {
      date: this.currentDate,
      elapsedDays: this.elapsedDays,
      speed: this.speed,
      isPaused: this.isPaused,
    };
  }

  /** Advance the clock. Call every render frame with real elapsed seconds. */
  tick(realDeltaSeconds) {
    if (this.isPaused) return;
    const daysToAdd = this.speed * realDeltaSeconds;
    this.elapsedDays += daysToAdd;
    this.currentDate = new Date(this.epoch.getTime() + this.elapsedDays * 86400000);
    this._notify();
  }

  togglePlayPause() {
    this.isPaused = !this.isPaused;
    this._notify();
    return this.isPaused;
  }

  speedUp() {
    this.speedIndex = Math.min(this.speedIndex + 1, SPEED_STEPS.length - 1);
    this._notify();
  }

  slowDown() {
    this.speedIndex = Math.max(this.speedIndex - 1, 0);
    this._notify();
  }

  jumpToNow() {
    this.currentDate = new Date();
    this.epoch = new Date(this.currentDate.getTime());
    this.elapsedDays = 0;
    this._notify();
  }

  jumpToDate(date) {
    this.currentDate = new Date(date);
    this.epoch = new Date(this.currentDate.getTime());
    this.elapsedDays = 0;
    this._notify();
  }

  /** Formats current sim date as e.g. "08 AUG 2026" */
  formatDate() {
    const d = this.currentDate;
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }
}