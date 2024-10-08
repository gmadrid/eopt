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
    - [x] combine similar transactions
    - [x] date filter
- [ ] For an assignment, show the adjusted cost basis
- [ ] Alert about in-the-money options due in the next "period" (week, fortnight, month, year, all-time)
- [ ] For the next N weeklies, show stats on a stock's Calls/Puts
- [ ] For a symbol, suggest possible weekly spreads with costs and "weeks to recovery"
- [ ] For a roll, show total profit/loss

So, for the Options screen, I think I want to:

- show current options holdings and stocks that are associated
- grouped by stock
- show current prices for all securities
- visibly group offsetting stocks

- when a security is selected,
  show profit/loss for each option group if left to expiration
- show profit/loss for each option group if sold now
- show some possible rolls
    - next week, two weeks
    - up/down to the current stock prices
    - down/up to one or two in the other direction
    - show total prices
    - show gains/losses as percentage (of what?)
    - one day, maybe link to an order on the eTrade site

## Finding options groups

- Groupings that I am likely to look for
    - Covered calls
        - Find a stock
        - Find a call
            - sold (negative quantity)
            - quantity * 100 < stock quantity
    - Bull call spread (there are many spreads, but I typically only have these)
        - Find a LONG call
        - Find a SHORT call
            - strike > LONG call strike
            - expiration == LONG call expiration
            - quantity == LONG call quantity
    - Sold put covered by a long put
        - Find a SHORT put
        - Find a LONG put
            - expiration >= SHORT put expiration
            - quantity == SHORT put quantity
    - Synthetic long
        - find a LONG call
        - find a SHORT put
            - strike == LONG call strike
            - expiration == LONG call expiration
            - quantity == LONG call quantity
