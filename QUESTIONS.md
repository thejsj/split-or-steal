1. How can I add 1000 to the object an then return it

```
r.db('split_or_steal').table('games')
    .get('a92e5d06-6aa1-49af-a1c8-b41569017b31')('players')
    .map(function (user) {
        return user('score').add(1000)
    })
    // .update({ 'score': 2000 })
```

2. Why can't I count on objects

```
r.db('split_or_steal').table('rounds')
  .filter({ id: 'b7a1a712-888a-4ff4-812b-16f3b6b0ce79' })('finalists')
  .count()
```

3. Why can't I reduce an object:

```
r.db('split_or_steal').table('rounds')
  .get('be0a5200-0e1c-4320-b988-e44228e15859')('bets').reduce(function (left, right) { return left + right; })
```

4. Why can't I do this?

```
r.db('rethink_chat').table('messages')
  .filter({'created': r.row('created').gt(0)})
```
