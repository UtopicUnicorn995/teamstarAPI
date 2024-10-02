const express = require("express");
const { MongoClient, ObjectId, Admin, Double } = require("mongodb");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoString = process.env.DATABASE_URL;

const client = new MongoClient(mongoString);
const database = client.db("task_management");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

// ONLY CREATE routes because the model and database has already been defined in the mongodb atlas, was defined at react native realm.

//Log in toget the auth token
router.post("/login", async (req, res) => {
  const { phone, pin } = req.body;

  try {
    await client.connect();
    const database = client.db("task_management");
    const userCollection = database.collection("User");

    const user = await userCollection.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPinValid = pin === user.pin;
    if (!isPinValid) {
      return res.status(403).json({ message: "Invalid pin" });
    }

    const userPayload = {
      _id: user._id,
      role: user.role,
      customer_id: user.customer_id,
    };

    const accessToken = generateAccessToken(userPayload);

    res.status(200).json({
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Get all Method
router.get("/getAllUsers", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const items = await collection.find({}).toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getAllTasks", async (req, res) => {
  console.log("items");
  try {
    await client.connect();

    const collection = database.collection("Task");

    const items = await collection.find({}).toArray();
    console.log("items");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getAllCustomers", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Customer");

    const items = await collection.find({}).toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getAllTaskAttachments", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("TaskAttachment");

    const items = await collection.find({}).toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getAllReports", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Reports");

    const items = await collection.find({}).toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

// Get all customers created by specific user -> done
router.get("/getCreatedCustomers/:user_id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Customer");

    const user_id = req.params.user_id;

    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection
      .find({
        created_by: new ObjectId(user_id),
      })
      .toArray();

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

// Get all tasks used by certain customer -> done
router.get("/getCreatedTasks/:user_id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Task");

    const user_id = req.params.user_id;

    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection
      .find({
        created_by: new ObjectId(user_id),
      })
      .toArray();

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Get by specific queries
router.get("/getUser/:user_id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const user_id = req.params.user_id;

    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(user_id) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Get details by the current User
router.get("/getCurrentUser/", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const user_id = req.user._id;

    if (!ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(user_id) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getTask/:id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Task");

    const reportId = req.params.id;

    if (!ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(reportId) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getCustomer/:id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Customer");

    const customerId = req.params.id;

    if (!ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(customerId) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getAttachment/:id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("TaskAttachments");

    const reportId = req.params.id;

    if (!ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(reportId) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//done
router.get("/getReport/:id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Reports");

    const reportId = req.params.id;

    if (!ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const item = await collection.findOne({ _id: new ObjectId(reportId) });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Delete task by ID -> done
router.delete("/deleteTask/:id", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const tasksCollection = database.collection("Task");
    const historyLogsCollection = database.collection("TaskHistoryLog");
    const taskCommentsCollection = database.collection("TaskComment");
    const taskAttachmentCollection = database.collection("TaskAttachment");
    const checklistCollection = database.collection("Checklist");

    const taskId = req.params.id;
    const user_id = req.user._id;

    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    if (user_id.role !== "admin" || user_id.role !== "supervisor") {
      return res
        .status(401)
        .json({ message: "User is not authorized to delete task." });
    }

    const deletedTask = await tasksCollection.deleteOne({
      _id: new ObjectId(taskId),
    });
    const deletedHistoryLogs = await historyLogsCollection.deleteMany({
      task_id: new ObjectId(taskId),
    });
    const deletedComments = await taskCommentsCollection.deleteMany({
      task_id: new ObjectId(taskId),
    });
    const deletedAttachments = await taskAttachmentCollection.deleteMany({
      task_id: new ObjectId(taskId),
    });
    const deletedChecklist = await checklistCollection.deleteMany({
      task_id: new ObjectId(taskId),
    });

    if (deletedTask.deletedCount === 1) {
      res.status(200).json({
        message: "Task and related data deleted successfully",
        taskDeleted: true,
        historyLogsDeleted: deletedHistoryLogs.deletedCount,
        commentsDeleted: deletedComments.deletedCount,
        attachmentsDeleted: deletedAttachments.deletedCount,
        checklistDeleted: deletedChecklist.deletedCount,
      });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Delete user by ID -> done
router.delete("/deleteUser/:user_id", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const userToDeleteId = req.params.user_id;
    const userId = req.user._id

    if (!ObjectId.isValid(userToDeleteId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    if (userId.role === "member") {
      return res
        .status(400)
        .json({ message: "The inviter is not an admin or supervsor" });
    }


    const result = await collection.deleteOne({ _id: new ObjectId(userToDeleteId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Delete report by ID -> done
router.delete("/deleteReport/:report_id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Reports");

    const reportId = req.params.report_id;

    if (!ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid Report ID format" });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(reportId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Report deleted successfully" });
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Change user role -> done
router.patch("/changeUserRole/:target_id", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const user = req.user;
    const targetUserId = req.params.target_id

    if (!ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    if (user.role === "member") {
      return res
        .status(400)
        .json({ message: "Members cannot change another user's role." });
    }

    const targetUser = await collection.findOne({ _id: new ObjectId(targetUserId) });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "admin") {
      return res.status(403).json({ message: "Admins cannot change roles" });
    }

    let newRole;
    if (targetUser.role === "supervisor") {
      newRole = "member";
    } else if (targetUser.role === "member") {
      newRole = "supervisor";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({
        message: `User role changed to ${newRole} successfully`,
      });
    } else {
      res.status(500).json({ message: "Failed to change user role" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

router.patch("/UpdateUser/", async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("User");

    const userId = req.user._id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot change roles" });
    }

    let newRole;
    if (user.role === "supervisor") {
      newRole = "member";
    } else if (user.role === "member") {
      newRole = "supervisor";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({
        message: `User role changed to ${newRole} successfully`,
      });
    } else {
      res.status(500).json({ message: "Failed to change user role" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Post Method create customer -> only if ID being used is an admin
router.post("/createCustomer/", authenticateToken, async (req, res) => {
  const { name, email } = req.body;

  try {
    await client.connect();
    const userCollection = database.collection("User");
    const customerCollection = database.collection("Customer");

    const admin_id = req.user._id;

    const admin = await userCollection.findOne({ _id: new ObjectId(admin_id) });

    if (admin.role === "member") {
      return res
        .status(400)
        .json({ message: "The inviter is not an admin or supervsor" });
    }

    const newCustomer = {
      _id: new ObjectId(),
      name,
      email,
      created_by: new ObjectId(admin._id),
      admin: new ObjectId(admin._id),
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
      supervisor: null,
    };

    const createdCustomer = await customerCollection.insertOne(newCustomer);

    res.status(201).json({
      message: "New Organization has been created successully",
      customerId: createdCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Post method create report -> only if the ID being used is a member
router.post("/createReport/", authenticateToken, async (req, res) => {
  const { title, description, customer_id, recepient } = req.body;
  const user = req.user;

  try {
    await client.connect();
    const userCollection = database.collection("User");
    const reportCollection = database.collection("Reports");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "member") {
      return res
        .status(403)
        .json({ message: "Only members can create reports" });
    }
    const newReport = {
      user_id: new ObjectId(user._id),
      title,
      description,
      customer_id: customer_id
        ? new ObjectId(customer_id)
        : new ObjectId(user.customer_id),
      recepient: new ObjectId(recepient),
      status: "pending",
    };
    const result = await reportCollection.insertOne(newReport);
    res.status(201).json({
      message: "Report created successfully",
      report: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Post method to create an admin account
router.post("/createNewUser", async (req, res) => {
  const { companyName, email, name, phone, pin } = req.body;

  try {
    await client.connect();
    const userCollection = database.collection("User");
    const customerCollection = database.collection("Customer");

    const existingUser = await userCollection.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const newUser = {
      _id: new ObjectId(),
      email,
      name,
      phone,
      pin,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCompany = {
      _id: new ObjectId(),
      name: companyName,
      email,
      created_by: newUser._id,
      admin: newUser._id,
      member: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = await userCollection.insertOne(newUser);
    const createdCustomer = await customerCollection.insertOne(newCompany);

    await userCollection.updateOne(
      { _id: newUser._id },
      { $set: { customer_id: newCompany._id } }
    );

    res.status(201).json({
      message: "New user has been registered successfully",
      user: createdUser.insertedId,
      customer: createdCustomer.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Post method to add a member to the team and to create a new user
router.post("/addMember/", authenticateToken, async (req, res) => {
  const { name, phone, pin } = req.body;

  try {
    await client.connect();
    const userCollection = database.collection("User");

    const inviter_id = req.user._id;

    const inviter = await userCollection.findOne({
      _id: new ObjectId(inviter_id),
    });

    if (inviter.role === "member") {
      return res
        .status(400)
        .json({ message: "The inviter is not an admin or supervsor" });
    }

    const existingUser = await userCollection.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const generatedPin =
      pin || Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = {
      _id: new ObjectId(),
      name,
      phone,
      pin: generatedPin,
      role: "member",
      createdAt: new Date(),
      updatedAt: new Date(),
      created_by: inviter_id,
      updatedAt: new Date(),
      updated_by: inviter_id,
      customer_id: inviter.customer_id,
    };

    const createdUser = await userCollection.insertOne(newUser);

    res.status(201).json({
      message: "New user has been registered successfully",
      user: createdUser.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Post Method create tasks -> done
router.post("/createTask/", authenticateToken, async (req, res) => {
  const {
    title,
    description,
    customer_id,
    due,
    startTime,
    endTime,
    duration,
    recurring,
    nextSchedules,
    priorityLevel,
    status,
    team_id,
    assignee,
    location,
    created_by,
    updated_by,
    completedAt,
    deletedAt,
  } = req.body;

  try {
    await client.connect();

    const taskCollection = database.collection("Task");

    const user = req.user;

    if (user.role === "member") {
      return res
        .status(400)
        .json({ message: "Members are not allowed to create a task" });
    }

    const taskData = {
      _id: new ObjectId(),
      title: title,
      description: description || null,
      due: due ? new Date(due) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      duration: new Double(duration) || new Double(0),
      recurring: recurring || null,
      nextSchedules: nextSchedules || "",
      priorityLevel: priorityLevel,
      status: status,
      team_id: new ObjectId(team_id),
      assignee: assignee ? new ObjectId(assignee) : null,
      location: location || null,
      customer_id: customer_id
        ? new ObjectId(customer_id)
        : new ObjectId(user.customer_id),
      created_by: new ObjectId(created_by),
      updated_by: updated_by ? new ObjectId(updated_by) : null,
      completedAt: completedAt ? new Date(completedAt) : null,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: deletedAt ? new Date(deletedAt) : null,
    };

    const result = await taskCollection.insertOne(taskData);

    res.status(201).json({
      message: "Task created successfully",
      task: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

//Update task by ID Method -> pending
router.put("/updateTask/:id", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const {
      title,
      description,
      customer_id,
      due,
      startTime,
      endTime,
      duration,
      recurring,
      nextSchedules,
      priorityLevel,
      status,
      team_id,
      assignee,
      location,
      updated_by,
      completedAt,
      deletedAt,
    } = req.body;

    const tasksCollection = database.collection("Task");
    const taskId = req.params.id;
    const user = req.user;

    // Check if the user is authorized to update the task
    if (user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Members are not authorized to update tasks" });
    }

    // Find the current task in the database
    const currentTask = await tasksCollection.findOne({
      _id: new ObjectId(taskId),
    });

    if (!currentTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update only the fields that are provided by the user
    const updatedTaskData = {
      title: title || currentTask.title,
      description: description || currentTask.description,
      customer_id: customer_id ? new ObjectId(customer_id) : currentTask.customer_id,
      due: due ? new Date(due) : currentTask.due,
      startTime: startTime || currentTask.startTime,
      endTime: endTime || currentTask.endTime,
      duration: duration !== undefined ? new Double(duration) : new Double(currentTask.duration),
      recurring: recurring || currentTask.recurring,
      nextSchedules: nextSchedules || currentTask.nextSchedules,
      priorityLevel: priorityLevel || currentTask.priorityLevel,
      status: status || currentTask.status,
      team_id: team_id ? new ObjectId(team_id) : currentTask.team_id,
      assignee: assignee ? new ObjectId(assignee) : currentTask.assignee,
      location: location || currentTask.location,
      updated_by: updated_by ? new ObjectId(updated_by) : new ObjectId(user._id),
      completedAt: completedAt ? new Date(completedAt) : currentTask.completedAt,
      deletedAt: deletedAt ? new Date(deletedAt) : currentTask.deletedAt,
      updatedAt: new Date(),
    };

    // Update the task in the database
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updatedTaskData }
    );

    if (result.modifiedCount === 0) {
      return res.status(304).json({ message: "No changes made to the task" });
    }

    res.status(200).json({
      message: "Task updated successfully",
      taskId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});


module.exports = router;
