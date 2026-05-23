require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bcrypt = require("bcryptjs");
const compression = require("compression");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const User = require("./models/user");
const Room = require("./models/room");
const VisitRequest = require("./models/visitRequest");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ZAc201_living";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zacadmin@zac.living";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Zac@Admin2026";
const SESSION_SECRET = process.env.SESSION_SECRET || "zac-living-dev-session-secret";
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || "919301942717").replace(/\D/g, "");
const isProduction = process.env.NODE_ENV === "production";

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    name: "zacLiving.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: MONGO_URL,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

const roomTypes = ["Single", "Double", "Triple", "Any"];
const genderOptions = ["Boys", "Girls", "Other"];
const foodOptions = ["Yes", "No"];
const availabilityOptions = ["Available", "Few beds left", "Full"];
const inquiryStatuses = ["Pending", "Contacted", "Visit Scheduled", "Closed"];
const preferenceSteps = [
  {
    field: "occupation",
    title: "Are you student or working?",
    hint: "Isse hum suitable area aur room type better suggest karte hain.",
    options: ["Student", "Working Professional"],
  },
  {
    field: "institute",
    title: "College, coaching, ya company ka naam?",
    hint: "Nearest PG/room recommend karne me help milegi.",
    inputType: "text",
    placeholder: "Example: MANIT, AIIMS, Allen, DB Mall office",
  },
  {
    field: "preferredArea",
    title: "Preferred area in Bhopal?",
    hint: "Common areas choose karo ya apna area type karo.",
    options: ["MP Nagar", "Saket Nagar", "Kolar", "Arera Colony", "Indrapuri", "Bawadia Kalan"],
    customLabel: "Other area",
    placeholder: "Example: New Market",
  },
  {
    field: "budgetRange",
    title: "Monthly budget kya hai?",
    hint: "Rent range ke hisab se matching hogi.",
    options: ["Below 6000", "6000-8000", "8000-10000", "10000-15000", "15000+"],
  },
  {
    field: "roomType",
    title: "Room type preference?",
    hint: "Single, double, triple ya any select kar sakte ho.",
    options: roomTypes,
  },
  {
    field: "foodRequired",
    title: "Food required?",
    hint: "PG food chahiye ya room/flat without food chalega?",
    options: foodOptions,
  },
  {
    field: "safetyPriority",
    title: "Safety priority?",
    hint: "Parents ke concern aur location filtering ke liye useful hai.",
    options: ["Normal", "High"],
  },
  {
    field: "specialRequirements",
    title: "Any special requirement?",
    hint: "Optional hai. Quiet room, study table, attached washroom, etc. likh sakte ho.",
    inputType: "textarea",
    placeholder: "Example: quiet room, near bus stop, attached washroom",
    optional: true,
  },
];

