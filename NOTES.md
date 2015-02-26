
# Notes

- Give a talk similar to a meetup talk
- Prepare A set of Slides
- Strong Storyline
- Not a bunch of facts
- Architecture of Realtime Apps
- Don't present just a project
- "Made to Stick"


- What would a better architecture than this be?
- How could this be better? Simpler? More Enjoyable?
- What is the story?
- A Real-time app is more than a database listener

- Subscribe/Publish model
- How can this be simpler?
- What does Meteor do?

- How do you manage state in an application?
- How can we get rid of all state in an application?
- What is the role of state in RT apps? 
- How do you control state?

- The idea of states changes because state becomes global. Everyone shares state.
- There is not only user state, but global state. State becomes interdependent.
- "This thing sucks"
- Types: Operations, Listeners, Meta Operations
- Types: Listeners, Updates, Queries
- `.changes` as a trigger can also be a way to notify your application something important has changes

- What is the architecture for RT apps? 
- How does RethinkDB fit into this architecture.

- My App sucks.
- What id does
- - Client
- - Backend
- Why Does it Suck?
- - Stateless Webapps (Django)
- Lessons Learned
- Other Models
- - For RT Apps
- - Listen/Subscribe
- - MVC

- Is there a way in which the architecture of this RT app can work like the request/response model?
- Meteor, Persistent, Connection
- The server tells the client to do stuff
- How much logic should be on the client/server
- Questions/Answers

- Meteor: Methods on both the client and server
- Event: "Significant change in state"

- You need MVC/ORM
- 1. Central source of truth
- 2. State is the enemy (React.js)
- 3. The architecture is important 

### Story

Once upon a time there was ___. Every day, ___. One day ___. Because of that, ___. Because of that, ___. Until finally ___.

I build a real-time app. 
I had a lot of problems build it. 
Because of that, I started thinking about what good practices for real-time apps.
These are some of the lessons I learned.


