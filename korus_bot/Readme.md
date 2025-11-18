# 🤖 Korus - Assistant for Migrant Workers

## 📋 Overview

**Korus** is an intelligent Telegram bot designed to help migrant workers protect their rights, analyze their employment contracts, and find nearby support organizations. The bot uses artificial intelligence (Google Gemini) and adapts to the user's language.

## ✨ Key Features

- 🌍 **Multilingual support**: The bot communicates in the user's chosen language
- 📄 **PDF contract analysis**: Automatic detection of problematic clauses
- 🏢 **NGO search**: Location of nearby support organizations
- 💬 **Intelligent conversations**: Personalized responses with contextual memory
- 🔒 **Guaranteed anonymity**: User privacy protection

## 🏗️ Workflow Architecture

The workflow is built with **n8n** and includes the following components:

### 1. **Entry Point: Telegram Trigger**
- Listens for user messages and interactions
- Supports text messages, PDF documents, and interactive buttons
- Automatically downloads sent files

### 2. **Routing System: Switch Node**
The workflow uses an intelligent switch that routes requests to different paths:

| Route | Condition | Action |
|-------|-----------|--------|
| **Language choosed** | Callback query exists | Records language choice |
| **Accueil** | Message = `/start` | Displays welcome message |
| **Change language** | Message = `/language` | Offers to change language |
| **PDF** | PDF document sent | Analyzes contract |
| **Text** | Normal text message | General conversation |

### 3. **Interaction Flows**

#### 🌐 "Language Chosen" Flow
```
Telegram → Switch → Upsert row(s) → Greeting Agent → Greetings Interaction
```
- Saves language to n8n Data Tables
- Generates personalized welcome message
- Sends response via Telegram

#### 📝 "Text Message" Flow
```
Telegram → Switch → Get row(s)1 → MAP Agent → Text interaction
```
- Retrieves user's language from Data Tables
- Integrates geographic search tool (Map workflow)
- Generates contextual response
- Sends response via Telegram

#### 📄 "PDF Analysis" Flow
```
Telegram → Switch → Get row(s) → Contract Analysis Agent → PDF interaction
```
- Retrieves user's language
- Analyzes PDF contract with AI
- Identifies problematic clauses
- Recommends local NGOs

#### 🏠 "Initial Welcome" Flow
```
Telegram → Switch → Initial language → Telegram (buttons)
```
- Displays welcome message
- Offers buttons to choose language

#### 🔄 "Language Change" Flow
```
Telegram → Switch → Change Language → Telegram (buttons)
```
- Displays available language options
- Allows language change at any time

## 🧠 Artificial Intelligence

### Model Used
- **Google Gemini Chat Model** (via Google PaLM API)
- Integrated with **n8n AI Agent** to orchestrate interactions

### Memory System
- **Memory Buffer Window**: Maintains conversation context
- Session linked to Telegram callback ID
- Enables natural and contextual exchanges

### System Prompts

#### 1. Greeting Agent (Initial Welcome)
```
You are Korus, a caring assistant dedicated to migrant workers.
You help them understand their contracts, find nearby NGOs, 
and protect them from scams.

Your role:
- Analyze employment contracts
- Find NGOs near the user
- Answer questions about labor rights
- Maintain user anonymity
```

#### 2. Contract Analysis Agent (PDF)
```
You are Korus, a professional advisor who helps migrant 
workers protect their rights.

Response structure:
1. Reassuring opening statement
2. List of identified problems (bullet point format)
3. NGO recommendations with complete contact details

Required format:
• [Problem 1]
• [Problem 2]
```

#### 3. MAP Agent (General Conversations & NGO Search)
```
You are a professional labor rights advisor, empathetic but direct.

You help with:
- Labor rights (conditions, salary, contracts, hours, safety, abuse)
- Finding local NGOs using the "mapworkflow" tool
- Providing concrete solutions

When users mention cities or ask for organizations:
→ Immediately call the "mapworkflow" tool
→ Format results with icons: 🌍 📍 📞 🕒 🌐
```

## 🔧 Secondary Workflow: Map_workflow

### Objective
Search for local organizations via Serper.dev API

