// ============================================================
//  content.js  —  ALL course content lives here
//  To add a new topic: append a new object to the TOPICS array.
//  No other file needs to change.
// ============================================================

const TOPICS = [
  // ─────────────────────────────────────────────────────────
  //  TOPIC 1: Git Basics
  // ─────────────────────────────────────────────────────────
  {
    id: "git-basics",
    title: "Git Basics",
    icon: "🔀",
    color: "#7c3aed",          // accent color for this topic card
    description: "Learn the fundamentals of version control with Git — track changes, collaborate with others, and manage your codebase like a pro.",
    difficulty: "Beginner",
    estimatedTime: "25 min",
    tags: ["DevOps", "Tools"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is Version Control?",
        content: `
          <p>Imagine you're writing an essay and you keep saving copies like <code>essay_v1.doc</code>, <code>essay_v2.doc</code>, <code>essay_FINAL.doc</code>, <code>essay_FINAL_v2.doc</code>... 😅 That's manual version control — and it's messy.</p>
          <p><strong>Version control</strong> is a system that tracks changes to files over time, so you can:</p>
          <ul>
            <li>📂 See <em>what</em> changed, <em>when</em>, and <em>who</em> made the change</li>
            <li>⏪ Revert to any earlier version instantly</li>
            <li>🤝 Work with a team without overwriting each other's work</li>
            <li>🌿 Experiment safely in separate "branches" without breaking the main code</li>
          </ul>
          <div class="callout callout-info">
            <strong>💡 Think of it like Google Docs history</strong> — but for code, and incredibly powerful.
          </div>
          <h3>Why Git Specifically?</h3>
          <p>Git is the most widely used version control system in the world. Created by <strong>Linus Torvalds</strong> (the same person who created Linux) in 2005, it's fast, distributed, and free.</p>
          <p><strong>Distributed</strong> means every developer has the full history of the project on their own computer — not just the latest snapshot. This makes Git resilient and great for offline work.</p>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Git vs GitHub — Not the Same Thing!",
        content: `
          <p>One of the most common beginner confusions is treating Git and GitHub as the same thing. They're not!</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Git</th><th>GitHub</th></tr></thead>
              <tbody>
                <tr><td>A tool installed on your computer</td><td>A website / cloud service</td></tr>
                <tr><td>Tracks versions locally</td><td>Hosts your Git repos online</td></tr>
                <tr><td>Works without the internet</td><td>Requires an internet connection</td></tr>
                <tr><td>Free and open source</td><td>Free tier + paid plans</td></tr>
                <tr><td>Command-line tool</td><td>Web UI + integrations</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Analogy:</strong> Git is like a camera that takes photos. GitHub is like Instagram — a place to share and store those photos online. You can use the camera without Instagram, but sharing is easier with it.
          </div>
          <p>Other platforms like <strong>GitLab</strong> and <strong>Bitbucket</strong> serve a similar purpose to GitHub. Git works with all of them.</p>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What does 'distributed' mean in the context of Git?",
            options: [
              "The code is split across multiple files",
              "Every developer has the full project history locally",
              "Git is distributed for free",
              "The team is distributed across time zones"
            ],
            answer: 1,
            explanation: "In a distributed system, everyone has the complete repository — including all history — on their own machine. This makes Git fast and resilient."
          },
          {
            q: "Which of these statements is TRUE?",
            options: [
              "Git and GitHub are the same thing",
              "You need GitHub to use Git",
              "Git is a tool; GitHub is a hosting platform",
              "GitHub created Git"
            ],
            answer: 2,
            explanation: "Git is the version control tool (created by Linus Torvalds), while GitHub is one of many platforms that host Git repositories online."
          },
          {
            q: "What was one major problem with saving files like 'essay_FINAL_v2.doc'?",
            options: [
              "Files take up too much space",
              "It's hard to know what changed between versions",
              "You can't share those files",
              "Filenames can't contain underscores"
            ],
            answer: 1,
            explanation: "Manual version naming gives you snapshots but no easy way to see exactly what changed, who changed it, or why. Git solves all of this."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Core Git Commands",
        content: `
          <p>Let's walk through the essential Git workflow, command by command.</p>
          <h3>🚀 Starting a Repository</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git init</code></pre>
          </div>
          <p>This creates a hidden <code>.git</code> folder in your project — that's where Git stores the entire history. Run this once per project.</p>
          <h3>📸 The Three-Stage Workflow</h3>
          <p>Every change in Git goes through 3 stages:</p>
          <div class="stages">
            <div class="stage"><span class="stage-num">1</span><strong>Working Directory</strong><br>Files you're editing right now</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">2</span><strong>Staging Area</strong><br>Changes you've selected to save</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">3</span><strong>Repository</strong><br>Permanently saved snapshots</div>
          </div>
          <h3>📋 Stage & Save Changes</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git add filename.txt   # stage a specific file
git add .             # stage ALL changed files
git commit -m "Add login page"  # save snapshot with a message</code></pre>
          </div>
          <h3>☁️ Sync with Remote</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git remote add origin https://github.com/you/repo.git
git push origin main   # upload your commits to GitHub</code></pre>
          </div>
          <h3>📥 Get Others' Changes</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git pull origin main   # download and merge latest changes</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>💡 Pro tip:</strong> Run <code>git status</code> anytime to see what's changed, what's staged, and what's not tracked yet.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Branching & Merging",
        content: `
          <p>Branches are one of Git's superpowers. They let you work on new features or fixes in <strong>complete isolation</strong> from your stable code.</p>
          <h3>🌿 Creating & Switching Branches</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git branch feature/login    # create a new branch
git checkout feature/login  # switch to it
# or shortcut:
git checkout -b feature/login</code></pre>
          </div>
          <p>Now any commits you make only go on <code>feature/login</code>. Your <code>main</code> branch stays clean and untouched.</p>
          <h3>🔗 Merging Back</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git checkout main           # go back to main
git merge feature/login     # bring in the feature</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>🌳 A typical branching strategy:</strong><br>
            <code>main</code> → always deployable, production-ready<br>
            <code>develop</code> → integration branch for features<br>
            <code>feature/xyz</code> → one branch per feature/fix
          </div>
          <h3>🗑️ Cleanup</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>git branch -d feature/login  # delete branch after merging</code></pre>
          </div>
          <p>Think of branches like parallel timelines — you can jump between them freely and merge them back when ready.</p>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — Git Basics",
        questions: [
          {
            q: "What does 'git add .' do?",
            options: [
              "Creates a new repository",
              "Stages all changed files for the next commit",
              "Commits all changes immediately",
              "Downloads files from GitHub"
            ],
            answer: 1,
            explanation: "'git add .' stages all modified and new files in the current directory. It moves changes from the Working Directory to the Staging Area."
          },
          {
            q: "You want to start a new feature without affecting the main branch. What should you do?",
            options: [
              "Edit files directly in main and be careful",
              "Create a new Git repository",
              "Create a new branch for the feature",
              "Clone the repository again"
            ],
            answer: 2,
            explanation: "Branches are designed exactly for this! Create a feature branch, do your work there, and merge it back when ready."
          },
          {
            q: "What is the correct order of the Git three-stage workflow?",
            options: [
              "Commit → Stage → Edit",
              "Edit → Commit → Stage",
              "Stage → Edit → Commit",
              "Edit → Stage → Commit"
            ],
            answer: 3,
            explanation: "You first Edit files in the working directory, then Stage the changes you want (git add), then Commit them as a snapshot (git commit)."
          },
          {
            q: "Which command downloads the latest changes from the remote repository?",
            options: [
              "git push",
              "git fetch",
              "git pull",
              "git clone"
            ],
            answer: 2,
            explanation: "'git pull' fetches the latest changes from the remote and immediately merges them into your current branch. git push does the opposite — it uploads your commits."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 2: JavaScript Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "js-fundamentals",
    title: "JavaScript Fundamentals",
    icon: "⚡",
    color: "#d97706",
    description: "Understand the building blocks of JavaScript — the language that powers the web. Start from scratch and build real understanding.",
    difficulty: "Beginner",
    estimatedTime: "30 min",
    tags: ["Programming", "Web Dev"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is JavaScript?",
        content: `
          <p>The web is built on three core technologies, each with a distinct job:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Technology</th><th>Role</th><th>Analogy</th></tr></thead>
              <tbody>
                <tr><td><strong>HTML</strong></td><td>Structure & content</td><td>The skeleton 🦴</td></tr>
                <tr><td><strong>CSS</strong></td><td>Style & layout</td><td>The skin & clothes 👗</td></tr>
                <tr><td><strong>JavaScript</strong></td><td>Behaviour & logic</td><td>The muscles & brain 🧠</td></tr>
              </tbody>
            </table>
          </div>
          <p>JavaScript is what makes a page <em>interactive</em> — it responds to clicks, fetches data, validates forms, animates elements, and much more.</p>
          <h3>Where does JS run?</h3>
          <ul>
            <li><strong>Browser</strong> — every modern browser has a JS engine (Chrome uses V8, Firefox uses SpiderMonkey)</li>
            <li><strong>Server</strong> — with Node.js, JavaScript runs on the backend too</li>
            <li><strong>Mobile, Desktop, embedded</strong> — JS is everywhere today</li>
          </ul>
          <div class="callout callout-info">
            <strong>🚫 Not Java!</strong> JavaScript and Java are completely different languages. The name was a marketing decision in 1995. Don't let it confuse you.
          </div>
          <h3>Your first JavaScript</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>console.log("Hello, World!");</code></pre>
          </div>
          <p>Open your browser's DevTools (F12 → Console tab) and type this. You'll see <code>Hello, World!</code> printed. That's JavaScript running live in your browser!</p>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Variables & Data Types",
        content: `
          <p>Variables are containers that store data. In modern JavaScript we use <code>let</code> and <code>const</code>:</p>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>let age = 25;              // can be changed later
const name = "Ravi";       // cannot be reassigned
const PI = 3.14159;

age = 26;   // ✅ allowed (let)
name = "Kumar";  // ❌ TypeError! (const)</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Rule of thumb:</strong> Always use <code>const</code> by default. Only switch to <code>let</code> if you know the value will change. Avoid <code>var</code> (the old way — has tricky scoping bugs).
          </div>
          <h3>The 7 Primitive Data Types</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>const num = 42;              // Number (integers AND decimals)
const price = 9.99;          // Number
const greeting = "Hello";   // String
const isOnline = true;       // Boolean
const nothing = null;        // Null (intentional empty value)
let notSet;                  // Undefined (variable declared, no value yet)
const id = Symbol("uid");    // Symbol (unique identifier)</code></pre>
          </div>
          <h3>typeof — check the type</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>typeof 42           // "number"
typeof "hello"      // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object"  ← famous JS quirk! 🐛</code></pre>
          </div>
          <p>The <code>typeof null === "object"</code> result is a well-known historical bug in JavaScript that was never fixed to preserve backward compatibility.</p>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What is the role of JavaScript in a web page?",
            options: [
              "Defines the page structure",
              "Styles elements with colours and layout",
              "Adds interactivity and behaviour",
              "Stores data in a database"
            ],
            answer: 2,
            explanation: "HTML = structure, CSS = style, JavaScript = behaviour. JS makes pages interactive — responding to clicks, fetching data, animating elements, etc."
          },
          {
            q: "Which of these correctly declares a constant in modern JavaScript?",
            options: [
              "var name = 'Ravi'",
              "let name = 'Ravi'",
              "const name = 'Ravi'",
              "constant name = 'Ravi'"
            ],
            answer: 2,
            explanation: "'const' declares a constant — a variable that cannot be reassigned after declaration. It's the preferred way to declare variables that won't change."
          },
          {
            q: "What does typeof null return in JavaScript?",
            options: [
              "\"null\"",
              "\"undefined\"",
              "\"object\"",
              "\"boolean\""
            ],
            answer: 2,
            explanation: "typeof null === 'object' is a famous historical bug in JavaScript. null is not actually an object — this was a mistake in the original implementation that was kept for backward compatibility."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Functions",
        content: `
          <p>Functions are reusable blocks of code that perform a specific task. Instead of writing the same logic 10 times, you write it once and call it whenever you need it.</p>
          <h3>3 Ways to Write Functions</h3>
          <div class="code-block">
            <div class="code-label">JavaScript — Function Declaration</div>
            <pre><code>function greet(name) {
  return "Hello, " + name + "!";
}
greet("Ravi");  // "Hello, Ravi!"</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">JavaScript — Function Expression</div>
            <pre><code>const greet = function(name) {
  return "Hello, " + name + "!";
};</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">JavaScript — Arrow Function (modern, preferred)</div>
            <pre><code>const greet = (name) => "Hello, " + name + "!";

// Multi-line arrow function
const add = (a, b) => {
  const result = a + b;
  return result;
};</code></pre>
          </div>
          <h3>Parameters vs Arguments</h3>
          <p><strong>Parameters</strong> are the names in the function definition (<code>name</code>). <strong>Arguments</strong> are the actual values passed when calling it (<code>"Ravi"</code>).</p>
          <h3>Default Parameters</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>const greet = (name = "stranger") => "Hello, " + name + "!";

greet("Ravi");   // "Hello, Ravi!"
greet();         // "Hello, stranger!"</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>🔑 Key point:</strong> Functions that don't have a <code>return</code> statement automatically return <code>undefined</code>.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Control Flow — if/else & Loops",
        content: `
          <p>Control flow lets your code make decisions and repeat actions.</p>
          <h3>🔀 Conditionals</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>const score = 85;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 80) {
  console.log("Grade: B");   // ← this runs
} else if (score >= 70) {
  console.log("Grade: C");
} else {
  console.log("Grade: D or below");
}</code></pre>
          </div>
          <h3>🔁 Loops</h3>
          <div class="code-block">
            <div class="code-label">JavaScript — for loop</div>
            <pre><code>for (let i = 0; i < 5; i++) {
  console.log("Count:", i);   // 0, 1, 2, 3, 4
}</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">JavaScript — forEach (array) — preferred modern style</div>
            <pre><code>const fruits = ["apple", "banana", "cherry"];

fruits.forEach((fruit) => {
  console.log(fruit);
});</code></pre>
          </div>
          <h3>⚠️ == vs ===</h3>
          <p>This trips up most beginners — always use <strong>strict equality</strong> <code>===</code>:</p>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>5 == "5"    // true  (loose — converts types first 😱)
5 === "5"   // false (strict — checks type AND value ✅)

null == undefined   // true  (loose)
null === undefined  // false (strict)</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Golden rule:</strong> Always use <code>===</code> (triple equals) for comparisons. Avoid <code>==</code> entirely to prevent subtle bugs.
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — JS Fundamentals",
        questions: [
          {
            q: "What will this code print?\n\nconst add = (a, b) => a + b;\nconsole.log(add(3, 4));",
            options: [
              "undefined",
              "34",
              "7",
              "Error"
            ],
            answer: 2,
            explanation: "This is an arrow function that returns 'a + b'. Since a=3 and b=4, it returns 7. Arrow functions with a single expression implicitly return that value."
          },
          {
            q: "What is the difference between == and === in JavaScript?",
            options: [
              "They are identical — both check type and value",
              "== is strict (checks type+value), === is loose (converts types)",
              "=== is strict (checks type+value), == is loose (converts types)",
              "=== only works for numbers"
            ],
            answer: 2,
            explanation: "=== (strict equality) checks both type and value. == (loose equality) converts types before comparing, which can cause unexpected results. Always prefer ===."
          },
          {
            q: "What does the following print?\n\nconst greet = (name = 'World') => 'Hello, ' + name;\nconsole.log(greet());",
            options: [
              "Hello, undefined",
              "Hello, World",
              "Hello, name",
              "Error: name is not defined"
            ],
            answer: 1,
            explanation: "When no argument is passed, the default parameter 'World' is used. So greet() returns 'Hello, World'."
          },
          {
            q: "Which loop style is preferred in modern JavaScript for iterating over arrays?",
            options: [
              "while loop",
              "do...while loop",
              "classic for loop with index",
              "forEach with an arrow function"
            ],
            answer: 3,
            explanation: "forEach with an arrow function is the modern, readable preference for iterating array items. It's declarative — you describe 'what to do with each item', not 'how to iterate'."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 3: Python Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "python-fundamentals",
    title: "Python Fundamentals",
    icon: "🐍",
    color: "#16a34a",
    description: "Discover Python — the world's most beginner-friendly programming language. From variables to functions, build a solid foundation for data science, automation, and beyond.",
    difficulty: "Beginner",
    estimatedTime: "30 min",
    tags: ["Programming", "Python"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is Python?",
        content: `
          <p>Python is one of the most popular programming languages in the world — and for good reason. It reads almost like plain English, making it perfect for beginners while remaining powerful enough for experts.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Use Case</th><th>Examples</th></tr></thead>
              <tbody>
                <tr><td>🌐 Web Development</td><td>Django, Flask, FastAPI</td></tr>
                <tr><td>📊 Data Science & AI</td><td>NumPy, Pandas, TensorFlow</td></tr>
                <tr><td>🤖 Automation & Scripting</td><td>File handling, web scraping</td></tr>
                <tr><td>🎮 Game Development</td><td>Pygame</td></tr>
                <tr><td>🔬 Scientific Computing</td><td>SciPy, Matplotlib</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Why Python?</h3>
          <ul>
            <li>✅ <strong>Readable syntax</strong> — less boilerplate, more clarity</li>
            <li>✅ <strong>Huge ecosystem</strong> — hundreds of thousands of libraries</li>
            <li>✅ <strong>Cross-platform</strong> — runs on Windows, Mac, Linux</li>
            <li>✅ <strong>Interpreted</strong> — run code line by line without compiling</li>
          </ul>
          <h3>Your first Python program</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>print("Hello, World!")</code></pre>
          </div>
          <p>That's it — just one line! No semicolons. No curly braces. No boilerplate. Python uses <strong>indentation</strong> (spaces) instead of braces to define code blocks.</p>
          <div class="callout callout-info">
            <strong>🐍 Fun fact:</strong> Python is named after the British comedy group <em>Monty Python</em>, not the snake — though the snake logo became iconic anyway!
          </div>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Variables & Data Types",
        content: `
          <p>In Python, you don't need to declare the type of a variable — Python figures it out automatically. This is called <strong>dynamic typing</strong>.</p>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>name = "Ravi"          # str  (text)
age = 28               # int  (whole number)
height = 5.11          # float (decimal)
is_active = True       # bool (True or False)
scores = [95, 87, 92]  # list (ordered collection)
person = {"city": "Bengaluru", "lang": "Python"}  # dict</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Note:</strong> Python is <em>case-sensitive</em>. <code>True</code> and <code>False</code> must be capitalised — <code>true</code> will cause an error!
          </div>
          <h3>Checking Types</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>print(type("hello"))    # &lt;class 'str'&gt;
print(type(42))         # &lt;class 'int'&gt;
print(type(3.14))       # &lt;class 'float'&gt;
print(type(True))       # &lt;class 'bool'&gt;</code></pre>
          </div>
          <h3>String Operations</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>first = "Hello"
second = "World"
combined = first + " " + second   # "Hello World"

# f-strings (modern, preferred)
name = "Ravi"
greeting = f"Hello, {name}! You are {age} years old."
print(greeting)  # Hello, Ravi! You are 28 years old.</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>💡 f-strings</strong> (formatted strings) are the modern way to embed variables inside text in Python. Prefix the string with <code>f</code> and use <code>{variable}</code> inside.
          </div>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What will print(type(3.14)) output in Python?",
            options: [
              "<class 'int'>",
              "<class 'number'>",
              "<class 'float'>",
              "<class 'decimal'>"
            ],
            answer: 2,
            explanation: "3.14 is a floating-point number in Python, so type() returns <class 'float'>. Python distinguishes between int (whole numbers) and float (decimals)."
          },
          {
            q: "Which of these correctly creates an f-string in Python?",
            options: [
              "\"Hello, ${name}\"",
              "f\"Hello, {name}\"",
              "\"Hello, \" + {name}",
              "format(\"Hello, name\")"
            ],
            answer: 1,
            explanation: "f-strings are created by prefixing a string with 'f' and placing variable names inside curly braces {}. They are the modern, preferred way to format strings in Python 3.6+."
          },
          {
            q: "What is 'dynamic typing' in Python?",
            options: [
              "Variables can change their value frequently",
              "Python automatically determines a variable's type based on its value",
              "You must declare the type before using a variable",
              "Types are checked at compile time"
            ],
            answer: 1,
            explanation: "Dynamic typing means Python infers the type of a variable from the value assigned to it. You don't write 'int age = 28' — just 'age = 28' and Python knows it's an int."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Functions",
        content: `
          <p>Functions let you write a block of code once and reuse it many times. Python functions are defined with the <code>def</code> keyword.</p>
          <div class="code-block">
            <div class="code-label">Python — Basic Function</div>
            <pre><code>def greet(name):
    return f"Hello, {name}!"

print(greet("Ravi"))    # Hello, Ravi!
print(greet("World"))   # Hello, World!</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>⚠️ Indentation matters!</strong> Python uses 4 spaces of indentation to define code blocks. Unlike JavaScript (which uses <code>{}</code>), getting the indentation wrong causes a <code>IndentationError</code>.
          </div>
          <h3>Default Parameters</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>def greet(name="stranger"):
    return f"Hello, {name}!"

print(greet("Ravi"))  # Hello, Ravi!
print(greet())        # Hello, stranger!</code></pre>
          </div>
          <h3>Multiple Return Values</h3>
          <p>Python functions can return multiple values at once — a feature not available in most other languages:</p>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>def min_max(numbers):
    return min(numbers), max(numbers)

lowest, highest = min_max([3, 1, 7, 2, 9])
print(lowest)   # 1
print(highest)  # 9</code></pre>
          </div>
          <h3>Lambda Functions</h3>
          <p>For short, one-liner functions, Python has <strong>lambda</strong> expressions:</p>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>square = lambda x: x ** 2
print(square(5))   # 25

double = lambda x: x * 2
print(double(7))   # 14</code></pre>
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Control Flow — if/else & Loops",
        content: `
          <p>Control flow in Python is clean and readable — no parentheses required around conditions, and no curly braces.</p>
          <h3>🔀 Conditionals</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")   # ← this runs
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: D or below")</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Note:</strong> Python uses <code>elif</code> (not <code>else if</code>) for chained conditions. Don't forget the <strong>colons</strong> — they end every condition/loop header.
          </div>
          <h3>🔁 Loops</h3>
          <div class="code-block">
            <div class="code-label">Python — for loop</div>
            <pre><code>fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)   # apple, banana, cherry</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">Python — range loop</div>
            <pre><code>for i in range(5):
    print(i)   # 0, 1, 2, 3, 4

# range(start, stop, step)
for i in range(0, 10, 2):
    print(i)   # 0, 2, 4, 6, 8</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">Python — while loop</div>
            <pre><code>count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1   # 0, 1, 2</code></pre>
          </div>
          <h3>List Comprehensions — Python's Secret Weapon 🚀</h3>
          <p>Python has a powerful one-liner syntax for creating lists:</p>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code># Traditional way
squares = []
for x in range(5):
    squares.append(x ** 2)

# List comprehension — same result, one line!
squares = [x ** 2 for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
print(evens)    # [0, 2, 4, 6, 8]</code></pre>
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — Python Fundamentals",
        questions: [
          {
            q: "What keyword does Python use to define a function?",
            options: [
              "function",
              "func",
              "def",
              "fn"
            ],
            answer: 2,
            explanation: "Python uses the 'def' keyword to define functions, followed by the function name, parameters in parentheses, and a colon. The function body is indented."
          },
          {
            q: "What will this code print?\n\nfor i in range(2, 8, 2):\n    print(i)",
            options: [
              "2 4 6 8",
              "2 4 6",
              "0 2 4 6",
              "2 3 4 5 6 7"
            ],
            answer: 1,
            explanation: "range(2, 8, 2) starts at 2, stops before 8, stepping by 2. So it produces: 2, 4, 6. The stop value (8) is excluded."
          },
          {
            q: "Which of these is a valid Python list comprehension?",
            options: [
              "[x * 2 from x in range(5)]",
              "{x * 2 for x in range(5)}",
              "[x * 2 for x in range(5)]",
              "(x * 2 for x in range(5)).toList()"
            ],
            answer: 2,
            explanation: "A list comprehension uses square brackets [] with the expression first, then 'for item in iterable'. Option B creates a set, not a list. The syntax is: [expression for item in iterable]."
          },
          {
            q: "What is the output of this code?\n\ndef add(a, b=10):\n    return a + b\n\nprint(add(5))",
            options: [
              "Error: missing argument",
              "5",
              "10",
              "15"
            ],
            answer: 3,
            explanation: "b has a default value of 10. When add(5) is called, a=5 and b=10 (the default). So a + b = 5 + 10 = 15."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 4: DevOps Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "devops-fundamentals",
    title: "DevOps Fundamentals",
    icon: "⚙️",
    color: "#0891b2",
    description: "Bridge the gap between development and operations. Learn CI/CD pipelines, containers, infrastructure as code, and the culture that makes modern software delivery fast and reliable.",
    difficulty: "Intermediate",
    estimatedTime: "35 min",
    tags: ["DevOps", "Cloud", "Tools"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is DevOps?",
        content: `
          <p>DevOps is a <strong>culture and set of practices</strong> that brings development (Dev) and operations (Ops) teams together to deliver software faster, more reliably, and more securely.</p>
          <div class="callout callout-info">
            <strong>🧠 Core idea:</strong> Instead of developers throwing code "over the wall" to ops teams, everyone owns the full lifecycle — from writing code to running it in production.
          </div>
          <h3>The Old Way vs the DevOps Way</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Traditional</th><th>DevOps</th></tr></thead>
              <tbody>
                <tr><td>Dev and Ops in silos</td><td>Shared ownership of delivery</td></tr>
                <tr><td>Long release cycles (months)</td><td>Continuous delivery (daily/hourly)</td></tr>
                <tr><td>Manual testing & deployment</td><td>Automated pipelines</td></tr>
                <tr><td>Ops manages servers manually</td><td>Infrastructure as Code</td></tr>
                <tr><td>Blame culture</td><td>Blameless post-mortems</td></tr>
              </tbody>
            </table>
          </div>
          <h3>The DevOps Infinity Loop</h3>
          <p>DevOps is often visualised as an infinite loop covering 8 phases:</p>
          <div class="stages">
            <div class="stage"><span class="stage-num">1</span><strong>Plan</strong><br>Roadmap & backlog</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">2</span><strong>Code</strong><br>Write & review</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">3</span><strong>Build</strong><br>Compile & package</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">4</span><strong>Test</strong><br>Automated checks</div>
          </div>
          <div class="stages" style="margin-top:8px">
            <div class="stage"><span class="stage-num">5</span><strong>Release</strong><br>Approve & tag</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">6</span><strong>Deploy</strong><br>Push to production</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">7</span><strong>Operate</strong><br>Run & scale</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">8</span><strong>Monitor</strong><br>Observe & alert</div>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Key metric:</strong> <strong>DORA metrics</strong> (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) are the industry-standard way to measure DevOps performance.
          </div>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "CI/CD Pipelines",
        content: `
          <p><strong>CI/CD</strong> (Continuous Integration / Continuous Delivery) is the backbone of modern software delivery. It replaces slow, error-prone manual processes with automated pipelines.</p>
          <h3>🔄 Continuous Integration (CI)</h3>
          <p>Every time a developer pushes code, CI automatically:</p>
          <ul>
            <li>🏗️ <strong>Builds</strong> the application</li>
            <li>🧪 <strong>Runs tests</strong> (unit, integration, lint)</li>
            <li>📊 <strong>Reports results</strong> back to the developer immediately</li>
          </ul>
          <div class="callout callout-info">
            <strong>💡 Why CI matters:</strong> Catching bugs the moment they're introduced is 10× cheaper than finding them weeks later in production. CI creates a tight feedback loop.
          </div>
          <h3>🚀 Continuous Delivery (CD)</h3>
          <p>CD extends CI — after tests pass, the pipeline automatically <strong>deploys</strong> the code to staging (and optionally, production).</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><strong>CI</strong></td><td>Auto-build + auto-test on every push</td></tr>
                <tr><td><strong>Continuous Delivery</strong></td><td>Auto-deploy to staging; manual approval for production</td></tr>
                <tr><td><strong>Continuous Deployment</strong></td><td>Fully automated — code goes to production without human approval</td></tr>
              </tbody>
            </table>
          </div>
          <h3>📋 A Typical CI/CD Pipeline</h3>
          <div class="code-block">
            <div class="code-label">GitHub Actions — .github/workflows/deploy.yml</div>
            <pre><code>name: CI/CD Pipeline

on: [push]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to production
        run: ./deploy.sh</code></pre>
          </div>
          <p>Popular CI/CD tools: <strong>GitHub Actions</strong>, <strong>GitLab CI</strong>, <strong>Jenkins</strong>, <strong>CircleCI</strong>, <strong>ArgoCD</strong>.</p>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What does 'CI' stand for and what does it primarily automate?",
            options: [
              "Code Integration — merging branches manually",
              "Continuous Integration — automatically building and testing code on every push",
              "Cloud Infrastructure — provisioning servers automatically",
              "Container Images — building Docker images"
            ],
            answer: 1,
            explanation: "CI stands for Continuous Integration. It automatically builds and tests code every time a developer pushes a change, catching bugs early in the development cycle."
          },
          {
            q: "What is the key difference between Continuous Delivery and Continuous Deployment?",
            options: [
              "They are the same thing",
              "Continuous Delivery requires manual approval before production; Continuous Deployment is fully automated",
              "Continuous Deployment requires manual approval; Continuous Delivery is fully automated",
              "Continuous Delivery only runs tests, not deployments"
            ],
            answer: 1,
            explanation: "Continuous Delivery deploys automatically to staging but requires a human to approve the final push to production. Continuous Deployment skips that human gate — every passing build goes straight to production."
          },
          {
            q: "Which of these is NOT one of the DORA metrics for measuring DevOps performance?",
            options: [
              "Deployment Frequency",
              "Mean Time to Recovery (MTTR)",
              "Number of Developers",
              "Change Failure Rate"
            ],
            answer: 2,
            explanation: "The four DORA metrics are: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Recovery (MTTR). Team size is not a DORA metric."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Containers & Docker",
        content: `
          <p>Containers solve the classic <em>"it works on my machine!"</em> problem by packaging an application <strong>together with everything it needs to run</strong> — code, runtime, libraries, and config — into a single portable unit.</p>
          <h3>🐳 What is Docker?</h3>
          <p>Docker is the most popular platform for building and running containers. A <strong>Docker image</strong> is the blueprint; a <strong>container</strong> is a running instance of that image.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Concept</th><th>Analogy</th></tr></thead>
              <tbody>
                <tr><td><strong>Docker Image</strong></td><td>A recipe / blueprint</td></tr>
                <tr><td><strong>Docker Container</strong></td><td>A meal cooked from that recipe</td></tr>
                <tr><td><strong>Dockerfile</strong></td><td>Instructions for creating the recipe</td></tr>
                <tr><td><strong>Docker Hub</strong></td><td>A recipe book (image registry)</td></tr>
              </tbody>
            </table>
          </div>
          <h3>📄 A Simple Dockerfile</h3>
          <div class="code-block">
            <div class="code-label">Dockerfile</div>
            <pre><code># Start from an official Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port and start the app
EXPOSE 3000
CMD ["node", "server.js"]</code></pre>
          </div>
          <h3>🛠️ Essential Docker Commands</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>docker build -t my-app .        # Build an image from a Dockerfile
docker run -p 3000:3000 my-app  # Run a container (map port 3000)
docker ps                       # List running containers
docker stop <container-id>      # Stop a container
docker pull nginx               # Download an image from Docker Hub</code></pre>
          </div>
          <h3>🆚 Containers vs Virtual Machines</h3>
          <p>Containers share the host OS kernel and are <strong>lightweight</strong> (MBs, start in seconds). VMs include a full OS (GBs, take minutes to boot). For most microservices, containers are the preferred choice.</p>
          <div class="callout callout-tip">
            <strong>🚀 Next level:</strong> <strong>Kubernetes (K8s)</strong> is the industry-standard tool for <em>orchestrating</em> many containers — automatically scheduling, scaling, and healing them across a cluster of machines.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Infrastructure as Code (IaC)",
        content: `
          <p><strong>Infrastructure as Code (IaC)</strong> means managing and provisioning servers, networks, and cloud resources using <em>code and configuration files</em> — instead of clicking through a web console or running manual commands.</p>
          <div class="callout callout-info">
            <strong>💡 Why IaC?</strong> Infrastructure defined in code can be version-controlled (in Git), reviewed, tested, and reproduced identically across environments — eliminating the "snowflake server" problem.
          </div>
          <h3>Key IaC Tools</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Tool</th><th>What it does</th><th>By</th></tr></thead>
              <tbody>
                <tr><td><strong>Terraform</strong></td><td>Provisions cloud resources (VMs, DBs, networks)</td><td>HashiCorp</td></tr>
                <tr><td><strong>Ansible</strong></td><td>Configures & deploys software on existing servers</td><td>Red Hat</td></tr>
                <tr><td><strong>AWS CloudFormation</strong></td><td>AWS-native IaC with JSON/YAML templates</td><td>Amazon</td></tr>
                <tr><td><strong>Pulumi</strong></td><td>IaC using real programming languages (Python, JS)</td><td>Pulumi Corp</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🔧 A Terraform Example</h3>
          <div class="code-block">
            <div class="code-label">Terraform — main.tf</div>
            <pre><code># Provision an EC2 instance on AWS
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "MyWebServer"
    Env  = "production"
  }
}</code></pre>
          </div>
          <div class="code-block">
            <div class="code-label">Terminal — Terraform workflow</div>
            <pre><code>terraform init    # Download providers & set up state
terraform plan    # Preview what will be created/changed
terraform apply   # Actually create/update the infrastructure
terraform destroy # Tear everything down</code></pre>
          </div>
          <h3>🔑 IaC Best Practices</h3>
          <ul>
            <li>📁 Store all IaC code in <strong>Git</strong> — infrastructure changes should go through pull requests</li>
            <li>🌍 Use <strong>separate state files</strong> per environment (dev, staging, production)</li>
            <li>🔒 Never hardcode secrets — use environment variables or secret managers (AWS Secrets Manager, HashiCorp Vault)</li>
            <li>♻️ Write <strong>reusable modules</strong> to avoid repeating yourself</li>
          </ul>
          <div class="callout callout-tip">
            <strong>🎯 Golden rule:</strong> If you clicked a button to create a resource, it's not IaC. Everything should be code — reproducible, reviewable, and version-controlled.
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — DevOps Fundamentals",
        questions: [
          {
            q: "What problem do containers primarily solve?",
            options: [
              "Making code run faster on all machines",
              "Replacing version control systems like Git",
              "Ensuring the app runs consistently regardless of environment ('works on my machine')",
              "Providing unlimited cloud storage"
            ],
            answer: 2,
            explanation: "Containers bundle the app with all its dependencies, ensuring it runs identically on a developer's laptop, a CI server, or in production. This eliminates environment-specific bugs."
          },
          {
            q: "In Docker terminology, what is the relationship between an image and a container?",
            options: [
              "They are the same thing",
              "An image is a running instance; a container is the blueprint",
              "A container is a running instance of an image",
              "An image is created from a running container"
            ],
            answer: 2,
            explanation: "A Docker image is the blueprint (built from a Dockerfile). A container is a live, running instance of that image. You can run many containers from the same image."
          },
          {
            q: "What is the correct order of the standard Terraform workflow?",
            options: [
              "apply → plan → init",
              "init → apply → plan",
              "plan → init → apply",
              "init → plan → apply"
            ],
            answer: 3,
            explanation: "'terraform init' downloads providers and sets up state. 'terraform plan' previews changes. 'terraform apply' actually creates/modifies infrastructure. Always init first, plan second, apply third."
          },
          {
            q: "Which of these best describes Infrastructure as Code (IaC)?",
            options: [
              "Writing scripts to test your application code",
              "Managing servers and cloud resources through version-controlled configuration files",
              "Using a GUI dashboard to provision cloud resources",
              "Documenting your infrastructure in a wiki"
            ],
            answer: 1,
            explanation: "IaC means defining your infrastructure (servers, networks, databases) in code files that can be version-controlled, reviewed, and automatically applied — making infrastructure as repeatable and auditable as application code."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 5: GenAI Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "genai-fundamentals",
    title: "GenAI Fundamentals",
    icon: "🤖",
    color: "#9333ea",
    description: "Understand the technology reshaping the world. Learn how Large Language Models work, how to write effective prompts, and how to use AI tools responsibly and productively.",
    difficulty: "Beginner",
    estimatedTime: "30 min",
    tags: ["AI", "Machine Learning", "Tools"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is Generative AI?",
        content: `
          <p><strong>Generative AI</strong> refers to AI systems that can <em>create</em> new content — text, images, code, audio, and video — rather than just classifying or analysing existing data.</p>
          <div class="callout callout-info">
            <strong>🧠 Key distinction:</strong> Traditional AI <em>recognises</em> patterns (e.g. "Is this email spam?"). Generative AI <em>produces</em> new content (e.g. "Write me a professional email about X").
          </div>
          <h3>A Brief Timeline</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Year</th><th>Milestone</th></tr></thead>
              <tbody>
                <tr><td>2017</td><td>Google publishes the <strong>Transformer</strong> architecture ("Attention is All You Need")</td></tr>
                <tr><td>2018</td><td>OpenAI releases <strong>GPT-1</strong>; Google releases <strong>BERT</strong></td></tr>
                <tr><td>2020</td><td><strong>GPT-3</strong> stuns the world with human-like text generation</td></tr>
                <tr><td>2022</td><td><strong>ChatGPT</strong> launches — 1 million users in 5 days</td></tr>
                <tr><td>2023–24</td><td>GPT-4, Gemini, Claude, Llama — the era of multimodal AI</td></tr>
              </tbody>
            </table>
          </div>
          <h3>What Can GenAI Create?</h3>
          <ul>
            <li>📝 <strong>Text</strong> — articles, emails, code, summaries, translations</li>
            <li>🖼️ <strong>Images</strong> — artwork, photos, logos (DALL·E, Midjourney, Stable Diffusion)</li>
            <li>🎵 <strong>Audio</strong> — music, voice cloning, sound effects</li>
            <li>🎬 <strong>Video</strong> — synthetic video clips (Sora, Runway, Pika)</li>
            <li>💻 <strong>Code</strong> — full functions, tests, refactoring (GitHub Copilot, Cursor)</li>
          </ul>
          <div class="callout callout-tip">
            <strong>🎯 Not magic:</strong> GenAI models are sophisticated <em>pattern-completion engines</em> trained on vast datasets. They predict the most probable next token — they don't "think" or "understand" in the human sense.
          </div>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "LLMs — How They Work",
        content: `
          <p><strong>Large Language Models (LLMs)</strong> are the engine behind tools like ChatGPT, Gemini, and Claude. Understanding how they work helps you use them more effectively.</p>
          <h3>🔤 Tokens — the Atomic Unit</h3>
          <p>LLMs don't process words — they process <strong>tokens</strong>. A token is roughly 3–4 characters or ¾ of a word. "Hello world" is 2 tokens; a 1000-word essay is ~750 tokens.</p>
          <div class="callout callout-info">
            <strong>Why tokens matter:</strong> Every LLM has a <strong>context window</strong> — a maximum number of tokens it can process at once. GPT-4 handles ~128 000 tokens; Gemini 1.5 Pro handles up to 1 million.
          </div>
          <h3>🏋️ Training in Three Stages</h3>
          <div class="stages">
            <div class="stage"><span class="stage-num">1</span><strong>Pre-training</strong><br>Predict next token on trillions of words from the internet</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">2</span><strong>Fine-tuning</strong><br>Train on curated high-quality instruction-response pairs</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">3</span><strong>RLHF</strong><br>Humans rank outputs; model learns from feedback</div>
          </div>
          <p style="margin-top:8px"><strong>RLHF</strong> = Reinforcement Learning from Human Feedback — the key step that transforms a next-token predictor into a helpful assistant.</p>
          <h3>🌡️ Temperature & Randomness</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Temperature</th><th>Behaviour</th><th>Best For</th></tr></thead>
              <tbody>
                <tr><td><strong>0.0</strong></td><td>Deterministic — always the most likely token</td><td>Factual Q&A, code generation</td></tr>
                <tr><td><strong>0.7</strong></td><td>Balanced creativity and coherence</td><td>General chat, summaries</td></tr>
                <tr><td><strong>1.0+</strong></td><td>High randomness — diverse, surprising outputs</td><td>Brainstorming, creative writing</td></tr>
              </tbody>
            </table>
          </div>
          <h3>⚠️ Key Limitations</h3>
          <ul>
            <li>🔻 <strong>Hallucinations</strong> — LLMs confidently make up false facts</li>
            <li>📅 <strong>Knowledge cutoff</strong> — training data has a cut-off date; models don't know recent events</li>
            <li>📐 <strong>No true reasoning</strong> — they mimic reasoning via pattern matching, not logical deduction</li>
            <li>🔁 <strong>Context window limits</strong> — very long documents may be truncated</li>
          </ul>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What is a 'token' in the context of Large Language Models?",
            options: [
              "A security credential used to authenticate API requests",
              "A full word processed by the model",
              "The smallest unit of text (roughly 3-4 characters) that an LLM processes",
              "A type of neural network layer"
            ],
            answer: 2,
            explanation: "Tokens are the atomic units LLMs work with — roughly 3-4 characters or ¾ of an average word. Understanding tokens helps you reason about context window limits and API costs (which are priced per token)."
          },
          {
            q: "What does a higher 'temperature' setting do to an LLM's output?",
            options: [
              "Makes the model run faster",
              "Increases randomness and creativity in the output",
              "Makes the output more factual and deterministic",
              "Increases the context window size"
            ],
            answer: 1,
            explanation: "Temperature controls randomness. A temperature of 0 makes the model pick the most probable token every time (deterministic). Higher temperatures make the model sample more randomly, producing more creative but less predictable outputs."
          },
          {
            q: "What is an LLM 'hallucination'?",
            options: [
              "When the model crashes due to a complex query",
              "When the model generates images instead of text",
              "When the model confidently produces false or made-up information",
              "When the model refuses to answer a question"
            ],
            answer: 2,
            explanation: "Hallucinations are when an LLM generates plausible-sounding but factually incorrect information — and presents it confidently. This is a key limitation to watch for, especially with facts, citations, and specific data."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Prompt Engineering",
        content: `
          <p><strong>Prompt engineering</strong> is the skill of crafting inputs to AI models that reliably produce useful, accurate, and well-formatted outputs. A better prompt = dramatically better results.</p>
          <div class="callout callout-info">
            <strong>💡 Key insight:</strong> LLMs are powerful but literal. They do exactly what you ask — so asking precisely and completely is everything.
          </div>
          <h3>🏗️ The Anatomy of a Great Prompt</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Component</th><th>Purpose</th><th>Example</th></tr></thead>
              <tbody>
                <tr><td><strong>Role</strong></td><td>Sets the persona</td><td>"You are a senior software engineer..."</td></tr>
                <tr><td><strong>Context</strong></td><td>Provides background</td><td>"I'm building a React e-commerce app..."</td></tr>
                <tr><td><strong>Task</strong></td><td>What to do</td><td>"Review this function and suggest improvements"</td></tr>
                <tr><td><strong>Format</strong></td><td>How to respond</td><td>"Return as bullet points, max 5 items"</td></tr>
                <tr><td><strong>Constraints</strong></td><td>Limits & rules</td><td>"Avoid using external libraries"</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🔑 Core Techniques</h3>
          <p><strong>1. Zero-shot prompting</strong> — Ask directly without examples:</p>
          <div class="code-block">
            <div class="code-label">Prompt</div>
            <pre><code>Translate this sentence to French: "The meeting starts at 9am."</code></pre>
          </div>
          <p><strong>2. Few-shot prompting</strong> — Provide examples to guide the format:</p>
          <div class="code-block">
            <div class="code-label">Prompt</div>
            <pre><code>Classify the sentiment. Examples:
"I love this product!" → Positive
"Terrible experience." → Negative
"It was okay." → Neutral

Now classify: "The delivery was late but the item is great."</code></pre>
          </div>
          <p><strong>3. Chain-of-thought</strong> — Tell the model to reason step by step:</p>
          <div class="code-block">
            <div class="code-label">Prompt</div>
            <pre><code>A train travels 120 km in 1.5 hours. What is its speed in km/h?
Think step by step.</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Golden rules:</strong> Be specific over vague. Give examples when you want a specific format. Say what you <em>do</em> want, not just what you don't. And always iterate — prompting is an experiment.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "AI Tools & Responsible Use",
        content: `
          <p>The GenAI landscape is moving fast. Here's a map of the key tools and the critical principles for using them responsibly.</p>
          <h3>🗺️ Key AI Tools by Category</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Category</th><th>Top Tools</th></tr></thead>
              <tbody>
                <tr><td><strong>Chat / General</strong></td><td>ChatGPT (OpenAI), Gemini (Google), Claude (Anthropic)</td></tr>
                <tr><td><strong>Coding</strong></td><td>GitHub Copilot, Cursor, Codeium, Amazon Q Developer</td></tr>
                <tr><td><strong>Image Generation</strong></td><td>DALL·E 3, Midjourney, Stable Diffusion, Adobe Firefly</td></tr>
                <tr><td><strong>Search + AI</strong></td><td>Perplexity, Google AI Overviews, Bing Copilot</td></tr>
                <tr><td><strong>Open-source LLMs</strong></td><td>Meta Llama, Mistral, Falcon — run locally or self-hosted</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🔗 RAG — Grounding AI in Your Data</h3>
          <p><strong>Retrieval-Augmented Generation (RAG)</strong> is the most popular technique for giving LLMs access to up-to-date or private information:</p>
          <div class="stages">
            <div class="stage"><span class="stage-num">1</span><strong>Retrieve</strong><br>Search your docs for relevant chunks</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">2</span><strong>Augment</strong><br>Inject chunks into the prompt as context</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">3</span><strong>Generate</strong><br>LLM answers using that grounded context</div>
          </div>
          <h3>⚖️ Responsible AI Use</h3>
          <ul>
            <li>✅ <strong>Verify outputs</strong> — never publish AI-generated facts without checking. Hallucinations are real.</li>
            <li>🔒 <strong>Protect privacy</strong> — don't paste personal data, passwords, or confidential business info into public AI tools</li>
            <li>🪞 <strong>Watch for bias</strong> — LLMs can reflect and amplify biases present in their training data</li>
            <li>📜 <strong>Check IP & copyright</strong> — AI-generated content may raise copyright questions depending on jurisdiction</li>
            <li>🏷️ <strong>Disclose AI use</strong> — be transparent when AI helped create content, especially in academic or professional contexts</li>
          </ul>
          <div class="callout callout-tip">
            <strong>🎯 Best mindset:</strong> Treat AI as a brilliant but imperfect <em>collaborator</em>, not an oracle. Use it to accelerate your thinking — not to replace it. Your critical judgement is what makes the output trustworthy.
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — GenAI Fundamentals",
        questions: [
          {
            q: "Which prompting technique involves providing examples within the prompt to guide the model's output format?",
            options: [
              "Zero-shot prompting",
              "Chain-of-thought prompting",
              "Few-shot prompting",
              "Temperature prompting"
            ],
            answer: 2,
            explanation: "Few-shot prompting includes 2-5 input/output examples in the prompt itself, showing the model exactly the format and style you want. It's very effective when zero-shot gives inconsistent results."
          },
          {
            q: "What does RAG (Retrieval-Augmented Generation) primarily solve?",
            options: [
              "Making LLMs run faster on local hardware",
              "Grounding LLM responses in up-to-date or private documents",
              "Reducing the hallucination rate to zero",
              "Training a new model from scratch on your data"
            ],
            answer: 1,
            explanation: "RAG retrieves relevant chunks from your own documents or databases and injects them into the LLM's context window. This grounds responses in real, current data — solving the knowledge cutoff and private data problems without retraining the model."
          },
          {
            q: "Which component of a well-structured prompt helps set the model's expertise level and persona?",
            options: [
              "Format",
              "Context",
              "Constraints",
              "Role"
            ],
            answer: 3,
            explanation: "The 'Role' component (e.g. 'You are a senior security engineer...') primes the model to respond from a specific perspective and expertise level. It's one of the most effective ways to improve response quality."
          },
          {
            q: "What is the most responsible approach when using AI-generated content professionally?",
            options: [
              "Use it as-is — AI is more accurate than humans",
              "Only use AI-generated content for internal documents, never public ones",
              "Always verify facts, disclose AI use where appropriate, and apply your own critical judgement",
              "Avoid AI tools entirely to eliminate risk"
            ],
            answer: 2,
            explanation: "Responsible AI use means verifying outputs (hallucinations happen), being transparent about AI assistance, protecting private data, and using your own judgement to assess quality. AI is a powerful collaborator — not a replacement for critical thinking."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 6: TypeScript Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "typescript-fundamentals",
    title: "TypeScript Fundamentals",
    icon: "🔷",
    color: "#2563eb",
    description: "Level up your JavaScript with static types. Learn how TypeScript catches bugs at compile time, makes refactoring safe, and powers modern frameworks like Angular, Next.js, and more.",
    difficulty: "Intermediate",
    estimatedTime: "35 min",
    tags: ["Programming", "Web Dev", "TypeScript"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Why TypeScript?",
        content: `
          <p><strong>TypeScript</strong> is a superset of JavaScript that adds <em>static types</em>. Every valid JS file is already valid TS — TypeScript just adds optional type annotations on top.</p>
          <div class="callout callout-info">
            <strong>🧠 Core idea:</strong> JavaScript tells you about bugs <em>at runtime</em> (when the app crashes). TypeScript tells you about bugs <em>at compile time</em> (before the code even runs).
          </div>
          <h3>JavaScript vs TypeScript</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>JavaScript</th><th>TypeScript</th></tr></thead>
              <tbody>
                <tr><td>Dynamically typed</td><td>Statically typed (with inference)</td></tr>
                <tr><td>Errors found at runtime</td><td>Errors caught at compile time</td></tr>
                <tr><td>No editor autocompletion for shapes</td><td>Rich IntelliSense & autocompletion</td></tr>
                <tr><td>Refactoring is risky</td><td>Refactoring is safe & confident</td></tr>
                <tr><td>Runs directly in browsers</td><td>Compiles to JavaScript first</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Who Uses TypeScript?</h3>
          <p>TypeScript is used by <strong>most large-scale projects</strong> today:</p>
          <ul>
            <li>🅰️ <strong>Angular</strong> — built entirely in TypeScript</li>
            <li>⚛️ <strong>React / Next.js</strong> — first-class TypeScript support</li>
            <li>💚 <strong>Vue 3</strong> — rewritten in TypeScript</li>
            <li>🟢 <strong>Node.js / Deno</strong> — server-side TypeScript</li>
            <li>📱 <strong>React Native</strong> — mobile apps with TypeScript</li>
          </ul>
          <h3>🚀 Getting Started</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code>npm install -g typescript    # Install globally
tsc --init                   # Create tsconfig.json
tsc app.ts                   # Compile app.ts → app.js</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Key takeaway:</strong> TypeScript doesn't run in the browser — it <em>compiles</em> to plain JavaScript. The types exist only during development and are stripped out in the final output.
          </div>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Type Annotations & Primitives",
        content: `
          <p>TypeScript lets you annotate variables, function parameters, and return values with types. But it also <strong>infers</strong> types automatically when possible.</p>
          <h3>🏷️ Basic Type Annotations</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Explicit types
let name: string = "Ravi";
let age: number = 28;
let isActive: boolean = true;

// Type inference — TS figures it out
let city = "Bengaluru";   // inferred as string
let score = 95;            // inferred as number</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Best practice:</strong> Let TypeScript <em>infer</em> types when the value makes the type obvious. Only add explicit annotations when inference isn't enough (e.g. function parameters).
          </div>
          <h3>📦 Arrays & Tuples</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Arrays — two equivalent syntaxes
let scores: number[] = [95, 87, 92];
let names: Array<string> = ["Alice", "Bob"];

// Tuples — fixed length & fixed types per position
let user: [string, number] = ["Ravi", 28];
// user[0] is string, user[1] is number</code></pre>
          </div>
          <h3>🔧 Function Types</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Parameter types + return type
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function with types
const greet = (name: string): string => {
  return \`Hello, \${name}!\`;
};

// Optional parameter (?)
function log(message: string, level?: string): void {
  console.log(level ? \`[\${level}] \${message}\` : message);
}

log("Server started");           // ✅ OK
log("DB error", "ERROR");        // ✅ OK</code></pre>
          </div>
          <h3>🚫 The <code>any</code> Escape Hatch</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>let data: any = "hello";
data = 42;       // ✅ No error — any disables type checking
data = true;     // ✅ No error</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>⚠️ Avoid <code>any</code></strong> — it defeats the purpose of TypeScript. If you don't know the type, use <code>unknown</code> instead, which forces you to narrow the type before using it.
          </div>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What is the key difference between JavaScript and TypeScript?",
            options: [
              "TypeScript is a completely different language unrelated to JavaScript",
              "TypeScript adds static types to JavaScript and catches errors at compile time",
              "TypeScript runs faster than JavaScript in all cases",
              "TypeScript replaces JavaScript in the browser"
            ],
            answer: 1,
            explanation: "TypeScript is a strict superset of JavaScript — it adds optional static type annotations. These types are checked at compile time and stripped away in the final JavaScript output. TypeScript doesn't run in the browser directly."
          },
          {
            q: "What does TypeScript do with type annotations when it compiles?",
            options: [
              "Keeps them in the output JavaScript for runtime checking",
              "Converts them to JSDoc comments",
              "Strips them out — the output is plain JavaScript with no types",
              "Sends them to a separate type-check server"
            ],
            answer: 2,
            explanation: "TypeScript types exist only during development. When you compile (tsc), all type annotations are removed and the output is plain JavaScript. Types are a development-time safety net, not a runtime feature."
          },
          {
            q: "Why should you avoid using 'any' in TypeScript?",
            options: [
              "It causes runtime errors",
              "It makes the code run slower",
              "It disables type checking, defeating the purpose of TypeScript",
              "It is not valid TypeScript syntax"
            ],
            answer: 2,
            explanation: "'any' tells TypeScript to skip all type checking for that value. This effectively turns off TypeScript's safety for that variable. Use 'unknown' instead — it's safer because it forces you to narrow the type before using it."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Interfaces & Custom Types",
        content: `
          <p>Real-world applications work with complex data — user objects, API responses, config settings. TypeScript's <strong>interfaces</strong> and <strong>type aliases</strong> let you describe these shapes precisely.</p>
          <h3>📐 Interfaces — Describing Object Shapes</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  bio?: string;          // optional property
}

const user: User = {
  id: 1,
  name: "Ravi",
  email: "ravi@example.com",
  isAdmin: false
  // bio is optional, so omitting it is fine
};</code></pre>
          </div>
          <h3>🆚 Interface vs Type Alias</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Type alias — can describe ANY type
type Status = "active" | "inactive" | "banned";
type ID = string | number;

// Interface — best for object shapes
interface Product {
  name: string;
  price: number;
}

// Extending interfaces
interface DigitalProduct extends Product {
  downloadUrl: string;
  fileSizeMb: number;
}</code></pre>
          </div>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Feature</th><th>Interface</th><th>Type Alias</th></tr></thead>
              <tbody>
                <tr><td>Object shapes</td><td>✅ Primary use</td><td>✅ Works too</td></tr>
                <tr><td>Extending</td><td><code>extends</code></td><td><code>&</code> (intersection)</td></tr>
                <tr><td>Union types</td><td>❌</td><td>✅ <code>string | number</code></td></tr>
                <tr><td>Declaration merging</td><td>✅</td><td>❌</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🔀 Union & Literal Types</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Union type — value can be one of several types
type Result = "success" | "error" | "loading";

function showStatus(status: Result): string {
  switch (status) {
    case "success": return "✅ Done!";
    case "error":   return "❌ Failed!";
    case "loading": return "⏳ Loading...";
  }
}

// Narrowing — TypeScript tracks type through conditions
function print(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());  // TS knows it's string here
  } else {
    console.log(value.toFixed(2));     // TS knows it's number here
  }
}</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Rule of thumb:</strong> Use <code>interface</code> for object shapes (especially if they'll be extended). Use <code>type</code> for unions, primitives, and more complex type expressions.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Generics & Utility Types",
        content: `
          <p><strong>Generics</strong> let you write reusable, type-safe code that works with <em>any</em> type — without losing type information. They're the key to writing flexible yet safe TypeScript.</p>
          <h3>🧬 Generics — Type Parameters</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>// Without generics — loses type info
function first(arr: any[]): any {
  return arr[0];
}

// With generics — preserves type info
function first<T>(arr: T[]): T {
  return arr[0];
}

first([1, 2, 3]);         // returns number
first(["a", "b", "c"]);   // returns string
// TypeScript knows the return type automatically!</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>💡 Think of <code>&lt;T&gt;</code></strong> like a placeholder that gets filled in when you call the function. It's a "type variable" — it lets the function adapt to whatever type you pass in.
          </div>
          <h3>📦 Generic Interfaces</h3>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Usage — T becomes User
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Ravi", email: "r@e.com", isAdmin: false },
  status: 200,
  message: "OK"
};

// T becomes string[]
const tagsResponse: ApiResponse<string[]> = {
  data: ["typescript", "javascript"],
  status: 200,
  message: "OK"
};</code></pre>
          </div>
          <h3>🛠️ Built-in Utility Types</h3>
          <p>TypeScript ships with powerful utility types that transform existing types:</p>
          <div class="code-block">
            <div class="code-label">TypeScript</div>
            <pre><code>interface User {
  id: number;
  name: string;
  email: string;
}

// Partial — all properties become optional
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// Pick — select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit — exclude specific properties
type CreateUser = Omit<User, "id">;
// { name: string; email: string }

// Readonly — all properties become readonly
type FrozenUser = Readonly<User>;
// Cannot reassign any property after creation

// Record — create an object type with typed keys & values
type RoleMap = Record<string, string[]>;
// { [key: string]: string[] }</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Power tip:</strong> Utility types compose beautifully. <code>Partial&lt;Pick&lt;User, "name" | "email"&gt;&gt;</code> gives you an object where <code>name</code> and <code>email</code> are both optional. This is incredibly useful for update/patch operations.
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — TypeScript Fundamentals",
        questions: [
          {
            q: "What does the Partial<T> utility type do?",
            options: [
              "Removes all properties from a type",
              "Makes all properties required",
              "Makes all properties optional",
              "Picks only string properties"
            ],
            answer: 2,
            explanation: "Partial<T> takes a type T and returns a new type where every property is optional (?). It's very useful for update/patch functions where you only want to send changed fields."
          },
          {
            q: "What is the purpose of generics in TypeScript?",
            options: [
              "To make functions run faster at runtime",
              "To write reusable code that preserves type information across different types",
              "To convert JavaScript to TypeScript automatically",
              "To create global variables accessible everywhere"
            ],
            answer: 1,
            explanation: "Generics let you write functions, classes, and interfaces that work with any type while still maintaining full type safety. Without generics, you'd have to use 'any' (losing type info) or write separate functions for every type."
          },
          {
            q: "When should you use an interface vs a type alias in TypeScript?",
            options: [
              "Always use interfaces, type aliases are deprecated",
              "Always use type aliases, interfaces are legacy",
              "Use interfaces for object shapes (especially extendable); use type aliases for unions and complex types",
              "They are identical in every way — use whichever you prefer"
            ],
            answer: 2,
            explanation: "Interfaces are ideal for defining object shapes, especially when you want to extend them. Type aliases are more flexible — they can describe unions (string | number), intersections, and other complex type expressions that interfaces cannot."
          },
          {
            q: "What will TypeScript do with this code?\n\nconst x: string = 42;",
            options: [
              "Run fine — TypeScript auto-converts 42 to \"42\"",
              "Throw a runtime error when executed",
              "Show a compile-time error: Type 'number' is not assignable to type 'string'",
              "Ignore the type annotation and infer number"
            ],
            answer: 2,
            explanation: "TypeScript catches this at compile time — you declared x as string but assigned a number. This is the core value of TypeScript: catching type mismatches before your code ever runs."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 7: SQL & Databases
  // ─────────────────────────────────────────────────────────
  {
    id: "sql-databases",
    title: "SQL & Databases",
    icon: "🗄️",
    color: "#dc2626",
    description: "Master the language of data. Learn how relational databases store information, write powerful SQL queries, and understand core concepts like joins, indexes, and schema design.",
    difficulty: "Beginner",
    estimatedTime: "35 min",
    tags: ["Databases", "SQL", "Backend"],
    sections: [
      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What are Databases?",
        content: `
          <p>A <strong>database</strong> is an organised collection of data stored electronically. Almost every application you use — from Instagram to your bank — is powered by a database behind the scenes.</p>
          <div class="callout callout-info">
            <strong>🧠 Core idea:</strong> Without a database, your app's data disappears the moment the server restarts. Databases provide <em>persistent, structured, and queryable</em> storage.
          </div>
          <h3>Relational vs Non-Relational</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Relational (SQL)</th><th>Non-Relational (NoSQL)</th></tr></thead>
              <tbody>
                <tr><td>Data in <strong>tables</strong> (rows & columns)</td><td>Data in documents, key-value, or graphs</td></tr>
                <tr><td>Fixed schema — structure defined upfront</td><td>Flexible schema — structure can vary</td></tr>
                <tr><td>SQL query language</td><td>Varies (MongoDB uses JSON-like queries)</td></tr>
                <tr><td>Strong consistency & ACID compliance</td><td>Often eventual consistency for scale</td></tr>
                <tr><td>MySQL, PostgreSQL, SQLite</td><td>MongoDB, Redis, DynamoDB, Cassandra</td></tr>
              </tbody>
            </table>
          </div>
          <h3>📊 How Relational Data Looks</h3>
          <p>Think of a <strong>table</strong> like a spreadsheet:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>id</th><th>name</th><th>email</th><th>role</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Ravi</td><td>ravi@example.com</td><td>admin</td></tr>
                <tr><td>2</td><td>Priya</td><td>priya@example.com</td><td>editor</td></tr>
                <tr><td>3</td><td>Arjun</td><td>arjun@example.com</td><td>viewer</td></tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>📋 <strong>Table</strong> — a collection of related data (e.g. <code>users</code>)</li>
            <li>📄 <strong>Row</strong> (Record) — a single entry (e.g. one user)</li>
            <li>📊 <strong>Column</strong> (Field) — a specific attribute (e.g. <code>email</code>)</li>
            <li>🔑 <strong>Primary Key</strong> — a unique identifier for each row (e.g. <code>id</code>)</li>
          </ul>
          <div class="callout callout-tip">
            <strong>🎯 This course focuses on SQL</strong> — the standard language for relational databases. The concepts you learn here apply to MySQL, PostgreSQL, SQLite, SQL Server, and more.
          </div>
        `
      },
      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Core SQL — SELECT Queries",
        content: `
          <p><strong>SQL</strong> (Structured Query Language) is the standard language for interacting with relational databases. The most common operation? <strong>SELECT</strong> — reading data.</p>
          <h3>📖 Basic SELECT</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Select all columns from a table
SELECT * FROM users;

-- Select specific columns
SELECT name, email FROM users;

-- Limit results
SELECT name FROM users LIMIT 5;</code></pre>
          </div>
          <h3>🔍 Filtering with WHERE</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Exact match
SELECT * FROM users WHERE role = 'admin';

-- Comparison operators
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE price BETWEEN 50 AND 200;

-- Pattern matching
SELECT * FROM users WHERE name LIKE 'R%';    -- starts with R
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Multiple conditions
SELECT * FROM users WHERE role = 'editor' AND is_active = true;
SELECT * FROM users WHERE role = 'admin' OR role = 'editor';

-- NULL checks
SELECT * FROM users WHERE bio IS NULL;
SELECT * FROM users WHERE bio IS NOT NULL;</code></pre>
          </div>
          <h3>📊 Sorting & Aggregating</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Sort results
SELECT * FROM products ORDER BY price ASC;     -- cheapest first
SELECT * FROM products ORDER BY price DESC;    -- most expensive first

-- Aggregate functions
SELECT COUNT(*) FROM users;                    -- total rows
SELECT AVG(price) FROM products;               -- average price
SELECT MAX(price), MIN(price) FROM products;   -- max and min

-- Group by category
SELECT category, COUNT(*) as total
FROM products
GROUP BY category
ORDER BY total DESC;</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 SQL keywords</strong> like <code>SELECT</code>, <code>FROM</code>, <code>WHERE</code> are case-insensitive — but writing them in UPPERCASE is a widely followed convention for readability.
          </div>
        `
      },
      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "What is a 'Primary Key' in a relational database?",
            options: [
              "The first column in every table",
              "A unique identifier for each row in a table",
              "The password used to access the database",
              "The most important table in the database"
            ],
            answer: 1,
            explanation: "A primary key uniquely identifies each row in a table. No two rows can have the same primary key value, and it cannot be NULL. Common examples include auto-incrementing IDs."
          },
          {
            q: "What does this SQL return?\\n\\nSELECT name FROM users WHERE role = 'admin' ORDER BY name ASC;",
            options: [
              "All columns for admin users, sorted alphabetically",
              "Only the name column for admin users, sorted A→Z",
              "All users sorted by role",
              "Counts how many admins exist"
            ],
            answer: 1,
            explanation: "This query selects only the 'name' column, filters to rows where role is 'admin', and sorts the results alphabetically (ASC = ascending = A→Z)."
          },
          {
            q: "Which SQL keyword is used to filter groups created by GROUP BY?",
            options: [
              "WHERE",
              "FILTER",
              "HAVING",
              "GROUP WHERE"
            ],
            answer: 2,
            explanation: "WHERE filters individual rows before grouping. HAVING filters groups after GROUP BY has been applied. For example: HAVING COUNT(*) > 5 shows only groups with more than 5 items."
          }
        ]
      },
      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "JOINs — Connecting Tables",
        content: `
          <p>Real databases split data across <strong>multiple tables</strong> to avoid repetition. <strong>JOINs</strong> let you combine data from two or more tables based on a shared column.</p>
          <h3>📊 Example: Two Related Tables</h3>
          <p><strong>users</strong> table:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>id</th><th>name</th><th>email</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Ravi</td><td>ravi@example.com</td></tr>
                <tr><td>2</td><td>Priya</td><td>priya@example.com</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>orders</strong> table:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>order_id</th><th>user_id</th><th>product</th><th>amount</th></tr></thead>
              <tbody>
                <tr><td>101</td><td>1</td><td>Laptop</td><td>75000</td></tr>
                <tr><td>102</td><td>1</td><td>Mouse</td><td>1500</td></tr>
                <tr><td>103</td><td>2</td><td>Keyboard</td><td>3000</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🔗 INNER JOIN — Only Matching Rows</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>SELECT users.name, orders.product, orders.amount
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- Result:
-- Ravi  | Laptop   | 75000
-- Ravi  | Mouse    | 1500
-- Priya | Keyboard | 3000</code></pre>
          </div>
          <h3>🔀 Types of JOINs</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>JOIN Type</th><th>Returns</th></tr></thead>
              <tbody>
                <tr><td><strong>INNER JOIN</strong></td><td>Only rows that match in <em>both</em> tables</td></tr>
                <tr><td><strong>LEFT JOIN</strong></td><td>All rows from left table + matching from right (NULL if no match)</td></tr>
                <tr><td><strong>RIGHT JOIN</strong></td><td>All rows from right table + matching from left</td></tr>
                <tr><td><strong>FULL OUTER JOIN</strong></td><td>All rows from both tables (NULL where no match)</td></tr>
              </tbody>
            </table>
          </div>
          <h3>⬅️ LEFT JOIN — Keep All From Left Table</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Find ALL users, even those with no orders
SELECT users.name, orders.product
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- If a user has no orders, product shows as NULL</code></pre>
          </div>
          <h3>🔑 Foreign Keys</h3>
          <p>The <code>user_id</code> column in orders is a <strong>foreign key</strong> — it references the <code>id</code> column in users. This creates a relationship between the two tables and ensures data integrity.</p>
          <div class="callout callout-tip">
            <strong>🎯 When to use which JOIN:</strong> Use <code>INNER JOIN</code> when you only want rows with matches in both tables. Use <code>LEFT JOIN</code> when you want all records from the "main" table even if there's no match in the joined table.
          </div>
        `
      },
      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Modifying Data & Schema Design",
        content: `
          <p>SQL isn't just for reading data — you can also <strong>create, insert, update, and delete</strong> data and tables.</p>
          <h3>🏗️ Creating Tables</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>CREATE TABLE users (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  role      VARCHAR(20) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);</code></pre>
          </div>
          <h3>➕ Inserting Data</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Insert a single row
INSERT INTO users (name, email, role)
VALUES ('Ravi', 'ravi@example.com', 'admin');

-- Insert multiple rows
INSERT INTO users (name, email) VALUES
  ('Priya', 'priya@example.com'),
  ('Arjun', 'arjun@example.com');</code></pre>
          </div>
          <h3>✏️ Updating Data</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Update specific rows
UPDATE users SET role = 'editor' WHERE name = 'Priya';

-- Update multiple columns
UPDATE products SET price = 999, stock = 50 WHERE id = 42;</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>⚠️ Always use WHERE with UPDATE and DELETE!</strong> Without a WHERE clause, the operation applies to <em>every row</em> in the table. <code>DELETE FROM users;</code> deletes ALL users — not what you want!
          </div>
          <h3>🗑️ Deleting Data</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Delete specific rows
DELETE FROM users WHERE id = 3;

-- Delete all inactive users
DELETE FROM users WHERE is_active = false;</code></pre>
          </div>
          <h3>⚡ Indexes — Speeding Up Queries</h3>
          <div class="code-block">
            <div class="code-label">SQL</div>
            <pre><code>-- Create an index on email (speeds up WHERE email = '...')
CREATE INDEX idx_users_email ON users(email);

-- Composite index (speeds up queries filtering on both columns)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);</code></pre>
          </div>
          <p>Indexes work like a book's index — instead of scanning every page (row), the database jumps directly to the right location. Add indexes on columns you frequently <code>WHERE</code>, <code>JOIN</code>, or <code>ORDER BY</code>.</p>
          <div class="callout callout-tip">
            <strong>🎯 Schema design tips:</strong> (1) Every table should have a primary key. (2) Use foreign keys to enforce relationships. (3) Don't duplicate data — normalise into separate tables. (4) Index columns you query often.
          </div>
        `
      },
      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — SQL & Databases",
        questions: [
          {
            q: "What does an INNER JOIN return?",
            options: [
              "All rows from both tables, with NULLs where there's no match",
              "All rows from the left table, with NULLs for unmatched right rows",
              "Only rows that have matching values in both tables",
              "The first 10 rows from both tables combined"
            ],
            answer: 2,
            explanation: "INNER JOIN returns only the rows where there is a match in both tables based on the join condition. Rows without a match in either table are excluded from the result."
          },
          {
            q: "What happens if you run DELETE FROM users; without a WHERE clause?",
            options: [
              "Nothing — SQL requires a WHERE clause for DELETE",
              "It deletes only the first row",
              "It deletes ALL rows in the users table",
              "It drops (removes) the entire table"
            ],
            answer: 2,
            explanation: "DELETE FROM users; without WHERE deletes every single row in the table! The table structure remains (unlike DROP TABLE), but all data is gone. Always double-check your WHERE clause before running DELETE or UPDATE."
          },
          {
            q: "What is the purpose of a database index?",
            options: [
              "To encrypt sensitive data in the table",
              "To speed up query performance on frequently searched columns",
              "To create a backup of the table",
              "To enforce unique constraints on all columns"
            ],
            answer: 1,
            explanation: "An index is a data structure that speeds up data retrieval — like a book's index lets you find a topic without reading every page. Add indexes on columns used in WHERE, JOIN, and ORDER BY clauses."
          },
          {
            q: "What is a foreign key?",
            options: [
              "A key used to encrypt data between tables",
              "The primary key of a table",
              "A column that references the primary key of another table, creating a relationship",
              "A special key that allows access from external applications"
            ],
            answer: 2,
            explanation: "A foreign key is a column in one table that references the primary key of another table. It creates a relationship between the two tables and enforces referential integrity — you can't insert a user_id that doesn't exist in the users table."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 7: REST APIs & HTTP
  // ─────────────────────────────────────────────────────────
  {
    id: "rest-apis-http",
    title: "REST APIs & HTTP",
    icon: "🌐",
    color: "#0369a1",
    description: "Understand how the web communicates — learn HTTP methods, status codes, request/response structure, and how to design and consume REST APIs like a professional.",
    difficulty: "Beginner",
    estimatedTime: "30 min",
    tags: ["Web", "Backend", "Networking"],
    sections: [

      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is HTTP?",
        content: `
          <p>Every time you open a website, your browser is having a conversation with a server. That conversation follows a strict set of rules called <strong>HTTP</strong> — HyperText Transfer Protocol.</p>
          <p>Think of it like ordering at a restaurant:</p>
          <ul>
            <li>🧑 <strong>You (the client)</strong> look at the menu and place an order</li>
            <li>🍽️ <strong>The waiter (HTTP)</strong> carries your request to the kitchen</li>
            <li>👨‍🍳 <strong>The kitchen (the server)</strong> prepares your food and sends it back</li>
          </ul>
          <div class="callout callout-info">
            <strong>💡 HTTP is stateless.</strong> Each request is completely independent — the server doesn't remember previous requests. It's like the waiter has no memory. Every order has to be complete and self-contained.
          </div>
          <h3>HTTP vs HTTPS</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>HTTP</th><th>HTTPS</th></tr></thead>
              <tbody>
                <tr><td>Plain text — anyone can read the data in transit</td><td>Encrypted — data is scrambled during transfer</td></tr>
                <tr><td>Port 80</td><td>Port 443</td></tr>
                <tr><td>Fine for public, non-sensitive content</td><td>Required for logins, payments, personal data</td></tr>
                <tr><td><code>http://example.com</code></td><td><code>https://example.com</code></td></tr>
              </tbody>
            </table>
          </div>
          <p>The <strong>S</strong> in HTTPS stands for <em>Secure</em>. It uses a protocol called TLS to encrypt the connection. Modern browsers mark plain HTTP sites as "Not Secure" — always use HTTPS in production.</p>
        `
      },

      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "HTTP Methods — The Verbs of the Web",
        content: `
          <p>Every HTTP request includes a <strong>method</strong> (also called a verb) that describes what action you want to perform. There are 5 you'll use constantly:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Method</th><th>Action</th><th>Real-world example</th></tr></thead>
              <tbody>
                <tr><td><strong>GET</strong></td><td>Read / fetch data</td><td>Load a user's profile page</td></tr>
                <tr><td><strong>POST</strong></td><td>Create new data</td><td>Submit a registration form</td></tr>
                <tr><td><strong>PUT</strong></td><td>Replace existing data</td><td>Update your entire profile</td></tr>
                <tr><td><strong>PATCH</strong></td><td>Partially update data</td><td>Change only your email address</td></tr>
                <tr><td><strong>DELETE</strong></td><td>Remove data</td><td>Delete a post</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 PUT vs PATCH:</strong> PUT replaces the <em>entire</em> resource. If you PUT a user object and forget to include the phone number, it gets wiped. PATCH only updates the fields you send — safer for partial edits.
          </div>
          <h3>Safe vs Unsafe Methods</h3>
          <p><strong>Safe methods</strong> (GET) don't change anything on the server — they're read-only. <strong>Unsafe methods</strong> (POST, PUT, PATCH, DELETE) modify data. This distinction matters for caching, browser behaviour, and API design.</p>
          <div class="callout callout-info">
            <strong>💡 Idempotency:</strong> A method is <em>idempotent</em> if calling it multiple times gives the same result as calling it once. GET, PUT, and DELETE are idempotent. POST is not — clicking "Submit Order" twice will create two orders!
          </div>
        `
      },

      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Anatomy of an HTTP Request & Response",
        content: `
          <p>Every HTTP interaction has two parts: the <strong>request</strong> (client → server) and the <strong>response</strong> (server → client). Let's break both down.</p>
          <h3>📤 The Request</h3>
          <div class="code-block">
            <div class="code-label">HTTP Request</div>
            <pre><code>POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "name": "Ravi Kumar",
  "email": "ravi@example.com"
}</code></pre>
          </div>
          <p>A request has three parts:</p>
          <ul>
            <li>📋 <strong>Request line</strong> — method, path, and HTTP version (<code>POST /api/users HTTP/1.1</code>)</li>
            <li>🏷️ <strong>Headers</strong> — metadata like content type, auth tokens, caching rules</li>
            <li>📦 <strong>Body</strong> — the data you're sending (only for POST, PUT, PATCH)</li>
          </ul>
          <h3>📥 The Response</h3>
          <div class="code-block">
            <div class="code-label">HTTP Response</div>
            <pre><code>HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/42

{
  "id": 42,
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "createdAt": "2025-06-01T10:30:00Z"
}</code></pre>
          </div>
          <p>A response has:</p>
          <ul>
            <li>📋 <strong>Status line</strong> — HTTP version + status code + message (<code>201 Created</code>)</li>
            <li>🏷️ <strong>Headers</strong> — info about the response (content type, length, etc.)</li>
            <li>📦 <strong>Body</strong> — the returned data (often JSON)</li>
          </ul>
          <div class="callout callout-tip">
            <strong>💡 Common Headers to know:</strong><br>
            <code>Content-Type: application/json</code> — tells the receiver what format the body is in<br>
            <code>Authorization: Bearer &lt;token&gt;</code> — proves who you are<br>
            <code>Accept: application/json</code> — tells the server what format you want back
          </div>
        `
      },

      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "Which HTTP method should you use to fetch a list of products from an API?",
            options: [
              "POST",
              "DELETE",
              "GET",
              "PATCH"
            ],
            answer: 2,
            explanation: "GET is the correct method for reading/fetching data. It's safe (no side effects) and idempotent. POST creates, DELETE removes, and PATCH partially updates."
          },
          {
            q: "What is the key difference between PUT and PATCH?",
            options: [
              "PUT is for creating, PATCH is for deleting",
              "PUT replaces the entire resource; PATCH only updates specified fields",
              "PATCH is faster than PUT",
              "There is no difference — they're interchangeable"
            ],
            answer: 1,
            explanation: "PUT replaces the entire resource with the data you send. If you omit fields, they get wiped. PATCH applies only the changes you specify, leaving other fields untouched."
          },
          {
            q: "What does 'HTTP is stateless' mean?",
            options: [
              "HTTP doesn't support state management features",
              "The server remembers all previous requests from a client",
              "Each request is independent — the server has no memory of prior requests",
              "HTTP can only be used in the USA"
            ],
            answer: 2,
            explanation: "Stateless means each HTTP request is self-contained. The server treats every request as brand new. This is why authentication tokens need to be sent with every request."
          }
        ]
      },

      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "HTTP Status Codes",
        content: `
          <p>When a server responds, it always includes a <strong>3-digit status code</strong> that instantly tells you whether your request worked — and if not, why.</p>
          <p>Status codes are grouped into 5 families:</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Range</th><th>Category</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><strong>1xx</strong></td><td>Informational</td><td>Request received, processing continues</td></tr>
                <tr><td><strong>2xx</strong></td><td>✅ Success</td><td>Everything worked</td></tr>
                <tr><td><strong>3xx</strong></td><td>↩️ Redirection</td><td>The resource has moved</td></tr>
                <tr><td><strong>4xx</strong></td><td>❌ Client Error</td><td>You made a mistake in the request</td></tr>
                <tr><td><strong>5xx</strong></td><td>💥 Server Error</td><td>The server crashed or failed</td></tr>
              </tbody>
            </table>
          </div>
          <h3>The Codes Every Developer Knows</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>When you'll see it</th></tr></thead>
              <tbody>
                <tr><td><strong>200</strong></td><td>OK</td><td>Standard success — data returned</td></tr>
                <tr><td><strong>201</strong></td><td>Created</td><td>New resource successfully created (POST)</td></tr>
                <tr><td><strong>204</strong></td><td>No Content</td><td>Success, but no body to return (DELETE)</td></tr>
                <tr><td><strong>301</strong></td><td>Moved Permanently</td><td>URL has changed forever — update your link</td></tr>
                <tr><td><strong>400</strong></td><td>Bad Request</td><td>Malformed request or invalid data sent</td></tr>
                <tr><td><strong>401</strong></td><td>Unauthorized</td><td>Not logged in — send a valid token</td></tr>
                <tr><td><strong>403</strong></td><td>Forbidden</td><td>Logged in, but you don't have permission</td></tr>
                <tr><td><strong>404</strong></td><td>Not Found</td><td>Resource doesn't exist at that URL</td></tr>
                <tr><td><strong>422</strong></td><td>Unprocessable Entity</td><td>Data format is right but values are invalid</td></tr>
                <tr><td><strong>429</strong></td><td>Too Many Requests</td><td>You've been rate-limited — slow down!</td></tr>
                <tr><td><strong>500</strong></td><td>Internal Server Error</td><td>Something crashed on the server</td></tr>
                <tr><td><strong>503</strong></td><td>Service Unavailable</td><td>Server is down or overloaded</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 401 vs 403:</strong> 401 means "who are you?" (unauthenticated). 403 means "I know who you are, but you can't do this" (unauthorised). Classic interview question!
          </div>
        `
      },

      // ── Lesson 5 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is a REST API?",
        content: `
          <p>An <strong>API</strong> (Application Programming Interface) is a way for two programs to talk to each other. A <strong>REST API</strong> is an API that follows a specific set of design principles using HTTP.</p>
          <p><strong>REST</strong> stands for <em>Representational State Transfer</em> — don't worry about the full name. What matters are the principles:</p>
          <ul>
            <li>🔗 <strong>Resources</strong> — everything is a "resource" (a user, a post, an order) with its own URL</li>
            <li>📡 <strong>Stateless</strong> — each request carries all the information the server needs</li>
            <li>🔀 <strong>Standard methods</strong> — use HTTP verbs (GET, POST, PUT, DELETE) to act on resources</li>
            <li>📦 <strong>Representations</strong> — resources are sent as data (usually JSON)</li>
          </ul>
          <h3>What a RESTful URL looks like</h3>
          <div class="code-block">
            <div class="code-label">REST API Examples</div>
            <pre><code>GET    /api/users           → Get all users
GET    /api/users/42        → Get user with ID 42
POST   /api/users           → Create a new user
PUT    /api/users/42        → Replace user 42
PATCH  /api/users/42        → Partially update user 42
DELETE /api/users/42        → Delete user 42

GET    /api/users/42/orders → Get all orders for user 42
GET    /api/orders/7        → Get order 7 directly</code></pre>
          </div>
          <div class="callout callout-info">
            <strong>💡 URL design tips:</strong> Use <strong>nouns</strong>, not verbs, in URLs. The verb is already the HTTP method. <code>/api/getUser</code> is bad REST. <code>GET /api/users/42</code> is good REST.
          </div>
          <h3>REST vs Other Styles</h3>
          <p>REST is not the only way to build APIs. <strong>GraphQL</strong> (used by Facebook/Meta) lets clients request exactly the fields they need. <strong>gRPC</strong> (used by Google) is ultra-fast for internal services. But REST remains the most common and the best starting point.</p>
        `
      },

      // ── Lesson 6 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Calling APIs in Practice",
        content: `
          <p>Let's look at how you actually <em>call</em> a REST API — both from the terminal and from code.</p>
          <h3>🖥️ Using curl (Command Line)</h3>
          <div class="code-block">
            <div class="code-label">Terminal</div>
            <pre><code># GET request
curl https://api.example.com/users

# POST with JSON body
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name": "Priya", "email": "priya@example.com"}'

# DELETE
curl -X DELETE https://api.example.com/users/42 \\
  -H "Authorization: Bearer YOUR_TOKEN"</code></pre>
          </div>
          <h3>🟨 Using JavaScript (fetch)</h3>
          <div class="code-block">
            <div class="code-label">JavaScript</div>
            <pre><code>// GET request
const response = await fetch('https://api.example.com/users/42');
const user = await response.json();
console.log(user.name);

// POST request
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ name: 'Priya', email: 'priya@example.com' })
});

if (response.status === 201) {
  const newUser = await response.json();
  console.log('Created:', newUser.id);
}</code></pre>
          </div>
          <h3>🐍 Using Python (requests library)</h3>
          <div class="code-block">
            <div class="code-label">Python</div>
            <pre><code>import requests

# GET
response = requests.get('https://api.example.com/users/42')
user = response.json()

# POST
response = requests.post(
    'https://api.example.com/users',
    json={'name': 'Priya', 'email': 'priya@example.com'},
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
print(response.status_code)  # 201</code></pre>
          </div>
          <div class="callout callout-tip">
            <strong>💡 Use Postman or Insomnia</strong> to test APIs visually before writing code. These free tools let you build requests with a UI, inspect responses, and save collections of API calls for your team.
          </div>
        `
      },

      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — REST APIs & HTTP",
        questions: [
          {
            q: "A user tries to access a resource they don't have permission for, but they ARE logged in. Which status code should the server return?",
            options: [
              "401 Unauthorized",
              "404 Not Found",
              "403 Forbidden",
              "400 Bad Request"
            ],
            answer: 2,
            explanation: "403 Forbidden means the server knows who you are (you're authenticated) but you don't have permission for this action. 401 Unauthorized means the server doesn't know who you are — you haven't authenticated yet."
          },
          {
            q: "Which of these is a well-designed RESTful endpoint for deleting a blog post with ID 5?",
            options: [
              "GET /api/deletePost?id=5",
              "POST /api/posts/delete/5",
              "DELETE /api/posts/5",
              "REMOVE /api/posts/5"
            ],
            answer: 2,
            explanation: "REST uses HTTP methods as the verb and nouns in the URL. DELETE /api/posts/5 is correct. Using 'delete' in the URL path or using GET for destructive actions are anti-patterns."
          },
          {
            q: "You POST to create a new resource and it succeeds. What is the most appropriate HTTP status code to return?",
            options: [
              "200 OK",
              "204 No Content",
              "201 Created",
              "202 Accepted"
            ],
            answer: 2,
            explanation: "201 Created is the correct status for a successful POST that creates a new resource. 200 OK is for general success (often GET), and 204 No Content is for success with no response body (often DELETE)."
          },
          {
            q: "What does it mean for an API endpoint to be 'idempotent'?",
            options: [
              "It returns the same data every time regardless of input",
              "Calling it multiple times produces the same result as calling it once",
              "It can be called without authentication",
              "It works on all browsers and devices"
            ],
            answer: 1,
            explanation: "Idempotency means repeated identical requests produce the same outcome. GET, PUT, and DELETE are idempotent. POST is not — submitting the same order twice will create two orders."
          },
          {
            q: "Which header tells the server that the request body is in JSON format?",
            options: [
              "Accept: application/json",
              "Authorization: Bearer token",
              "Content-Type: application/json",
              "Format: json"
            ],
            answer: 2,
            explanation: "Content-Type: application/json tells the server what format the request BODY is in. The Accept header tells the server what format you want the RESPONSE in. Both are important but serve different purposes."
          }
        ]
      }

    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 8: Cloud Computing Basics
  // ─────────────────────────────────────────────────────────
  {
    id: "cloud-computing-basics",
    title: "Cloud Computing Basics",
    icon: "☁️",
    color: "#0891b2",
    description: "Demystify the cloud — understand what it is, the key service models (IaaS, PaaS, SaaS), deployment types, and the major providers powering the modern internet.",
    difficulty: "Beginner",
    estimatedTime: "30 min",
    tags: ["Cloud", "DevOps", "Infrastructure"],
    sections: [

      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "What is Cloud Computing?",
        content: `
          <p>Before the cloud, if a company needed a server, they had to <strong>buy physical hardware</strong>, set it up in a data centre, hire staff to maintain it, and pay for electricity and cooling — whether they used it or not.</p>
          <p><strong>Cloud computing</strong> flips this model. Instead of owning infrastructure, you <em>rent</em> it from a provider over the internet — paying only for what you use, scaling up or down in minutes.</p>
          <div class="callout callout-info">
            <strong>💡 Simple analogy:</strong> Cloud computing is like electricity from the grid. You don't build your own power plant — you plug in and pay for what you use. The cloud is the same idea, but for servers, storage, databases, and more.
          </div>
          <h3>The 5 Core Characteristics (NIST definition)</h3>
          <ul>
            <li>⚡ <strong>On-demand self-service</strong> — provision resources yourself, instantly, no human needed</li>
            <li>🌍 <strong>Broad network access</strong> — accessible from anywhere via the internet</li>
            <li>🏊 <strong>Resource pooling</strong> — many customers share the same physical infrastructure</li>
            <li>📈 <strong>Rapid elasticity</strong> — scale up in seconds, scale down just as fast</li>
            <li>📊 <strong>Measured service</strong> — usage is tracked and you're billed precisely for what you consume</li>
          </ul>
          <h3>Why It Matters for IT Professionals</h3>
          <p>Today, virtually every company uses cloud services — from startups running entirely on AWS to enterprises with hybrid setups. Understanding cloud fundamentals is no longer optional; it's a baseline expectation for developers, sysadmins, and IT professionals of all kinds.</p>
        `
      },

      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "IaaS, PaaS, and SaaS — The Three Service Models",
        content: `
          <p>Cloud services are grouped into three layers, each handling a different amount of the infrastructure for you. The higher you go, the less you manage.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th></th><th>IaaS</th><th>PaaS</th><th>SaaS</th></tr></thead>
              <tbody>
                <tr><td><strong>Stands for</strong></td><td>Infrastructure as a Service</td><td>Platform as a Service</td><td>Software as a Service</td></tr>
                <tr><td><strong>You manage</strong></td><td>OS, runtime, apps, data</td><td>Apps and data only</td><td>Nothing — just use it</td></tr>
                <tr><td><strong>Provider manages</strong></td><td>Hardware, networking, virtualisation</td><td>Everything below the app layer</td><td>Everything</td></tr>
                <tr><td><strong>Examples</strong></td><td>AWS EC2, Azure VMs, Google Compute Engine</td><td>Heroku, Google App Engine, AWS Elastic Beanstalk</td><td>Gmail, Slack, Salesforce, Dropbox</td></tr>
                <tr><td><strong>Best for</strong></td><td>Full control, custom setups</td><td>Developers who want to focus on code</td><td>End users, business tools</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Pizza analogy:</strong><br>
            <strong>IaaS</strong> = oven and ingredients delivered. You cook everything yourself.<br>
            <strong>PaaS</strong> = pizza dough and sauce provided. You add toppings and bake.<br>
            <strong>SaaS</strong> = pizza delivered to your door, ready to eat.
          </div>
          <p>A fourth model worth knowing: <strong>FaaS (Function as a Service)</strong> — also called <em>serverless</em>. You deploy individual functions (small pieces of code) and the cloud runs them only when triggered, charging per execution. Examples: AWS Lambda, Google Cloud Functions.</p>
        `
      },

      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Deployment Models — Public, Private & Hybrid",
        content: `
          <p>Not all cloud is the same. Depending on security, compliance, and cost requirements, organisations choose different <strong>deployment models</strong>.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Model</th><th>Who uses the infrastructure</th><th>Managed by</th><th>Best for</th></tr></thead>
              <tbody>
                <tr><td><strong>Public Cloud</strong></td><td>Many organisations share it</td><td>The cloud provider (AWS, Azure, GCP)</td><td>Startups, scalable apps, cost efficiency</td></tr>
                <tr><td><strong>Private Cloud</strong></td><td>A single organisation exclusively</td><td>The organisation itself or a managed provider</td><td>Banks, hospitals, high-security environments</td></tr>
                <tr><td><strong>Hybrid Cloud</strong></td><td>Mix of both</td><td>Shared responsibility</td><td>Enterprises with existing on-prem + cloud workloads</td></tr>
                <tr><td><strong>Multi-Cloud</strong></td><td>Multiple public providers simultaneously</td><td>The organisation</td><td>Avoiding vendor lock-in, best-of-breed services</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-info">
            <strong>💡 Real-world example:</strong> A bank might keep customer account data on a <strong>private cloud</strong> (for regulatory reasons) while running its public website and marketing tools on <strong>AWS</strong> (public cloud). That combination is a <strong>hybrid cloud</strong>.
          </div>
          <h3>On-Premises vs Cloud</h3>
          <p><strong>On-premises</strong> (or "on-prem") means running your own servers in your own building. You own and control everything — but you also pay for everything, even when idle. Cloud removes that capital expenditure and replaces it with operational expenditure (pay as you go).</p>
        `
      },

      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "A developer wants to deploy their web app without worrying about managing servers, OS patches, or runtime environments. Which cloud model fits best?",
            options: [
              "IaaS — they get full control over the VM",
              "PaaS — the platform handles infrastructure, they focus on code",
              "SaaS — they use pre-built software",
              "On-premises — they host it themselves"
            ],
            answer: 1,
            explanation: "PaaS (Platform as a Service) is designed exactly for this. The developer pushes their code and the platform handles everything underneath — OS, runtime, scaling. Heroku and Google App Engine are classic examples."
          },
          {
            q: "A hospital needs to keep patient records in a tightly controlled environment due to regulations, but wants to use public cloud for its staff email. What deployment model is this?",
            options: [
              "Public Cloud",
              "Private Cloud",
              "Hybrid Cloud",
              "Multi-Cloud"
            ],
            answer: 2,
            explanation: "Hybrid Cloud combines private infrastructure (for the sensitive regulated data) with public cloud services (for less sensitive workloads). This is very common in healthcare, finance, and government sectors."
          },
          {
            q: "Which of these is the best example of SaaS?",
            options: [
              "AWS EC2 (virtual machines)",
              "Google App Engine (app deployment platform)",
              "Slack (team messaging tool)",
              "AWS Lambda (serverless functions)"
            ],
            answer: 2,
            explanation: "Slack is SaaS — you just open a browser or app and use it. No infrastructure, no deployment, no OS management. AWS EC2 is IaaS, Google App Engine is PaaS, and AWS Lambda is FaaS (serverless)."
          }
        ]
      },

      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "The Major Cloud Providers",
        content: `
          <p>Three providers dominate the cloud market and together account for the vast majority of global cloud infrastructure.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th></th><th>AWS</th><th>Microsoft Azure</th><th>Google Cloud (GCP)</th></tr></thead>
              <tbody>
                <tr><td><strong>Launched</strong></td><td>2006</td><td>2010</td><td>2011</td></tr>
                <tr><td><strong>Market share</strong></td><td>~31% (largest)</td><td>~25% (second)</td><td>~11% (third)</td></tr>
                <tr><td><strong>Known for</strong></td><td>Widest range of services, most mature</td><td>Deep Microsoft/enterprise integration</td><td>Data, AI/ML, Kubernetes (invented it)</td></tr>
                <tr><td><strong>Compute</strong></td><td>EC2</td><td>Azure Virtual Machines</td><td>Compute Engine</td></tr>
                <tr><td><strong>Object storage</strong></td><td>S3</td><td>Azure Blob Storage</td><td>Cloud Storage</td></tr>
                <tr><td><strong>Serverless</strong></td><td>Lambda</td><td>Azure Functions</td><td>Cloud Functions</td></tr>
                <tr><td><strong>Managed database</strong></td><td>RDS</td><td>Azure SQL Database</td><td>Cloud SQL</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Which should you learn first?</strong> AWS is the safest bet for job market demand — it has the most certifications, tutorials, and job listings. Azure is the best choice if you work in a Microsoft-heavy enterprise. GCP is worth learning if you're focused on data engineering or ML.
          </div>
          <p>Beyond the "Big Three", other notable providers include <strong>Oracle Cloud</strong>, <strong>IBM Cloud</strong>, <strong>Alibaba Cloud</strong> (dominant in Asia), and <strong>DigitalOcean</strong> (popular with developers for its simplicity).</p>
        `
      },

      // ── Lesson 5 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Key Cloud Concepts You'll Encounter",
        content: `
          <p>Cloud platforms come with their own vocabulary. Here are the essential concepts that come up constantly:</p>
          <h3>🗺️ Regions &amp; Availability Zones</h3>
          <p>Cloud providers divide the world into <strong>regions</strong> — geographic areas like "us-east-1" (N. Virginia) or "ap-south-1" (Mumbai). Each region contains multiple <strong>Availability Zones (AZs)</strong> — physically separate data centres within the same region. Running your app across multiple AZs means it keeps working even if one data centre goes down.</p>
          <div class="callout callout-info">
            <strong>💡 Why regions matter:</strong> Data residency laws (like GDPR in Europe) may require you to keep certain data within specific geographic regions. Always check compliance requirements before choosing a region.
          </div>
          <h3>📦 Virtual Machines vs Containers vs Serverless</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th></th><th>Virtual Machines</th><th>Containers (Docker)</th><th>Serverless</th></tr></thead>
              <tbody>
                <tr><td><strong>What it is</strong></td><td>Full emulated computer with its own OS</td><td>Lightweight app package sharing the host OS</td><td>Individual functions triggered by events</td></tr>
                <tr><td><strong>Startup time</strong></td><td>Minutes</td><td>Seconds</td><td>Milliseconds</td></tr>
                <tr><td><strong>You manage</strong></td><td>OS, patches, runtime</td><td>App and dependencies</td><td>Just the code</td></tr>
                <tr><td><strong>Best for</strong></td><td>Full control, legacy apps</td><td>Microservices, portability</td><td>Event-driven tasks, APIs</td></tr>
              </tbody>
            </table>
          </div>
          <h3>📈 Scalability — Scaling Up vs Scaling Out</h3>
          <ul>
            <li>⬆️ <strong>Vertical scaling (scale up)</strong> — give your server more CPU/RAM. Simple, but has limits and requires downtime.</li>
            <li>➡️ <strong>Horizontal scaling (scale out)</strong> — add more servers. More complex but essentially unlimited and more resilient.</li>
          </ul>
          <div class="callout callout-tip">
            <strong>💡 Auto-scaling</strong> — cloud platforms can automatically add or remove servers based on traffic. Your app handles a Black Friday traffic spike without you touching anything, then scales back down to save cost.
          </div>
          <h3>💾 Object Storage vs Block Storage</h3>
          <p><strong>Object storage</strong> (like AWS S3) stores files as objects — great for images, videos, backups, and static websites. No file hierarchy, infinitely scalable. <strong>Block storage</strong> (like AWS EBS) works like a hard drive attached to a VM — used for databases and OS disks where you need low latency and random access.</p>
        `
      },

      // ── Lesson 6 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Cloud Economics & the Shared Responsibility Model",
        content: `
          <p>Two concepts that every IT professional must understand before working with cloud: <strong>how you're billed</strong> and <strong>who is responsible for what</strong>.</p>
          <h3>💰 Cloud Pricing Models</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Model</th><th>How it works</th><th>Best for</th></tr></thead>
              <tbody>
                <tr><td><strong>On-Demand</strong></td><td>Pay by the hour or second, no commitment</td><td>Unpredictable workloads, testing</td></tr>
                <tr><td><strong>Reserved</strong></td><td>Commit to 1–3 years, get up to 72% discount</td><td>Stable, predictable workloads</td></tr>
                <tr><td><strong>Spot / Preemptible</strong></td><td>Use spare capacity at massive discounts (up to 90%) — can be interrupted</td><td>Batch jobs, fault-tolerant workloads</td></tr>
                <tr><td><strong>Free Tier</strong></td><td>Limited free usage every month</td><td>Learning, development, small projects</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-info">
            <strong>⚠️ Cloud bill shock is real.</strong> Forgetting to turn off a VM, accidentally leaving data transfer running, or misconfiguring auto-scaling can lead to surprise bills. Always set up <strong>billing alerts</strong> and <strong>budget limits</strong> — every provider offers these for free.
          </div>
          <h3>🔐 The Shared Responsibility Model</h3>
          <p>Security in the cloud is a <strong>shared responsibility</strong> between you and the provider. A common misconception is that moving to the cloud means the provider handles all security. It doesn't.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Cloud Provider is responsible for...</th><th>You are responsible for...</th></tr></thead>
              <tbody>
                <tr><td>Physical data centre security</td><td>Who has access to your cloud account (IAM)</td></tr>
                <tr><td>Hardware and network infrastructure</td><td>Encrypting your data at rest and in transit</td></tr>
                <tr><td>Virtualisation layer</td><td>Configuring firewalls and security groups correctly</td></tr>
                <tr><td>Managed service security (e.g. S3 infrastructure)</td><td>Setting correct permissions on your S3 buckets</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Most cloud breaches aren't the provider's fault.</strong> They're caused by misconfigured permissions, weak passwords, or exposed API keys — all the customer's responsibility. Always follow the <strong>principle of least privilege</strong>: give every user and service only the minimum access they need.
          </div>
        `
      },

      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — Cloud Computing Basics",
        questions: [
          {
            q: "What is the main advantage of 'horizontal scaling' over 'vertical scaling'?",
            options: [
              "It's cheaper per server",
              "It adds more CPU and RAM to one machine, making it more powerful",
              "It adds more servers, making the system more resilient and essentially unlimited in scale",
              "It's easier to configure and requires no code changes"
            ],
            answer: 2,
            explanation: "Horizontal scaling (scaling out) adds more servers to distribute load, making the system more fault-tolerant and virtually unlimited in scale. Vertical scaling (scaling up) hits hardware limits and usually requires downtime."
          },
          {
            q: "A company's S3 bucket was left publicly readable, exposing customer data. Whose responsibility was this misconfiguration?",
            options: [
              "AWS — they should have prevented the bucket from being public",
              "The customer — configuring access permissions is the customer's responsibility",
              "Both equally — AWS and the customer share 50/50 blame",
              "Neither — S3 is always private by default so this couldn't happen"
            ],
            answer: 1,
            explanation: "Under the Shared Responsibility Model, the cloud provider secures the infrastructure, but the customer is responsible for configuring access controls, permissions, and encryption. Misconfigured S3 buckets are one of the most common causes of cloud data breaches."
          },
          {
            q: "You're running a batch data processing job overnight that can tolerate interruptions. Which pricing model saves the most money?",
            options: [
              "On-Demand — most flexible",
              "Reserved — best long-term discount",
              "Spot / Preemptible — uses spare capacity at up to 90% discount",
              "Free Tier — always cheapest"
            ],
            answer: 2,
            explanation: "Spot (AWS) or Preemptible (GCP) instances offer massive discounts by using spare cloud capacity. They can be interrupted with short notice, making them perfect for fault-tolerant batch jobs. Free Tier has usage limits and isn't meant for production workloads."
          },
          {
            q: "What is an Availability Zone (AZ)?",
            options: [
              "A country where a cloud provider has offices",
              "A physically separate data centre within a cloud region, used to provide fault tolerance",
              "A virtual network zone that separates public and private resources",
              "A geographic area like 'US East' or 'Europe West'"
            ],
            answer: 1,
            explanation: "An Availability Zone is a physically separate (and independently powered) data centre within a cloud region. Deploying across multiple AZs means your app keeps running even if one data centre has an outage. The larger geographic area is called a Region."
          },
          {
            q: "Google invented Kubernetes and is known for its strengths in data and AI/ML. Which cloud provider is this?",
            options: [
              "AWS (Amazon Web Services)",
              "Microsoft Azure",
              "Google Cloud Platform (GCP)",
              "IBM Cloud"
            ],
            answer: 2,
            explanation: "Google Cloud Platform created Kubernetes (now open-source and used everywhere) and is renowned for its expertise in data processing (BigQuery), AI/ML (Vertex AI), and networking. AWS leads in overall market share and service breadth, while Azure leads in enterprise Microsoft integration."
          }
        ]
      }

    ]
  },

  // ─────────────────────────────────────────────────────────
  //  TOPIC 9: Cybersecurity Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    icon: "🔐",
    color: "#dc2626",
    description: "Learn how attackers think, how systems get compromised, and how to defend against the most common threats — essential knowledge for every IT professional.",
    difficulty: "Beginner",
    estimatedTime: "35 min",
    tags: ["Security", "Networking", "Best Practices"],
    sections: [

      // ── Lesson 1 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "The CIA Triad — The Foundation of Security",
        content: `
          <p>Every security decision in IT traces back to three core goals. Together they form the <strong>CIA Triad</strong> — the most fundamental model in cybersecurity.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Principle</th><th>Goal</th><th>Threat example</th><th>Defence example</th></tr></thead>
              <tbody>
                <tr><td>🔒 <strong>Confidentiality</strong></td><td>Only authorised people can access the data</td><td>A hacker steals a database of passwords</td><td>Encryption, access controls, MFA</td></tr>
                <tr><td>✅ <strong>Integrity</strong></td><td>Data hasn't been tampered with or corrupted</td><td>An attacker modifies a financial transaction in transit</td><td>Hashing, digital signatures, audit logs</td></tr>
                <tr><td>⚡ <strong>Availability</strong></td><td>Authorised users can access the system when needed</td><td>A DDoS attack takes down a company's website</td><td>Redundancy, backups, DDoS protection</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-info">
            <strong>💡 Real-world example:</strong> A ransomware attack hits all three. It destroys <strong>availability</strong> (you can't access your files), threatens <strong>confidentiality</strong> (attackers may exfiltrate data before encrypting), and damages <strong>integrity</strong> (files are encrypted and unreadable).
          </div>
          <h3>Authentication vs Authorisation</h3>
          <p>Two terms that are often confused but are completely different:</p>
          <ul>
            <li>🪪 <strong>Authentication (AuthN)</strong> — verifying <em>who you are</em>. Logging in with a username and password.</li>
            <li>🚪 <strong>Authorisation (AuthZ)</strong> — verifying <em>what you're allowed to do</em>. Checking if you have permission to access a file after you've logged in.</li>
          </ul>
          <div class="callout callout-tip">
            <strong>🎯 Easy way to remember:</strong> Authentication = "Are you really you?" Authorisation = "OK, but are you allowed to be here?"
          </div>
        `
      },

      // ── Lesson 2 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Common Attack Types",
        content: `
          <p>To defend systems, you need to understand how they're attacked. Here are the most common threats you'll encounter in the real world.</p>
          <h3>🎣 Phishing</h3>
          <p>The attacker impersonates a trusted entity (your bank, IT department, a colleague) via email, SMS, or phone to trick you into revealing credentials or clicking a malicious link. Phishing is responsible for the majority of data breaches — it exploits people, not technology.</p>
          <ul>
            <li><strong>Spear phishing</strong> — targeted at a specific individual, personalised to seem credible</li>
            <li><strong>Whaling</strong> — spear phishing aimed at executives (the "big fish")</li>
            <li><strong>Smishing</strong> — phishing via SMS text message</li>
          </ul>
          <h3>🦠 Malware</h3>
          <p>Malicious software designed to damage, disrupt, or gain unauthorised access to a system.</p>
          <div class="comparison-table">
            <table>
              <thead><tr><th>Type</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td><strong>Virus</strong></td><td>Attaches to files and spreads when those files are opened</td></tr>
                <tr><td><strong>Ransomware</strong></td><td>Encrypts your files and demands payment for the key</td></tr>
                <tr><td><strong>Trojan</strong></td><td>Disguises itself as legitimate software, then attacks from inside</td></tr>
                <tr><td><strong>Spyware</strong></td><td>Silently monitors your activity and sends data to the attacker</td></tr>
                <tr><td><strong>Rootkit</strong></td><td>Hides deep in the OS, giving attackers persistent hidden access</td></tr>
              </tbody>
            </table>
          </div>
          <h3>👤 Man-in-the-Middle (MitM)</h3>
          <p>The attacker secretly intercepts communication between two parties — reading or altering the data without either side knowing. Common on unsecured public Wi-Fi. Using HTTPS prevents this for web traffic.</p>
          <h3>💥 Denial of Service (DoS) &amp; DDoS</h3>
          <p>Flooding a server with so many requests it can't respond to legitimate users. A <strong>DDoS</strong> (Distributed DoS) uses thousands of compromised machines (a <em>botnet</em>) to amplify the attack to a scale that's very hard to defend against.</p>
          <h3>💉 SQL Injection</h3>
          <p>An attacker inserts malicious SQL code into an input field (like a login form) to manipulate the database — potentially dumping all user data or bypassing authentication entirely.</p>
          <div class="code-block">
            <div class="code-label">SQL Injection Example</div>
            <pre><code>-- Normal query built from user input:
SELECT * FROM users WHERE username = 'alice' AND password = 'pass123';

-- Attacker enters: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '';
-- '1'='1' is always true → attacker bypasses login!</code></pre>
          </div>
        `
      },

      // ── Lesson 3 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Passwords, Hashing & Multi-Factor Authentication",
        content: `
          <p>Weak credential management is one of the most exploited vulnerabilities. Here's how it works — and how to do it right.</p>
          <h3>🔑 Why Passwords Should Never Be Stored in Plain Text</h3>
          <p>If a database is breached and passwords are stored as plain text, every user account is instantly compromised. The solution is <strong>hashing</strong> — a one-way mathematical function that converts a password into a fixed-length string.</p>
          <div class="code-block">
            <div class="code-label">Hashing Example</div>
            <pre><code>Plain text:  "mypassword123"
SHA-256:     "9b8769a4a742959a2d0298c36fb70623f2a2d0898c36fb70623..."

Plain text:  "mypassword124"   ← just one character different
SHA-256:     "3f1abc82e..."     ← completely different hash</code></pre>
          </div>
          <p>You can't reverse a hash back to the original password. When you log in, your input is hashed and compared to the stored hash. The original password is never stored.</p>
          <div class="callout callout-info">
            <strong>💡 Salting:</strong> Attackers use pre-computed tables of hashes (called <em>rainbow tables</em>) to crack common passwords. Adding a random <strong>salt</strong> (a unique string appended to each password before hashing) makes these tables useless. Good password libraries like bcrypt do this automatically.
          </div>
          <h3>🔐 Multi-Factor Authentication (MFA)</h3>
          <p>MFA requires users to provide two or more of the following before gaining access:</p>
          <ul>
            <li>🧠 <strong>Something you know</strong> — password or PIN</li>
            <li>📱 <strong>Something you have</strong> — a phone (TOTP app), hardware key (YubiKey)</li>
            <li>👁️ <strong>Something you are</strong> — fingerprint, face scan (biometrics)</li>
          </ul>
          <p>Even if an attacker steals your password, they still can't log in without the second factor. Enabling MFA is one of the single highest-impact security improvements any individual or organisation can make.</p>
          <h3>🏋️ Password Best Practices</h3>
          <ul>
            <li>Use a <strong>password manager</strong> (1Password, Bitwarden) — never reuse passwords</li>
            <li>Longer is stronger — a 16-character passphrase beats a complex 8-character password</li>
            <li>Never use personal info (birthdays, pet names) — attackers use this in targeted attacks</li>
            <li>Enable <strong>breach monitoring</strong> — services like HaveIBeenPwned alert you if your email appears in known breaches</li>
          </ul>
        `
      },

      // ── Quiz 1 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "⚡ Quick Check #1",
        questions: [
          {
            q: "A ransomware attack encrypts all files on a company's servers, making them inaccessible. Which pillar of the CIA Triad is primarily violated?",
            options: [
              "Confidentiality — the data has been exposed",
              "Integrity — the data has been altered",
              "Availability — authorised users can no longer access the data",
              "Authentication — user identities have been compromised"
            ],
            answer: 2,
            explanation: "Ransomware primarily attacks Availability — the files still exist but are encrypted and inaccessible to the rightful owners. It may also threaten Confidentiality if the attackers exfiltrate data before encrypting it."
          },
          {
            q: "An attacker sends an email pretending to be the CEO, asking an employee to urgently wire money to a new account. What type of attack is this?",
            options: [
              "SQL Injection",
              "DDoS attack",
              "Whaling (targeted spear phishing)",
              "Man-in-the-Middle"
            ],
            answer: 2,
            explanation: "This is whaling — a spear phishing attack specifically targeting or impersonating executives. It exploits urgency and authority rather than technical vulnerabilities. This type of attack (also called BEC — Business Email Compromise) costs organisations billions annually."
          },
          {
            q: "Why is hashing passwords more secure than encrypting them?",
            options: [
              "Hashes are longer and harder to guess",
              "Hashing is a one-way process — you cannot reverse a hash to get the original password",
              "Encrypted passwords still get stolen in breaches",
              "Hashing is faster, making login quicker"
            ],
            answer: 1,
            explanation: "Hashing is one-way — you can't reverse it to recover the original password. Encryption is two-way — anyone with the key can decrypt it. If a database is stolen, encrypted passwords can be decrypted, but hashed passwords (especially with salting) cannot be reversed."
          }
        ]
      },

      // ── Lesson 4 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Encryption — Keeping Data Secret",
        content: `
          <p><strong>Encryption</strong> transforms readable data (plaintext) into scrambled data (ciphertext) using a mathematical algorithm and a key. Only someone with the correct key can decrypt it back to readable form.</p>
          <h3>🔑 Symmetric vs Asymmetric Encryption</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th></th><th>Symmetric</th><th>Asymmetric</th></tr></thead>
              <tbody>
                <tr><td><strong>Keys used</strong></td><td>One shared secret key for both encrypt &amp; decrypt</td><td>A key pair: public key (encrypt) + private key (decrypt)</td></tr>
                <tr><td><strong>Speed</strong></td><td>Very fast</td><td>Slower</td></tr>
                <tr><td><strong>Problem</strong></td><td>How do you securely share the key?</td><td>No key-sharing problem — public key can be given to anyone</td></tr>
                <tr><td><strong>Common algorithms</strong></td><td>AES-256</td><td>RSA, ECC</td></tr>
                <tr><td><strong>Used for</strong></td><td>Encrypting large data (files, databases)</td><td>TLS handshakes, digital signatures, SSH</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 How HTTPS uses both:</strong> When you connect to a website over HTTPS, asymmetric encryption is used first to securely exchange a symmetric key. Then that symmetric key is used for the rest of the session (because it's much faster). This is called the <strong>TLS handshake</strong>.
          </div>
          <h3>🔏 Encryption at Rest vs In Transit</h3>
          <ul>
            <li>💾 <strong>At rest</strong> — data sitting in storage (a database, hard drive, S3 bucket) is encrypted so it's unreadable if the storage is stolen</li>
            <li>🌐 <strong>In transit</strong> — data moving across a network is encrypted so it can't be intercepted (HTTPS, TLS, VPNs)</li>
          </ul>
          <div class="callout callout-info">
            <strong>💡 End-to-end encryption (E2EE)</strong> means only the sender and receiver can read the message — not even the service provider. WhatsApp, Signal, and iMessage use E2EE. This is different from standard HTTPS, where the server can read the data.
          </div>
        `
      },

      // ── Lesson 5 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Network Security Basics",
        content: `
          <p>Securing the network is a core part of any defence strategy. Here are the essential tools and concepts.</p>
          <h3>🧱 Firewalls</h3>
          <p>A firewall monitors and controls incoming and outgoing network traffic based on a set of rules. Think of it as a security guard at the door — it checks every packet and decides whether to allow or block it based on IP address, port, and protocol.</p>
          <ul>
            <li><strong>Network firewall</strong> — sits between your network and the internet (hardware or virtual)</li>
            <li><strong>Host-based firewall</strong> — runs on an individual machine (Windows Defender Firewall, iptables on Linux)</li>
            <li><strong>WAF (Web Application Firewall)</strong> — specifically protects web apps from attacks like SQL injection and XSS</li>
          </ul>
          <h3>🔍 IDS vs IPS</h3>
          <div class="comparison-table">
            <table>
              <thead><tr><th></th><th>IDS (Intrusion Detection System)</th><th>IPS (Intrusion Prevention System)</th></tr></thead>
              <tbody>
                <tr><td><strong>What it does</strong></td><td>Monitors traffic and <em>alerts</em> when suspicious activity is detected</td><td>Monitors traffic and <em>automatically blocks</em> threats</td></tr>
                <tr><td><strong>Action</strong></td><td>Passive — logs and notifies</td><td>Active — blocks in real time</td></tr>
                <tr><td><strong>Risk</strong></td><td>Threat isn't stopped automatically</td><td>False positives can block legitimate traffic</td></tr>
              </tbody>
            </table>
          </div>
          <h3>🛡️ VPNs</h3>
          <p>A <strong>VPN (Virtual Private Network)</strong> creates an encrypted tunnel between your device and a server, masking your traffic from anyone on the same network. Used by companies so remote workers can securely access internal systems as if they were in the office.</p>
          <h3>🏘️ Network Segmentation &amp; the Principle of Least Privilege</h3>
          <p><strong>Network segmentation</strong> divides a network into isolated zones. If an attacker breaches one zone (say, the guest Wi-Fi), they can't automatically access the internal corporate network. Combined with the <strong>principle of least privilege</strong> — giving every user and service only the minimum access they need — this drastically limits damage from breaches.</p>
          <div class="callout callout-info">
            <strong>💡 Zero Trust</strong> is a modern security model built on "never trust, always verify." Even users inside the corporate network must authenticate and be authorised for every resource they access. No one is implicitly trusted just because they're on the internal network.
          </div>
        `
      },

      // ── Lesson 6 ──────────────────────────────────────────
      {
        type: "lesson",
        title: "Security Best Practices & Incident Response",
        content: `
          <p>Knowing the threats is only half the battle — here's how professionals actually defend systems and respond when things go wrong.</p>
          <h3>🛡️ Defence in Depth</h3>
          <p>Don't rely on a single security control. <strong>Defence in depth</strong> layers multiple controls so that if one fails, others catch the attacker. Like a castle with a moat, walls, guards, and a locked keep — not just a front door lock.</p>
          <h3>🔄 Patch Management</h3>
          <p>The majority of successful attacks exploit <strong>known vulnerabilities</strong> that already have patches available — the organisations just hadn't applied them. Keeping software, OSes, and firmware up to date is one of the most effective (and underrated) security controls.</p>
          <div class="callout callout-info">
            <strong>💡 The WannaCry ransomware attack (2017)</strong> infected 200,000+ machines across 150 countries — including the UK's NHS. The vulnerability it exploited had been patched by Microsoft two months earlier. Most victims simply hadn't updated Windows.
          </div>
          <h3>💾 Backups — The 3-2-1 Rule</h3>
          <p>A reliable backup strategy is your last line of defence against ransomware and disasters:</p>
          <ul>
            <li>3️⃣ Keep <strong>3 copies</strong> of your data</li>
            <li>2️⃣ Store on <strong>2 different media types</strong> (e.g. local drive + cloud)</li>
            <li>1️⃣ Keep <strong>1 copy offsite</strong> (so a fire or flood doesn't destroy everything)</li>
          </ul>
          <h3>🚨 Incident Response — The 6 Phases</h3>
          <p>When a breach happens, organisations follow a structured process:</p>
          <div class="stages">
            <div class="stage"><span class="stage-num">1</span><strong>Preparation</strong><br>Policies, tools, and training in place before an incident</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">2</span><strong>Identification</strong><br>Detect and confirm that an incident has occurred</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">3</span><strong>Containment</strong><br>Isolate affected systems to stop the spread</div>
          </div>
          <div class="stages" style="margin-top:0.5rem">
            <div class="stage"><span class="stage-num">4</span><strong>Eradication</strong><br>Remove the threat (malware, attacker access)</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">5</span><strong>Recovery</strong><br>Restore systems and verify they're clean</div>
            <div class="stage-arrow">→</div>
            <div class="stage"><span class="stage-num">6</span><strong>Lessons Learned</strong><br>Post-mortem: what happened and how to prevent recurrence</div>
          </div>
          <div class="callout callout-tip">
            <strong>🎯 Certifications to consider:</strong> CompTIA Security+ is the most recognised entry-level cybersecurity cert. For cloud security: AWS Security Specialty or Microsoft SC-900. For ethical hacking: CEH or OSCP (advanced).
          </div>
        `
      },

      // ── Quiz 2 ────────────────────────────────────────────
      {
        type: "quiz",
        title: "🏆 Final Quiz — Cybersecurity Fundamentals",
        questions: [
          {
            q: "What is the difference between authentication and authorisation?",
            options: [
              "They are the same thing — both verify identity",
              "Authentication verifies who you are; authorisation determines what you're allowed to do",
              "Authorisation verifies who you are; authentication determines what you're allowed to do",
              "Authentication applies to humans; authorisation applies to systems"
            ],
            answer: 1,
            explanation: "Authentication (AuthN) confirms your identity — 'Are you really Ravi?' Authorisation (AuthZ) determines your permissions — 'OK Ravi, you can read this file but not delete it.' You always authenticate before being authorised."
          },
          {
            q: "Which type of encryption uses a public key to encrypt and a private key to decrypt?",
            options: [
              "Symmetric encryption (e.g. AES-256)",
              "Hashing (e.g. SHA-256)",
              "Asymmetric encryption (e.g. RSA)",
              "End-to-end encryption"
            ],
            answer: 2,
            explanation: "Asymmetric encryption uses a key pair. Anyone can encrypt data using your public key, but only you can decrypt it with your private key. This solves the key-distribution problem of symmetric encryption and is used in TLS, SSH, and digital signatures."
          },
          {
            q: "An attacker gains access to a company's guest Wi-Fi but cannot reach the internal HR system because it's on a separate network segment. What security principle prevented the lateral movement?",
            options: [
              "Encryption at rest",
              "Multi-Factor Authentication",
              "Network segmentation and least privilege",
              "Patch management"
            ],
            answer: 2,
            explanation: "Network segmentation isolates different parts of the network so a breach in one zone can't automatically spread to others. Combined with least privilege (only granting the minimum necessary access), it dramatically limits what an attacker can reach after an initial compromise."
          },
          {
            q: "A company's servers were infected with ransomware on a Tuesday. Their last backup was from the previous Thursday and wasn't tested. What was their biggest backup failure?",
            options: [
              "They didn't follow the 3-2-1 backup rule",
              "They backed up too infrequently AND never tested their backups",
              "They stored backups on the same server that got infected",
              "They used cloud storage instead of physical media"
            ],
            answer: 1,
            explanation: "Two failures here: (1) backing up only once a week means losing days of data, and (2) never testing backups means you don't know if they actually work until disaster strikes — by which point it's too late. An untested backup is not a backup."
          },
          {
            q: "What is 'Defence in Depth'?",
            options: [
              "Having one very strong firewall to block all threats",
              "Layering multiple security controls so that if one fails, others still protect the system",
              "Encrypting data at multiple levels of the OSI model",
              "A strategy where the security team works in shifts 24/7"
            ],
            answer: 1,
            explanation: "Defence in depth means never relying on a single control. You use firewalls, MFA, encryption, network segmentation, patch management, backups, and monitoring together — so an attacker who bypasses one layer still faces multiple others."
          }
        ]
      }

    ]
  }

  // ─────────────────────────────────────────────────────────
  //  ADD YOUR NEXT TOPIC HERE
  //  Just copy the structure above and fill in your content!
  // ─────────────────────────────────────────────────────────
];

