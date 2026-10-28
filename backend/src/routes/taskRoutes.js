const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { listTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");

router.use(protect);
router.route("/").get(listTasks).post(createTask);
router.route("/:id").patch(updateTask).delete(deleteTask);

module.exports = router;
