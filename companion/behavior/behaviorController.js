class BehaviorController {
  constructor(anchorCandidates, maxHistory = 8) {
    this.anchorCandidates = anchorCandidates;
    this.maxHistory = maxHistory;
    this.history = [];
    this.lastAction = "idle";
    this.currentMood = "calm";
  }

  pickAnchor(currentIndex) {
    const weighted = this.anchorCandidates.map((anchor, index) => {
      let score = 1;

      if (index === currentIndex) {
        score -= 0.85;
      }

      const recentPenalty = this.history.filter((entry) => entry.anchorIndex === index).length;
      score -= recentPenalty * 0.3;

      const distanceWeight = Math.abs(index - currentIndex);
      score -= distanceWeight * 0.12;

      return { index, score };
    });

    const total = weighted.reduce((sum, item) => sum + Math.max(item.score, 0.05), 0);
    let threshold = Math.random() * total;

    for (const item of weighted) {
      threshold -= Math.max(item.score, 0.05);
      if (threshold <= 0) {
        return item.index;
      }
    }

    return weighted[weighted.length - 1].index;
  }

  record(anchorIndex, action) {
    this.history.push({ anchorIndex, action, at: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.lastAction = action;
  }

  updateMood() {
    const randomShift = Math.random();
    if (randomShift < 0.35) {
      this.currentMood = "calm";
    } else if (randomShift < 0.7) {
      this.currentMood = "active";
    } else {
      this.currentMood = "playful";
    }
  }

  decideAction(currentIndex, timeMs) {
    this.updateMood();

    if (timeMs % 4800 < 1400) {
      return { action: "swing", anchorIndex: this.pickAnchor(currentIndex) };
    }

    if (timeMs % 6800 < 2000) {
      return { action: "release", anchorIndex: this.pickAnchor(currentIndex) };
    }

    return { action: "idle", anchorIndex: currentIndex };
  }
}

if (typeof module !== "undefined") {
  module.exports = { BehaviorController };
}