### Components
1. **Trigger**: Receives a search query
2. **HTTP Request**: Calls Google Maps API via Serper
3. **JavaScript Code**: Formats results
4. **Filter**: Filters relevant results

### Output Format
```json
{
  "Position": 1,
  "Name": "Organization name",
  "Address": "Complete address",
  "Hours": "Opening hours",
  "Rating": 4.5,
  "Website": "Website URL",
  "Phone": "+33 X XX XX XX XX",
  "Number of Avis": 123
}
```

## 🗄️ Database

The workflow uses **n8n Data Tables** to store:
- Telegram user ID
- Preferred language
- Interaction history

### Table Structure
| Column | Type | Description |
|---------|------|-------------|
| `user_id` | String | User's Telegram ID |
| `Language` | String | Language choice (English, French, Spanish, Arabic, Hindi) |

## 🚀 Installation and Configuration

### Prerequisites
- An n8n account (self-hosted or cloud)
- A Telegram bot (API Token)
- A Google Gemini account (API key)
- A Serper.dev account (API key for geographic search)

### Installation Steps

1. **Import workflows into n8n**
   - Import `Korus.json` (main workflow)
   - Import `Map_workflow.json` (search workflow)

2. **Configure credentials**
   
   **Telegram API:**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Copy the API token
   - Add to n8n: Credentials → Telegram API
   
   **Google Gemini (PaLM API):**
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to n8n: Credentials → Google PaLM API
   
   **Serper.dev API:**
   - Sign up on [Serper.dev](https://serper.dev/)
   - Copy the API key
   - Replace in the "HTTP Request" node of Map_workflow
   
   **n8n Data Tables:**
   - In your n8n project, create a new Data Table named "Language"
   - Add two columns: `user_id` (String) and `Language` (String)
   - The workflow will automatically populate this table

3. **Activate workflows**
   - Activate "Korus"
   - Activate "Map_workflow"

4. **Test the bot**
   - Send `/start` to your Telegram bot
   - Choose a language
   - Test with questions or a PDF

## 📱 Usage

### Available Commands

| Command | Description |
|----------|-------------|
| `/start` | Start the bot and choose language |
| `/language` | Change language at any time |

### Interactions

1. **General conversation**
   ```
   User: "What are my rights in France?"
   Korus: [Detailed response in user's language]
   ```

2. **NGO search**
   ```
   User: "Find me NGOs in Paris"
   Korus: [List of organizations with contact details]
   ```

3. **Contract analysis**
   ```
   User: [Sends a contract PDF]
   Korus: 
   "I've reviewed your contract and unfortunately, it contains 
   problematic elements:
   
   • The proposed salary is below the legal minimum
   • You're being asked to pay recruitment fees (illegal)
   
   I strongly recommend consulting these NGOs:
   [List with addresses and hours]"
   ```

## 🛡️ Security and Privacy

- ✅ No sensitive personal data is stored
- ✅ Conversations are not recorded (except language preference)
- ✅ The bot never asks for identification information
- ✅ PDF files are not retained after analysis
- ✅ Secure connections via HTTPS

## 🔍 Common Issue Detection

The bot can identify in contracts:

| ⚠️ Issue | Description |
|------------|-------------|
| **Insufficient salary** | Salary below legal minimum |
| **Illegal fees** | Request for payment for recruitment |
| **Unspecified hours** | Missing work schedule information |
| **Abusive probation** | Excessive duration or vague conditions |
| **Mobility clause** | Uncompensated relocation requirement |
| **Document retention** | Confiscation of identity papers |

## 📊 Supported Languages

The bot can communicate in several languages based on user choice:
- 🇬🇧 English
- 🇫🇷 Français
- 🇪🇸 Español
- 🇦🇪 العربية
- 🇮🇳 हिन्दी (Hindi)
- *(Other languages configurable)*

## 🐛 Troubleshooting

### Bot doesn't respond
- Verify the workflow is active
- Check Telegram credentials
- Review execution logs in n8n

### PDF analysis fails
- Verify the file is actually a PDF
- Check Google Gemini API (quota, valid key)
- Ensure PDF contains text (not just an image)

### NGO search doesn't work
- Verify Serper.dev API key
- Check that Map_workflow is active
- Review API parameters in HTTP Request
