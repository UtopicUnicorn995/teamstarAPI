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
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
};

// ONLY CREATE routes because the model and database has already been defined in the mongodb atlas, was defined at react native realm.

//Log in to get the auth token
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
router.get("/getAllUsers", authenticateToken, async (req, res) => {
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
router.get("/getAllTasks", authenticateToken, async (req, res) => {
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
router.get(
  "/getOrganizationTask/:customer_id",
  authenticateToken,
  async (req, res) => {
    console.log("items");
    try {
      await client.connect();

      const collection = database.collection("Task");

      const customer_id = req.params.customer_id;

      const items = await collection
        .find({ customer_id: new ObjectId(customer_id) })
        .toArray();
      console.log("items");
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      await client.close();
    }
  }
);

//done
router.get("/getAllCustomers", authenticateToken, async (req, res) => {
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
router.get("/getAllAttachments", authenticateToken, async (req, res) => {
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
router.get(
  "/getTaskAttachments/:task_id",
  authenticateToken,
  async (req, res) => {
    try {
      await client.connect();

      const task_id = req.params.task_id;

      const collection = database.collection("TaskAttachment");

      const items = await collection
        .find({ task_id: new ObjectId(task_id) })
        .toArray();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      await client.close();
    }
  }
);

//done
router.get("/getAllReports", authenticateToken, async (req, res) => {
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

//done
router.get(
  "/getAllReports/:customer_id",
  authenticateToken,
  async (req, res) => {
    try {
      await client.connect();
      const customer_id = req.params.customer_id;

      const collection = database.collection("Reports");

      const items = await collection
        .find({ customer_id: new ObjectId(customer_id) })
        .toArray();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      await client.close();
    }
  }
);

// Get all customers created by specific user -> done
router.get(
  "/getCreatedCustomers/:user_id",
  authenticateToken,
  async (req, res) => {
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
  }
);

// Get all tasks used by certain customer -> done
router.get("/getCreatedTasks/:user_id", authenticateToken, async (req, res) => {
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
router.get("/getUser/:user_id", authenticateToken, async (req, res) => {
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
router.get("/getTask/:id", authenticateToken, async (req, res) => {
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
router.get("/getCustomer/:id", authenticateToken, async (req, res) => {
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
router.get("/getAttachment/:id", authenticateToken, async (req, res) => {
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
router.get("/getReport/:id", authenticateToken, async (req, res) => {
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

router.get(
  "/getCustomerTeams/:customer_id",
  authenticateToken,
  async (req, res) => {
    try {
      await client.connect();

      const collection = database.collection("Team");

      const customer_id = req.params.customer_id;

      console.log("customer id", customer_id);

      const teams = await collection
        .find({ customer_id: new ObjectId(customer_id) })
        .toArray();

      if (teams) {
        res.status(200).json(teams);
      } else {
        res.status(404).json({ message: "Teams not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      await client.close();
    }
  }
);

router.get("/getTaskByTitle/", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const collection = database.collection("Task");

    const taskTitle = req.query.title;

    const task = await collection
      .find({ title: taskTitle })
      .sort({ createdAt: -1 })
      .toArray();

    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
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
    const usersCollection = database.collection("User");

    const taskId = req.params.id;
    const user_id = req.user._id;

    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });

    if (user.role !== "admin" && user.role !== "supervisor") {
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
    const userId = req.user._id;

    if (!ObjectId.isValid(userToDeleteId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    if (userId.role === "member") {
      return res
        .status(400)
        .json({ message: "The inviter is not an admin or supervsor" });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(userToDeleteId),
    });

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
router.delete(
  "/deleteReport/:report_id",
  authenticateToken,
  async (req, res) => {
    try {
      await client.connect();

      const collection = database.collection("Reports");

      const reportId = req.params.report_id;

      if (!ObjectId.isValid(reportId)) {
        return res.status(400).json({ message: "Invalid Report ID format" });
      }

      const result = await collection.deleteOne({
        _id: new ObjectId(reportId),
      });

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
  }
);

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

    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
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

    if (!title) {
      return res.status(400).json({ message: "Report title is required" });
    }

    if (!description) {
      return res
        .status(400)
        .json({ message: "Report description is required" });
    }

    if (!customer_id) {
      return res
        .status(400)
        .json({ message: "Customer ID of the customer is required" });
    }


    if (!recepient) {
      return res
        .status(400)
        .json({ message: "Report recepient is required" });
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

    const existingUserPhone = await userCollection.findOne({ phone });
    const existingUserEmail = await userCollection.findOne({ email });

    if (existingUserPhone) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    if (existingUserEmail) {
      return res
        .status(400)
        .json({ message: "Email address already registered" });
    }

    if (!companyName) {
      return res
        .status(400)
        .json({ message: "Company name is required to register" });
    }

    if (!email || !phone) {
      return res
        .status(400)
        .json({ message: "Email address or phone number is required to registered" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "New user's name is required to registered" });
    }
    
    if (!pin) {
      return res
        .status(400)
        .json({ message: "Password is required to registered" });
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
    linkURL,
  } = req.body;

  try {
    await client.connect();

    const taskCollection = database.collection("Task");
    const teamsCollection = database.collection("Team");

    const user = req.user;

    if (user.role === "member") {
      return res
        .status(400)
        .json({ message: "Members are not allowed to create a task" });
    }

    if(!title){
      return res
      .status(400)
      .json({ message: "Title is required to create a task." });
    }

    if(!team_id){
      return res
      .status(400)
      .json({ message: "Team ID is required to create a task." });
    }


    const taskData = {
      _id: new ObjectId(),
      title: title,
      description: description || null,
      due: due ? new Date(due) : null,
      startTime: startTime || "08:00",
      endTime: endTime || "09:00",
      duration: new Double(duration) || new Double(0),
      recurring: recurring || null,
      nextSchedules: nextSchedules || "",
      priorityLevel: priorityLevel || 'medium',
      status: status || 'open',
      team_id: new ObjectId(team_id),
      assignee: assignee ? new ObjectId(assignee) : null,
      location: new ObjectId(location) || null,
      linkURL: linkURL ? linkURL : "",
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

    await teamsCollection.updateOne(
      { _id: new ObjectId(team_id) },
      { $push: { tasks: result.insertedId } }
    );

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

router.post("/createMessage", authenticateToken, async (req, res) => {
  const { messageId, subject, customer_id, message, recipient } = req.body;

  try {
    await client.connect();
    const messageThread = database.collection("Message");
    const messageEntry = database.collection("MessageEntry");

    if (!messageId) {
      const newMessageThread = {
        _id: new ObjectId(),
        subject,
        customer_id: new ObjectId(customer_id),
        created_by: req.user._id,
        updated_by: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        people: recipient.map((id) => new ObjectId(id)),
        messages: [],
      };

      const resultThread = await messageThread.insertOne(newMessageThread);

      const newMessageEntry = {
        _id: new ObjectId(),
        thread_id: resultThread.insertedId,
        sender_id: req.user._id,
        sender_name: req.user.name,
        content: message,
        sentAt: new Date(),
        isRead: false,
        attachments: [],
      };

      await messageEntry.insertOne(newMessageEntry);

      await messageThread.updateOne(
        { _id: resultThread.insertedId },
        { $push: { messages: newMessageEntry._id } }
      );

      res.status(201).json({
        message: "New conversation created with initial message.",
        thread: newMessageThread,
        entry: newMessageEntry,
      });
    } else {
      const newMessageEntry = {
        _id: new ObjectId(),
        thread_id: new ObjectId(messageId),
        sender_id: req.user._id,
        sender_name: req.user.name,
        content: message,
        sentAt: new Date(),
        isRead: false,
        attachments: [],
      };

      await messageEntry.insertOne(newMessageEntry);

      await messageThread.updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: { updatedAt: new Date() },
          $push: { messages: newMessageEntry._id },
        }
      );

      res.status(201).json({
        message: "Message added to existing conversation.",
        entry: newMessageEntry,
      });
    }
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Failed to create message.", error });
  } finally {
    await client.close();
  }
});

router.post("/createEvent", authenticateToken, async (req, res) => {
  const {
    title,
    description,
    eventDate,
    eventStartTime = "8:00", // Default value
    eventEndTime = "9:00", // Default value
    customer_id,
    location,
    members,
  } = req.body;

  try {
    // Validate start and end times
    const [startHour, startMinute] = eventStartTime.split(":").map(Number);
    const [endHour, endMinute] = eventEndTime.split(":").map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (startTimeInMinutes >= endTimeInMinutes) {
      return res.status(400).json({
        error: "Event start time must be before the end time.",
      });
    }

    // Connect to database
    await client.connect();
    const eventCollection = database.collection("Event");
    const userCollection = database.collection("User");

    // Validate members
    const memberIds = members.map((id) => new ObjectId(id));
    const validMembers = await userCollection
      .find({ _id: { $in: memberIds } })
      .toArray();

    if (validMembers.length !== members.length) {
      return res.status(400).json({
        error: "Some members are invalid or not associated with this customer.",
      });
    }

    // Create new event
    const newEvent = {
      _id: new ObjectId(),
      customer_id: new ObjectId(customer_id),
      title,
      description,
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      eventStartTime,
      eventEndTime,
      location: location || null,
      members: validMembers.map((member) => member._id),
    };

    // Insert event into database
    const result = await eventCollection.insertOne(newEvent);

    if (result.insertedId) {
      return res.status(201).json({
        message: "Event created successfully",
        eventId: result.insertedId,
      });
    } else {
      throw new Error("Failed to insert the event.");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

//Change user role -> done
router.patch(
  "/changeUserRole/:target_id",
  authenticateToken,
  async (req, res) => {
    try {
      await client.connect();

      const userCollection = database.collection("User");
      const customDataCollection = database.collection("CustomUserData");

      const user = req.user;
      const targetUserId = req.params.target_id;

      if (!ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }

      if (user.role === "member") {
        return res
          .status(400)
          .json({ message: "Members cannot change another user's role." });
      }

      const targetUser = await userCollection.findOne({
        _id: new ObjectId(targetUserId),
      });

      const targetCustomUserData = await customDataCollection.findOne({
        external_id: new ObjectId(targetUserId),
      });

      console.log(targetUser, targetCustomUserData);

      if (!targetUser || !targetCustomUserData) {
        return res.status(404).json({ message: "User not found" });
      }

      if (
        targetUser.role === "admin" ||
        targetCustomUserData.role === "admin"
      ) {
        return res.status(403).json({ message: "Admins cannot change roles" });
      }

      let newRole;
      if (
        targetUser.role === "supervisor" ||
        targetCustomUserData === "supervisor"
      ) {
        newRole = "member";
      } else if (
        targetUser.role === "member" ||
        targetCustomUserData === "member"
      ) {
        newRole = "supervisor";
      } else {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUserResult = await userCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $set: { role: newRole } }
      );

      const updatedCustomDataResult = await customDataCollection.updateMany(
        { external_id: new ObjectId(targetUserId) },
        { $set: { role: newRole } }
      );

      if (
        updatedUserResult.modifiedCount === 1 &&
        updatedCustomDataResult.modifiedCount === 1
      ) {
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
  }
);

//Update task by ID Method -> done
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
      customer_id: customer_id
        ? new ObjectId(customer_id)
        : currentTask.customer_id,
      due: due ? new Date(due) : currentTask.due,
      startTime: startTime || currentTask.startTime,
      endTime: endTime || currentTask.endTime,
      duration:
        duration !== undefined
          ? new Double(duration)
          : new Double(currentTask.duration),
      recurring: recurring || currentTask.recurring,
      nextSchedules: nextSchedules || currentTask.nextSchedules,
      priorityLevel: priorityLevel || currentTask.priorityLevel,
      status: status || currentTask.status,
      team_id: team_id ? new ObjectId(team_id) : currentTask.team_id,
      assignee: assignee ? new ObjectId(assignee) : currentTask.assignee,
      location: location || currentTask.location,
      updated_by: updated_by
        ? new ObjectId(updated_by)
        : new ObjectId(user._id),
      completedAt: completedAt
        ? new Date(completedAt)
        : currentTask.completedAt,
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

//Update the current user -> done
router.put("/updateCurrentUser/", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const { name, phone, pin, email } = req.body;

    const userCollection = database.collection("User");
    const customDataCollection = database.collection("CustomUserData");
    const user = req.user._id;

    const currentUser = await userCollection.findOne({
      _id: new ObjectId(user),
    });

    const customData = await customDataCollection.findOne({
      external_id: new ObjectId(user),
    });

    console.log(currentUser, customData);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!customData) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = {
      name: name ? name : currentUser.name,
      phone: phone ? phone : currentUser.phone,
      pin: pin ? pin : currentUser.pin,
      email: email ? email : currentUser.email,
    };

    const updatedCustomData = {
      name: name ? name : currentUser.name,
    };

    const result = await userCollection.updateOne(
      { _id: new ObjectId(user) },
      { $set: updatedUser }
    );

    const customDataResult = await customDataCollection.updateOne(
      { external_id: new ObjectId(user) },
      { $set: updatedCustomData }
    );

    if (result.modifiedCount === 0 || customDataResult.modifiedCount === 0) {
      return res.status(304).json({ message: "No changes made to the User" });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedUserId: updatedUser.insertedId,
      updatedCustomDataId: updatedCustomData.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

router.put("/changeUserPassword/", authenticateToken, async (req, res) => {
  try {
    await client.connect();

    const { name, phone, pin, email } = req.body;

    const userCollection = database.collection("User");
    const customDataCollection = database.collection("CustomUserData");
    const user = req.user._id;

    const currentUser = await userCollection.findOne({
      _id: new ObjectId(user),
    });

    const customData = await customDataCollection.findOne({
      external_id: new ObjectId(user),
    });

    console.log(currentUser, customData);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!customData) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = {
      name: name ? name : currentUser.name,
      phone: phone ? phone : currentUser.phone,
      pin: pin ? pin : currentUser.pin,
      email: email ? email : currentUser.email,
    };

    const updatedCustomData = {
      name: name ? name : currentUser.name,
    };

    const result = await userCollection.updateOne(
      { _id: new ObjectId(user) },
      { $set: updatedUser }
    );

    const customDataResult = await customDataCollection.updateOne(
      { external_id: new ObjectId(user) },
      { $set: updatedCustomData }
    );

    if (result.modifiedCount === 0 || customDataResult.modifiedCount === 0) {
      return res.status(304).json({ message: "No changes made to the User" });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedUserId: updatedUser.insertedId,
      updatedCustomDataId: updatedCustomData.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;