const demoRooms = [
  {
    title: "Premium Boys PG near MP Nagar",
    area: "MP Nagar",
    landmark: "Near DB Mall",
    rent: 7800,
    deposit: 5000,
    roomType: "Single",
    category: "Boys",
    food: "Yes",
    foodDetails: "Two meals plus breakfast, vegetarian menu, Sunday special dinner.",
    facilities: ["Wi-Fi", "Food", "Laundry", "Study Table", "Water Purifier"],
    rules: ["No smoking", "Entry before 10:30 PM", "ID verification required"],
    utilities: "Electricity extra by meter, RO water included, high-speed Wi-Fi included.",
    availability: "Available",
    ownerContact: "9988776655",
    published: true,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    safetyNotes: "CCTV at entrance, caretaker on-site, main road access.",
    distanceNotes: "1.2 km from MP Nagar coaching hub, 3 km from Rani Kamlapati station.",
    description: "Clean student PG with real photos, food, Wi-Fi, and easy access to coaching centers.",
  },
  {
    title: "Girls PG with food in Saket Nagar",
    area: "Saket Nagar",
    landmark: "Near AIIMS Road",
    rent: 7000,
    deposit: 4000,
    roomType: "Double",
    category: "Girls",
    food: "Yes",
    foodDetails: "Breakfast and dinner included, lunch available on request.",
    facilities: ["Wi-Fi", "Food", "Security", "Laundry", "Power Backup"],
    rules: ["Visitors in common area only", "Entry before 9:30 PM", "No loud music"],
    utilities: "Water and Wi-Fi included, electricity fixed Rs. 600/month.",
    availability: "Few beds left",
    ownerContact: "9977001122",
    published: true,
    videoUrl: "",
    photos: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
    ],
    safetyNotes: "Women caretaker, CCTV, secure main gate.",
    distanceNotes: "900 m from AIIMS Road, near bus stops and daily needs stores.",
    description: "Safe girls PG with food, laundry, and strong access to public transport.",
  },
  {
    title: "Student flat room in Arera Colony",
    area: "Arera Colony",
    landmark: "10 No. Market",
    rent: 10500,
    deposit: 10000,
    roomType: "Double",
    category: "Boys",
    food: "No",
    foodDetails: "Kitchen available, tiffin providers nearby.",
    facilities: ["Wi-Fi", "Kitchen", "Parking", "Water Purifier"],
    rules: ["Keep shared spaces clean", "No parties", "Rent due by 5th"],
    utilities: "Electricity and water split between flatmates, Wi-Fi included.",
    availability: "Available",
    ownerContact: "9898989898",
    published: true,
    videoUrl: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    ],
    safetyNotes: "Gated apartment and residential neighborhood.",
    distanceNotes: "2 km from coaching centers, 1 km from 10 No. Market.",
    description: "Flat-style room for students who want more independence and kitchen access.",
  },
];

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

async function getCurrentUser(req) {
  if (!req.session.userId) return null;
  return User.findById(req.session.userId).populate("favorites");
}

function requireAuth(req, res, next) {
  if (!req.currentUser) return res.redirect("/login");
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.currentUser) return res.redirect(role === "admin" ? "/zac-admin" : "/login");
    if (req.currentUser.role !== role) return res.redirect("/dashboard");
    next();
  };
}

function normalizeList(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split("\n");
  return list.flatMap((item) => String(item).split("\n")).map((item) => item.trim()).filter(Boolean);
}

function budgetMax(range) {
  const matches = String(range || "").match(/\d+/g);
  return matches ? Number(matches[matches.length - 1]) : 0;
}

function calculateMatch(room, student = {}) {
  let score = 0;
  const maxBudget = budgetMax(student.budgetRange);
  if (maxBudget && room.rent <= maxBudget) score += 30;
  if (student.preferredArea && room.area.toLowerCase().includes(student.preferredArea.toLowerCase())) score += 25;
  if (student.roomType && (student.roomType === "Any" || student.roomType === room.roomType)) score += 20;
  if (student.gender && (student.gender === room.category || student.gender === "Other")) score += 15;
  if (student.foodRequired && student.foodRequired === room.food) score += 10;
  return { score, label: score >= 75 ? "Best Match" : score >= 45 ? "Good Match" : "Basic Match" };
}

function decorateRooms(roomList, user, query = {}) {
  return roomList
    .filter((room) => {
      const maxBudget = Number(query.budget || 0);
      return (
        (!query.area || room.area.toLowerCase().includes(query.area.toLowerCase())) &&
        (!maxBudget || room.rent <= maxBudget) &&
        (!query.roomType || query.roomType === "Any" || room.roomType === query.roomType) &&
        (!query.category || room.category === query.category) &&
        (!query.food || room.food === query.food)
      );
    })
    .map((room) => {
      const favoriteIds = user && user.favorites ? user.favorites.map((favorite) => String(favorite._id || favorite)) : [];
      return {
        ...room.toObject(),
        id: String(room._id),
        photo: room.photos[0],
        match: calculateMatch(room, user && user.role === "student" ? user : {}),
        isFavorite: favoriteIds.includes(String(room._id)),
      };
    })
    .sort((a, b) => b.match.score - a.match.score);
}

