/*!
 * B-star51 Chatbot Widget
 * Rule-based, zero dependencies, drop-in script tag.
 * Usage: <script src="chatbot.js"></script>
 */
(function () {
  'use strict';

  // ── RESPONSES ──────────────────────────────────────────────────────────────
  // Each entry: { keywords: [...], reply: "..." }
  // First matching rule wins. Lowercase keywords, partial match.
  const RULES = [
    {
      keywords: ['hello', 'hi', 'hey', 'sup', 'yo', 'howdy', 'hiya'],
      reply: "Hi! 👋 I'm B-star51's site assistant. Ask me about services, projects, skills, or how to get in touch!"
    },
    {
      keywords: ['who are you', 'what are you', 'bot', 'robot', 'ai', 'automated'],
      reply: "I'm a lightweight rule-based chatbot — no AI APIs, just fast scripted answers. For the real B-star51, hit the Contact section!"
    },
    {
      keywords: ['service', 'offer', 'do you do', 'what can you do', 'help with'],
      reply: "Three main service areas:\n🔐 Security — web app pentesting, OWASP assessments, vuln scanning\n💻 Web Dev — secure full-stack apps, responsive front-ends\n🤖 AI/Automation — Python scripts, chatbot integration, API tooling"
    },
    {
      keywords: ['project', 'portfolio', 'work', 'built', 'made', 'repo', 'github'],
      reply: "Current projects:\n• Web App Vulnerability Scanner (Python/XSS/SQLi)\n• Secure Web App (OWASP-aligned full-stack)\n• Pentesting Automation Toolkit (port scanner, subdomain enum)\n• GhostFile (browser-based AES-GCM file encryption)\n• dufo.save (Linux privesc recon script)\n\nAll on GitHub → github.com/B-star51"
    },
    {
      keywords: ['skill', 'know', 'tech', 'language', 'tool', 'stack'],
      reply: "Key skills:\n🔐 Burp Suite, Nmap, Metasploit, Gobuster, Hydra, Hashcat\n💻 Python, JavaScript, HTML/CSS, Bash, Flask\n🖥️ Linux (Kali/Ubuntu), Git, Active Directory\n🤖 Claude API, OpenAI API, NVIDIA NIM"
    },
    {
      keywords: ['pentest', 'penetration', 'hacking', 'ctf', 'security', 'hack', 'vuln', 'exploit'],
      reply: "Security is my main focus — web app pentesting, CTF challenges, and privilege escalation. Check out codex-jinx (pentesting playbook) and bug-hunting (recon methodology) on GitHub."
    },
    {
      keywords: ['price', 'cost', 'rate', 'charge', 'fee', 'quote', 'hire', 'available'],
      reply: "I'm open to junior pentester roles, freelance security assessments, and web dev work. Drop an email to discuss — taylormeai@outlook.com"
    },
    {
      keywords: ['contact', 'email', 'reach', 'message', 'get in touch', 'linkedin'],
      reply: "Best ways to reach me:\n✉️ taylormeai@outlook.com\n🐙 github.com/B-star51\n💼 Check the Contact section for LinkedIn"
    },
    {
      keywords: ['tryhackme', 'thm', 'rank', 'top 1', 'cert', 'certification', 'oscp', 'comptia'],
      reply: "Currently Top 1% on TryHackMe (CyberA1eX). Certs: CompTIA Security+, Network+, ISC2 CC, Cisco Ethical Hacker, THM Jr. Pentest. Working towards OSCP."
    },
    {
      keywords: ['ghostfile', 'ghost', 'encrypt', 'encryption', 'aes'],
      reply: "GhostFile is a browser-based file encryption tool — AES-GCM 256-bit, fully client-side. Files never leave your machine unencrypted. Split-key design for secure sharing. → github.com/B-star51/ghostfile"
    },
    {
      keywords: ['dufo', 'privesc', 'privilege escalation', 'linux script', 'bash script'],
      reply: "dufo.save is a Bash script that automates Linux privesc recon — collects sudo rules, SUID binaries, cron jobs, writable paths, and network listeners into a timestamped folder. → github.com/B-star51/dufo.save"
    },
    {
      keywords: ['bye', 'goodbye', 'see you', 'later', 'thanks', 'thank you', 'cheers'],
      reply: "Cheers! 👊 Feel free to come back anytime. Stay curious, stay secure."
    },
    {
      keywords: ['joke', 'funny', 'laugh'],
      reply: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛"
    }
  ];

  const DEFAULT_REPLY = "I don't have a scripted answer for that — but feel free to email directly: taylormeai@outlook.com 👍";

  function getReply(input) {
    const lower = input.toLowerCase();
    for (const rule of RULES) {
      if (rule.keywords.some(kw => lower.includes(kw))) {
        return rule.reply;
      }
    }
    return DEFAULT_REPLY;
  }

  // ── BUILD UI ───────────────────────────────────────────────────────────────
  const CSS = `
    #cb-toggle{position:fixed;bottom:24px;right:24px;z-index:9999;width:52px;height:52px;border-radius:50%;background:#58a6ff;border:none;cursor:pointer;font-size:1.4rem;box-shadow:0 4px 20px rgba(88,166,255,.45);transition:transform .2s;}
    #cb-toggle:hover{transform:scale(1.1);}
    #cb-box{position:fixed;bottom:88px;right:24px;z-index:9998;width:320px;max-height:460px;display:flex;flex-direction:column;background:#161b22;border:1px solid #30363d;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.6);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;transition:opacity .2s,transform .2s;}
    #cb-box.cb-hidden{opacity:0;transform:translateY(12px);pointer-events:none;}
    #cb-header{background:#0d1117;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #30363d;}
    #cb-header span{font-size:.9rem;font-weight:600;color:#e6edf3;}
    #cb-header small{font-size:.75rem;color:#3fb950;}
    #cb-close{background:none;border:none;color:#8b949e;cursor:pointer;font-size:1.1rem;padding:0;}
    #cb-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}
    .cb-msg{max-width:82%;padding:9px 12px;border-radius:10px;font-size:.85rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;}
    .cb-bot{background:#1c2128;color:#e6edf3;border:1px solid #30363d;align-self:flex-start;border-bottom-left-radius:3px;}
    .cb-user{background:#58a6ff;color:#0d1117;align-self:flex-end;border-bottom-right-radius:3px;}
    #cb-footer{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #30363d;background:#0d1117;}
    #cb-input{flex:1;background:#161b22;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#e6edf3;font-size:.85rem;outline:none;}
    #cb-input:focus{border-color:#58a6ff;}
    #cb-send{background:#58a6ff;border:none;border-radius:6px;padding:8px 12px;color:#0d1117;font-size:.85rem;font-weight:600;cursor:pointer;}
    #cb-send:hover{background:#79c0ff;}
    @media(max-width:400px){#cb-box{width:calc(100vw - 32px);right:16px;}}
  `;

  function inject() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Toggle button
    const toggle = document.createElement('button');
    toggle.id = 'cb-toggle';
    toggle.title = 'Chat';
    toggle.textContent = '💬';

    // Chat box
    const box = document.createElement('div');
    box.id = 'cb-box';
    box.classList.add('cb-hidden');
    box.innerHTML = `
      <div id="cb-header">
        <div><span>B-star51 Assistant</span><br><small>● Online</small></div>
        <button id="cb-close" title="Close">✕</button>
      </div>
      <div id="cb-messages"></div>
      <div id="cb-footer">
        <input id="cb-input" type="text" placeholder="Ask me anything…" maxlength="200" autocomplete="off" />
        <button id="cb-send">Send</button>
      </div>
    `;

    document.body.appendChild(toggle);
    document.body.appendChild(box);

    const messages = box.querySelector('#cb-messages');
    const input = box.querySelector('#cb-input');
    const send = box.querySelector('#cb-send');
    let open = false;

    function addMsg(text, who) {
      const m = document.createElement('div');
      m.className = 'cb-msg cb-' + who;
      m.textContent = text;
      messages.appendChild(m);
      messages.scrollTop = messages.scrollHeight;
    }

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      setTimeout(() => addMsg(getReply(text), 'bot'), 300);
    }

    toggle.addEventListener('click', () => {
      open = !open;
      box.classList.toggle('cb-hidden', !open);
      toggle.textContent = open ? '✕' : '💬';
      if (open && messages.children.length === 0) {
        addMsg("Hi! 👋 I'm B-star51's site assistant. Ask me about services, projects, skills, or how to get in touch!", 'bot');
      }
      if (open) input.focus();
    });

    box.querySelector('#cb-close').addEventListener('click', () => {
      open = false;
      box.classList.add('cb-hidden');
      toggle.textContent = '💬';
    });

    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
