require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bcrypt = require("bcryptjs");
const compression = require("compression");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const { v2: cloudinary } = require("cloudinary");
const User = require("./models/user");
const Room = require("./models/room");
const VisitRequest = require("./models/visitRequest");
const { appendListingToSheet } = require("./utils/googleSheets");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ZAc201_living";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zacadmin@zac.living";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Zac@Admin2026";
const SESSION_SECRET = process.env.SESSION_SECRET || "zac-living-dev-session-secret";
const WHATSAPP_NUMBER = (process.env.WHATSAPP_NUMBER || "919301942717").replace(/\D/g, "");
const isProduction = process.env.NODE_ENV === "production";
const AI_PROVIDER = (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
const AI_BASE_URL = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (AI_PROVIDER === "gemini" ? AI_API_KEY : "");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed."));
    cb(null, true);
  },
});
const mongoOptions = {
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 15000),
};
const sessionStore = new MongoStore({
  mongoUrl: MONGO_URL,
  collectionName: "sessions",
  ttl: 60 * 60 * 24 * 7,
  mongoOptions,
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

sessionStore.on("error", (error) => {
  console.error("Session store error:", error.message);
});

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    name: "zacLiving.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
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
const auditStatuses = ["Admin Added", "Pending Zac Audit", "Zac Verified", "Needs Owner Follow-up", "Rejected"];
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
    nearbyPlaces: ["DB Mall - 1.1 km", "MP Nagar market - 800 m", "Coaching hub - 1.2 km", "Bus stop - 350 m", "Medical store - 450 m"],
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
    nearbyPlaces: ["AIIMS Road - 900 m", "Daily needs stores - 250 m", "Bus stop - 400 m", "Pharmacy - 500 m", "Food stalls - 300 m"],
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
    nearbyPlaces: ["10 No. Market - 1 km", "Grocery store - 300 m", "Cafe lane - 700 m", "Bus stop - 600 m", "Coaching centers - 2 km"],
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

function isValidPersonName(value) {
  return /^[A-Za-z ]{2,60}$/.test(String(value || "").trim());
}

function isValidMobileNumber(value) {
  return /^\d{10}$/.test(String(value || ""));
}

function isGmailAddress(value) {
  return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(String(value || "").trim());
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

function mergeListInputs(...values) {
  return [...new Set(values.flatMap(normalizeList))];
}

function normalizeUrls(value) {
  if (!value) return [];
  const source = Array.isArray(value) ? value.join("\n") : String(value);
  const matches = source.match(/https?:\/\/[^\s,]+/g) || [];
  return [...new Set(matches.map((url) => url.trim()).filter(Boolean))];
}

function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function uploadImageToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: process.env.CLOUDINARY_FOLDER || "zac-living/listings",
      resource_type: "image",
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
}

async function uploadListingPhotos(files = []) {
  if (!files.length) return [];
  return Promise.all(files.map(uploadImageToCloudinary));
}

function isAiConfigured() {
  return AI_PROVIDER === "gemini" ? Boolean(GEMINI_API_KEY) : Boolean(AI_API_KEY);
}

function extractJsonObject(text) {
  const source = String(text || "").trim();
  if (!source) return null;
  try {
    return JSON.parse(source);
  } catch (error) {
    const match = source.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (innerError) {
      return null;
    }
  }
}

async function requestAiJson(messages) {
  if (!isAiConfigured()) return null;
  if (AI_PROVIDER === "gemini") return requestGeminiJson(messages);

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${response.status} ${errorText.slice(0, 160)}`);
  }

  const payload = await response.json();
  return extractJsonObject(payload.choices?.[0]?.message?.content);
}

async function requestGeminiJson(messages) {
  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText.slice(0, 160)}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n");
  return extractJsonObject(text);
}

function buildSiteHelperFallback(message, rooms = []) {
  const intent = parseRoomIntent(message);
  const recommendations = rooms
    .map((room) => {
      const ranking = scoreRoomForIntent(room, intent, message);
      return { room, score: ranking.score, reasons: ranking.reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const answer = recommendations.length
    ? `Aapke liye ${recommendations.length} matching room options mil sakte hain. Budget, area, food aur room type ke basis par in rooms ko compare karein.`
    : "Abhi exact match nahi mila. Area, budget, boys/girls, food aur room type thoda clearly likhen.";

  return {
    answer,
    suggestions: ["Budget add karein", "Area ya landmark likhein", "Food required hai ya nahi batayein"],
    roomIds: recommendations.map(({ room }) => String(room._id)),
  };
}

function buildListingDraft(form = {}) {
  const category = form.category || "Student";
  const roomType = form.roomType || "room";
  const foodLabel = form.food === "Yes" ? "with food" : "without food";
  const area = form.area || "Bhopal";
  const landmark = form.landmark || "a key landmark";
  const rent = form.rent ? `Rs. ${Number(form.rent).toLocaleString("en-IN")}` : "budget-friendly rent";
  return {
    title: `${category} ${roomType} ${foodLabel} near ${landmark}, ${area}`,
    description: `${category} ${roomType} stay in ${area}, near ${landmark}. Rent is ${rent} per month. Suitable for students looking for clear room details and local access.`,
    facilities: normalizeList(form.facilities).join("\n"),
    nearbyPlaces: normalizeList(form.nearbyPlaces).join("\n"),
    foodDetails: form.food === "Yes" ? "Food available for students." : "Food is not included.",
    rules: normalizeList(form.rules).join("\n"),
    safetyNotes: form.safetyNotes || "Basic owner details are available with Zac.Living.",
    distanceNotes: form.distanceNotes || `${landmark} is the main nearby reference point.`,
  };
}

function parseRoomIntent(query = "") {
  const text = String(query || "").toLowerCase();
  const numbers = text.match(/\d+/g) || [];
  const budget = numbers.length ? Number(numbers[numbers.length - 1]) : 0;
  return {
    area: "",
    budget,
    category: text.includes("girls") || text.includes("girl") ? "Girls" : text.includes("boys") || text.includes("boy") ? "Boys" : "",
    food: text.includes("food") || text.includes("meal") || text.includes("tiffin") ? "Yes" : "",
    roomType: text.includes("single") ? "Single" : text.includes("double") ? "Double" : text.includes("triple") ? "Triple" : "",
    priorities: text.split(/\W+/).filter((word) => word.length > 3).slice(0, 10),
  };
}

function scoreRoomForIntent(room, intent = {}, query = "") {
  const text = String(query || "").toLowerCase();
  const haystack = [
    room.title,
    room.area,
    room.landmark,
    room.roomType,
    room.category,
    room.food,
    room.description,
    ...(room.facilities || []),
    ...(room.nearbyPlaces || []),
    ...(room.rules || []),
  ].join(" ").toLowerCase();
  let score = 0;
  const reasons = [];

  if (intent.budget && room.rent <= intent.budget) {
    score += 30;
    reasons.push("budget match");
  }
  if (intent.category && room.category === intent.category) {
    score += 18;
    reasons.push(`${intent.category.toLowerCase()} option`);
  }
  if (intent.food && room.food === intent.food) {
    score += 15;
    reasons.push("food available");
  }
  if (intent.roomType && room.roomType === intent.roomType) {
    score += 15;
    reasons.push(`${intent.roomType.toLowerCase()} room`);
  }
  for (const word of intent.priorities || []) {
    if (haystack.includes(word)) score += 4;
  }
  if (text && haystack.includes(text)) score += 12;
  if (!score) score = Math.max(1, 10 - Math.floor(room.rent / 3000));

  return {
    score,
    reasons: reasons.length ? reasons : ["closest available match"],
  };
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

function sanitizeRoomForViewer(room, user) {
  const payload = room.toObject();
  const isAdmin = Boolean(user && user.role === "admin");
  const isOwner = Boolean(user && user.role === "owner" && room.owner && String(room.owner) === String(user._id));
  if (!isAdmin && !isOwner) {
    delete payload.ownerName;
    delete payload.ownerContact;
    delete payload.ownerAddress;
  }
  return payload;
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
      const payload = sanitizeRoomForViewer(room, user);
      const photoUrls = normalizeUrls(payload.photos);
      const photos = photoUrls.length ? photoUrls : payload.photos;
      return {
        ...payload,
        photos,
        id: String(room._id),
        photo: photos[0],
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
    res.locals.auditStatuses = auditStatuses;
    next();
  })
);

app.get(
  "/",
  asyncHandler(async (req, res) => {
    const rawRooms = await Room.find({ published: true }).sort({ createdAt: -1 });
    const rooms = decorateRooms(rawRooms, req.currentUser);
    const featuredRooms = [...rooms].sort(() => Math.random() - 0.5).slice(0, 8);

    res.render("home", {
      query: {},
      featuredRooms,
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

app.post(
  "/api/ai/listing-helper",
  asyncHandler(async (req, res) => {
    const form = req.body || {};
    const fallback = buildListingDraft(form);

    if (!isAiConfigured()) {
      return res.json({ ok: true, mode: "fallback", draft: fallback });
    }

    try {
      const draft = await requestAiJson([
        {
          role: "system",
          content: "You improve Indian student housing listings for Zac.Living. Return valid JSON only with string keys: title, description, facilities, nearbyPlaces, foodDetails, rules, safetyNotes, distanceNotes. Keep every value as a plain string. Keep Hinglish owner data professional, concise, factual, and do not invent exact distances.",
        },
        {
          role: "user",
          content: JSON.stringify({
            form,
            fallback,
            instruction: "Create a clear student-friendly listing draft. Use newline-separated strings for facilities, nearbyPlaces, and rules.",
          }),
        },
      ]);
      return res.json({ ok: true, mode: "ai", draft: { ...fallback, ...(draft || {}) } });
    } catch (error) {
      console.error("AI listing helper failed:", error.message);
      return res.json({ ok: true, mode: "fallback", draft: fallback });
    }
  })
);

app.post(
  "/api/ai/room-search",
  asyncHandler(async (req, res) => {
    const query = String(req.body.query || "").trim().slice(0, 240);
    if (!query) return res.status(400).json({ ok: false, error: "Search query is required." });

    const rooms = await Room.find({ published: true }).sort({ createdAt: -1 }).limit(60);
    let intent = parseRoomIntent(query);
    let aiUsed = false;

    if (isAiConfigured()) {
      try {
        const aiIntent = await requestAiJson([
          {
            role: "system",
            content: "Extract student room search intent for Bhopal housing. Return only JSON: area string, budget number, category Boys/Girls/empty, food Yes/No/empty, roomType Single/Double/Triple/empty, priorities array of short keywords.",
          },
          { role: "user", content: query },
        ]);
        intent = { ...intent, ...(aiIntent || {}) };
        aiUsed = Boolean(aiIntent);
      } catch (error) {
        console.error("AI room intent failed:", error.message);
      }
    }

    const recommendations = decorateRooms(rooms, req.currentUser)
      .map((room) => {
        const ranking = scoreRoomForIntent(room, intent, query);
        return { ...room, aiScore: ranking.score, aiReasons: ranking.reasons };
      })
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 6)
      .map((room) => ({
        id: room.id,
        title: room.title,
        area: room.area,
        landmark: room.landmark,
        rent: room.rent,
        photo: room.photo,
        href: `/rooms/${room.id}`,
        reasons: room.aiReasons,
      }));

    res.json({
      ok: true,
      mode: aiUsed ? "ai-assisted" : "fallback",
      intent,
      recommendations,
    });
  })
);

app.post(
  "/api/ai/site-helper",
  asyncHandler(async (req, res) => {
    const message = String(req.body.message || "").trim().slice(0, 500);
    if (!message) return res.status(400).json({ ok: false, error: "Message is required." });

    const rooms = await Room.find({ published: true }).sort({ createdAt: -1 }).limit(40);
    const roomFacts = rooms.map((room) => ({
      id: String(room._id),
      title: room.title,
      area: room.area,
      landmark: room.landmark,
      rent: room.rent,
      roomType: room.roomType,
      category: room.category,
      food: room.food,
      facilities: room.facilities || [],
      nearbyPlaces: room.nearbyPlaces || [],
      availability: room.availability,
    }));
    const fallback = buildSiteHelperFallback(message, rooms);

    if (!isAiConfigured()) {
      return res.json({ ok: true, mode: "fallback", ...fallback });
    }

    try {
      const ai = await requestAiJson([
        {
          role: "system",
          content: "You are Zac.Living's helpful Hinglish assistant for Bhopal student housing. Use only the provided room data. Do not show owner phone/address. Return JSON only: answer string, suggestions array of strings, roomIds array. Keep answer short and friendly.",
        },
        {
          role: "user",
          content: JSON.stringify({ message, rooms: roomFacts }),
        },
      ]);
      res.json({
        ok: true,
        mode: "ai",
        answer: ai?.answer || fallback.answer,
        suggestions: Array.isArray(ai?.suggestions) ? ai.suggestions.slice(0, 3) : fallback.suggestions,
        roomIds: Array.isArray(ai?.roomIds) ? ai.roomIds.slice(0, 3) : fallback.roomIds,
      });
    } catch (error) {
      console.error("AI site helper failed:", error.message);
      res.json({ ok: true, mode: "fallback", ...fallback });
    }
  })
);

app.get("/list-your-property", (req, res) => {
  res.render("rooms/partner_submit", { form: {}, error: null, success: null });
});

app.post(
  "/list-your-property",
  upload.array("propertyPhotos", 8),
  asyncHandler(async (req, res) => {
    const form = req.body.room || {};
    form.ownerContact = cleanPhone(form.ownerContact);
    const ownerPassword = String(req.body.ownerPassword || "").trim();

    if (!form.ownerName || !form.ownerContact || !form.area || !form.landmark || !form.rent || !form.roomType || !form.category || !form.food) {
      return res.status(400).render("rooms/partner_submit", { form, error: "Please fill the required fields: owner name, mobile, area, landmark, rent, category, room type, and food.", success: null });
    }
    if (!isValidMobileNumber(form.ownerContact)) {
      return res.status(400).render("rooms/partner_submit", { form, error: "Owner mobile number should be exactly 10 digits.", success: null });
    }
    if ((!req.currentUser || req.currentUser.role !== "owner") && ownerPassword.length < 6) {
      return res.status(400).render("rooms/partner_submit", { form, error: "Create a password of at least 6 characters to manage your property later.", success: null });
    }
    if (req.files && req.files.length && !isCloudinaryConfigured()) {
      return res.status(400).render("rooms/partner_submit", {
        form,
        error: "Photo upload is temporarily unavailable. Please paste photo links or submit without photos.",
        success: null,
      });
    }

    const uploadedPhotoUrls = await uploadListingPhotos(req.files || []);
    form.photos = [...normalizeUrls(form.photos), ...uploadedPhotoUrls].join("\n");
    form.title = form.title || `${form.category} ${form.roomType} ${form.food === "Yes" ? "PG" : "room"} near ${form.landmark}, ${form.area}`;
    form.deposit = form.deposit || 0;
    form.ownerAddress = form.ownerAddress || "Address to be completed by Zac team";
    form.availability = form.availability || "Available";
    form.facilities = mergeListInputs(form.facilitiesPreset, form.facilities).join("\n");
    form.nearbyPlaces = mergeListInputs(form.nearbyPreset, form.nearbyPlaces).join("\n");
    form.rules = mergeListInputs(form.rulesPreset, form.rules).join("\n");
    form.description = form.description || `${form.category} ${form.roomType} stay in ${form.area}, near ${form.landmark}. Suitable for students looking for clear room details and local access.`;

    let owner = req.currentUser && req.currentUser.role === "owner" ? req.currentUser : await User.findOne({ phone: form.ownerContact, role: "owner" });
    if (!owner) {
      owner = await User.create({
        role: "owner",
        name: form.ownerName,
        phone: form.ownerContact,
        password: await bcrypt.hash(ownerPassword, 12),
      });
    } else if (ownerPassword && isBcryptHash(owner.password)) {
      const isOwnerPasswordValid = await bcrypt.compare(ownerPassword, owner.password);
      if (!isOwnerPasswordValid) {
        return res.status(401).render("rooms/partner_submit", { form, error: "This owner mobile already has an account. Please use the correct password.", success: null });
      }
    }

    await Room.create({
      ...roomPayload({
        ...form,
        availability: form.availability || "Available",
        published: undefined,
      }),
      owner: owner._id,
      published: false,
      auditStatus: "Pending Zac Audit",
      submissionSource: "Partner Submission",
    });

    req.session.userId = owner._id;
    res.redirect("/owner/dashboard");
  })
);

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
    if (!isValidPersonName(form.name)) {
      return res.status(400).render("auth/signup", { error: "Name should contain only letters and spaces.", form });
    }
    if (!isValidMobileNumber(form.phone)) {
      return res.status(400).render("auth/signup", { error: "Mobile number should be exactly 10 digits.", form });
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
    if (!isValidMobileNumber(phone)) {
      return res.status(400).render("auth/login", {
        error: "Mobile number should be exactly 10 digits.",
        form: { phone },
      });
    }
    const user = await User.findOne({ phone, role: { $in: ["student", "owner"] } }).sort({ role: 1 });
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
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!isGmailAddress(email)) {
      return res.status(400).render("auth/admin-login", {
        error: "Please enter a valid Gmail address.",
        form: { email },
      });
    }
    const user = await User.findOne({ email, role: "admin" });
    const isPasswordValid = Boolean(user && (await bcrypt.compare(req.body.password, user.password)));

    if (!isPasswordValid) {
      return res.status(401).render("auth/admin-login", {
        error: "Invalid admin credentials.",
        form: { email },
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
  if (req.currentUser.role === "owner") return res.redirect("/owner/dashboard");
  res.redirect("/student/dashboard");
});

app.get(
  "/owner/dashboard",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const rooms = await Room.find({ owner: req.currentUser._id }).sort({ createdAt: -1 });
    res.render("dashboards/owner", {
      rooms: decorateRooms(rooms, req.currentUser),
      owner: req.currentUser,
    });
  })
);

app.get(
  "/owner/rooms/:id/edit",
  requireRole("owner"),
  asyncHandler(async (req, res, next) => {
    const room = await Room.findOne({ _id: req.params.id, owner: req.currentUser._id });
    if (!room) return next();
    res.render("rooms/owner_edit", { room: room.toObject(), error: null });
  })
);

app.put(
  "/owner/rooms/:id",
  requireRole("owner"),
  upload.array("propertyPhotos", 8),
  asyncHandler(async (req, res, next) => {
    const existing = await Room.findOne({ _id: req.params.id, owner: req.currentUser._id });
    if (!existing) return next();
    const form = req.body.room || {};
    form.ownerContact = cleanPhone(form.ownerContact || req.currentUser.phone);

    if (!form.title || !form.area || !form.landmark || !form.rent || !form.roomType || !form.category || !form.food || !form.ownerName || !form.ownerContact) {
      return res.status(400).render("rooms/owner_edit", { room: { ...existing.toObject(), ...form }, error: "Please fill title, area, landmark, rent, room type, category, food, owner name, and mobile." });
    }
    if (!isValidMobileNumber(form.ownerContact)) {
      return res.status(400).render("rooms/owner_edit", { room: { ...existing.toObject(), ...form }, error: "Owner mobile number should be exactly 10 digits." });
    }
    if (req.files && req.files.length && !isCloudinaryConfigured()) {
      return res.status(400).render("rooms/owner_edit", { room: { ...existing.toObject(), ...form }, error: "Photo upload is temporarily unavailable. Please paste photo links or submit without photos." });
    }

    const uploadedPhotoUrls = await uploadListingPhotos(req.files || []);
    form.photos = [...normalizeUrls(form.photos), ...uploadedPhotoUrls].join("\n");
    const payload = roomPayload({
      ...form,
      deposit: form.deposit || existing.deposit || 0,
      availability: form.availability || existing.availability || "Available",
      published: undefined,
      auditStatus: "Needs Owner Follow-up",
      submissionSource: "Partner Submission",
    });
    payload.published = false;
    payload.owner = req.currentUser._id;
    payload.auditStatus = "Needs Owner Follow-up";
    payload.submissionSource = "Partner Submission";
    await Room.findByIdAndUpdate(existing._id, payload, { runValidators: true });
    res.redirect("/owner/dashboard");
  })
);

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
    const profileForm = {
      name: String(req.body.name || "").trim(),
      phone: cleanPhone(req.body.phone),
    };
    if (!isValidPersonName(profileForm.name) || !isValidMobileNumber(profileForm.phone)) {
      const savedIds = req.currentUser.favorites.map((room) => room._id);
      const savedRoomsRaw = await Room.find({ _id: { $in: savedIds }, published: true });
      return res.status(400).render("profile", {
        user: { ...req.currentUser.toObject(), ...profileForm },
        savedRooms: decorateRooms(savedRoomsRaw, req.currentUser),
        error: !isValidPersonName(profileForm.name) ? "Name should contain only letters and spaces." : "Mobile number should be exactly 10 digits.",
      });
    }

    Object.assign(req.currentUser, {
      name: profileForm.name,
      phone: profileForm.phone,
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
    const filters = {
      search: (req.query.search || "").trim(),
      availability: req.query.availability || "",
      published: req.query.published || "",
      category: req.query.category || "",
    };
    const roomFilter = {};
    if (filters.availability) roomFilter.availability = filters.availability;
    if (filters.category) roomFilter.category = filters.category;
    if (filters.published === "published") roomFilter.published = true;
    if (filters.published === "hidden") roomFilter.published = false;
    if (filters.published === "pending") {
      roomFilter.published = false;
      roomFilter.auditStatus = "Pending Zac Audit";
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      roomFilter.$or = [
        { title: searchRegex },
        { area: searchRegex },
        { landmark: searchRegex },
        { ownerName: searchRegex },
        { ownerContact: searchRegex },
        { ownerAddress: searchRegex },
      ];
    }

    const [rawRooms, rawOwnerSubmissions, rawStudents, requests] = await Promise.all([
      Room.find(roomFilter).sort({ createdAt: -1 }),
      Room.find({ submissionSource: "Partner Submission", published: false }).sort({ createdAt: -1 }),
      User.find({ role: "student" }).sort({ createdAt: -1 }),
      VisitRequest.find({}).populate("room").populate("student").sort({ createdAt: -1 }),
    ]);
    const allRooms = await Room.find({});
    const rooms = decorateRooms(rawRooms, req.currentUser);
    const ownerSubmissions = decorateRooms(rawOwnerSubmissions, req.currentUser);
    const students = rawStudents.map((student) => {
      const bestMatch = decorateRooms(allRooms.filter((room) => room.published), student)[0];
      return {
        ...student.toObject(),
        id: String(student._id),
        bestMatch,
      };
    });

    res.render("dashboards/admin", {
      rooms,
      ownerSubmissions,
      students,
      filters,
      dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Not connected",
      stats: {
        totalRooms: allRooms.length,
        visibleRooms: rawRooms.length,
        publishedRooms: allRooms.filter((room) => room.published).length,
        availableRooms: allRooms.filter((room) => room.availability === "Available").length,
        studentCount: rawStudents.length,
        pendingRequests: requests.filter((request) => request.status === "Pending").length,
        pendingAuditRooms: allRooms.filter((room) => room.auditStatus === "Pending Zac Audit").length,
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
    if (req.body.auditStatus) update.auditStatus = req.body.auditStatus;
    if (update.published === true) update.auditStatus = "Zac Verified";
    if (update.published === false && !req.body.auditStatus) update.auditStatus = "Needs Owner Follow-up";
    const room = await Room.findByIdAndUpdate(req.params.id, update, { runValidators: true, new: true });
    if (!room) return next();
    res.redirect(req.get("Referrer") || "/admin");
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
    nearbyPlaces: normalizeList(body.nearbyPlaces),
    rules: normalizeList(body.rules),
    utilities: body.utilities || "",
    availability: body.availability,
    ownerName: body.ownerName || "",
    ownerContact: body.ownerContact,
    ownerAddress: body.ownerAddress || "",
    auditStatus: body.auditStatus || "Admin Added",
    submissionSource: body.submissionSource || "Admin",
    published: body.published === "on",
    videoUrl: body.videoUrl || "",
    photos: normalizeUrls(body.photos).length
      ? normalizeUrls(body.photos)
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
    if (!room.title || !room.area || !room.landmark || !room.rent || !room.deposit || !room.roomType || !room.category || !room.food || !room.availability || !room.ownerName || !room.ownerContact || !room.ownerAddress) {
      return res.status(400).render("rooms/form", { room, action: "/admin/rooms", title: "Add Listing", error: "Please fill all required admin listing fields." });
    }
    const createdRoom = await Room.create(roomPayload(room));
    appendListingToSheet(createdRoom).catch((error) => {
      console.error("Failed to save listing to Google Sheets:", error.message);
    });
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
    if (!room.title || !room.area || !room.landmark || !room.rent || !room.deposit || !room.roomType || !room.category || !room.food || !room.availability || !room.ownerName || !room.ownerContact || !room.ownerAddress) {
      return res.status(400).render("rooms/form", { room, action: `/admin/rooms/${req.params.id}?_method=put`, title: "Edit Listing", error: "Please fill all required admin listing fields." });
    }
    const payload = roomPayload(room);
    if (payload.published) payload.auditStatus = "Zac Verified";
    const updated = await Room.findByIdAndUpdate(req.params.id, payload, { runValidators: true });
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

async function connectDatabase() {
  await mongoose.connect(MONGO_URL, mongoOptions);
  await User.syncIndexes();
  await seedDatabase();
  console.log("MongoDB connected and Zac.Living seed data is ready.");
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Zac.Living is running on http://localhost:${PORT}`);
  });

  connectDatabase().catch((error) => {
    console.error("Failed to connect Zac.Living database:", error);
  });
}

startServer();