async function seedDatabase() {
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  await User.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        role: "admin",
        name: "Zac Admin",
        phone: "9000000000",
        email: ADMIN_EMAIL,
        password: adminPassword,
      },
    },
    { upsert: true }
  );

  await User.deleteMany({ role: "admin", email: { $ne: ADMIN_EMAIL } });

  await User.updateOne(
    { email: "student@zac.living" },
    {
      $setOnInsert: {
        role: "student",
        name: "Aarav Sharma",
        phone: "9876543210",
        email: "student@zac.living",
        password: studentPassword,
        gender: "Boys",
        occupation: "Student",
        institute: "LNCT Bhopal",
        preferredArea: "MP Nagar",
        budgetRange: "6000-9000",
        foodRequired: "Yes",
        roomType: "Single",
        safetyPriority: "High",
        specialRequirements: "Quiet room with Wi-Fi and study table.",
        preferencesComplete: true,
      },
    },
    { upsert: true }
  );

  if ((await Room.countDocuments()) === 0) {
    await Room.insertMany(demoRooms);
  }

  const demoUsers = await User.find({ email: { $in: [ADMIN_EMAIL, "student@zac.living"] } });
  for (const user of demoUsers) {
    if (!isBcryptHash(user.password)) {
      user.password = await bcrypt.hash(user.email === ADMIN_EMAIL ? ADMIN_PASSWORD : "student123", 12);
      await user.save();
    }
  }
}

app.use(
  asyncHandler(async (req, res, next) => {
    req.currentUser = await getCurrentUser(req);
    res.locals.currentUser = req.currentUser;
    res.locals.roomTypes = roomTypes;
    res.locals.genderOptions = genderOptions;
    res.locals.foodOptions = foodOptions;
    res.locals.availabilityOptions = availabilityOptions;
    res.locals.inquiryStatuses = inquiryStatuses;
    next();
  })
);

app.get(
  "/",
  asyncHandler(async (req, res) => {
    const rawRooms = await Room.find({ published: true }).sort({ createdAt: -1 });
    const rooms = decorateRooms(rawRooms, req.currentUser);

    res.render("home", {
      query: {},
      featuredRooms: rooms.slice(0, 6),
      isPersonalized: Boolean(req.currentUser && req.currentUser.role === "student"),
    });
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    app: "Zac.Living",
    db: mongoose.connection.readyState === 1 ? "connected" : "not-connected",
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get(
  "/rooms",
  asyncHandler(async (req, res) => {
    const rooms = await Room.find({ published: true }).sort({ createdAt: -1 });
    let decoratedRooms = decorateRooms(rooms, req.currentUser, req.query);
    if (req.query.video) decoratedRooms = decoratedRooms.filter((room) => room.videoUrl);
    res.render("rooms/index", { rooms: decoratedRooms, query: req.query });
  })
);

app.get(
  "/rooms/all",
  requireAuth,
  asyncHandler(async (req, res) => {
    const filter = req.currentUser.role === "admin" ? {} : { published: true };
    const rawRooms = await Room.find(filter).sort({ createdAt: -1 });
    let rooms = decorateRooms(rawRooms, req.currentUser, req.query);
    if (req.query.video) rooms = rooms.filter((room) => room.videoUrl);
    res.render("rooms/all", { rooms, query: req.query });
  })
);

app.get(
  "/rooms/:id",
  asyncHandler(async (req, res, next) => {
    const filter = { _id: req.params.id };
    if (!req.currentUser || req.currentUser.role !== "admin") filter.published = true;
    const room = await Room.findOne(filter);
    if (!room) return next();
    res.render("rooms/show", { room: decorateRooms([room], req.currentUser)[0] });
  })
);

app.get("/signup", (req, res) => res.render("auth/signup", { error: null, form: {} }));

app.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const form = {
      name: String(req.body.name || "").trim(),
      phone: cleanPhone(req.body.phone),
      password: req.body.password || "",
    };

    if (!form.name || !form.phone || !form.password) {
      return res.status(400).render("auth/signup", { error: "Name, WhatsApp number, and password are required.", form });
    }
    if (form.phone.length < 10) {
      return res.status(400).render("auth/signup", { error: "Please enter a valid WhatsApp number.", form });
    }
    if (form.password.length < 6) {
      return res.status(400).render("auth/signup", { error: "Password must be at least 6 characters.", form });
    }
    if (await User.exists({ phone: form.phone, role: "student" })) {
      return res.status(400).render("auth/signup", { error: "An account with this WhatsApp number already exists. Please login.", form });
    }

    const password = await bcrypt.hash(form.password, 12);
    const user = await User.create({
      role: "student",
      name: form.name,
      phone: form.phone,
      password,
      favorites: [],
      preferencesComplete: false,
    });
    req.session.userId = user._id;
    res.redirect("/preferences?step=1");
  })
);

