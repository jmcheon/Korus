# Korus - Collective Voice 

A platform empowering migrant workers to anonymously share reviews about their working conditions, companies, and support organizations — helping improve transparency and accountability.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-1abc9c?style=for-the-badge)](http://51.21.248.96/)


## 📱 Korus Chatbot Entry Point (QR Code)
Korus starts with a conversational assistant that allows migrant workers to submit feedback privately and safely.

👉 [**Korus Chatbot README**](https://github.com/jmcheon/Korus/blob/main/korus_bot/Readme.md)

---

## Features

- 📝 Leave anonymous reviews about employers

- 🏢 Browse companies, job listings, and support organizations

- ⭐ Aggregated scores based on community sentiment

- 🔐 Token-based worker authentication

- 🗄️ Fully containerized system (frontend + backend + database + reverse proxy)

- 🌐 Production-ready deployment using Nginx & Docker Compose

## Tech Stack
<p align="center"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nginx/nginx-original.svg" alt="Nginx" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React.js" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="TailwindCSS" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" alt="Next.js" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/fastapi/fastapi-original.svg" alt="FastAPI" width="48" height="48"/> <img src="https://iconape.com/wp-content/png_logo_vector/typescript.png" alt="TypeScript" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" alt="MySQL" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-plain.svg" alt="Docker" width="48" height="48"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS" width="48" height="48"/> </p>


## Architecture Overview
```
┌─────────────────────────┐
│        Frontend         │  Next.js + React + Tailwind
│  (Korus Web Platform)   │
└────────────┬────────────┘
             │
             │  API Requests
             ▼
┌─────────────────────────┐
│        Backend          │  FastAPI + SQLAlchemy
│     (REST Services)     │
└────────────┬────────────┘
             │
             │  SQL Queries
             ▼
┌─────────────────────────┐
│         MySQL           │
│ (Company + Reviews DB)  │
└─────────────────────────┘

Deployed behind Nginx reverse proxy
```

## Dockerized Environment

Both development and production use Docker Compose with isolated services:

- frontend → Next.js app

- backend → FastAPI app

- mysql → Database with init scripts

- nginx → Serves frontend & reverse proxy to backend


## Future Roadmap

- Multi-language support (French, Spanish, Arabic)

- AI-based review classification (positive/neutral/negative)

- OAuth login for NGOs
