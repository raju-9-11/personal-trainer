## 2024-05-22 - [Fixed Delay vs Minimum Display Time]
**Learning:** The application had multiple layers of fixed `setTimeout` delays (2s in App + 1.5s in TrainerPage) to simulate a "boot sequence". These were additive to network requests, causing massive 3.5s+ delays.
**Action:** Replace fixed delays with "minimum display time" logic. Record start time, fetch data, and only wait the *remaining* time to reach the desired minimum (e.g. 800ms). This ensures the loading screen is visible without penalizing users on slow networks or adding unnecessary waits.
