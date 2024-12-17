const TASK_REQUIRE_TIME_MS = 5_000;
/**
 * Processes an task and executes a callback to mark the task as done.
 *
 * @param {Object} task - The task object containing details about the task.
 * @param {string} task.id - Unique identifier for the task.
 * @param {number} task.priority - Priority level of the task (higher is more urgent).
 * @param {string} task.description - A description of the task. Can be empty string.
 * @param {function(string | undefined):void} task.setTaskDone - Callback function to mark the task as complete.
 * It receives an optional message string.
 */

let waitingQueue = []
let runningTask = null

class Task {
  constructor(task) {
    this.id = task.id
    this.priority = task.priority,
    this.timeLeft = TASK_REQUIRE_TIME_MS,
    this.paused = false
    this.setTaskDone = task.setTaskDone
  }
  
  async execute() {
    while (this.timeLeft > 0) {
      if (this.paused == true) {
        waitingQueue.push(this)
        return
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.timeLeft = this.timeLeft - 1000
    }
    runningTask = null
    waitingTaskRunner()
    this.setTaskDone(this.id)
  }

  pause() {
    this.paused = true
  }
}

const waitingTaskRunner = () => {
  while (waitingQueue.length > 0) {
    if (runningTask !== null) {
      return
    }
    const curTask = waitingQueue.shift()
    curTask.paused = false
    curTask.execute()
    runningTask = curTask
  }
}

export const processTask = (task) => {
  const newTask = new Task(task)
  if (runningTask) {
    if (runningTask.priority < newTask.priority) {
      runningTask.pause()
      waitingQueue.push(runningTask)
      newTask.execute()
      runningTask = newTask
    } else {
      waitingQueue.push(newTask)
    }
    waitingQueue.sort((b, a) => a.priority - b.priority)
  } else {
    newTask.execute()
    runningTask = newTask
  }
};