app.get(
  "/preferences",
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const stepNumber = Math.min(Math.max(Number(req.query.step) || 1, 1), preferenceSteps.length);
    const step = preferenceSteps[stepNumber - 1];
    res.render("preferences/step", {
      step,
      stepNumber,
      totalSteps: preferenceSteps.length,
      currentValue: req.currentUser[step.field] || "",
      error: null,
    });
  })
);

app.post(
  "/preferences",
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const stepNumber = Math.min(Math.max(Number(req.body.step) || 1, 1), preferenceSteps.length);
    const step = preferenceSteps[stepNumber - 1];
    const rawValue = step.field === "preferredArea" ? req.body.customValue || req.body.value : req.body.value;
    const value = String(rawValue || "").trim();

    if (!value && !step.optional) {
      return res.status(400).render("preferences/step", {
        step,
        stepNumber,
        totalSteps: preferenceSteps.length,
        currentValue: "",
        error: "Please answer this question to continue.",
      });
    }

    req.currentUser[step.field] = value;
    if (stepNumber === preferenceSteps.length) req.currentUser.preferencesComplete = true;
    await req.currentUser.save();

    if (stepNumber >= preferenceSteps.length) return res.redirect("/student/dashboard");
    res.redirect(`/preferences?step=${stepNumber + 1}`);
  })
);

app.get("/login", (req, res) => res.render("auth/login", { error: null, form: {} }));

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const phone = cleanPhone(req.body.phone);
    const user = await User.findOne({ phone, role: "student" });
    let isPasswordValid = false;

    if (user && isBcryptHash(user.password)) {
      isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    } else if (user && user.password === req.body.password) {
      isPasswordValid = true;
      user.password = await bcrypt.hash(req.body.password, 12);
      await user.save();
    }

    if (!user || !isPasswordValid) {
      return res.status(401).render("auth/login", {
        error: "Invalid WhatsApp number or password.",
        form: { phone },
      });
    }
    req.session.userId = user._id;
    res.redirect("/dashboard");
  })
);

app.get("/zac-admin", (req, res) => res.render("auth/admin-login", { error: null, form: {} }));

app.post(
  "/zac-admin",
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email, role: "admin" });
    const isPasswordValid = Boolean(user && (await bcrypt.compare(req.body.password, user.password)));

    if (!isPasswordValid) {
      return res.status(401).render("auth/admin-login", {
        error: "Invalid admin credentials.",
        form: { email: req.body.email },
      });
    }

    req.session.userId = user._id;
    res.redirect("/admin");
  })
);

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("zacLiving.sid");
    res.redirect("/");
  });
});

app.get("/dashboard", requireAuth, (req, res) => {
  if (req.currentUser.role === "admin") return res.redirect("/admin");
  res.redirect("/student/dashboard");
});

