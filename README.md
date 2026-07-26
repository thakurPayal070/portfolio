#  Thakur Payal — Portfolio

A modern, interactive developer portfolio built with **HTML, CSS, JavaScript, PHP, and MySQL**.

The website presents portfolio content as a journey through space. Visitors move between fixed full-screen sections while stars accelerate, text reacts to mouse movement, and technical skills orbit like planets.

##  Live Demo

[View the live portfolio](https://thakurpayal.site.je/)

##  About Me

I am **Thakur Payal**, a Bachelor of Computer Applications student and aspiring web developer.

I enjoy creating responsive websites, interactive user interfaces, and practical software applications. My current skills include HTML, CSS, JavaScript, C, C++, Python, PHP, MySQL, and database management.

##  Features

- Full-screen space-themed interface
- Scroll-controlled section transitions
- Animated warp-speed starfield
- Fixed visual stage instead of normal page scrolling
- Mouse-responsive text and content
- Centered active navigation
- Orbiting technology elements
- Gentle floating animations
- Responsive desktop, tablet, and mobile design
- Projects, education, certificates, and contact sections
- Downloadable resume
- PHP contact form
- MySQL message storage
- Server-side validation
- Basic spam and rate-limit protection
- Keyboard navigation
- Reduced-motion accessibility support

##  Portfolio Sections

| Section | Description |
|---|---|
| **Home** | Introduction and primary actions |
| **About** | Personal background and development interests |
| **Skills** | Technologies displayed as an animated constellation |
| **Focus** | Current development interests and learning goals |
| **Projects** | Selected software and web projects |
| **Journey** | Education and development progress |
| **Certificates** | Certifications and achievements |
| **Contact** | Contact details and working message form |

##  Technologies

### Front End

- HTML5
- CSS3
- JavaScript
- Canvas API
- Responsive Web Design
- CSS animations and transitions

### Back End

- PHP 8+
- MySQL
- PDO
- Prepared SQL statements
- JSON responses for asynchronous form submission

### Tools

- Visual Studio Code
- Git
- GitHub
- Browser Developer Tools
- phpMyAdmin

##  Featured Projects

### Store Application

A store-management application designed to organize products, stock, sales, and customer billing.

**Main features:**

- Product entry and management
- Inventory updates
- Price calculations
- Customer billing
- Sales records
- CRUD operations

### Restaurant Order Management System

An academic software application created to improve restaurant order processing and reduce manual work.

**Main features:**

- Menu-item management
- Customer order placement
- Automatic bill calculation
- Order-status tracking
- Structured order-processing logic

##  Project Structure

```text
portfolio/
│
├── index.html
├── style.css
├── script.js
├── save-response.php
├── config.example.php
├── database.sql
├── README.md
├── .gitignore
│
└── assets/
    ├── Thakur-Payal-Resume.pdf
    └── favicon.svg
```

| File | Purpose |
|---|---|
| `index.html` | Website structure and portfolio content |
| `style.css` | Layout, responsiveness, and visual effects |
| `script.js` | Navigation, starfield, orbit animations, and form submission |
| `save-response.php` | Validates and stores contact messages |
| `config.example.php` | Example database configuration |
| `database.sql` | SQL structure for the messages table |
| `.gitignore` | Protects private configuration files |
| `assets/` | Resume, favicon, and static assets |

##  Local Setup

The visual website can be opened directly, but the contact form requires a PHP server and MySQL database.

### Requirements

- PHP 8 or newer
- MySQL 5.7+ or MySQL 8+
- PDO MySQL extension
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/thakurPayal070/portfolio.git
cd portfolio
```

### 2. Create the Private Configuration

Copy:

```text
config.example.php
```

Rename the copy to:

```text
config.php
```

Update the database values:

```php
'database' => [
    'host' => 'YOUR_DATABASE_HOST',
    'port' => 3306,
    'name' => 'YOUR_DATABASE_NAME',
    'username' => 'YOUR_DATABASE_USERNAME',
    'password' => 'YOUR_DATABASE_PASSWORD',
    'charset' => 'utf8mb4',
],
```

Replace the security key with a long random value:

```php
'ip_hash_key' => 'YOUR_LONG_RANDOM_SECRET',
```

> Never commit `config.php` to a public repository.

### 3. Create the Database Table

Import `database.sql` using phpMyAdmin or MySQL:

```bash
mysql -u YOUR_USERNAME -p YOUR_DATABASE_NAME < database.sql
```

The contact endpoint may also create the required table automatically if the database user has permission to create tables.

### 4. Start the PHP Server

Run this command inside the project folder:

```bash
php -S localhost:8000
```

Open:

```text
http://localhost:8000
```

## 📬 Contact Form

The contact form sends visitor messages to:

```text
save-response.php
```

JavaScript submits the form asynchronously, so the page does not reload.

Saved records include:

- Public response ID
- Name
- Email
- Subject
- Message
- Submission date and time
- Hashed IP information
- User-agent information
- Form version

### Protection Included

- POST-only submissions
- Required-field validation
- Email validation
- Maximum field lengths
- Prepared database queries
- Honeypot bot protection
- Browser cooldown
- Submission rate limiting
- Hashed IP storage

##  Security Notes

- Keep `config.php` private.
- Never publish database credentials.
- Use a unique database password.
- Replace the default hashing key.
- Use HTTPS on the deployed website.
- Limit database permissions where possible.
- Do not commit message exports to GitHub.

Recommended `.gitignore` entries:

```gitignore
config.php
.env
data/contact-responses.jsonl
.vscode/
.idea/
.DS_Store
Thumbs.db
```

##  Deployment Requirements

The complete website requires a server with:

- PHP 8+
- MySQL
- PDO MySQL
- HTTPS
- PHP file execution
- Database access

Upload these runtime files:

```text
index.html
style.css
script.js
save-response.php
config.php
assets/
```

After deployment:

1. Open the website.
2. Navigate to Contact.
3. Submit a test message.
4. Confirm that a success message appears.
5. Check the `portfolio_messages` table.

##  Navigation

Visitors can move through the portfolio using:

- Mouse wheel or trackpad
- Navigation links
- Arrow Up and Arrow Down
- Page Up and Page Down
- Home and End keys
- Mouse movement for foreground effects

##  Responsive Design

The portfolio is optimized for:

- Desktop computers
- Laptops
- Tablets
- Mobile phones

##  Customization

### Change Portfolio Content

Edit:

```text
index.html
```

### Change Design

Edit:

```text
style.css
```

### Change Star Density

Inside `script.js`:

```javascript
const STAR_COUNT_DESKTOP = 760;
const STAR_COUNT_MOBILE = 390;
```

### Change Orbit Movement

Edit the orbit profiles:

```javascript
{
  radiusX: 0.425,
  radiusY: 0.305,
  duration: 30000,
  direction: 1,
  bob: 4.5
}
```

- `radiusX` controls orbit width.
- `radiusY` controls orbit height.
- `duration` controls speed.
- `direction` controls movement direction.
- `bob` controls vertical floating distance.

##  Future Improvements

- Project screenshots
- Live links for individual projects
- GitHub links for each project
- Admin dashboard for reviewing messages
- Email notifications
- Message filtering
- More space objects and animations
- Project filtering by technology
- Additional accessibility controls

##  Contact

**Thakur Payal**

- **Email:** [tp4997181@gmail.com](mailto:tp4997181@gmail.com)
- **LinkedIn:** [Thakur Payal](https://www.linkedin.com/in/thakurpayal/)
- **GitHub:** [@thakurPayal070](https://github.com/thakurPayal070)
- **Location:** Doiwala, Dehradun, Uttarakhand, India

##  License

This project is intended for personal portfolio and educational use.

You may study and adapt the code for learning purposes. Replace the personal details, resume, and project content before publishing your own version.

---

<div align="center">

### Designed and developed by Thakur Payal

**Building creative interfaces and practical software solutions.**

 Consider starring the repository if you find the project helpful.

</div>
