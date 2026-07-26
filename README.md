# 🚀 Thakur Payal —  Portfolio

An interactive front-end developer portfolio designed as a journey through space. Scrolling controls the travel experience instead of moving a normal webpage, stars accelerate into warp speed, and technologies orbit the central **BUILD** planet.

The online version includes a PHP and MySQL contact system, so visitor messages are stored securely in a database rather than only on the local computer.

## Live experience

The portfolio contains:

- Fixed full-screen space environment
- Scroll-controlled section transitions
- Animated canvas starfield and warp effects
- Technology cards moving in elliptical orbits
- Gentle floating and depth animations
- Mouse-reactive headings and interface elements
- Centered active navigation
- Responsive desktop, tablet, and mobile layouts
- Keyboard navigation and reduced-motion support
- Downloadable resume
- PHP contact form with online MySQL storage

## Portfolio sections

| Section | Content |
|---|---|
| Home | Introduction and primary actions |
| About | Profile, education, location, and languages |
| Skills | Animated technology constellation |
| Focus | Web-development interests and strengths |
| Projects | Store and restaurant-management applications |
| Journey | Education and development timeline |
| Certificates | Certifications and achievements |
| Contact | Contact details and online message form |

## Technologies

**Front end:** HTML5, CSS3, JavaScript, Canvas API, responsive design, CSS animation  
**Back end:** PHP 8+, PDO, MySQL  
**Tools:** Visual Studio Code, Git, GitHub, XAMPP, phpMyAdmin

## Featured projects

### Store Application

A practical application for managing products, stock, prices, sales records, and customer billing. It demonstrates CRUD operations, structured data handling, and software-design fundamentals.

### Restaurant Order Management System

An academic application for menu management, order placement, bill calculation, and order-status tracking. It was developed to organize restaurant workflows and reduce manual work.

## Project structure

```text
portfolio/
├── index.html
├── style.css
├── script.js
├── save-response.php
├── config.example.php 
├── database.sql
├── .gitignore
├── README.md
└── assets/
    ├── Thakur-Payal-Resume.pdf
    └── favicon.svg
```

## Contact-form database

Valid submissions are inserted into the `portfolio_messages` table with:

- Visitor name
- Email address
- Subject
- Message
- UTC submission time
- Hashed IP value for rate limiting
- Browser user-agent information
- Form version

The endpoint includes:

- POST-only requests
- Server-side validation
- PDO prepared statements
- Honeypot spam protection
- Browser cooldown
- Per-IP hourly rate limiting
- Private database configuration
- Generic public error messages
- Automatic table creation

## Run locally

The visual website can be opened directly, but PHP and MySQL require a server.

### XAMPP

1. Place the folder inside `C:\xampp\htdocs\`.
2. Start Apache and MySQL.
3. Create a MySQL database.
4. Update `config.php` for the local database.
5. Open the website through `http://localhost/...`.

### PHP built-in server

```bash
php -S localhost:8000
```

A MySQL server must still be available and configured in `config.php`.

## Host it online

The recommended free setup for this project is **InfinityFree with MySQL** because the website requires PHP. GitHub Pages only serves the static part and cannot execute `save-response.php`.

Follow the complete guide in [DEPLOYMENT.md](DEPLOYMENT.md).

Deployment summary:

1. Create an InfinityFree hosting account.
2. Create a MySQL database in its control panel.
3. Enter the database credentials in `config.php`.
4. Upload the project contents into the lowercase `htdocs` folder.
5. Submit a test message.
6. Read saved messages from phpMyAdmin → `portfolio_messages`.

## GitHub repository

Repository:

```text
https://github.com/thakurPayal070/my-first-internship
```

Update the repository:

```bash
git add .
git commit -m "Add online MySQL contact form"
git branch -M main
git remote set-url origin https://github.com/thakurPayal070/my-first-internship.git
git push -u origin main
```

`config.php` is excluded by `.gitignore`. Never publish a real database password in GitHub.

## Contact

**Thakur Payal**

- Email: [tp4997181@gmail.com](mailto:tp4997181@gmail.com)
- LinkedIn: [thakur-khusboo](https://www.linkedin.com/in/thakur-khusboo/)
- GitHub: [@thakurPayal070](https://github.com/thakurPayal070)
- Location: Doiwala, Dehradun, Uttarakhand, India

## License

Created for personal portfolio and educational use. Please do not republish an unchanged copy using the same identity or personal information.

---

<div align="center">

### Designed and developed by Thakur Payal

**Exploring ideas, building solutions, and growing one project at a time.**

</div>
