const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, getUserById } = require('../storage');

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.getSignup = (req, res) => {
    res.render('signup', { error: null });
};

exports.postSignup = async (req, res) => {
    try {
        const { name, email, password, role, adminId } = req.body;
        console.log('Signup Request:', { name, email, role });
        
        // Validate admin ID if role is Admin
        if (role === 'Admin') {
            if (!adminId || adminId !== '123456') {
                return res.render('signup', { error: 'Invalid Admin Unique ID' });
            }
        }
        
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            console.log('User already exists');
            return res.render('signup', { error: 'Email already registered' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await createUser({ name, email, password: hashed, role: role || 'Student' });
        console.log('User created:', newUser);
        res.redirect('/login');
    } catch (err) {
        console.error('Signup Error:', err);
        res.render('signup', { error: 'Error creating account' });
    }
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
        return res.render('login', { error: 'Invalid Credentials' });
    }
    if (!user.isActive) {
        return res.render('login', { error: 'Your account has been deactivated.' });
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET || 'secret123'
        );
        req.session.userId = user.id;

        // decide where to send user after login
        let redirectTo = '/';
        if (req.session.returnTo) {
            redirectTo = req.session.returnTo;
            delete req.session.returnTo;
        } else if (user.role === 'Admin') {
            redirectTo = '/admin/panel';
        }

        res.cookie('token', token).redirect(redirectTo);
    } else {
        res.render('login', { error: 'Invalid Credentials' });
    }
};

exports.getLogout = (req, res) => {
    // login logic uses a JWT stored in a cookie, so clearing the cookie
    // is the primary way to log out. The use of `req.session` seems inconsistent.
    // If you are using express-session for other features, it should be destroyed
    // asynchronously.
    if (req.session) {
        req.session.destroy(err => {
            // You can handle errors here, if any
            res.clearCookie('token').redirect('/');
        });
    } else {
        res.clearCookie('token').redirect('/');
    }
};

exports.getDashboard = async (req, res) => {
    const user = await getUserById(req.user.id);
    res.render('dashboard', { user });
};