app.get(
  "/student/dashboard",
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const rooms = await Room.find({ published: true }).sort({ createdAt: -1 });
    const savedIds = req.currentUser.favorites.map((room) => room._id);
    const savedRoomsRaw = await Room.find({ _id: { $in: savedIds }, published: true });
    const requests = await VisitRequest.find({ student: req.currentUser._id }).populate("room").sort({ createdAt: -1 });

    res.render("dashboards/student", {
      user: req.currentUser,
      recommendedRooms: decorateRooms(rooms, req.currentUser).slice(0, 6),
      savedRooms: decorateRooms(savedRoomsRaw, req.currentUser),
      requests: requests.map((request) => ({
        ...request.toObject(),
        id: String(request._id),
        room: request.room
          ? {
              ...request.room.toObject(),
              id: String(request.room._id),
              photo: request.room.photos[0],
            }
          : null,
        createdAt: request.createdAt.toISOString().slice(0, 10),
      })),
    });
  })
);

app.post(
  "/rooms/:id/favorite",
  requireRole("student"),
  asyncHandler(async (req, res, next) => {
    const room = await Room.findOne({ _id: req.params.id, published: true });
    if (!room) return next();

    const favoriteIds = req.currentUser.favorites.map((favorite) => String(favorite._id || favorite));
    if (favoriteIds.includes(String(room._id))) {
      req.currentUser.favorites = req.currentUser.favorites.filter((favorite) => String(favorite._id || favorite) !== String(room._id));
    } else {
      req.currentUser.favorites.push(room._id);
    }
    await req.currentUser.save();
    res.redirect(req.get("Referrer") || "/student/dashboard");
  })
);

app.post(
  "/rooms/:id/visit",
  requireRole("student"),
  asyncHandler(async (req, res, next) => {
    const room = await Room.findOne({ _id: req.params.id, published: true });
    if (!room) return next();

    await VisitRequest.updateOne(
      { room: room._id, student: req.currentUser._id },
      {
        $setOnInsert: {
          room: room._id,
          student: req.currentUser._id,
          message: req.body.message || "I want to request a visit.",
          status: "Pending",
        },
      },
      { upsert: true }
    );
    res.redirect("/student/dashboard");
  })
);

