require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const showRoutes = require('./routes/shows');


app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/shows', showRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database');
const router = express.Router();

const SECRET_KEY = "your_secret_key";

// Endpoint pour la connexion
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

module.exports = router;
const express = require('express');

const authRoutes = require('./routes/auth');




const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());

// Middleware pour vérifier le token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ error: "Access denied" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// Routes protégées
app.use('/shows', authenticate, showRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
