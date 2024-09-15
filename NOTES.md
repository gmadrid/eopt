### Things I want to do

- Transactions
    - only the sort that I want
    - only for a single stock
    - include totals
        - short-term vs long-term

- Portfolio view
    - full list
    - options list
        - include stocks that have options
        - group by stock
        - (eventually, it would be nice to show which options match up or which stocks cover which options)

### UI

- Framework
    - Header
        - Account holder
        - Account number
        - Current balance
            - Maybe other balances
    - Sidebar
        - If not logged in
            - Login
        - If logged in
            - Accounts
                - Account 1
                - Account 2
            - Transactions
            - Portfolio
                - Full view
                - Options view

### Early design notes from Obsidian

A possible OAuth 1.0 solution: https://www.npmjs.com/package/oauth-1.0a

**What do I want this to do?**

- [x] Login to eTrade
- [x] Display transactions (that I care about) since a date
    - [x] filter by symbol
    - [ ] combine similar transactions
    - [x] date filter
- [ ] For an assignment, show the adjusted cost basis
- [ ] Alert about in-the-money options due in the next "period" (week, fortnight, month, year, all-time)
- [ ] For the next N weeklies, show stats on a stock's Calls/Puts
- [ ] For a symbol, suggest possible weekly spreads with costs and "weeks to recovery"
- [ ] For a roll, show total profit/loss