app.get("/support/whatsapp", requireRole("student"), (req, res) => {
  const area = req.currentUser.preferredArea || "Bhopal";
  const text = encodeURIComponent(`Hi Zac.Living, I am ${req.currentUser.name}. I need help finding a room in ${area}.`);
  res.redirect(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${text}`);
});

app.get(
  "/profile",
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const savedIds = req.currentUser.favorites.map((room) => room._id);
    const savedRoomsRaw = await Room.find({ _id: { $in: savedIds }, published: true });
    res.render("profile", { user: req.currentUser, savedRooms: decorateRooms(savedRoomsRaw, req.currentUser), error: null });
  })
);

app.post(
  "/profile",
  requireRole("student"),
  asyncHandler(async (req, res) => {
    Object.assign(req.currentUser, {
      name: req.body.name,
      phone: cleanPhone(req.body.phone),
      gender: req.body.gender,
      occupation: req.body.occupation,
      institute: req.body.institute,
      preferredArea: req.body.preferredArea,
      budgetRange: req.body.budgetRange,
      foodRequired: req.body.foodRequired,
      roomType: req.body.roomType,
      safetyPriority: req.body.safetyPriority,
      specialRequirements: req.body.specialRequirements || "",
      preferencesComplete: true,
    });
    await req.currentUser.save();
    res.redirect("/student/dashboard");
  })
);

app.get(
  "/admin",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const [rawRooms, rawStudents, requests] = await Promise.all([
      Room.find({}).sort({ createdAt: -1 }),
      User.find({ role: "student" }).sort({ createdAt: -1 }),
      VisitRequest.find({}).populate("room").populate("student").sort({ createdAt: -1 }),
    ]);
    const rooms = decorateRooms(rawRooms, req.currentUser);
    const students = rawStudents.map((student) => {
      const bestMatch = decorateRooms(rawRooms.filter((room) => room.published), student)[0];
      return {
        ...student.toObject(),
        id: String(student._id),
        bestMatch,
      };
    });

    res.render("dashboards/admin", {
      rooms,
      students,
      stats: {
        totalRooms: rawRooms.length,
        publishedRooms: rawRooms.filter((room) => room.published).length,
        studentCount: rawStudents.length,
        pendingRequests: requests.filter((request) => request.status === "Pending").length,
      },
      requests: requests.map((request) => ({
        ...request.toObject(),
        id: String(request._id),
        room: request.room ? { ...request.room.toObject(), id: String(request.room._id) } : null,
        student: request.student ? { ...request.student.toObject(), id: String(request.student._id) } : null,
      })),
    });
  })
);

app.post(
  "/admin/rooms/:id/quick",
  requireRole("admin"),
  asyncHandler(async (req, res, next) => {
    const update = {};
    if (req.body.availability) update.availability = req.body.availability;
    if (req.body.published !== undefined) update.published = req.body.published === "true";
    const room = await Room.findByIdAndUpdate(req.params.id, update, { runValidators: true });
    if (!room) return next();
    res.redirect("/admin");
  })
);

app.get("/admin/rooms/new", requireRole("admin"), (req, res) => {
  res.render("rooms/form", { room: {}, action: "/admin/rooms", title: "Add Listing", error: null });
});

function roomPayload(body) {
  return {
    title: body.title,
    area: body.area,
    landmark: body.landmark,
    rent: Number(body.rent),
    deposit: Number(body.deposit),
    roomType: body.roomType,
    category: body.category,
    food: body.food,
    foodDetails: body.foodDetails || "",
    facilities: normalizeList(body.facilities),
    rules: normalizeList(body.rules),
    utilities: body.utilities || "",
    availability: body.availability,
    ownerContact: body.ownerContact,
    published: body.published === "on",
    videoUrl: body.videoUrl || "",
    photos: normalizeList(body.photos).length
      ? normalizeList(body.photos)
      : ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80"],
    safetyNotes: body.safetyNotes || "",
    distanceNotes: body.distanceNotes || "",
    description: body.description || "",
  };
}

app.post(
  "/admin/rooms",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const room = req.body.room || {};
    if (!room.title || !room.area || !room.landmark || !room.rent || !room.deposit || !room.roomType || !room.category || !room.food || !room.availability || !room.ownerContact) {
      return res.status(400).render("rooms/form", { room, action: "/admin/rooms", title: "Add Listing", error: "Please fill all required admin listing fields." });
    }
    await Room.create(roomPayload(room));
    res.redirect("/admin");
  })
);

app.get(
  "/admin/rooms/:id/edit",
  requireRole("admin"),
  asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.id);
    if (!room) return next();
    res.render("rooms/form", { room: room.toObject(), action: `/admin/rooms/${room._id}?_method=put`, title: "Edit Listing", error: null });
  })
);

app.put(
  "/admin/rooms/:id",
  requireRole("admin"),
  asyncHandler(async (req, res, next) => {
    const room = req.body.room || {};
    const updated = await Room.findByIdAndUpdate(req.params.id, roomPayload(room), { runValidators: true });
    if (!updated) return next();
    res.redirect("/admin");
  })
);

app.delete(
  "/admin/rooms/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await Room.findByIdAndDelete(req.params.id);
    await VisitRequest.deleteMany({ room: req.params.id });
    await User.updateMany({}, { $pull: { favorites: req.params.id } });
    res.redirect("/admin");
  })
);

app.post(
  "/admin/requests/:id/status",
  requireRole("admin"),
  asyncHandler(async (req, res, next) => {
    const request = await VisitRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { runValidators: true });
    if (!request) return next();
    res.redirect("/admin");
  })
);

app.use((req, res) => {
  res.status(404).render("error", { err: { statusCode: 404, message: "Page not found" } });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { err: { statusCode: 500, message: "Something went wrong" } });
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await User.syncIndexes();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Zac.Living is running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Zac.Living:", error);
});
