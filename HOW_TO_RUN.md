# Testing the Trust Game Experiment Workflow

## 1. Start the Development Server

```bash
cd frontend
npm run dev
```

The app should be running at `http://localhost:5173` (or similar).

## 2. Create an Experiment (as Experimenter)

1. Navigate to `/dashboard/experimenter`
2. Click the "Create New" tab
3. Select "Trust Game" template
4. Fill in:
   - **Name**: "Test Trust Game"
   - **Description**: "Testing the workflow"
   - Keep default parameters or adjust (E1: 100,000 µALGO, m: 3, etc.)
5. Click "Create Experiment"
6. Click on your newly created experiment card

## 3. Create a Session with Subjects

1. On the experiment detail page, find "Create New Session"
2. Enter a session name: "Session 1"
3. Enter subject IDs in the text area (one per line):
   ```
   alice
   bob
   ```
4. Preview should show: Pair #1: alice (S1) ↔ bob (S2)
5. Click "Create Session"
6. **Copy the Session ID** from the session card that appears (you'll need this!)

## 4. Test as Subject 1 (Investor)

**Option A: New browser tab**

1. Open new tab to `/dashboard/subject`
2. Enter:
   - **Session ID**: (paste the session ID you copied)
   - **Subject ID**: `alice`
3. Click "Join Session"
4. You should see the **InvestorInterface**
5. Choose an investment amount (e.g., 50,000)
6. Click "Submit Investment Decision"
7. You should now see the **WaitingRoom** ("Waiting for Trustee...")

**Option B: Incognito window** (better for testing both subjects)

1. Open incognito/private window
2. Navigate to `/dashboard/subject`
3. Follow same steps

## 5. Test as Subject 2 (Trustee)

1. Open **another** new tab or incognito window
2. Go to `/dashboard/subject`
3. Enter:
   - **Session ID**: (same session ID)
   - **Subject ID**: `bob`
4. Click "Join Session"
5. You should see the **WaitingRoom** first (waiting for alice)
6. After alice submits, bob's page should **automatically update** (polling every 3 seconds) to show **TrusteeInterface**
7. Bob sees the investment and multiplied amount
8. Choose a return amount
9. Click "Submit Return Decision"
10. Both alice and bob should now see **ResultsDisplay** with final payouts!

## 6. Monitor as Experimenter

1. Go back to the experimenter's experiment detail page
2. The SessionMonitor should show:
   - Updated pair status
   - Investment and return amounts
   - Completion timestamp

## Tips for Testing

### Multi-Window Setup

- Window 1: Experimenter dashboard
- Window 2: Subject alice (S1)
- Window 3: Subject bob (S2)

### Quick Test Subjects

Use simple IDs like:

```
s1
s2
```

### Check Browser Console

- Look for any errors
- Should see polling logs every 3 seconds when in subject dashboard

### Test Different Scenarios

1. **Zero investment**: alice invests 0 → bob gets 0 → bob returns 0
2. **Full investment**: alice invests all 100,000 → bob gets 300,000 → test various returns
3. **Multiple pairs**: Create session with 4 subjects (2 pairs)

### IndexedDB Inspection

- Chrome DevTools → Application tab → IndexedDB → `btree_experiments`
- You can see the actual data being stored
