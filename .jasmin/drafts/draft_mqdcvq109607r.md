# Draft: Wire tasks collection + CRUD into StoreContext

> Task: `task_mqdc8ifcrt6uu`

Edits to src/context/StoreContext.js, mirroring followups/accounts:
1. Add `const [tasks, setTasks] = useState([])`.
2. In the no-user branch, add setTasks([]) before setReady(true).
3. Add tasks:false to the `loaded` markReady map.
4. Add subscribe('tasks', setTasks) to the unsubs array.
5. Add CRUD near the transactions section:
   - addTask({title, note, priority}) -> addDoc(tasks, { title.trim(), note.trim(), priority||'medium', done:false, createdAt: Date.now() })
   - updateTask(id, {title, note, priority}) -> updateDoc(... { title.trim(), note.trim(), priority||'medium' }) (does not touch done)
   - toggleTaskDone(id) -> find local task, updateDoc(... { done: !target.done })
   - deleteTask(id) -> deleteDoc(...)
6. Expose tasks + the four functions in the context value.

## Implementation Notes

priority defaults to 'medium' to match the rules (done is bool, title non-empty). toggleTaskDone reads current value from local `tasks` state (store is the single subscriber) like toggleFollowupDone. updateTask intentionally omits `done` so editing title/note/priority never flips completion. No notification logic (unlike followups). Field shape matches firestore.rules tasks block: title (non-empty string), done (bool).
