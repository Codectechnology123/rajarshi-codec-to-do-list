const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { listTasks, getTask, createTask, updateTask, deleteTask } = require("../controllers/taskController");
router.use(protect);
router.route("/").get(listTasks).post(createTask);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);
module.exports = router;
